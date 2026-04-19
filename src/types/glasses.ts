export interface GlassesModel {
  id: string;
  name: string;
  brand: string;
  modelPath: string;
  texturePath?: string;
  thumbnail: string;
  category: 'sunglasses' | 'eyeglasses' | 'fashion';
  price: number;
  scale?: number;
  offset?: { x: number; y: number; z: number };
}
