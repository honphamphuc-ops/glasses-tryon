import { useState, useRef, useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Point3D } from '@/types/landmarks';
import { KEY_POINTS } from '@/data/landmarkIndices';

export function useCalibration() {
  const { calibratedEyeWidth, calibrate } = useAppStore();
  const eyeSamplesRef = useRef<number[]>([]);
  const faceSamplesRef = useRef<number[]>([]);
  const [progress, setProgress] = useState<number>(0);

  const isCalibrated = calibratedEyeWidth !== null;

  const processSample = useCallback(
    (landmarks: Point3D[]) => {
      if (isCalibrated) return;

      const leftOuter = landmarks[KEY_POINTS.LEFT_EYE_OUTER];
      const rightOuter = landmarks[KEY_POINTS.RIGHT_EYE_OUTER];
      const leftTemple = landmarks[KEY_POINTS.LEFT_EAR];
      const rightTemple = landmarks[KEY_POINTS.RIGHT_EAR];

      if (!leftOuter || !rightOuter || !leftTemple || !rightTemple) return;

      // Đo eye width
      const eyeWidth = Math.hypot(
        rightOuter.x - leftOuter.x,
        rightOuter.y - leftOuter.y
      );
      // Đo face width
      const faceWidth = Math.hypot(
        rightTemple.x - leftTemple.x,
        rightTemple.y - leftTemple.y
      );

      eyeSamplesRef.current.push(eyeWidth);
      faceSamplesRef.current.push(faceWidth);

      const currentProgress = Math.min(
        (eyeSamplesRef.current.length / 10) * 100,
        100
      );
      setProgress(currentProgress);

      // Khi đủ 10 mẫu, tính trung bình và calibrate
      if (eyeSamplesRef.current.length >= 10) {
        const sumEye = eyeSamplesRef.current.reduce((a, b) => a + b, 0);
        const avgEye = sumEye / eyeSamplesRef.current.length;
        const sumFace = faceSamplesRef.current.reduce((a, b) => a + b, 0);
        const avgFace = sumFace / faceSamplesRef.current.length;

        calibrate(avgEye, avgFace);  // Gọi action mới
      }
    },
    [isCalibrated, calibrate]
  );

  return { processSample, isCalibrated, progress };
}