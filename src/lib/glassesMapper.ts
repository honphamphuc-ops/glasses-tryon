import { KEY_POINTS } from '@/data/landmarkIndices';
import { GlassesAdjustment } from '@/types/glasses';
import { Point3D, GlassesTransform } from '@/types/landmarks';

const REFERENCE_EYE_WIDTH = 0.28;
const BRIDGE_OFFSET_RATIO = 0.12;

function getAdjustmentValue(value: number | undefined, fallback: number): number {
  return Number.isFinite(value) ? value as number : fallback;
}

function computeEyeWidth(left: Point3D, right: Point3D): number {
  return Math.hypot(right.x - left.x, right.y - left.y);
}

function computeRoll(left: Point3D, right: Point3D): number {
  return Math.atan2(right.y - left.y, right.x - left.x);
}

function estimateYaw(landmarks: Point3D[]): number {
  const nose = landmarks[KEY_POINTS.NOSE_BRIDGE];
  const leftEar = landmarks[KEY_POINTS.LEFT_EAR];
  const rightEar = landmarks[KEY_POINTS.RIGHT_EAR];
  if (!nose || !leftEar || !rightEar) return 0;
  const leftDist = Math.hypot(nose.x - leftEar.x, nose.y - leftEar.y);
  const rightDist = Math.hypot(nose.x - rightEar.x, nose.y - rightEar.y);
  return (leftDist - rightDist) / (leftDist + rightDist);
}

function estimatePitch(landmarks: Point3D[]): number {
  const nose = landmarks[KEY_POINTS.NOSE_BRIDGE];
  const chin = landmarks[KEY_POINTS.CHIN];
  const forehead = landmarks[10];
  if (!nose || !chin || !forehead) return 0;
  const topDist = Math.hypot(nose.x - forehead.x, nose.y - forehead.y);
  const bottomDist = Math.hypot(nose.x - chin.x, nose.y - chin.y);
  return (topDist - bottomDist) / (topDist + bottomDist);
}

export function computeGlassesTransform(
  landmarks: Point3D[],
  calibratedEyeWidth?: number | null,
  adjustment?: GlassesAdjustment | null
): GlassesTransform {
  const leftOuter = landmarks[KEY_POINTS.LEFT_EYE_OUTER];
  const rightOuter = landmarks[KEY_POINTS.RIGHT_EYE_OUTER];
  const noseBridge = landmarks[KEY_POINTS.NOSE_BRIDGE];

  if (!leftOuter || !rightOuter || !noseBridge) {
    return {
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: 1,
    };
  }

  const roll = computeRoll(leftOuter, rightOuter);
  const yaw = estimateYaw(landmarks);
  const pitch = estimatePitch(landmarks);

  const currentEyeWidth = computeEyeWidth(leftOuter, rightOuter);
  const reference = calibratedEyeWidth ?? REFERENCE_EYE_WIDTH;
  const scaleOverride = getAdjustmentValue(adjustment?.scaleOverride, 1);
  const yOffset = getAdjustmentValue(adjustment?.yOffset, 0);
  const zOffset = getAdjustmentValue(adjustment?.zOffset, 0);
  const scaleFactor = (currentEyeWidth / reference) * scaleOverride;
  const eyeMidpoint = {
    x: (leftOuter.x + rightOuter.x) / 2,
    y: (leftOuter.y + rightOuter.y) / 2 + currentEyeWidth * (BRIDGE_OFFSET_RATIO + yOffset),
    z: noseBridge.z,
  };

  return {
    position: eyeMidpoint,
    rotation: { x: pitch, y: yaw, z: roll },
    scale: scaleFactor,
    depthOffset: zOffset,
  };
}