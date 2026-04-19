import { GlassesModel } from '@/types/glasses';
import { GlassesCard } from './GlassesCard';

interface GlassesCatalogProps {
  glasses: GlassesModel[];
  selectedId: string | null;
  onSelect: (glasses: GlassesModel) => void;
}

export function GlassesCatalog({ glasses, selectedId, onSelect }: GlassesCatalogProps) {
  return (
    <div className="flex gap-3 overflow-x-auto p-4">
      {glasses.map((g) => (
        <GlassesCard
          key={g.id}
          glasses={g}
          isSelected={g.id === selectedId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
