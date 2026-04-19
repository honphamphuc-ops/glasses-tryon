export function captureScreenshot(
  videoElement: HTMLVideoElement,
  overlayCanvas: HTMLCanvasElement
): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;

  // Draw video frame
  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

  // Draw glasses overlay
  ctx.drawImage(overlayCanvas, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL('image/png');
}

export function downloadScreenshot(dataUrl: string, filename = 'glasses-tryon.png') {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
