import { useEffect, useRef } from 'react';

interface UseAnimationLoopProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  faceMeshRef: React.MutableRefObject<any>;
  onResults: (results: any) => void;
  enabled: boolean;
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

  useEffect(() => {
    if (!enabled || !videoRef.current || !faceMeshRef.current) return;

    // Cắm cổng kết nối để mở khóa khi AI quét xong mặt
    faceMeshRef.current.onResultsCallback = (results: any) => {
      isProcessing.current = false;
      if (onResultsRef.current) onResultsRef.current(results);
    };

    const loop = (now: number) => {
      // 1. BỌC TRY...CATCH CHO RENDER ĐỂ VÒNG LẶP BẤT TỬ
      try {
        if (onFrame) onFrame();
      } catch (err) {
        console.error("Lỗi Render 3D:", err);
      }

      // 2. BỌC TRY...CATCH CHO AI TRACKING
      try {
        if (
          videoRef.current &&
          videoRef.current.readyState >= 2 &&
          now - lastTrackTime.current >= 33 && // Khóa ở mức 30fps
          !isProcessing.current
        ) {
          lastTrackTime.current = now;
          isProcessing.current = true;

          if (onTrackStart) onTrackStart();

          // NẠP TRỰC TIẾP VIDEO VÀO AI (Bỏ qua canvas ẩn)
          faceMeshRef.current.send({ image: videoRef.current }).catch((err: any) => {
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
  }, [enabled, videoRef, faceMeshRef, onFrame, onTrackStart]);
}