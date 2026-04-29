export interface GlassesAdjustment {
  scaleOverride?: number;
  yOffset?: number;
  zOffset?: number;
}

export interface GlassesModel {
  id: string;
  name: string;
  brand: string;
  modelPath: string;
  texturePath?: string;
  thumbnail: string;
  category: 'sunglasses' | 'eyeglasses' | 'fashion';
  price: number;
  scaleOverride?: number;
  yOffset?: number;
  zOffset?: number;
}
