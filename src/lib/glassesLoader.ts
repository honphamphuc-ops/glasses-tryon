import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

// Cache để không phải load lại model khi người dùng chọn lại kính cũ
const modelCache = new Map<string, THREE.Group>();

// Cấu hình Draco & GLTF Loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
dracoLoader.preload(); // Tải decoder ngầm trước

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

// Fallback: Nếu lỗi load model thì trả về 1 cục hộp đỏ để debug
function createFallbackModel(): THREE.Group {
  const group = new THREE.Group();
  const geometry = new THREE.BoxGeometry(0.3, 0.1, 0.1);
  const material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
  group.add(new THREE.Mesh(geometry, material));
  return group;
}

export async function loadGlassesModel(url: string): Promise<THREE.Group> {
  // 1. Check Cache
  if (modelCache.has(url)) {
    const cachedModel = modelCache.get(url)!;
    return cachedModel.clone(); // Bắt buộc clone() để Three.js không bị nhầm lẫn object
  }

  // 2. Load Model mới
  return new Promise((resolve) => {
    gltfLoader.load(
      url,
      (gltf) => {
        const model = gltf.scene;

        // Auto-center: Đưa tâm của kính về trục tọa độ (0,0,0)
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.x += (model.position.x - center.x);
        model.position.y += (model.position.y - center.y);
        model.position.z += (model.position.z - center.z);

        // Auto-normalize scale: Đảm bảo mọi loại kính đều có width ban đầu ~ 0.3 units
        const size = box.getSize(new THREE.Vector3());
        const scaleFactor = 0.3 / size.x;
        model.scale.setScalar(scaleFactor);

        // Bật bóng (Shadows)
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        // Bọc vào Group, lưu cache
        const finalGroup = new THREE.Group();
        finalGroup.add(model);
        modelCache.set(url, finalGroup);

        resolve(finalGroup.clone());
      },
      undefined,
      (error) => {
        console.error(`Lỗi khi load model ${url}:`, error);
        resolve(createFallbackModel());
      }
    );
  });
}

// Chạy Promise.all để tải trước nhiều model lúc rảnh
export async function preloadGlasses(paths: string[]): Promise<void> {
  await Promise.allSettled(paths.map((path) => loadGlassesModel(path)));
}

export function clearCache(): void {
  modelCache.forEach((model) => {
    model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.geometry.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach(m => m.dispose());
        } else {
          mesh.material.dispose();
        }
      }
    });
  });
  modelCache.clear();
}