import * as THREE from 'three';
import { FaceLandmarks } from '@/types/landmarks';
import { estimateHeadPose } from './poseEstimator';

export function mapGlassesToFace(
  glassesGroup: THREE.Group,
  landmarks: FaceLandmarks,
  videoWidth: number,
  videoHeight: number
) {
  const pose = estimateHeadPose(landmarks);

  // Position glasses at the bridge of the nose (between eyes)
  // Convert from video coordinates to Three.js coordinates
  const x = pose.position.x - videoWidth / 2;
  const y = -(pose.position.y - videoHeight / 2);
  const z = pose.position.z;

  glassesGroup.position.set(x, y, z);

  // Apply rotation
  glassesGroup.rotation.set(
    pose.rotation.x,
    -pose.rotation.y,
    -pose.rotation.z
  );

  // Scale based on face width
  const scaleFactor = pose.scale / 150;
  glassesGroup.scale.setScalar(scaleFactor);
}
