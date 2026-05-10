import { create } from 'zustand';
import { GlassesModel } from '@/types/glasses';

type WebcamStatus = 'idle' | 'starting' | 'active' | 'error';

export interface AppStoreState {
  // --- States ---
  webcamStatus: WebcamStatus;
  selectedGlasses: GlassesModel | null;
  isLoading: boolean;
  error: string | null;
  calibratedEyeWidth: number | null;
  loadingModelId: string | null; 
  calibratedFaceWidth: number | null;

  // --- Actions ---
  selectGlasses: (glasses: GlassesModel | null) => void;
  setWebcamStatus: (status: WebcamStatus, error?: string | null) => void;
  calibrate: (eyeWidth: number, faceWidth: number) => void;
  setIsLoading: (isLoading: boolean) => void;
  setLoadingModelId: (id: string | null) => void;
  startLoadModel: (id: string) => void;
  finishLoadModel: (id: string) => void;
  resetCalibration: () => void;
}

export const useAppStore = create<AppStoreState>((set) => ({
  // Giá trị mặc định
  webcamStatus: 'idle',
  selectedGlasses: null,
  isLoading: false,
  error: null,
  calibratedEyeWidth: null,
  calibratedFaceWidth: null,
  loadingModelId: null,

  // Các hàm thay đổi state
  selectGlasses: (glasses) => set({ selectedGlasses: glasses }),
  
  setWebcamStatus: (status, error = null) => set({ webcamStatus: status, error }),
  
  calibrate: (eyeWidth, faceWidth) => set({ calibratedEyeWidth: eyeWidth, calibratedFaceWidth: faceWidth }),
  
  setIsLoading: (isLoading) => set({ isLoading }),
  setLoadingModelId: (id) => set({ loadingModelId: id }),
  startLoadModel: (id) => set({ loadingModelId: id }),
  finishLoadModel: (id) => set((state) => (
    state.loadingModelId === id ? { loadingModelId: null } : state
  )),
  resetCalibration: () => set({ calibratedEyeWidth: null, calibratedFaceWidth: null }), // Hủy kết quả đo cũ
}));