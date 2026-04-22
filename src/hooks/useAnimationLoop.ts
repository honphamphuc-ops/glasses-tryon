import { useEffect, useRef } from 'react';

interface UseAnimationLoopProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  faceMeshRef: React.MutableRefObject<any>;
  onResults: (results: any) => void;
  enabled: boolean;
  onFrame?: () => void;
  onTrackStart?: () => void;
}

const TRACKING_FPS = 30;
const TRACKING_INTERVAL = 1000 / TRACKING_FPS;

export function useAnimationLoop({
  videoRef,
  faceMeshRef,
  onResults,
  enabled,
  onFrame,
  onTrackStart,
}: UseAnimationLoopProps) {
  const requestRef = useRef<number>(0);
  const lastTrackTime = useRef<number>(0);
  const isRunning = useRef<boolean>(false);
  
  // ✅ CÁCH FIX: Thêm KHÓA để AI không bị quá tải
  const isProcessingRef = useRef<boolean>(false); 
  
  const onResultsRef = useRef(onResults);
  useEffect(() => {
    onResultsRef.current = onResults;
  }, [onResults]);

  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const offscreenCtxRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    offscreenCanvasRef.current = canvas;
    offscreenCtxRef.current = canvas.getContext('2d', { willReadFrequently: true });
  }, []);

  useEffect(() => {
    if (!enabled || !videoRef.current || !faceMeshRef.current || !offscreenCanvasRef.current) {
      isRunning.current = false;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      return;
    }

    isRunning.current = true;
    
    // Khi AI xử lý xong -> Chạy kết quả -> Mở khóa
    faceMeshRef.current.onResults((results: any) => {
      onResultsRef.current(results);
      isProcessingRef.current = false; // ✅ Mở khóa cho frame tiếp theo
    });

    const loop = (now: number) => {
      if (!isRunning.current) return;

      // 1. Luôn chạy Render 3D ở tốc độ cao nhất có thể (60 FPS)
      if (onFrame) onFrame();

      const video = videoRef.current;
      const offscreenCanvas = offscreenCanvasRef.current;
      const ctx = offscreenCtxRef.current;

      // 2. AI AI chỉ lấy frame khi ĐÃ MỞ KHÓA (chống DDoS ngầm)
      if (
        video && video.readyState >= 2 && 
        now - lastTrackTime.current >= TRACKING_INTERVAL &&
        !isProcessingRef.current // <--- Kiểm tra khóa ở đây
      ) {
        lastTrackTime.current = now;
        
        if (offscreenCanvas!.width !== video.videoWidth) {
          offscreenCanvas!.width = video.videoWidth;
          offscreenCanvas!.height = video.videoHeight;
        }
        ctx?.drawImage(video, 0, 0, offscreenCanvas!.width, offscreenCanvas!.height);

        isProcessingRef.current = true; // ✅ Khóa lại ngay lập tức
        if (onTrackStart) onTrackStart();
        
        // Gửi ảnh đi (Promise)
    // Khi AI xử lý xong -> Chạy kết quả -> Mở khóa
        faceMeshRef.current.onResults((results: any) => {
          try {
            onResultsRef.current(results);
          } catch (err) {
            console.error("Lỗi trong xử lý khuôn mặt (onResults):", err);
          } finally {
            // ✅ Bọc trong finally để LUÔN LUÔN mở khóa, dù code React có lỗi hay không!
            isProcessingRef.current = false; 
          }
        });
      }
      
      requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);

    return () => {
      isRunning.current = false;
      cancelAnimationFrame(requestRef.current);
    };
  }, [enabled, videoRef, faceMeshRef, onFrame, onTrackStart]);
}