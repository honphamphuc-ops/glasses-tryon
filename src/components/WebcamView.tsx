interface WebcamViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export function WebcamView({ videoRef, canvasRef }: WebcamViewProps) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-gray-900">
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        style={{ transform: 'scaleX(-1)' }}
        playsInline
        muted
      />
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{ transform: 'scaleX(-1)' }}
      />
    </div>
  );
}
