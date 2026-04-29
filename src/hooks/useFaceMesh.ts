import { useEffect, useRef, useState } from 'react';
import * as faceMeshModule from '@mediapipe/face_mesh';

const FaceMeshClass = faceMeshModule.FaceMesh || (faceMeshModule as any).default?.FaceMesh || (window as any).FaceMesh;

export function useFaceMesh() {
  const faceMeshRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!FaceMeshClass) return;

    const faceMesh = new FaceMeshClass({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5, // Giúp nhận diện mặt trong bóng tối tốt hơn
      minTrackingConfidence: 0.5,
    });

    // ✅ FIX TYPESCRIPT: Dùng (faceMesh as any) để khai báo cổng kết nối phụ
    faceMesh.onResults((results: any) => {
      if ((faceMesh as any).onResultsCallback) {
        (faceMesh as any).onResultsCallback(results);
      }
    });

    console.log("⏳ Đang tải AI Model từ mạng...");
    faceMesh.initialize()
      .then(() => {
        setIsReady(true);
        console.log("✅ FaceMesh Model đã tải xong và sẵn sàng!");
      })
      .catch((e: any) => console.error("❌ Lỗi tải AI:", e));

    faceMeshRef.current = faceMesh;

    return () => {
      faceMesh.close();
    };
  }, []);

  return { faceMeshRef, isReady };
}