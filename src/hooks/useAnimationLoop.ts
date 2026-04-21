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
    
    faceMeshRef.current.onResults((results: any) => {
      onResultsRef.current(results);
    });

    const loop = async (now: number) => {
      if (!isRunning.current) return;
      const video = videoRef.current;
      const offscreenCanvas = offscreenCanvasRef.current;
      const ctx = offscreenCtxRef.current;

      if (onFrame) onFrame();

      if (video && video.readyState >= 2 && now - lastTrackTime.current >= TRACKING_INTERVAL) {
        lastTrackTime.current = now;
        if (offscreenCanvas!.width !== video.videoWidth) {
          offscreenCanvas!.width = video.videoWidth;
          offscreenCanvas!.height = video.videoHeight;
        }
        ctx?.drawImage(video, 0, 0, offscreenCanvas!.width, offscreenCanvas!.height);

        try {
          if (onTrackStart) onTrackStart();
          await faceMeshRef.current?.send({ image: offscreenCanvas! });
        } catch (error) {
          console.error("Lỗi khi send image cho FaceMesh:", error);
        }
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