import { useCallback, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { createScene, createCamera, createRenderer, setupLighting } from '@/lib/threeSetup';
import { FaceLandmarks } from '@/types/landmarks';
import { mapGlassesToFace } from '@/lib/glassesMapper';
import { GlassesModel } from '@/types/glasses';

export function useGlassesRenderer(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  videoWidth: number,
  videoHeight: number
) {
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const glassesGroupRef = useRef<THREE.Group | null>(null);
  const currentModelRef = useRef<string | null>(null);

  const initRenderer = useCallback(() => {
    if (!canvasRef.current || videoWidth === 0 || videoHeight === 0) return;

    const scene = createScene();
    const camera = createCamera(videoWidth, videoHeight);
    const renderer = createRenderer(canvasRef.current, videoWidth, videoHeight);
    setupLighting(scene);

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
  }, [canvasRef, videoWidth, videoHeight]);

  const loadGlasses = useCallback(async (_model: GlassesModel) => {
    if (!sceneRef.current) return;

    // Remove previous glasses
    if (glassesGroupRef.current) {
      sceneRef.current.remove(glassesGroupRef.current);
    }

    // Placeholder glasses geometry
    // In production, use GLTFLoader to load _model.modelPath
    const group = new THREE.Group();

    // Frame
    const frameGeometry = new THREE.TorusGeometry(15, 2, 8, 32);
    const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });

    const leftLens = new THREE.Mesh(frameGeometry, frameMaterial);
    leftLens.position.set(-20, 0, 0);
    group.add(leftLens);

    const rightLens = new THREE.Mesh(frameGeometry, frameMaterial);
    rightLens.position.set(20, 0, 0);
    group.add(rightLens);

    // Bridge
    const bridgeGeometry = new THREE.CylinderGeometry(1, 1, 10, 8);
    const bridge = new THREE.Mesh(bridgeGeometry, frameMaterial);
    bridge.rotation.z = Math.PI / 2;
    bridge.position.set(0, 0, 0);
    group.add(bridge);

    sceneRef.current.add(group);
    glassesGroupRef.current = group;
    currentModelRef.current = _model.id;
  }, []);

  const updateGlasses = useCallback(
    (landmarks: FaceLandmarks | null) => {
      if (!glassesGroupRef.current) return;

      if (landmarks) {
        glassesGroupRef.current.visible = true;
        mapGlassesToFace(glassesGroupRef.current, landmarks, videoWidth, videoHeight);
      } else {
        glassesGroupRef.current.visible = false;
      }
    },
    [videoWidth, videoHeight]
  );

  const render = useCallback(() => {
    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      rendererRef.current?.dispose();
    };
  }, []);

  return { initRenderer, loadGlasses, updateGlasses, render };
}
