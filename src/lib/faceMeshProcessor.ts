import { Point3D, FaceLandmarks } from '@/types/landmarks';
import { LANDMARK_INDICES } from '@/data/landmarkIndices';

export function extractLandmarks(
  landmarks: { x: number; y: number; z: number }[],
  videoWidth: number,
  videoHeight: number
): FaceLandmarks {
  const points: Point3D[] = landmarks.map((lm) => ({
    x: lm.x * videoWidth,
    y: lm.y * videoHeight,
    z: lm.z * videoWidth,
  }));

  const leftEye = points[LANDMARK_INDICES.LEFT_EYE_OUTER];
  const rightEye = points[LANDMARK_INDICES.RIGHT_EYE_OUTER];
  const noseBridge = points[LANDMARK_INDICES.NOSE_BRIDGE_TOP];
  const noseTop = points[LANDMARK_INDICES.NOSE_BRIDGE_MID];
  const leftTemple = points[LANDMARK_INDICES.LEFT_TEMPLE];
  const rightTemple = points[LANDMARK_INDICES.RIGHT_TEMPLE];

  const faceWidth = Math.sqrt(
    Math.pow(rightTemple.x - leftTemple.x, 2) +
    Math.pow(rightTemple.y - leftTemple.y, 2)
  );

  return {
    points,
    leftEye,
    rightEye,
    noseBridge,
    noseTop,
    leftTemple,
    rightTemple,
    faceWidth,
  };
}
