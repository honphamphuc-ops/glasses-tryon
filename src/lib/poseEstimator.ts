import { mat4 } from 'gl-matrix';
import { FaceLandmarks } from '@/types/landmarks';

export interface HeadPose {
  rotation: { x: number; y: number; z: number };
  position: { x: number; y: number; z: number };
  scale: number;
}

export function estimateHeadPose(landmarks: FaceLandmarks): HeadPose {
  const { leftEye, rightEye, noseBridge } = landmarks;

  // Calculate center between eyes
  const centerX = (leftEye.x + rightEye.x) / 2;
  const centerY = (leftEye.y + rightEye.y) / 2;
  const centerZ = (leftEye.z + rightEye.z) / 2;

  // Estimate yaw (rotation around Y axis)
  const dx = rightEye.x - leftEye.x;
  const dz = rightEye.z - leftEye.z;
  const yaw = Math.atan2(dz, dx);

  // Estimate pitch (rotation around X axis)
  const eyeMidY = (leftEye.y + rightEye.y) / 2;
  const noseY = noseBridge.y;
  const noseZ = noseBridge.z;
  const pitch = Math.atan2(noseY - eyeMidY, Math.abs(noseZ - centerZ) + 1);

  // Estimate roll (rotation around Z axis)
  const roll = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x);

  // Scale based on face width
  const scale = landmarks.faceWidth;

  return {
    rotation: { x: pitch, y: yaw, z: roll },
    position: { x: centerX, y: centerY, z: centerZ },
    scale,
  };
}

export function createTransformMatrix(pose: HeadPose): mat4 {
  const matrix = mat4.create();

  mat4.translate(matrix, matrix, [pose.position.x, pose.position.y, pose.position.z]);
  mat4.rotateX(matrix, matrix, pose.rotation.x);
  mat4.rotateY(matrix, matrix, pose.rotation.y);
  mat4.rotateZ(matrix, matrix, pose.rotation.z);

  return matrix;
}
