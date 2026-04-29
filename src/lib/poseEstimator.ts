import * as THREE from 'three';
import { Point3D } from '@/types/landmarks';
import { GlassesTransform } from '@/types/landmarks';

const REFERENCE_EYE_WIDTH = 0.28;
const BASE_MODEL_DEPTH = -0.65;
const DEPTH_SENSITIVITY = 0.0015;

export function ndcToWorld(
  nx: number,
  ny: number,
  depth: number,
  camera: THREE.PerspectiveCamera,
  canvasWidth: number,
  canvasHeight: number
): THREE.Vector3 {
  const target = new THREE.Vector3();
  const vFOV = THREE.MathUtils.degToRad(camera.fov);
  const heightAtDepth = 2 * Math.tan(vFOV / 2) * Math.abs(depth);
  const widthAtDepth = heightAtDepth * (canvasWidth / canvasHeight);

  target.x = -(nx - 0.5) * widthAtDepth;
  target.y = -(ny - 0.5) * heightAtDepth;
  target.z = depth;

  return target;
}

export function computeModelDepth(noseBridgeZ: number): number {
  return THREE.MathUtils.clamp(
    BASE_MODEL_DEPTH - noseBridgeZ * DEPTH_SENSITIVITY,
    -0.9,
    -0.45
  );
}

export function landmarkToWorld(
  point: Point3D,
  camera: THREE.PerspectiveCamera,
  canvasWidth: number,
  canvasHeight: number,
  depthOffset = 0
): THREE.Vector3 {
  const nx = THREE.MathUtils.clamp(point.x / canvasWidth, 0, 1);
  const ny = THREE.MathUtils.clamp(point.y / canvasHeight, 0, 1);
  const depth = THREE.MathUtils.clamp(computeModelDepth(point.z) + depthOffset, -0.95, -0.35);

  return ndcToWorld(nx, ny, depth, camera, canvasWidth, canvasHeight);
}

export function computeWorldScale(
  currentEyeWidth: number,
  calibratedEyeWidth: number | null,
  depth: number,
  camera: THREE.PerspectiveCamera
): number {
  const reference = calibratedEyeWidth ?? REFERENCE_EYE_WIDTH;
  const screenScale = currentEyeWidth / reference;
  const vFOV = THREE.MathUtils.degToRad(camera.fov);
  const perspectiveFactor = 2 * Math.tan(vFOV / 2) * Math.abs(depth);
  
  return screenScale * perspectiveFactor * 0.45;
}

export function applyTransformToModel(
  model: THREE.Object3D,
  transform: GlassesTransform,
  camera: THREE.PerspectiveCamera,
  canvasWidth: number,
  canvasHeight: number,
  _calibratedEyeWidth?: number | null // Đã thêm dấu gạch dưới để TS bỏ qua cảnh báo unused
): void {
  const worldPos = landmarkToWorld(
    transform.position,
    camera,
    canvasWidth,
    canvasHeight,
    transform.depthOffset ?? 0
  );
  
  model.position.lerp(worldPos, 0.25);

  const targetQuat = new THREE.Quaternion().setFromEuler(
    new THREE.Euler(transform.rotation.x, transform.rotation.y, transform.rotation.z, 'XYZ')
  );
  model.quaternion.slerp(targetQuat, 0.2);

  model.scale.setScalar(transform.scale);
}