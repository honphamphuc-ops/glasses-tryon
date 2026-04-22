import { useCallback, useRef, useEffect, useState } from 'react';

// --- Hooks ---
import { useWebcam } from '@/hooks/useWebcam';
import { useFaceMesh } from '@/hooks/useFaceMesh';
import { useGlassesRenderer } from '@/hooks/useGlassesRenderer';
import { useAnimationLoop } from '@/hooks/useAnimationLoop';
import { useCalibration } from '@/hooks/useCalibration';
import { useRenderStats } from '@/hooks/useRenderStats';

// --- Components ---
import { WebcamView } from '@/components/WebcamView';
import { GlassesCatalog } from '@/components/GlassesCatalog';
import { CaptureButton } from '@/components/CaptureButton';
import { PermissionModal } from '@/components/PermissionModal';
import { CalibrationOverlay } from '@/components/CalibrationOverlay';
import { FpsCounter } from '@/components/FpsCounter';
import { PreviewModal } from '@/components/PreviewModal';

// --- Store & Utils ---
import { useAppStore } from '@/store/useAppStore';
import { glassesCatalog } from '@/data/catalog';
import { 
  extractLandmarks, 
  drawDebugLandmarks, 
  extractEyeMetrics 
} from '@/lib/faceMeshProcessor';
import { computeGlassesTransform } from '@/lib/glassesMapper';
import { drawEyeBoundingBox, drawNosePoint } from '@/lib/debugRenderer';
import { captureSnapshot } from '@/lib/screenshotCapture';
import { GlassesModel } from '@/types/glasses';

