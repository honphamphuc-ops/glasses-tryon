import { GlassesModel } from '@/types/glasses';

interface GlassesCardProps {
  glasses: GlassesModel;
  isSelected: boolean;
  onSelect: (glasses: GlassesModel) => void;
}

export function GlassesCard({ glasses, isSelected, onSelect }: GlassesCardProps) {
  return (
    <button
      onClick={() => onSelect(glasses)}
      className={`flex flex-shrink-0 flex-col items-center rounded-xl border-2 p-3 transition ${
        isSelected
          ? 'border-indigo-500 bg-indigo-50 shadow-md'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      <div className="mb-2 flex h-20 w-20 items-center justify-center rounded-lg bg-gray-100">
        <img
          src={glasses.thumbnail}
          alt={glasses.name}
          className="h-16 w-16 object-contain"
        />
      </div>
      <span className="text-sm font-medium text-gray-800">{glasses.name}</span>
      <span className="text-xs text-gray-500">{glasses.brand}</span>
      <span className="mt-1 text-sm font-semibold text-indigo-600">
        ${glasses.price}
      </span>
    </button>
  );
}
