import { KEY_POINTS } from '@/data/landmarkIndices';
import { EyeMetrics, Point3D, FaceLandmarks } from '@/types/landmarks';

// Hàm cũ bị mất
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

  const leftEye = points[KEY_POINTS.LEFT_EYE_OUTER] || points[33];
  const rightEye = points[KEY_POINTS.RIGHT_EYE_OUTER] || points[263];
  const noseBridge = points[KEY_POINTS.NOSE_BRIDGE] || points[168];
  const noseTop = points[1] || points[1];
  const leftTemple = points[KEY_POINTS.LEFT_EAR] || points[234];
  const rightTemple = points[KEY_POINTS.RIGHT_EAR] || points[454];

  const faceWidth = Math.hypot(rightTemple.x - leftTemple.x, rightTemple.y - leftTemple.y);

  return { points, leftEye, rightEye, noseBridge, noseTop, leftTemple, rightTemple, faceWidth };
}

// Các hàm mới
export function extractEyeMetrics(landmarks: Point3D[]): EyeMetrics & { eyeWidth: number, midpoint: Point3D } {
  const leftOuter = landmarks[KEY_POINTS.LEFT_EYE_OUTER];
  const leftInner = landmarks[KEY_POINTS.LEFT_EYE_INNER];
  const rightOuter = landmarks[KEY_POINTS.RIGHT_EYE_OUTER];
  const rightInner = landmarks[KEY_POINTS.RIGHT_EYE_INNER];

  const leftCenter: Point3D = {
    x: (leftOuter.x + leftInner.x) / 2, y: (leftOuter.y + leftInner.y) / 2, z: (leftOuter.z + leftInner.z) / 2,
  };
  const rightCenter: Point3D = {
    x: (rightOuter.x + rightInner.x) / 2, y: (rightOuter.y + rightInner.y) / 2, z: (rightOuter.z + rightInner.z) / 2,
  };
  const midpoint: Point3D = {
    x: (leftCenter.x + rightCenter.x) / 2, y: (leftCenter.y + rightCenter.y) / 2, z: (leftCenter.z + rightCenter.z) / 2,
  };

  const eyeWidth = Math.hypot(rightOuter.x - leftOuter.x, rightOuter.y - leftOuter.y);

  return { leftEyeCenter: leftCenter, rightEyeCenter: rightCenter, interpupillaryDistance: Math.hypot(rightCenter.x - leftCenter.x, rightCenter.y - leftCenter.y), eyeWidth, midpoint };
}

export function drawDebugLandmarks(ctx: CanvasRenderingContext2D, landmarks: { x: number; y: number }[], w: number, h: number) {
  ctx.fillStyle = 'rgba(0, 255, 0, 0.4)';
  landmarks.forEach((lm) => { ctx.beginPath(); ctx.arc(lm.x * w, lm.y * h, 1.5, 0, 2 * Math.PI); ctx.fill(); });

  ctx.fillStyle = 'red';
  ctx.font = '10px Arial';
  Object.entries(KEY_POINTS).forEach(([name, index]) => {
    const lm = landmarks[index];
    if (!lm) return;
    const px = lm.x * w, py = lm.y * h;
    ctx.beginPath(); ctx.arc(px, py, 4, 0, 2 * Math.PI); ctx.fill();
    ctx.save(); ctx.translate(px, py); ctx.scale(-1, 1); ctx.fillStyle = 'white'; ctx.fillText(name, -5, -8); ctx.restore();
  });
}