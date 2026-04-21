import * as THREE from 'three';

export interface ThreeScene {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  resize: (width: number, height: number) => void;
  dispose: () => void;
}

export function setupThreeScene(canvas: HTMLCanvasElement, width: number, height: number): ThreeScene {
  // 1. Khởi tạo Scene
  const scene = new THREE.Scene();

  // 2. Camera: PerspectiveCamera FOV=60, near=0.01, far=100
  const camera = new THREE.PerspectiveCamera(60, width / height, 0.01, 100);
  camera.position.set(0, 0, 1);

  // 3. Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    preserveDrawingBuffer: true, // ★ QUAN TRỌNG: Bắt buộc để canvas.toDataURL() hoạt động
  });
  
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Chống vỡ hạt trên màn hình Retina
  renderer.setClearColor(0x000000, 0); // Nền trong suốt hoàn toàn

  // 4. Ánh sáng
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
  directionalLight.position.set(0, 1, 1);
  scene.add(directionalLight);

  // 5. Hàm tiện ích
  const resize = (newWidth: number, newHeight: number) => {
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
  };

  const dispose = () => {
    renderer.dispose();
  };

  return { scene, camera, renderer, resize, dispose };
}