export default function App() {
  // 1. Refs để quản lý dữ liệu không cần re-render
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const latestTransformRef = useRef<any>(null); // Lưu tọa độ kính để luồng Render lấy liên tục

  // 2. Local State
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // 3. Zustand Store
  const { 
    selectedGlasses, 
    selectGlasses, 
    loadingModelId,
    setLoadingModelId,
    setIsLoading, 
    calibratedEyeWidth,
    resetCalibration,
    setWebcamStatus
  } = useAppStore();

  // 4. Khởi tạo các dịch vụ AI và Camera
  const { videoRef, isActive, error: camError, hasPermission, startCamera } = useWebcam();
  const { faceMeshRef, isReady: isAiReady } = useFaceMesh();
  const { stats, markFrame, markTrackStart, markTrackEnd } = useRenderStats();
  const { processSample, isCalibrated, progress } = useCalibration();
  
  // 5. Khởi tạo Renderer 3D
  const { renderFrame } = useGlassesRenderer(canvasRef, 1280, 720);

  /**
   * 6. LUỒNG XỬ LÝ AI (Tracking - 30fps)
   * Nhận landmarks -> Tính transform -> Cập nhật Ref
   */
  const handleResults = useCallback((results: any) => {
    markTrackEnd(results.multiFaceLandmarks?.length > 0);

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      const rawPoints = results.multiFaceLandmarks[0];
      // Chuyển đổi landmark sang đơn vị Pixel
      const landmarks = extractLandmarks(rawPoints, 1280, 720);

      // Hiệu chỉnh khuôn mặt nếu cần
      if (!isCalibrated) {
        processSample(landmarks.points);
      }

      // Tính toán Pose (Vị trí/Góc quay) và lưu vào Ref
      const transform = computeGlassesTransform(landmarks.points, calibratedEyeWidth);
      latestTransformRef.current = transform;

      // VẼ DEBUG 2D (Chỉ chạy khi bật mode)
      if (isDebugMode && canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, 1280, 720); // Xóa frame cũ
          drawDebugLandmarks(ctx, rawPoints, 1280, 720);
          
          // Sử dụng eye metrics thay vì transform để tránh lỗi crash
          const metrics = extractEyeMetrics(landmarks.points);
          drawEyeBoundingBox(ctx, metrics, 1280, 720);
          
          drawNosePoint(ctx, rawPoints, 1280, 720);
        }
      }
    } else {
      latestTransformRef.current = null;
      if (isDebugMode && canvasRef.current) {
        canvasRef.current.getContext('2d')?.clearRect(0, 0, 1280, 720);
      }
    }
  }, [isCalibrated, processSample, calibratedEyeWidth, isDebugMode, markTrackEnd]);

  /**
   * 7. LUỒNG RENDER ĐỒ HỌA (Render - 60fps)
   * Lấy dữ liệu từ Ref và vẽ lên canvas WebGL
   */
  const handleFrame = useCallback(() => {
    markFrame();
    renderFrame(latestTransformRef.current);
  }, [markFrame, renderFrame]);

  // 8. Kết nối vào vòng lặp Animation chính
  useAnimationLoop({
    videoRef,
    faceMeshRef,
    onResults: handleResults,
    enabled: isActive && isAiReady,
    onFrame: handleFrame,
    onTrackStart: markTrackStart
  });

  // 9. Handlers
  const handleStart = async () => {
    setWebcamStatus('starting');
    await startCamera();
    setWebcamStatus('active');
  };

  const handleSelectGlasses = async (glasses: GlassesModel) => {
    selectGlasses(glasses);
    setLoadingModelId(glasses.id);
    // Giả lập thời gian nạp model GLB
    setTimeout(() => setLoadingModelId(null), 500);
  };

  const handleCapture = async () => {
    if (videoRef.current && canvasRef.current && selectedGlasses) {
      try {
        const url = await captureSnapshot(
          videoRef.current, 
          canvasRef.current, 
          selectedGlasses.name
        );
        setPreviewUrl(url);
      } catch (err) {
        console.error("Lỗi khi chụp ảnh:", err);
      }
    }
  };

  useEffect(() => {
    setIsLoading(!isAiReady);
  }, [isAiReady, setIsLoading]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50 font-sans text-gray-900">
      {/* Header */}
      <header className="z-20 flex h-16 shrink-0 items-center justify-between border-b bg-white px-6 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-2xl">👓</span>
          <h1 className="bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-xl font-bold text-transparent">
            Glasses AR Try-On
          </h1>
        </div>
        
        {isActive && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
              <span className="hidden sm:inline">Chế độ Debug</span>
              <button 
                onClick={() => setIsDebugMode(!isDebugMode)}
                className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${isDebugMode ? 'bg-teal-500' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform duration-200 ${isDebugMode ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Layout chính */}
      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        
        {/* Khu vực Camera (70%) */}
        <main className="relative flex w-full flex-col items-center justify-center bg-gray-950 lg:w-[70%]">
          
          {isDebugMode && isActive && <FpsCounter stats={stats} />}
          
          {isActive && !isCalibrated && (
            <CalibrationOverlay isCalibrated={isCalibrated} progress={progress} />
          )}

          {!hasPermission && (
            <PermissionModal onAllow={handleStart} error={camError} />
          )}

          <div className="relative aspect-video w-full max-w-5xl overflow-hidden rounded-xl shadow-2xl">
            <WebcamView videoRef={videoRef} canvasRef={canvasRef} />

            {previewUrl && selectedGlasses && (
              <PreviewModal 
                imageUrl={previewUrl}
                glassesName={selectedGlasses.name}
                onClose={() => setPreviewUrl(null)}
                onRetake={() => setPreviewUrl(null)}
              />
            )}

            {isActive && isCalibrated && !previewUrl && (
              <button 
                onClick={resetCalibration}
                className="absolute bottom-6 left-6 z-30 flex items-center gap-2 rounded-full bg-black/50 px-4 py-2 text-xs font-medium text-white backdrop-blur-md transition hover:bg-black/70 active:scale-95 shadow-lg"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Đo lại khuôn mặt
              </button>
            )}

            {isActive && isCalibrated && !previewUrl && (
              <div className="absolute bottom-8 left-1/2 z-30 -translate-x-1/2">
                <CaptureButton 
                  onCapture={handleCapture}
                  faceDetected={stats.faceDetected}
                  glassesSelected={!!selectedGlasses}
                />
              </div>
            )}
          </div>
        </main>

        {/* Sidebar Catalog (30%) */}
        <aside className="z-10 flex w-full flex-col border-t bg-white shadow-lg lg:w-[30%] lg:border-l lg:border-t-0">
          <div className="flex-1 overflow-hidden">
            <GlassesCatalog
              glasses={glassesCatalog}
              selectedId={selectedGlasses?.id ?? null}
              loadingId={loadingModelId}
              onSelect={handleSelectGlasses}
            />
          </div>

          <div className="bg-gray-50 border-t p-3 text-center text-[10px] text-gray-400 uppercase tracking-widest">
            Powered by Three.js & MediaPipe
          </div>
        </aside>
      </div>
    </div>
  );
}