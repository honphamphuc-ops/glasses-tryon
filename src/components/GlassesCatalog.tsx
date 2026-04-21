import { GlassesModel } from '@/types/glasses';
import { GlassesCard } from './GlassesCard';

interface GlassesCatalogProps {
  glasses: GlassesModel[];
  selectedId: string | null;
  loadingId: string | null;
  onSelect: (glasses: GlassesModel) => void;
}

export function GlassesCatalog({ glasses, selectedId, loadingId, onSelect }: GlassesCatalogProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white/80 p-4 backdrop-blur-md">
        <h2 className="text-lg font-bold text-gray-800">Chọn kính</h2>
        <span className="flex h-6 items-center justify-center rounded-full bg-gray-100 px-3 text-xs font-semibold text-gray-600">
          {glasses.length} mẫu
        </span>
      </div>

      {/* Layout Responsive: 
        - Mobile: flex ngang, overflow-x-auto, snap-x mandatory để vuốt mượt như Shopee
        - lg (Desktop): grid 2 cột, lướt dọc
      */}
      <div className="flex-1 overflow-y-auto lg:p-4 custom-scrollbar">
        <div className="flex gap-4 overflow-x-auto p-4 snap-x snap-mandatory lg:grid lg:grid-cols-2 lg:overflow-visible lg:p-0">
          {glasses.map((g) => (
            <GlassesCard
              key={g.id}
              glasses={g}
              isSelected={g.id === selectedId}
              isLoading={g.id === loadingId}
              onClick={onSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
}