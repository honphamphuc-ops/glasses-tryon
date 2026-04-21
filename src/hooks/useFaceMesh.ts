import { useEffect, useRef, useState } from 'react';
import * as faceMeshModule from '@mediapipe/face_mesh';

// Workaround (Mẹo) xử lý lỗi import thư viện MediaPipe trong môi trường Vite
const FaceMeshClass = faceMeshModule.FaceMesh || (faceMeshModule as any).default?.FaceMesh || (window as any).FaceMesh;

export function useFaceMesh() {
  const faceMeshRef = useRef<any>(null); 
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Tránh crash nếu module thực sự không load được
    if (!FaceMeshClass) {
      console.error("Không thể load được module FaceMesh từ MediaPipe.");
      return;
    }

    // Khởi tạo FaceMesh với CDN jsdelivr
    const faceMesh = new FaceMeshClass({
      locateFile: (file: string) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    // Cấu hình: 1 khuôn mặt, 478 điểm (refineLandmarks), độ tự tin 0.7
    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true, 
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    // Khi load xong model sẽ chạy callback này báo hiệu AI đã sẵn sàng
    faceMesh.onResults(() => {
      if (!isReady) setIsReady(true);
    });

    faceMeshRef.current = faceMesh;

    // Cleanup khi component unmount
    return () => {
      if (faceMeshRef.current) {
        faceMeshRef.current.close();
      }
    };
  }, []);

  return { faceMeshRef, isReady };
}