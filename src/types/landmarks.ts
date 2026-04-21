export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface FaceLandmarks {
  points: Point3D[];
  leftEye: Point3D;
  rightEye: Point3D;
  noseBridge: Point3D;
  noseTop: Point3D;
  leftTemple: Point3D;
  rightTemple: Point3D;
  faceWidth: number;
}

// Bổ sung theo checklist Ngày 2
export interface FaceTransform {
  position: Point3D;
  rotation: { x: number; y: number; z: number };
  scale: number;
}

export interface EyeMetrics {
  leftEyeCenter: Point3D;
  rightEyeCenter: Point3D;
  interpupillaryDistance: number; // Khoảng cách giữa 2 đồng tử
}

export interface GlassesTransform {
  position: Point3D;
  rotation: { x: number; y: number; z: number };
  scale: number;
}