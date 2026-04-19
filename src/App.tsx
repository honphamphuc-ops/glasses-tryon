import { useCallback, useRef, useState } from 'react';
import { useWebcam } from '@/hooks/useWebcam';
import { useFaceMesh } from '@/hooks/useFaceMesh';
import { useGlassesRenderer } from '@/hooks/useGlassesRenderer';
import { useAnimationLoop } from '@/hooks/useAnimationLoop';
import { WebcamView } from '@/components/WebcamView';
import { GlassesCatalog } from '@/components/GlassesCatalog';
import { CaptureButton } from '@/components/CaptureButton';
import { PermissionModal } from '@/components/PermissionModal';
import { glassesCatalog } from '@/data/catalog';
import { GlassesModel } from '@/types/glasses';
import { captureScreenshot, downloadScreenshot } from '@/lib/screenshotCapture';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { videoRef, isActive, error, hasPermission, startCamera } = useWebcam();
  const { landmarks, isLoading, initialize: initFaceMesh } = useFaceMesh(videoRef);
  const { initRenderer, loadGlasses, updateGlasses, render } = useGlassesRenderer(
    canvasRef,
    1280,
    720
  );

  const [selectedGlasses, setSelectedGlasses] = useState<GlassesModel | null>(null);

  const handleAllow = useCallback(async () => {
    await startCamera();
    initRenderer();
    await initFaceMesh();
  }, [startCamera, initRenderer, initFaceMesh]);

  const handleSelectGlasses = useCallback(
    async (glasses: GlassesModel) => {
      setSelectedGlasses(glasses);
      await loadGlasses(glasses);
    },
    [loadGlasses]
  );

  const handleCapture = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const dataUrl = captureScreenshot(videoRef.current, canvasRef.current);
      downloadScreenshot(dataUrl);
    }
  }, [videoRef]);

  // Animation loop
  useAnimationLoop(() => {
    updateGlasses(landmarks);
    render();
  }, isActive);

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-center border-b bg-white px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Virtual Glasses Try-On
        </h1>
      </header>

      {/* Main content */}
      <main className="flex flex-1 flex-col items-center overflow-hidden p-4">
        {(hasPermission === null || hasPermission === false) && (
          <PermissionModal onAllow={handleAllow} error={error} />
        )}

        <div className="relative w-full max-w-3xl flex-1">
          <WebcamView videoRef={videoRef} canvasRef={canvasRef} />

          {isLoading && isActive && (
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/30">
              <p className="text-lg font-semibold text-white">Loading face detection...</p>
            </div>
          )}

          {/* Capture button */}
          {isActive && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <CaptureButton onCapture={handleCapture} disabled={!selectedGlasses} />
            </div>
          )}
        </div>
      </main>

      {/* Glasses catalog */}
      {isActive && (
        <footer className="border-t bg-white">
          <GlassesCatalog
            glasses={glassesCatalog}
            selectedId={selectedGlasses?.id ?? null}
            onSelect={handleSelectGlasses}
          />
        </footer>
      )}
    </div>
  );
}
