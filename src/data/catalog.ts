import { GlassesModel } from '@/types/glasses';

export const glassesCatalog: GlassesModel[] = [
  {
    id: 'aviator-gold',
    name: 'Classic Aviator',
    brand: 'RayStyle',
    modelPath: '/models/aviator.glb',
    thumbnail: '/thumbnails/aviator.png',
    category: 'sunglasses',
    price: 149.99,
  },
  {
    id: 'wayfarer-black',
    name: 'Urban Wayfarer',
    brand: 'RayStyle',
    modelPath: '/models/wayfarer.glb',
    thumbnail: '/thumbnails/wayfarer.png',
    category: 'sunglasses',
    price: 129.99,
  },
  {
    id: 'round-silver',
    name: 'Retro Round',
    brand: 'VintageSpec',
    modelPath: '/models/round.glb',
    thumbnail: '/thumbnails/round.png',
    category: 'eyeglasses',
    price: 99.99,
  },
  {
    id: 'cat-eye-pink',
    name: 'Cat Eye',
    brand: 'GlamVision',
    modelPath: '/models/cat-eye.glb',
    thumbnail: '/thumbnails/cat-eye.png',
    category: 'fashion',
    price: 179.99,
  },
];
