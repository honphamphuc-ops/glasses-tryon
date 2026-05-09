import { useState } from 'react';
import { GlassesModel } from '@/types/glasses';

interface GlassesCardProps {
  glasses: GlassesModel;
  isSelected: boolean;
  isLoading: boolean;
  disabled?: boolean;
  onClick: (glasses: GlassesModel) => void;
}

const USD_TO_VND_RATE = 26000;

const CATEGORY_LABELS: Record<GlassesModel['category'], string> = {
  sunglasses: 'Kính mát',
  eyeglasses: 'Kính thuốc',
  fashion: 'Fashion',
};

export function GlassesCard({ glasses, isSelected, isLoading, disabled = false, onClick }: GlassesCardProps) {
  const [hasImageError, setHasImageError] = useState(false);
  const displayPrice = glasses.price < 1000 ? Math.round(glasses.price * USD_TO_VND_RATE) : Math.round(glasses.price);
  const formattedPrice = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(displayPrice);
  const originalPrice = glasses.price < 1000
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(glasses.price)
    : null;

  return (
    <button
      onClick={() => onClick(glasses)}
      disabled={disabled}
      aria-pressed={isSelected}
      className={`group relative flex w-[15rem] shrink-0 snap-center flex-col overflow-hidden rounded-[1.75rem] border p-3 text-left transition-all duration-200 md:w-auto ${
        disabled
          ? 'cursor-not-allowed opacity-50'
          : isSelected
            ? 'border-teal-500 bg-teal-50/80 shadow-lg shadow-teal-900/10 ring-1 ring-teal-500/40'
            : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-lg hover:shadow-slate-900/5'
      }`}
    >
      {isSelected && (
        <div className="absolute right-0 top-0 z-10 rounded-bl-2xl bg-teal-500 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white shadow-sm">
          Đang thử
        </div>
      )}

      <div className="relative mb-4 flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100 via-white to-teal-50">
        {hasImageError ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-center text-slate-500">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/80 text-lg font-semibold text-slate-700 shadow-sm">
              {glasses.brand.slice(0, 2).toUpperCase()}
            </div>
            <span className="text-xs font-medium">Không tải được thumbnail</span>
          </div>
        ) : (
          <img
            src={glasses.thumbnail}
            alt={glasses.name}
            className={`h-full w-full object-contain p-3 transition duration-300 ${
              isLoading ? 'scale-105 opacity-30' : 'group-hover:scale-105'
            }`}
            loading="lazy"
            decoding="async"
            onError={() => setHasImageError(true)}
          />
        )}

        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-950/10 backdrop-blur-[1px]">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-700">
              Đang tải
            </span>
          </div>
        )}
      </div>

      <div className="flex w-full flex-1 flex-col">
        <div className="mb-2 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="block truncate text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              {glasses.brand}
            </span>
            <span className="mt-1 block truncate text-base font-bold text-slate-900">
              {glasses.name}
            </span>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
            {CATEGORY_LABELS[glasses.category]}
          </span>
        </div>

        <span className="mt-auto text-sm font-semibold text-teal-700">
          {formattedPrice}
        </span>
        {originalPrice && (
          <span className="mt-1 text-xs text-slate-500">{originalPrice}</span>
        )}
      </div>
    </button>
  );
}