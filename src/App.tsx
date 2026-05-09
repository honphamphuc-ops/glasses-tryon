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
import { DebugTuningPanel } from '@/components/DebugTuningPanel';
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
import { runQAChecklist } from '@/lib/qaChecklist';
import { drawEyeBoundingBox, drawNosePoint } from '@/lib/debugRenderer';
import { captureSnapshot, ensureCaptureHistoryStorage } from '@/lib/screenshotCapture';
import { preloadGlasses } from '@/lib/glassesLoader';
import { GlassesAdjustment, GlassesModel } from '@/types/glasses';
import { GlassesTransform, Point3D } from '@/types/landmarks';

interface RenderFrameState {
  transform: GlassesTransform | null;
  landmarks: Point3D[] | null;
  sourceSize: { width: number; height: number } | null;
}

const DEFAULT_ADJUSTMENT: Required<GlassesAdjustment> = {
  scaleOverride: 1,
  yOffset: 0,
  zOffset: 0,
};

function adjustmentFromModel(glasses: GlassesModel | null): Required<GlassesAdjustment> {
  return {
    scaleOverride: glasses?.scaleOverride ?? DEFAULT_ADJUSTMENT.scaleOverride,
    yOffset: glasses?.yOffset ?? DEFAULT_ADJUSTMENT.yOffset,
    zOffset: glasses?.zOffset ?? DEFAULT_ADJUSTMENT.zOffset,
  };
}

