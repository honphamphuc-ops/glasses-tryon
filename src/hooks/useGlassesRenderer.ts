import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { useAppStore } from '@/store/useAppStore';
import { setupThreeScene, ThreeScene } from '@/lib/threeSetup';
import { loadGlassesModel } from '@/lib/glassesLoader';
import { createOcclusionMask } from '@/lib/occlusionMask';
import { applyTransformToModel } from '@/lib/poseEstimator';
import { GlassesTransform } from '@/types/landmarks';

export function useGlassesRenderer(
  outputCanvasRef: React.RefObject<HTMLCanvasElement>,
  width: number,
  height: number
) {
  // Lấy state từ Zustand store
  const { selectedGlasses, calibratedEyeWidth } = useAppStore();
  
  // Refs lưu trữ các đối tượng 3D để tránh re-render không cần thiết
  const sceneRef = useRef<ThreeScene | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const maskRef = useRef<THREE.Mesh | null>(null);

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
      threeScene.dispose();
    };
  }, [outputCanvasRef, width, height]);

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
      if (modelRef.current) {
        sceneObj.scene.remove(modelRef.current);
        modelRef.current = null;
      }
      if (maskRef.current) maskRef.current.visible = false;
      return;
    }

    let isMounted = true;

    const initModel = async () => {
      // Gọi thư viện load file .glb (đã nén Draco)
      const modelGroup = await loadGlassesModel(selectedGlasses.modelPath);
      
      if (!isMounted) return;

      // Xóa model cũ ra khỏi scene trước khi add cái mới vào
      if (modelRef.current) {
        sceneObj.scene.remove(modelRef.current);
      }

      modelGroup.visible = false; // Tạm ẩn để tránh hiện chớp nhoáng giữa màn hình
      sceneObj.scene.add(modelGroup);
      modelRef.current = modelGroup;
    };

    initModel();

    return () => {
      isMounted = false; // Ngăn lỗi "Race Condition" nếu người dùng click đổi kính liên tục
    };
  }, [selectedGlasses]);

  // 3. VÒNG LẶP RENDER (Được gọi 60 lần/giây từ useAnimationLoop)
  const renderFrame = useCallback((transform: GlassesTransform | null) => {
    const sceneObj = sceneRef.current;
    const model = modelRef.current;
    const mask = maskRef.current;

    if (!sceneObj || !outputCanvasRef.current) return;

    // Nếu MediaPipe tìm thấy mặt và đã tính toán xong tọa độ
    if (transform && model && mask) {
      model.visible = true;
      mask.visible = true;

      // Bước A: Áp dụng vị trí, góc quay, tỉ lệ cho Kính
      applyTransformToModel(
        model,
        transform,
        sceneObj.camera,
        outputCanvasRef.current.width,
        outputCanvasRef.current.height,
        calibratedEyeWidth
      );

      // Bước B: Đồng bộ Mặt nạ (Occlusion Mask) bám theo Kính
      mask.position.copy(model.position);
      mask.quaternion.copy(model.quaternion);
      
      // Scale mặt nạ to hơn kính một chút để che được phần càng kính cắm vào tai
      mask.scale.setScalar(transform.scale * 1.1);

    } else if (model && mask) {
      // Mất mặt (hoặc đưa tay che camera) -> Ẩn kính đi
      model.visible = false;
      mask.visible = false;
    }

    // Tiến hành vẽ (Render) khung hình 3D lên Canvas
    sceneObj.renderer.render(sceneObj.scene, sceneObj.camera);
  }, [calibratedEyeWidth, outputCanvasRef]);

  return { renderFrame, sceneRef, modelRef };
}