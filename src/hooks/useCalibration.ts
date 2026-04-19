export interface CalibrationState {
  calibratedEyeWidth: number | null;
}

export function useCalibration(): CalibrationState {
  return { calibratedEyeWidth: null };
}
