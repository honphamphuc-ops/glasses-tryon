import { GlassesModel } from '@/types/glasses';

interface GlassesCardProps {
  glasses: GlassesModel;
  isSelected: boolean;
  isLoading: boolean;
  onClick: (glasses: GlassesModel) => void;
}

export function GlassesCard({ glasses, isSelected, isLoading, onClick }: GlassesCardProps) {
  // Format giá tiền (VD: 149000 -> 149.000 ₫)
  const formattedPrice = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(glasses.price);

  return (
    <button
      onClick={() => onClick(glasses)}
      // Tailwind snap-center cho mobile carousel, width linh hoạt
      className={`relative flex w-40 shrink-0 flex-col overflow-hidden rounded-2xl border-2 p-3 text-left transition-all duration-200 snap-center sm:w-auto ${
        isSelected
          ? 'border-teal-500 bg-teal-50 shadow-md ring-1 ring-teal-500'
          : 'border-gray-100 bg-white hover:border-teal-300 hover:shadow-sm'
      }`}
    >
      {/* Badge "Đang thử" */}
      {isSelected && (
        <div className="absolute right-0 top-0 z-10 rounded-bl-lg bg-teal-500 px-2 py-1 text-[10px] font-bold text-white shadow-sm">
          Đang thử
        </div>
      )}

      {/* Vùng Thumbnail / Spinner */}
      <div className="relative mb-3 flex aspect-video w-full items-center justify-center rounded-xl bg-gray-50/80">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-500 border-t-transparent"></div>
            <span className="text-[10px] font-medium text-teal-600">Đang tải...</span>
          </div>
        ) : (
          <img
            src={glasses.thumbnail}
            alt={glasses.name}
            className="h-full w-full object-contain p-2 transition-transform duration-300 hover:scale-110"
            loading="lazy"
          />
        )}
      </div>

      {/* Thông tin */}
      <div className="flex w-full flex-col">
        <span className="truncate text-xs font-semibold uppercase tracking-wider text-gray-500">
          {glasses.brand}
        </span>
        <span className="truncate text-sm font-bold text-gray-800">
          {glasses.name}
        </span>
        <span className="mt-1 text-sm font-medium text-teal-600">
          {formattedPrice}
        </span>
      </div>
    </button>
  );
}