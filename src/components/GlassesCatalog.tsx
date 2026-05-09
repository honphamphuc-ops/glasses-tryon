import { GlassesModel } from '@/types/glasses';
import { GlassesCard } from './GlassesCard';

interface PreloadProgress {
  loaded: number;
  total: number;
}

interface GlassesCatalogProps {
  glasses: GlassesModel[];
  selectedId: string | null;
  loadingId: string | null;
  disabled?: boolean;
  onSelect: (glasses: GlassesModel) => void;
  onResetCalibration: () => void;
  isCalibrated: boolean;
  preloadProgress: PreloadProgress;
}

export function GlassesCatalog({
  glasses,
  selectedId,
  loadingId,
  disabled = false,
  onSelect,
  onResetCalibration,
  isCalibrated,
  preloadProgress,
}: GlassesCatalogProps) {
  const isPreloading = preloadProgress.total > 0 && preloadProgress.loaded < preloadProgress.total;

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur-md">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Chọn kính</h2>
            <p className="mt-1 text-xs text-slate-500">Vuốt trên điện thoại hoặc xem dạng lưới trên desktop.</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="flex h-7 items-center justify-center rounded-full bg-slate-100 px-3 text-xs font-semibold text-slate-700">
              {glasses.length} mẫu
            </span>
            <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${
              isPreloading
                ? 'bg-amber-50 text-amber-700'
                : 'bg-emerald-50 text-emerald-700'
            }`}>
              {isPreloading
                ? `3D ${preloadProgress.loaded}/${preloadProgress.total}`
                : '3D Ready'}
            </span>
          </div>
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <div className="custom-scrollbar h-full overflow-y-auto px-4 py-4">
          <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory md:grid md:grid-cols-2 md:gap-4 md:overflow-visible md:pb-0">
          {glasses.map((g) => (
            <GlassesCard
              key={g.id}
              glasses={g}
              isSelected={g.id === selectedId}
              isLoading={g.id === loadingId}
              disabled={disabled}
              onClick={onSelect}
            />
          ))}
          </div>
        </div>

        {disabled && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm">
            <p className="max-w-[16rem] px-6 text-center text-sm font-semibold leading-6 text-slate-700">
              Đang hiệu chỉnh khuôn mặt... Vui lòng nhìn thẳng vào camera
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-slate-200 bg-slate-50 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={onResetCalibration}
            disabled={!isCalibrated}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              isCalibrated
                ? 'bg-slate-900 text-white hover:bg-slate-800'
                : 'cursor-not-allowed bg-slate-200 text-slate-500'
            }`}
          >
            Hiệu chỉnh lại
          </button>
          <span className="text-right text-[11px] text-slate-500">
            {isPreloading
              ? `Đang tải mô hình 3D... (${preloadProgress.loaded}/${preloadProgress.total})`
              : 'Thư viện 3D đã sẵn sàng'}
          </span>
        </div>
      </div>
    </div>
  );
}