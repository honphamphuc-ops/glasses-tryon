import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { useAppStore } from '@/store/useAppStore';
import { setupThreeScene, ThreeScene } from '@/lib/threeSetup';
import { disposeGlassesModel, loadGlassesModel } from '@/lib/glassesLoader';
import { createOcclusionMask, updateOcclusionMask } from '@/lib/occlusionMask';
import { applyTransformToModel } from '@/lib/poseEstimator';
import { GlassesTransform, Point3D } from '@/types/landmarks';

interface FrameSourceSize {
  width: number;
  height: number;
}

function scalePointToRenderSpace(
  point: Point3D,
  sourceSize: FrameSourceSize,
  renderWidth: number,
  renderHeight: number
): Point3D {
  return {
    x: point.x * (renderWidth / sourceSize.width),
    y: point.y * (renderHeight / sourceSize.height),
    z: point.z,
  };
}

function scaleTransformToRenderSpace(
  transform: GlassesTransform,
  sourceSize: FrameSourceSize,
  renderWidth: number,
  renderHeight: number
): GlassesTransform {
  return {
    ...transform,
    position: scalePointToRenderSpace(transform.position, sourceSize, renderWidth, renderHeight),
  };
}

export function useGlassesRenderer(
  outputCanvasRef: React.RefObject<HTMLCanvasElement>,
  width: number,
  height: number
) {
  // Lấy state từ Zustand store
  const { selectedGlasses, startLoadModel, finishLoadModel } = useAppStore();
  
  // Refs lưu trữ các đối tượng 3D để tránh re-render không cần thiết
  const sceneRef = useRef<ThreeScene | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const maskRef = useRef<THREE.Mesh | null>(null);
  const loadRequestRef = useRef(0);

  const removeCurrentModel = useCallback((sceneObj: ThreeScene) => {
    if (!modelRef.current) {
      return;
    }

    sceneObj.scene.remove(modelRef.current);
    disposeGlassesModel(modelRef.current);
    modelRef.current = null;
  }, []);

  // 1. KHỞI TẠO SCENE VÀ MẶT NẠ (Chỉ chạy 1 lần khi Canvas xuất hiện)
  useEffect(() => {
    if (!outputCanvasRef.current) return;

    // Thiết lập Three.js cơ bản (Camera, Ánh sáng, WebGL)
    const threeScene = setupThreeScene(outputCanvasRef.current, width, height);
    sceneRef.current = threeScene;

    // Tạo cái đầu tàng hình (Mặt nạ che khuất hai bên thái dương)
    const mask = createOcclusionMask();
    mask.visible = false; // Ẩn cho đến khi tìm thấy khuôn mặt
    threeScene.scene.add(mask);
    maskRef.current = mask;

    // Cleanup khi unmount
    return () => {
      removeCurrentModel(threeScene);
      threeScene.scene.remove(mask);
      mask.geometry.dispose();
      const material = mask.material;
      if (Array.isArray(material)) {
        material.forEach((item) => item.dispose());
      } else {
        material.dispose();
      }
      maskRef.current = null;
      sceneRef.current = null;
      threeScene.dispose();
    };
  }, [outputCanvasRef, removeCurrentModel]);

  useEffect(() => {
    if (!sceneRef.current) {
      return;
    }

    sceneRef.current.resize(width, height);
  }, [height, width]);

  // 2. TẢI VÀ CHUYỂN ĐỔI KÍNH (Chạy mỗi khi user chọn kính mới)
  // ★ [XỬ LÝ CALIBRATION KHI ĐỔI KÍNH MỚI]
  // 1. Khi user bấm chọn kính mới ở Catalog, store.selectedGlasses thay đổi.
  // 2. Tác vụ loadGlassesModel(.glb) được gọi để nạp model 3D mới vào.
  // 3. ĐIỂM QUAN TRỌNG: store.calibratedEyeWidth KHÔNG HỀ BỊ RESET.
  // 4. Khi vòng lặp renderFrame(transform) chạy (ở 60FPS), nó lập tức lấy 
  //    calibratedEyeWidth cũ truyền vào applyTransformToModel().
  // 5. Kết quả: Mẫu kính mới ngay khi hiện lên sẽ lập tức scale đúng tỉ lệ khuôn mặt
  //    mà hệ thống đã đo được từ lần đầu tiên. Trải nghiệm thay kính sẽ mượt mà
  //    như ngoài đời thực, không bắt người dùng phải "Nhìn thẳng vào camera" lại!
  useEffect(() => {
    const sceneObj = sceneRef.current;
    if (!sceneObj) return;

    // Nếu chọn "None" hoặc chưa chọn, xóa kính cũ đi
    if (!selectedGlasses) {
      loadRequestRef.current += 1;
      removeCurrentModel(sceneObj);
      if (maskRef.current) maskRef.current.visible = false;
      return;
    }

    let isCancelled = false;
    const requestId = ++loadRequestRef.current;
    startLoadModel(selectedGlasses.id);

    const initModel = async () => {
      try {
        const modelGroup = await loadGlassesModel(selectedGlasses.modelPath);

        if (isCancelled || requestId !== loadRequestRef.current) {
          disposeGlassesModel(modelGroup);
          return;
        }

        removeCurrentModel(sceneObj);
        modelGroup.visible = false;
        modelGroup.renderOrder = 0;
        modelGroup.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.renderOrder = 0;
          }
        });
        sceneObj.scene.add(modelGroup);
        modelRef.current = modelGroup;
      } catch (error) {
        console.error('Không thể nạp model kính:', error);
      } finally {
        if (!isCancelled && requestId === loadRequestRef.current) {
          finishLoadModel(selectedGlasses.id);
        }
      }
    };

    void initModel();

    return () => {
      isCancelled = true;
    };
  }, [selectedGlasses, startLoadModel, finishLoadModel, removeCurrentModel]);

  // 3. VÒNG LẶP RENDER (Được gọi 60 lần/giây từ useAnimationLoop)
  const renderFrame = useCallback((
    transform: GlassesTransform | null,
    landmarks: Point3D[] | null,
    sourceSize: FrameSourceSize | null = null
  ) => {
    const sceneObj = sceneRef.current;
    const model = modelRef.current;
    const mask = maskRef.current;
    const renderCanvas = outputCanvasRef.current;

    if (!sceneObj || !renderCanvas) return;

    const renderWidth = renderCanvas.width || width;
    const renderHeight = renderCanvas.height || height;
    const mappedTransform = transform && sourceSize
      ? scaleTransformToRenderSpace(transform, sourceSize, renderWidth, renderHeight)
      : transform;
    const mappedLandmarks = landmarks && sourceSize
      ? landmarks.map((point) => scalePointToRenderSpace(point, sourceSize, renderWidth, renderHeight))
      : landmarks;

    // Nếu MediaPipe tìm thấy mặt và đã tính toán xong tọa độ
    if (mappedTransform && mappedLandmarks && model && mask) {
      model.visible = true;
      updateOcclusionMask(mask, mappedLandmarks, sceneObj.camera, renderCanvas);

      // Bước A: Áp dụng vị trí, góc quay, tỉ lệ cho Kính
      applyTransformToModel(
        model,
        mappedTransform,
        sceneObj.camera,
        renderCanvas.width,
        renderCanvas.height
      );

    } else if (model && mask) {
      // Mất mặt (hoặc đưa tay che camera) -> Ẩn kính đi
      model.visible = false;
      mask.visible = false;
    }

    // Tiến hành vẽ (Render) khung hình 3D lên Canvas
    sceneObj.renderer.render(sceneObj.scene, sceneObj.camera);
  }, [height, outputCanvasRef, width]);

  return { renderFrame, sceneRef, modelRef, maskRef };
}