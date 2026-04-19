export interface AppStoreState {
  calibratedEyeWidth: number | null;
}

const initialState: AppStoreState = {
  calibratedEyeWidth: null,
};

export function useAppStore(): AppStoreState {
  return initialState;
}
