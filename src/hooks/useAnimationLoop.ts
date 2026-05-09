import { useEffect, useRef } from 'react';
import type { GlassesTransform, Point3D } from '@/types/landmarks';

interface UseAnimationLoopProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  faceMeshRef: React.MutableRefObject<any>;
  onResults: (results: any) => void;
  enabled: boolean;
  // Callbacks are stored in refs to avoid restarting the RAF loop
  onFrame?: () => void;
  onTrackStart?: () => void;
}

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
  const isProcessing = useRef<boolean>(false);

  const onResultsRef = useRef(onResults);
  useEffect(() => {
    onResultsRef.current = onResults;
  }, [onResults]);

  // Stable refs for callbacks to avoid effect restarts when parents recreate functions
  const onFrameRef = useRef(onFrame);
  useEffect(() => {
    onFrameRef.current = onFrame;
  }, [onFrame]);

  const onTrackStartRef = useRef(onTrackStart);
  useEffect(() => {
    onTrackStartRef.current = onTrackStart;
  }, [onTrackStart]);

  useEffect(() => {
    if (!enabled) return;

    // We'll attach onResultsCallback when faceMesh becomes available
    let hasAttachedResults = false;

    const loop = (now: number) => {
      // 1. BỌC TRY...CATCH CHO RENDER ĐỂ VÒNG LẶP BẤT TỬ
      try {
        if (onFrameRef.current) onFrameRef.current();
      } catch (err) {
        console.error("Lỗi Render 3D:", err);
      }

      // 2. GẮN onResultsCallback nếu chưa gắn và faceMesh sẵn sàng
      try {
        if (!hasAttachedResults && faceMeshRef.current) {
          (faceMeshRef.current as any).onResultsCallback = (results: any) => {
            isProcessing.current = false;
            if (onResultsRef.current) onResultsRef.current(results);
          };
          hasAttachedResults = true;
        }

        // Chỉ gửi ảnh khi video đã sẵn sàng
        if (
          videoRef.current &&
          videoRef.current.readyState >= 2 &&
          faceMeshRef.current &&
          now - lastTrackTime.current >= 33 && // Khóa ở mức 30fps
          !isProcessing.current
        ) {
          lastTrackTime.current = now;
          isProcessing.current = true;

          if (onTrackStartRef.current) onTrackStartRef.current();

          // NẠP TRỰC TIẾP VIDEO VÀO AI (Bỏ qua canvas ẩn)
          (faceMeshRef.current as any).send({ image: videoRef.current }).catch((err: any) => {
            console.error("Lỗi MediaPipe WASM:", err);
            isProcessing.current = false; // Lỗi cũng phải mở khóa
          });
        }
      } catch (err) {
        console.error("Lỗi Logic Tracking:", err);
        isProcessing.current = false;
      }

      // 3. LUÔN LUÔN GỌI LẠI VÒNG LẶP (Không bao giờ được dừng)
      requestRef.current = requestAnimationFrame(loop);
    };

    // Kích hoạt vòng lặp phát súng đầu tiên
    requestRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(requestRef.current);
    };
  }, [enabled]);
}