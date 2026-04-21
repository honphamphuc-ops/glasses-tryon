import React, { useState } from 'react';

interface WebcamViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onToggleDebug?: (isDebug: boolean) => void; // Thêm prop để báo cho App.tsx biết
}

export function WebcamView({ videoRef, canvasRef, onToggleDebug }: WebcamViewProps) {
  const [isDebugMode, setIsDebugMode] = useState(false);

  const handleToggle = () => {
    const newVal = !isDebugMode;
    setIsDebugMode(newVal);
    if (onToggleDebug) {
      onToggleDebug(newVal);
    }
  };

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-gray-900 shadow-inner">
      {/* Nút Toggle Debug Mode */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 backdrop-blur-md">
        <span className="text-xs font-semibold text-white">Debug Mode</span>
        <button
          onClick={handleToggle}
          className={`relative h-6 w-11 rounded-full transition-colors duration-200 focus:outline-none ${
            isDebugMode ? 'bg-indigo-500' : 'bg-gray-500'
          }`}
        >
          <span
            className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform duration-200 ${
              isDebugMode ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        style={{ transform: 'scaleX(-1)' }}
        playsInline
        muted
      />
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{ transform: 'scaleX(-1)' }}
      />
    </div>
  );
}