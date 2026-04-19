interface CaptureButtonProps {
  onCapture: () => void;
  disabled?: boolean;
}

export function CaptureButton({ onCapture, disabled }: CaptureButtonProps) {
  return (
    <button
      onClick={onCapture}
      disabled={disabled}
      className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg transition hover:scale-105 active:scale-95 disabled:opacity-50"
      aria-label="Capture screenshot"
    >
      <div className="h-10 w-10 rounded-full border-4 border-indigo-600" />
    </button>
  );
}
