import React, { useEffect, useState } from 'react';

interface CalibrationOverlayProps {
  isCalibrated: boolean;
  progress: number;
}

export const CalibrationOverlay: React.FC<CalibrationOverlayProps> = ({ isCalibrated, progress }) => {
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Khi vừa chuyển sang trạng thái Calibrated -> Hiện flash success 1 giây
    if (isCalibrated) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 1000);
      return () => clearTimeout(timer);
    } else {
      setShowSuccess(false);
    }
  }, [isCalibrated]);

  // Nếu đã calibrate xong và hết thời gian flash -> Không render gì
  if (isCalibrated && !showSuccess) return null;

  // Render trạng thái thành công
  if (showSuccess) {
    return (
      <div className="absolute inset-0 z-40 flex items-center justify-center bg-green-900/30 backdrop-blur-sm transition-opacity duration-500">
        <div className="flex flex-col items-center rounded-xl bg-white/10 p-6 shadow-lg backdrop-blur-md">
          <div className="mb-2 text-4xl text-green-400">✓</div>
          <p className="text-xl font-bold text-green-400">Đã hiệu chỉnh khuôn mặt</p>
        </div>
      </div>
    );
  }

  // Render trạng thái đang lấy mẫu (Progress bar)
  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300">
      <div className="flex flex-col items-center rounded-2xl bg-white/10 p-8 shadow-2xl backdrop-blur-lg">
        <div className="mb-6 animate-pulse text-5xl">👀</div>
        <p className="mb-6 text-xl font-semibold tracking-wide text-white">
          Nhìn thẳng vào camera...
        </p>
        
        {/* Progress Bar Container */}
        <div className="h-3 w-64 overflow-hidden rounded-full bg-gray-800 shadow-inner">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-200 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-3 text-sm font-medium text-gray-300">
          Đang quét tỉ lệ: {Math.round(progress)}%
        </p>
      </div>
    </div>
  );
};