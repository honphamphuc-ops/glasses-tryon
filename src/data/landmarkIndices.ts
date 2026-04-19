// MediaPipe Face Mesh landmark indices
export const LANDMARK_INDICES = {
  // Eye inner/outer corners
  LEFT_EYE_INNER: 133,
  LEFT_EYE_OUTER: 33,
  RIGHT_EYE_INNER: 362,
  RIGHT_EYE_OUTER: 263,

  // Nose bridge
  NOSE_BRIDGE_TOP: 6,
  NOSE_BRIDGE_MID: 197,
  NOSE_TIP: 1,

  // Face outline / temples
  LEFT_TEMPLE: 127,
  RIGHT_TEMPLE: 356,

  // Forehead
  FOREHEAD_CENTER: 10,

  // Chin
  CHIN: 152,

  // Ear area
  LEFT_EAR: 234,
  RIGHT_EAR: 454,
} as const;
