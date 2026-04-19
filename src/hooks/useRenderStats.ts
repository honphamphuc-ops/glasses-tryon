export interface RenderStats {
  fps: number;
  latencyMs: number;
  faceDetected: boolean;
}

export function useRenderStats(): RenderStats {
  return {
    fps: 0,
    latencyMs: 0,
    faceDetected: false,
  };
}
