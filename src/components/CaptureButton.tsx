import React, { useState } from 'react';

interface CaptureButtonProps {
  onCapture: () => Promise<void>;
  faceDetected: boolean;
  glassesSelected: boolean;
}

export const CaptureButton: React.FC<CaptureButtonProps> = ({ 
  onCapture, 
  faceDetected, 
  glassesSelected 
}) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [showFlash, setShowFlash] = useState(false);

  const isDisabled = !faceDetected || !glassesSelected || isCapturing;

  const handleClick = async () => {
    if (isDisabled) return;
    
    setIsCapturing(true);
    setShowFlash(true); // Kích hoạt hiệu ứng Flash

    // Tắt Flash sau 150ms
    setTimeout(() => setShowFlash(false), 150);

    try {
      await onCapture();
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="relative">
      {/* Hiệu ứng Flash trắng bao phủ màn hình */}
      {showFlash && (
        <div className="fixed inset-0 z-[100] bg-white animate-in fade-in duration-150" />
      )}

      <button
        onClick={handleClick}
        disabled={isDisabled}
        className={`group relative flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-teal-500 shadow-2xl transition-all active:scale-90 ${
          isDisabled ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:bg-teal-600'
        }`}
      >
        {isCapturing ? (
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
        ) : (
          <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )}
      </button>
    </div>
  );
};