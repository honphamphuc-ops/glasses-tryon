/**
 * Xử lý chụp ảnh kết hợp Video và Canvas 3D
 */
export const GLASSES_CAPTURE_HISTORY_KEY = 'glasses-tryon.captureHistory';

interface CaptureHistoryEntry {
  capturedAt: number;
  fileName: string;
  glassesName: string;
}

export function ensureCaptureHistoryStorage(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    if (window.localStorage.getItem(GLASSES_CAPTURE_HISTORY_KEY) === null) {
      window.localStorage.setItem(GLASSES_CAPTURE_HISTORY_KEY, JSON.stringify([]));
    }
  } catch (error) {
    console.warn('Không thể khởi tạo capture history trong localStorage:', error);
  }
}

function appendCaptureHistory(entry: CaptureHistoryEntry): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const currentRaw = window.localStorage.getItem(GLASSES_CAPTURE_HISTORY_KEY);
    const current = currentRaw ? JSON.parse(currentRaw) as CaptureHistoryEntry[] : [];
    const next = [entry, ...current].slice(0, 20);
    window.localStorage.setItem(GLASSES_CAPTURE_HISTORY_KEY, JSON.stringify(next));
  } catch (error) {
    console.warn('Không thể lưu capture history:', error);
  }
}

export async function captureSnapshot(
  videoEl: HTMLVideoElement,
  outputCanvas: HTMLCanvasElement,
  glassesName: string
): Promise<string> {
  const width = videoEl.videoWidth;
  const height = videoEl.videoHeight;

  // 1. Tạo Canvas ẩn (Offscreen)
  const captureCanvas = document.createElement('canvas');
  captureCanvas.width = width;
  captureCanvas.height = height;
  const ctx = captureCanvas.getContext('2d');

  if (!ctx) throw new Error('Không thể khởi tạo context 2D');

  // Lớp 1: Vẽ Video Camera
  // Vì video trên giao diện thường bị lật gương (scaleX(-1)), 
  // ta phải lật lại canvas này trước khi vẽ để ảnh chụp giống hệt những gì user thấy.
  ctx.save();
  ctx.scale(-1, 1);
  ctx.translate(-width, 0);
  ctx.drawImage(videoEl, 0, 0, width, height);
  ctx.restore();

  // Lớp 2: Vẽ Three.js Canvas (Kính 3D)
  // Lưu ý: outputCanvas phải được khởi tạo với preserveDrawingBuffer: true
  ctx.drawImage(outputCanvas, 0, 0, width, height);

  // 2. Xuất dữ liệu ảnh
  const dataUrl = captureCanvas.toDataURL('image/png');

  // 3. Tự động tải xuống
  const link = document.createElement('a');
  const timestamp = new Date().getTime();
  link.download = `tryon-${glassesName.toLowerCase().replace(/\s+/g, '-')}-${timestamp}.png`;
  link.href = dataUrl;
  appendCaptureHistory({ capturedAt: timestamp, fileName: link.download, glassesName });
  link.click();

  return dataUrl;
}