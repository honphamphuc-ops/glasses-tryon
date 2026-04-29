import * as THREE from 'three';
import { FACE_OVAL_INDICES, KEY_POINTS } from '@/data/landmarkIndices';
import { landmarkToWorld } from '@/lib/poseEstimator';
import { Point3D } from '@/types/landmarks';

const OCCLUSION_DEPTH_OFFSET = -0.04;

function createOcclusionGeometry(): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array((FACE_OVAL_INDICES.length + 1) * 3);
  const indices = new Uint16Array(FACE_OVAL_INDICES.length * 3);

  for (let index = 0; index < FACE_OVAL_INDICES.length; index += 1) {
    const current = index + 1;
    const next = ((index + 1) % FACE_OVAL_INDICES.length) + 1;
    const triangleOffset = index * 3;

    indices[triangleOffset] = 0;
    indices[triangleOffset + 1] = current;
    indices[triangleOffset + 2] = next;
  }

  const positionAttribute = new THREE.BufferAttribute(positions, 3);
  positionAttribute.setUsage(THREE.DynamicDrawUsage);

  geometry.setAttribute('position', positionAttribute);
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));

  return geometry;
}

export function createOcclusionMask(): THREE.Mesh {
  const occlusionMaterial = new THREE.MeshBasicMaterial({ side: THREE.FrontSide });
  occlusionMaterial.colorWrite = false;
  occlusionMaterial.depthWrite = true;

  const maskMesh = new THREE.Mesh(createOcclusionGeometry(), occlusionMaterial);
  maskMesh.renderOrder = -1;
  maskMesh.frustumCulled = false;

  return maskMesh;
}

export function updateOcclusionMask(
  mesh: THREE.Mesh,
  landmarks: Point3D[] | null,
  camera: THREE.PerspectiveCamera,
  canvas: HTMLCanvasElement
): void {
  if (!landmarks || !canvas.width || !canvas.height) {
    mesh.visible = false;
    return;
  }

  const noseBridge = landmarks[KEY_POINTS.NOSE_BRIDGE];
  const geometry = mesh.geometry as THREE.BufferGeometry;
  const positionAttribute = geometry.getAttribute('position') as THREE.BufferAttribute;
  const positions = positionAttribute.array as Float32Array;

  if (!noseBridge || positions.length !== (FACE_OVAL_INDICES.length + 1) * 3) {
    mesh.visible = false;
    return;
  }

  const center = landmarkToWorld(noseBridge, camera, canvas.width, canvas.height, OCCLUSION_DEPTH_OFFSET);
  positions[0] = center.x;
  positions[1] = center.y;
  positions[2] = center.z;

  for (let index = 0; index < FACE_OVAL_INDICES.length; index += 1) {
    const point = landmarks[FACE_OVAL_INDICES[index]];
    if (!point) {
      mesh.visible = false;
      return;
    }

    const worldPoint = landmarkToWorld(point, camera, canvas.width, canvas.height, OCCLUSION_DEPTH_OFFSET);
    const offset = (index + 1) * 3;
    positions[offset] = worldPoint.x;
    positions[offset + 1] = worldPoint.y;
    positions[offset + 2] = worldPoint.z;
  }

  positionAttribute.needsUpdate = true;
  mesh.visible = true;
}