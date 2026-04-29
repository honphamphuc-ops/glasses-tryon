import { GlassesAdjustment, GlassesModel } from '@/types/glasses';

interface DebugTuningPanelProps {
  selectedGlasses: GlassesModel | null;
  adjustment: Required<GlassesAdjustment>;
  onAdjustmentChange: (next: Required<GlassesAdjustment>) => void;
  onCopyConfig: () => void;
  onRunQa: () => void;
  statusMessage: string | null;
}

interface SliderConfig {
  key: keyof Required<GlassesAdjustment>;
  label: string;
  min: number;
  max: number;
  step: number;
}

const SLIDERS: SliderConfig[] = [
  { key: 'scaleOverride', label: 'Scale', min: 0.5, max: 2, step: 0.01 },
  { key: 'yOffset', label: 'Y Offset', min: -0.1, max: 0.1, step: 0.001 },
  { key: 'zOffset', label: 'Z Offset', min: -0.2, max: 0.2, step: 0.001 },
];

export function DebugTuningPanel({
  selectedGlasses,
  adjustment,
  onAdjustmentChange,
  onCopyConfig,
  onRunQa,
  statusMessage,
}: DebugTuningPanelProps) {
  return (
    <section className="rounded-[1.5rem] border border-amber-200 bg-amber-50/80 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-700">Debug Tuning</p>
          <h3 className="mt-1 text-sm font-bold text-slate-900">
            {selectedGlasses ? selectedGlasses.name : 'Chọn một mẫu kính để tinh chỉnh'}
          </h3>
        </div>
        <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          ?debug=true
        </span>
      </div>

      <div className="mt-4 space-y-4">
        {SLIDERS.map((slider) => (
          <label key={slider.key} className="block">
            <div className="mb-1 flex items-center justify-between text-xs font-medium text-slate-700">
              <span>{slider.label}</span>
              <span className="font-mono text-slate-500">{adjustment[slider.key].toFixed(3)}</span>
            </div>
            <input
              type="range"
              min={slider.min}
              max={slider.max}
              step={slider.step}
              value={adjustment[slider.key]}
              disabled={!selectedGlasses}
              onChange={(event) => {
                const value = Number(event.target.value);
                onAdjustmentChange({ ...adjustment, [slider.key]: value });
              }}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white accent-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </label>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={onCopyConfig}
          disabled={!selectedGlasses}
          className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Copy config
        </button>
        <button
          onClick={onRunQa}
          className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
        >
          Run QA checklist
        </button>
      </div>

      <p className="mt-3 min-h-4 text-[11px] text-slate-500">
        {statusMessage ?? 'Điều chỉnh realtime chỉ áp dụng trong phiên debug hiện tại.'}
      </p>
    </section>
  );
}