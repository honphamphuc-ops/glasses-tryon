import { GlassesModel } from '@/types/glasses';

export const glassesCatalog: GlassesModel[] = [
  {
    id: 'aviator-gold',
    name: 'Classic Aviator',
    brand: 'RayStyle',
    modelPath: '/models/glasses-001.glb',
    thumbnail: '/thumbnails/glasses-001.png',
    category: 'sunglasses',
    price: 149.99,
    scaleOverride: 1.18,
    yOffset: 0.01,
    zOffset: 0.03,
  },
  {
    id: 'wayfarer-black',
    name: 'Urban Wayfarer',
    brand: 'RayStyle',
    modelPath: '/models/glasses-002.glb',
    thumbnail: '/thumbnails/glasses-002.png',
    category: 'sunglasses',
    price: 129.99,
    scaleOverride: 1.06,
    yOffset: 0.015,
    zOffset: 0.035,
  },
  {
    id: 'round-silver',
    name: 'Retro Round',
    brand: 'VintageSpec',
    modelPath: '/models/glasses-003.glb',
    thumbnail: '/thumbnails/glasses-003.png',
    category: 'eyeglasses',
    price: 99.99,
    scaleOverride: 0.94,
    yOffset: 0.005,
    zOffset: 0.02,
  },
  {
    id: 'cat-eye-pink',
    name: 'Cat Eye',
    brand: 'GlamVision',
    modelPath: '/models/glasses-004.glb',
    thumbnail: '/thumbnails/glasses-004.png',
    category: 'fashion',
    price: 179.99,
    scaleOverride: 1.1,
    yOffset: 0.02,
    zOffset: 0.03,
  },
  // Đã thêm kính thứ 5 để đủ số lượng yêu cầu
  {
    id: 'clubmaster-classic',
    name: 'Clubmaster Classic',
    brand: 'RayStyle',
    modelPath: '/models/glasses-005.glb',
    thumbnail: '/thumbnails/glasses-005.png',
    category: 'sunglasses',
    price: 159.99,
    scaleOverride: 1.03,
    yOffset: 0.012,
    zOffset: 0.028,
  }
];

// Hàm lấy dữ liệu kính theo ID
export const getGlassesById = (id: string): GlassesModel | undefined => {
  return glassesCatalog.find((glasses) => glasses.id === id);
};