export default function App() {
  // 1. Refs để quản lý dữ liệu không cần re-render
  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const debugCanvasRef = useRef<HTMLCanvasElement>(null);
  const latestFrameRef = useRef<RenderFrameState>({ transform: null, landmarks: null, sourceSize: null });

  // 2. Local State
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [debugAdjustment, setDebugAdjustment] = useState<Required<GlassesAdjustment>>(DEFAULT_ADJUSTMENT);
  const [debugStatus, setDebugStatus] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 1280, height: 720 });
  const [preloadProgress, setPreloadProgress] = useState({
    loaded: 0,
    total: glassesCatalog.length,
  });
  const isTuningDebug = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === 'true';

  // 3. Zustand Store
  const { 
    selectedGlasses, 
    selectGlasses, 
    loadingModelId,
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
  const { renderFrame, sceneRef, modelRef, maskRef } = useGlassesRenderer(canvasRef, canvasSize.width, canvasSize.height);

  /**
   * 6. LUỒNG XỬ LÝ AI (Tracking - 30fps)
   * Nhận landmarks -> Tính transform -> Cập nhật Ref
   */
  const handleResults = useCallback((results: any) => {
    markTrackEnd(results.multiFaceLandmarks?.length > 0);
    const debugContext = debugCanvasRef.current?.getContext('2d') ?? null;
    const debugWidth = debugCanvasRef.current?.width ?? canvasSize.width;
    const debugHeight = debugCanvasRef.current?.height ?? canvasSize.height;
    const videoWidth = Math.max(videoRef.current?.videoWidth ?? canvasSize.width, 1);
    const videoHeight = Math.max(videoRef.current?.videoHeight ?? canvasSize.height, 1);

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      const rawPoints = results.multiFaceLandmarks[0];
      // Chuyển đổi landmark sang đơn vị Pixel
      const landmarks = extractLandmarks(rawPoints, videoWidth, videoHeight);

      // Hiệu chỉnh khuôn mặt nếu cần
      if (!isCalibrated) {
        processSample(landmarks.points);
      }

      // Tính toán Pose (Vị trí/Góc quay) và lưu vào Ref
      const activeAdjustment = isTuningDebug && selectedGlasses
        ? { ...selectedGlasses, ...debugAdjustment }
        : selectedGlasses;
      const transform = isCalibrated
        ? computeGlassesTransform(landmarks.points, calibratedEyeWidth, activeAdjustment)
        : null;
      latestFrameRef.current = {
        transform,
        landmarks: landmarks.points,
        sourceSize: { width: videoWidth, height: videoHeight },
      };

      // VẼ DEBUG 2D (Chỉ chạy khi bật mode)
      if (isDebugMode && debugContext) {
        debugContext.clearRect(0, 0, debugWidth, debugHeight);
        drawDebugLandmarks(debugContext, rawPoints, debugWidth, debugHeight);

        const metrics = extractEyeMetrics(rawPoints as Point3D[]);
        drawEyeBoundingBox(debugContext, metrics, debugWidth, debugHeight);

        drawNosePoint(debugContext, rawPoints, debugWidth, debugHeight);
      }
    } else {
      latestFrameRef.current = { transform: null, landmarks: null, sourceSize: null };
      if (isDebugMode) {
        debugContext?.clearRect(0, 0, debugWidth, debugHeight);
      }
    }
  }, [
    canvasSize.height,
    canvasSize.width,
    calibratedEyeWidth,
    debugAdjustment,
    isCalibrated,
    isDebugMode,
    isTuningDebug,
    markTrackEnd,
    processSample,
    selectedGlasses,
    videoRef,
  ]);

  /**
   * 7. LUỒNG RENDER ĐỒ HỌA (Render - 60fps)
   * Lấy dữ liệu từ Ref và vẽ lên canvas WebGL
   */
  const handleFrame = useCallback(() => {
    markFrame();
    renderFrame(
      latestFrameRef.current.transform,
      latestFrameRef.current.landmarks,
      latestFrameRef.current.sourceSize
    );
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

  const handleSelectGlasses = (glasses: GlassesModel) => {
    if (selectedGlasses?.id === glasses.id && loadingModelId !== glasses.id) {
      return;
    }

    selectGlasses(glasses);
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

  useEffect(() => {
    ensureCaptureHistoryStorage();
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    const updateCanvasSize = () => {
      const { width, height } = viewport.getBoundingClientRect();
      const nextWidth = Math.max(1, Math.round(width));
      const nextHeight = Math.max(1, Math.round(height));

      setCanvasSize((current) => {
        if (current.width === nextWidth && current.height === nextHeight) {
          return current;
        }

        return { width: nextWidth, height: nextHeight };
      });
    };

    updateCanvasSize();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(() => {
        updateCanvasSize();
      });
      observer.observe(viewport);

      return () => {
        observer.disconnect();
      };
    }

    window.addEventListener('resize', updateCanvasSize);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, []);

  useEffect(() => {
    sceneRef.current?.resize(canvasSize.width, canvasSize.height);
  }, [canvasSize.height, canvasSize.width, sceneRef]);

  useEffect(() => {
    if (!isDebugMode) {
      const canvas = debugCanvasRef.current;
      canvas?.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [isDebugMode]);

  useEffect(() => {
    setDebugAdjustment(adjustmentFromModel(selectedGlasses));
    setDebugStatus(null);
  }, [selectedGlasses]);

  useEffect(() => {
    let isMounted = true;

    void preloadGlasses(
      glassesCatalog.map((glasses) => glasses.modelPath),
      (loaded, total) => {
        if (!isMounted) {
          return;
        }

        setPreloadProgress({ loaded, total });
      }
    );

    return () => {
      isMounted = false;
    };
  }, []);

  const isPreloadingModels = preloadProgress.total > 0 && preloadProgress.loaded < preloadProgress.total;
  const showModelOverlay = Boolean(loadingModelId);

  const handleCopyDebugConfig = useCallback(() => {
    if (!selectedGlasses) {
      setDebugStatus('Chưa có mẫu kính nào được chọn.');
      return;
    }

    const snippet = `scaleOverride: ${debugAdjustment.scaleOverride.toFixed(3)}, yOffset: ${debugAdjustment.yOffset.toFixed(3)}, zOffset: ${debugAdjustment.zOffset.toFixed(3)}`;

    navigator.clipboard.writeText(snippet)
      .then(() => setDebugStatus(`Đã copy config cho ${selectedGlasses.name}.`))
      .catch(() => setDebugStatus('Không copy được vào clipboard.'));
  }, [debugAdjustment, selectedGlasses]);

  const handleRunQaChecklist = useCallback(() => {
    const results = runQAChecklist({
      renderer: sceneRef.current?.renderer ?? null,
      scene: sceneRef.current?.scene ?? null,
      occlusionMesh: maskRef.current,
      glassesModel: modelRef.current,
    });

    const failed = results.filter((result) => !result.passed).length;
    setDebugStatus(failed === 0 ? 'QA checklist: tất cả check đều pass.' : `QA checklist: còn ${failed} check chưa pass, xem console.`);
  }, [maskRef, modelRef, sceneRef]);

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

          <div ref={viewportRef} className="relative aspect-video w-full max-w-5xl overflow-hidden rounded-xl shadow-2xl">
            <WebcamView
              videoRef={videoRef}
              canvasRef={canvasRef}
              debugCanvasRef={debugCanvasRef}
              canvasWidth={canvasSize.width}
              canvasHeight={canvasSize.height}
            />

            {showModelOverlay && (
              <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-slate-950/20 backdrop-blur-[2px]">
                <div className="rounded-2xl border border-white/10 bg-black/55 px-5 py-4 text-center text-white shadow-2xl backdrop-blur-md">
                  <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-white/80 border-t-transparent" />
                  <p className="text-sm font-semibold">Đang tải mô hình 3D...</p>
                  <p className="mt-1 text-xs text-white/70">
                    {selectedGlasses ? selectedGlasses.name : 'Đang đồng bộ kính mới'}
                  </p>
                  {isPreloadingModels && (
                    <p className="mt-2 text-[11px] text-white/55">
                      Thư viện sẵn sàng {preloadProgress.loaded}/{preloadProgress.total}
                    </p>
                  )}
                </div>
              </div>
            )}

            {previewUrl && selectedGlasses && (
              <PreviewModal 
                imageUrl={previewUrl}
                glassesName={selectedGlasses.name}
                onClose={() => setPreviewUrl(null)}
                onRetake={() => setPreviewUrl(null)}
              />
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
              disabled={!isCalibrated}
              onSelect={handleSelectGlasses}
              onResetCalibration={resetCalibration}
              isCalibrated={isCalibrated}
              preloadProgress={preloadProgress}
            />
          </div>

          {isTuningDebug && (
            <div className="border-t border-amber-100 bg-white px-4 py-4">
              <DebugTuningPanel
                selectedGlasses={selectedGlasses}
                adjustment={debugAdjustment}
                onAdjustmentChange={setDebugAdjustment}
                onCopyConfig={handleCopyDebugConfig}
                onRunQa={handleRunQaChecklist}
                statusMessage={debugStatus}
              />
            </div>
          )}

          <div className="bg-gray-50 border-t p-3 text-center text-[10px] text-gray-400 uppercase tracking-widest">
            Powered by Three.js & MediaPipe
          </div>
        </aside>
      </div>
    </div>
  );
}