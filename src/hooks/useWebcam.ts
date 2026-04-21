import { useCallback, useRef, useState } from 'react';

export function useWebcam() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      streamRef.current = stream;
      setIsActive(true);
      setHasPermission(true);
      setError(null);
    } catch (err: unknown) {
      setHasPermission(false);
      
      // Phân loại 3 loại lỗi camera phổ biến
      if (err instanceof DOMException) {
        switch (err.name) {
          case 'NotAllowedError':
          case 'SecurityError':
            setError('Quyền truy cập bị từ chối. Vui lòng cấp quyền sử dụng camera trên trình duyệt.');
            break;
          case 'NotFoundError':
          case 'OverconstrainedError':
            setError('Không tìm thấy camera trên thiết bị của bạn. Vui lòng kiểm tra lại kết nối.');
            break;
          case 'NotReadableError':
          case 'TrackStartError':
            setError('Camera đang được sử dụng bởi một ứng dụng khác (như Zoom, Meet) hoặc bị lỗi phần cứng.');
            break;
          default:
            setError('Lỗi không xác định khi truy cập camera: ' + err.message);
        }
      } else {
        setError('Lỗi không xác định khi truy cập camera.');
      }
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  }, []);

  return {
    videoRef,
    isActive,
    error,
    hasPermission,
    startCamera,
    stopCamera,
  };
}