import * as THREE from 'three';
import { GlassesTransform } from '@/types/landmarks';

const REFERENCE_EYE_WIDTH = 0.28;

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

  // target.x = -(nx - 0.5) * widthAtDepth;
  target.x = (nx - 0.5) * widthAtDepth;
  target.y = -(ny - 0.5) * heightAtDepth;
  target.z = depth;

  return target;
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
  // const worldPos = ndcToWorld(
  //   transform.position.x,
  //   transform.position.y,
  //   -0.65,
  //   camera,
  //   canvasWidth,
  //   canvasHeight
  const nx = transform.position.x / canvasWidth;
  const ny = transform.position.y / canvasHeight;

  const worldPos = ndcToWorld(
    nx,
    ny,
    -0.65,
    camera,
    canvasWidth,
    canvasHeight
  );
  
  model.position.lerp(worldPos, 0.25);

  const targetQuat = new THREE.Quaternion().setFromEuler(
    new THREE.Euler(transform.rotation.x, transform.rotation.y, transform.rotation.z, 'XYZ')
  );
  model.quaternion.slerp(targetQuat, 0.2);

  model.scale.setScalar(transform.scale);
}