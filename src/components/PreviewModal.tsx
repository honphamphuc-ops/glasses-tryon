import React from 'react';

interface PreviewModalProps {
  imageUrl: string;
  glassesName: string;
  onClose: () => void;
  onRetake: () => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({ 
  imageUrl, 
  glassesName, 
  onClose, 
  onRetake 
}) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-2xl flex-col items-center gap-6">
        <h3 className="text-xl font-bold text-white uppercase tracking-wider">
          Ảnh của bạn với {glassesName}
        </h3>
        
        <div className="relative overflow-hidden rounded-2xl border-4 border-white/20 shadow-2xl">
          <img src={imageUrl} alt="Preview" className="w-full object-contain" />
        </div>

        <div className="flex gap-4">
          <button
            onClick={onRetake}
            className="rounded-full bg-white/10 px-8 py-3 font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
          >
            Chụp lại
          </button>
          <button
            onClick={onClose}
            className="rounded-full bg-teal-500 px-8 py-3 font-semibold text-white shadow-lg transition hover:bg-teal-600 active:scale-95"
          >
            Xong
          </button>
        </div>
      </div>
    </div>
  );
};