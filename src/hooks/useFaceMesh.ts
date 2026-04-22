import { useEffect, useRef, useState } from 'react';
import * as faceMeshModule from '@mediapipe/face_mesh';

// Workaround (Mẹo) xử lý lỗi import thư viện MediaPipe trong môi trường Vite
const FaceMeshClass = faceMeshModule.FaceMesh || (faceMeshModule as any).default?.FaceMesh || (window as any).FaceMesh;

export function useFaceMesh() {
  const faceMeshRef = useRef<any>(null); 
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!FaceMeshClass) {
      console.error("Không thể load được module FaceMesh từ MediaPipe.");
      return;
    }

    // Khởi tạo FaceMesh với CDN jsdelivr
    const faceMesh = new FaceMeshClass({
      locateFile: (file: string) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/${file}`,
    });

    // Cấu hình: 1 khuôn mặt, 478 điểm (refineLandmarks)
    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true, 
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    // ✅ CÁCH FIX Ở ĐÂY: Dùng hàm initialize() để đợi tải xong AI Model từ mạng
    faceMesh.initialize().then(() => {
      setIsReady(true);
      console.log("✅ FaceMesh Model đã tải xong!");
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