import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

// Cache template model đã được căn chỉnh để những lần chọn sau chỉ cần clone.
const modelCache = new Map<string, THREE.Group>();
const NORMALIZED_MODEL_WIDTH = 0.3;
const MODEL_FRONT_Z_RATIO = 0.22;

// Cấu hình Draco & GLTF Loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
dracoLoader.preload(); // Tải decoder ngầm trước

let dracoConfigured = false;

const gltfLoader = new GLTFLoader();
try {
  gltfLoader.setDRACOLoader(dracoLoader);
  dracoConfigured = true;
} catch (error) {
  console.warn('DRACOLoader setup failed:', error);
  dracoConfigured = false;
}

// Fallback: Nếu lỗi load model thì trả về khung kính wireframe để dễ nhận biết.
function createFallbackModel(): THREE.Group {
  const group = new THREE.Group();
  const material = new THREE.MeshBasicMaterial({ color: 0xff4d4f, wireframe: true });

  const leftLens = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.008, 10, 32), material.clone());
  leftLens.position.set(-0.09, 0, 0);
  leftLens.scale.set(1, 0.9, 1);

  const rightLens = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.008, 10, 32), material.clone());
  rightLens.position.set(0.09, 0, 0);
  rightLens.scale.set(1, 0.9, 1);

  const bridge = new THREE.Mesh(new THREE.CapsuleGeometry(0.006, 0.04, 2, 8), material.clone());
  bridge.rotation.z = Math.PI / 2;
  bridge.position.y = 0.005;

  const leftTemple = new THREE.Mesh(new THREE.CapsuleGeometry(0.005, 0.12, 2, 8), material.clone());
  leftTemple.rotation.z = Math.PI / 2;
  leftTemple.rotation.y = Math.PI / 5;
  leftTemple.position.set(-0.17, 0.01, -0.045);

  const rightTemple = new THREE.Mesh(new THREE.CapsuleGeometry(0.005, 0.12, 2, 8), material.clone());
  rightTemple.rotation.z = Math.PI / 2;
  rightTemple.rotation.y = -Math.PI / 5;
  rightTemple.position.set(0.17, 0.01, -0.045);

  group.add(leftLens, rightLens, bridge, leftTemple, rightTemple);
  return group;
}

function normalizeMaterial(material: THREE.Material): THREE.Material {
  material.side = THREE.DoubleSide;

  if ('transparent' in material && material.transparent) {
    material.opacity = Math.max(material.opacity ?? 1, 0.92);
  }

  if ('alphaTest' in material) {
    material.alphaTest = material.transparent ? 0.05 : 0;
  }

  if ('depthWrite' in material) {
    material.depthWrite = !material.transparent;
  }

  if (material instanceof THREE.MeshStandardMaterial || material instanceof THREE.MeshPhysicalMaterial) {
    material.envMapIntensity = 1.5;
    material.metalness = Math.min(material.metalness, 0.35);
    material.roughness = Math.max(material.roughness, 0.45);
  }

  material.needsUpdate = true;

  return material;
}

function normalizeMeshAppearance(mesh: THREE.Mesh): void {
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.frustumCulled = false;

  if (Array.isArray(mesh.material)) {
    mesh.material = mesh.material.map((material) => normalizeMaterial(material));
  } else {
    mesh.material = normalizeMaterial(mesh.material);
  }
}

function normalizeModel(model: THREE.Group): THREE.Group {
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const scaleFactor = size.x > 0 ? NORMALIZED_MODEL_WIDTH / size.x : 1;
  const anchor = new THREE.Vector3(
    center.x,
    center.y,
    box.max.z - size.z * MODEL_FRONT_Z_RATIO
  );

  model.position.sub(anchor);
  model.scale.setScalar(scaleFactor);

  model.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      normalizeMeshAppearance(child as THREE.Mesh);
    }
  });

  return model;
}

function cloneMaterial(material: THREE.Material | THREE.Material[]): THREE.Material | THREE.Material[] {
  if (Array.isArray(material)) {
    return material.map((item) => item.clone());
  }

  return material.clone();
}

function cloneModelInstance(template: THREE.Group): THREE.Group {
  const instance = template.clone(true);

  instance.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      mesh.geometry = mesh.geometry.clone();
      mesh.material = cloneMaterial(mesh.material);
      normalizeMeshAppearance(mesh);
    }
  });

  return instance;
}

async function loadModelTemplate(url: string): Promise<THREE.Group> {
  if (modelCache.has(url)) {
    return modelCache.get(url)!;
  }

  return new Promise((resolve) => {
    gltfLoader.load(
      url,
      (gltf) => {
        const template = new THREE.Group();
        template.add(normalizeModel(gltf.scene));
        modelCache.set(url, template);
        resolve(template);
      },
      undefined,
      (error) => {
        console.error(`Lỗi khi load model ${url}:`, error);
        resolve(createFallbackModel());
      }
    );
  });
}

export async function loadGlassesModel(url: string): Promise<THREE.Group> {
  const template = await loadModelTemplate(url);
  return cloneModelInstance(template);
}

// Chạy Promise.all để tải trước nhiều model lúc rảnh.
export async function preloadGlasses(
  paths: string[],
  onProgress?: (loaded: number, total: number) => void
): Promise<void> {
  const uniquePaths = [...new Set(paths)];
  const total = uniquePaths.length;
  let loaded = 0;

  onProgress?.(loaded, total);

  await Promise.allSettled(uniquePaths.map(async (path) => {
    await loadModelTemplate(path);
    loaded += 1;
    onProgress?.(loaded, total);
  }));
}

export function disposeGlassesModel(model: THREE.Object3D): void {
  model.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      mesh.geometry.dispose();

      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((material) => material.dispose());
      } else {
        mesh.material.dispose();
      }
    }
  });
}

export function clearCache(): void {
  modelCache.forEach((model) => {
    disposeGlassesModel(model);
  });
  modelCache.clear();
}

export function isDracoConfigured(): boolean {
  return dracoConfigured;
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    clearCache();
  });
}