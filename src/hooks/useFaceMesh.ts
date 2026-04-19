import { useCallback, useEffect, useRef, useState } from 'react';
import { FaceMesh, Results } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';
import { FaceLandmarks } from '@/types/landmarks';
import { extractLandmarks } from '@/lib/faceMeshProcessor';

export function useFaceMesh(videoRef: React.RefObject<HTMLVideoElement>) {
  const [landmarks, setLandmarks] = useState<FaceLandmarks | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const faceMeshRef = useRef<FaceMesh | null>(null);
  const cameraRef = useRef<Camera | null>(null);

  const onResults = useCallback((results: Results) => {
    if (!videoRef.current) return;

    const videoWidth = videoRef.current.videoWidth;
    const videoHeight = videoRef.current.videoHeight;

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      const faceLandmarks = extractLandmarks(
        results.multiFaceLandmarks[0],
        videoWidth,
        videoHeight
      );
      setLandmarks(faceLandmarks);
    } else {
      setLandmarks(null);
    }
  }, [videoRef]);

  const initialize = useCallback(async () => {
    const faceMesh = new FaceMesh({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMesh.onResults(onResults);
    faceMeshRef.current = faceMesh;

    if (videoRef.current) {
      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          if (faceMeshRef.current && videoRef.current) {
            await faceMeshRef.current.send({ image: videoRef.current });
          }
        },
        width: 1280,
        height: 720,
      });

      cameraRef.current = camera;
      await camera.start();
    }

    setIsLoading(false);
  }, [onResults, videoRef]);

  useEffect(() => {
    return () => {
      cameraRef.current?.stop();
      faceMeshRef.current?.close();
    };
  }, []);

  return { landmarks, isLoading, initialize };
}
