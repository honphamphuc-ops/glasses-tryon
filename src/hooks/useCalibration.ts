import { useState, useRef, useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Point3D } from '@/types/landmarks';
import { KEY_POINTS } from '@/data/landmarkIndices';

export function useCalibration() {
  const { calibratedEyeWidth, calibrate } = useAppStore();
  const samplesRef = useRef<number[]>([]);
  const [progress, setProgress] = useState<number>(0);

  const isCalibrated = calibratedEyeWidth !== null;

  const processSample = useCallback(
    (landmarks: Point3D[]) => {
      // Nếu đã calibrate rồi thì bỏ qua
      if (isCalibrated) return;

      const leftOuter = landmarks[KEY_POINTS.LEFT_EYE_OUTER];
      const rightOuter = landmarks[KEY_POINTS.RIGHT_EYE_OUTER];

      if (!leftOuter || !rightOuter) return;

      // Đo khoảng cách mắt hiện tại
      const eyeWidth = Math.hypot(rightOuter.x - leftOuter.x, rightOuter.y - leftOuter.y);
      samplesRef.current.push(eyeWidth);

      // Cập nhật progress (0 - 100%)
      const currentProgress = Math.min((samplesRef.current.length / 10) * 100, 100);
      setProgress(currentProgress);

      // Khi đủ 10 mẫu, tính trung bình và lưu vào store
      if (samplesRef.current.length >= 10) {
        const sum = samplesRef.current.reduce((acc, val) => acc + val, 0);
        const avg = sum / samplesRef.current.length;
        calibrate(avg);
      }
    },
    [isCalibrated, calibrate]
  );

  return { processSample, isCalibrated, progress };
}