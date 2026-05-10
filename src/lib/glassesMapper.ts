import { KEY_POINTS } from '@/data/landmarkIndices';
import { GlassesAdjustment } from '@/types/glasses';
import { Point3D, GlassesTransform } from '@/types/landmarks';

const BRIDGE_OFFSET_RATIO = 0.12;
const DEFAULT_EYE_FACE_RATIO = 0.75; // Tỉ lệ mắt/mặt tham khảo, tinh chỉnh sau khi test

function getAdjustmentValue(value: number | undefined, fallback: number): number {
  return Number.isFinite(value) ? value as number : fallback;
}

function computeEyeWidth(left: Point3D, right: Point3D): number {
  return Math.hypot(right.x - left.x, right.y - left.y);
}

function computeRoll(left: Point3D, right: Point3D): number {
  return -Math.atan2(right.y - left.y, right.x - left.x);
}

function estimateYaw(landmarks: Point3D[]): number {
  const nose = landmarks[KEY_POINTS.NOSE_BRIDGE];
  const leftEar = landmarks[KEY_POINTS.LEFT_EAR];
  const rightEar = landmarks[KEY_POINTS.RIGHT_EAR];
  if (!nose || !leftEar || !rightEar) return 0;
  const leftDist = Math.hypot(nose.x - leftEar.x, nose.y - leftEar.y);
  const rightDist = Math.hypot(nose.x - rightEar.x, nose.y - rightEar.y);
  return -(leftDist - rightDist) / (leftDist + rightDist);
}

function estimatePitch(landmarks: Point3D[]): number {
  const noseBridge = landmarks[KEY_POINTS.NOSE_BRIDGE];
  const chin = landmarks[KEY_POINTS.CHIN];
  const forehead = landmarks[10];
  if (!noseBridge || !chin || !forehead) return 0;
  const topDist = Math.hypot(noseBridge.x - forehead.x, noseBridge.y - forehead.y);
  const bottomDist = Math.hypot(noseBridge.x - chin.x, noseBridge.y - chin.y);
  return (topDist - bottomDist) / (topDist + bottomDist);
}

export function computeGlassesTransform(
  landmarks: Point3D[],
  calibratedEyeWidth?: number | null,
  calibratedFaceWidth?: number | null,  // ➕ Tham số mới
  adjustment?: GlassesAdjustment | null
): GlassesTransform {
  const leftOuter = landmarks[KEY_POINTS.LEFT_EYE_OUTER];
  const rightOuter = landmarks[KEY_POINTS.RIGHT_EYE_OUTER];
  const noseBridge = landmarks[KEY_POINTS.NOSE_BRIDGE];
  const leftTemple = landmarks[KEY_POINTS.LEFT_EAR];
  const rightTemple = landmarks[KEY_POINTS.RIGHT_EAR];

  if (!leftOuter || !rightOuter || !noseBridge || !leftTemple || !rightTemple) {
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
  const currentFaceWidth = Math.hypot(
    rightTemple.x - leftTemple.x,
    rightTemple.y - leftTemple.y
  );

  // --- TÍNH SCALE MỚI ---
  let targetEyeWidth: number;

  if (calibratedEyeWidth != null && calibratedFaceWidth != null) {
    // Đã calibrate: dùng tỉ lệ cá nhân
    const personalRatio = calibratedEyeWidth / calibratedFaceWidth;
    targetEyeWidth = currentFaceWidth * personalRatio;
  } else {
    // Chưa calibrate: dùng tỉ lệ mặc định
    targetEyeWidth = currentFaceWidth * DEFAULT_EYE_FACE_RATIO;
  }

  const scaleOverride = getAdjustmentValue(adjustment?.scaleOverride, 1);
  const scaleFactor = (currentEyeWidth / targetEyeWidth) * scaleOverride;

  // --- TÍNH VỊ TRÍ ---
  const yOffset = getAdjustmentValue(adjustment?.yOffset, 0);
  const zOffset = getAdjustmentValue(adjustment?.zOffset, 0);
  const eyeMidpoint = {
    x: (leftOuter.x + rightOuter.x) / 2,
    y: (leftOuter.y + rightOuter.y) / 2 + currentEyeWidth * (BRIDGE_OFFSET_RATIO + yOffset),
    z: noseBridge.z,
  };

  console.log('📏 Scale debug:', {
  currentEyeWidth,
  currentFaceWidth,
  targetEyeWidth,
  scaleFactor,
  isCalibrated: calibratedEyeWidth != null,
});

  return {
    position: eyeMidpoint,
    rotation: { x: pitch, y: yaw, z: roll },
    scale: scaleFactor,
    depthOffset: zOffset,
  };
}