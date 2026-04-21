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
  },
  {
    id: 'wayfarer-black',
    name: 'Urban Wayfarer',
    brand: 'RayStyle',
    modelPath: '/models/glasses-002.glb',
    thumbnail: '/thumbnails/glasses-002.png',
    category: 'sunglasses',
    price: 129.99,
  },
  {
    id: 'round-silver',
    name: 'Retro Round',
    brand: 'VintageSpec',
    modelPath: '/models/glasses-003.glb',
    thumbnail: '/thumbnails/glasses-003.png',
    category: 'eyeglasses',
    price: 99.99,
  },
  {
    id: 'cat-eye-pink',
    name: 'Cat Eye',
    brand: 'GlamVision',
    modelPath: '/models/glasses-004.glb',
    thumbnail: '/thumbnails/glasses-004.png',
    category: 'fashion',
    price: 179.99,
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
  }
];

// Hàm lấy dữ liệu kính theo ID
export const getGlassesById = (id: string): GlassesModel | undefined => {
  return glassesCatalog.find((glasses) => glasses.id === id);
};
