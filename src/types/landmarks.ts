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
