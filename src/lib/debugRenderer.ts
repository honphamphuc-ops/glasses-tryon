import { KEY_POINTS } from '@/data/landmarkIndices';

export function drawEyeBoundingBox(ctx: CanvasRenderingContext2D, metrics: any, w: number, h: number) {
  const { eyeWidth, midpoint } = metrics;
  
  // Chuyển đổi tọa độ chuẩn hóa (0-1) sang pixel thực tế
  const mx = midpoint.x * w;
  const my = midpoint.y * h;
  const ew = eyeWidth * w;
  const boxHeight = ew * 0.4; // Ước lượng chiều cao hộp viền mắt

  ctx.strokeStyle = 'yellow';
  ctx.lineWidth = 2;
  
  // Vẽ Bounding Box quanh khu vực mắt
  ctx.strokeRect(mx - ew / 2, my - boxHeight / 2, ew, boxHeight);

  // Vẽ Crosshair (Dấu thập) ngay tâm
  ctx.beginPath();
  ctx.moveTo(mx - 15, my);
  ctx.lineTo(mx + 15, my);
  ctx.moveTo(mx, my - 15);
  ctx.lineTo(mx, my + 15);
  ctx.stroke();
}

export function drawNosePoint(ctx: CanvasRenderingContext2D, landmarks: any[], w: number, h: number) {
  const noseBridge = landmarks[KEY_POINTS.NOSE_BRIDGE];
  if (!noseBridge) return;

  ctx.fillStyle = 'red';
  ctx.beginPath();
  ctx.arc(noseBridge.x * w, noseBridge.y * h, 6, 0, 2 * Math.PI);
  ctx.fill();
}

export function drawFPS(ctx: CanvasRenderingContext2D, fps: number, trackingFps: number) {
  // Reset lật ngang để vẽ text bình thường ở góc màn hình
  ctx.save();
  ctx.scale(-1, 1); 
  ctx.translate(-ctx.canvas.width, 0); 
  
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(10, 10, 160, 45);
  
  ctx.fillStyle = '#00FF00';
  ctx.font = '14px monospace';
  ctx.fillText(`Render: ${fps} FPS`, 20, 30);
  ctx.fillText(`Track:  ${trackingFps} FPS`, 20, 48);
  
  ctx.restore();
}