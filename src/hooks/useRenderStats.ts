import { useState, useRef, useCallback } from 'react';

export interface RenderStats {
  fps: number;
  trackingFps: number;
  latencyMs: number;
  faceDetected: boolean;
}

export function useRenderStats() {
  const [stats, setStats] = useState<RenderStats>({
    fps: 0,
    trackingFps: 0,
    latencyMs: 0,
    faceDetected: false,
  });

  const framesRef = useRef(0);
  const trackFramesRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const trackStartTimeRef = useRef(0);

  // Gọi trong hàm loop chính (60fps)
  const markFrame = useCallback(() => {
    framesRef.current += 1;
    updateMetrics();
  }, []);

  // Gọi ngay trước khi gọi fm.send()
  const markTrackStart = useCallback(() => {
    trackStartTimeRef.current = performance.now();
    trackFramesRef.current += 1;
  }, []);

  // Gọi trong onResults của FaceMesh
  const markTrackEnd = useCallback((hasFace: boolean) => {
    const latency = performance.now() - trackStartTimeRef.current;
    
    setStats(prev => ({
      ...prev,
      latencyMs: Math.round(latency),
      faceDetected: hasFace
    }));
  }, []);

  const updateMetrics = () => {
    const now = performance.now();
    const elapsed = now - lastTimeRef.current;

    // Cập nhật FPS mỗi giây
    if (elapsed >= 1000) {
      setStats(prev => ({
        ...prev,
        fps: Math.round((framesRef.current * 1000) / elapsed),
        trackingFps: Math.round((trackFramesRef.current * 1000) / elapsed)
      }));
      
      framesRef.current = 0;
      trackFramesRef.current = 0;
      lastTimeRef.current = now;
    }
  };

  return { stats, markFrame, markTrackStart, markTrackEnd };
}