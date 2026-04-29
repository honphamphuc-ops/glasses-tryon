// Các điểm mốc (landmarks) chuẩn của MediaPipe Face Mesh (478 điểm)
export const KEY_POINTS = {
  // --- Khu vực mắt ---
  LEFT_EYE_OUTER: 133,  // Vị trí: Đuôi mắt trái (Góc ngoài). Dùng để: Tính toán chiều rộng khuôn mặt (Scale) và góc xoay (Rotation Z).
  LEFT_EYE_INNER: 33,   // Vị trí: Hốc mắt trái (Góc trong). Dùng để: Tính khoảng cách hai mắt.
  RIGHT_EYE_OUTER: 263, // Vị trí: Đuôi mắt phải. Dùng để: Tính toán Scale và Rotation Z.
  RIGHT_EYE_INNER: 362, // Vị trí: Hốc mắt phải. Dùng để: Tính khoảng cách hai mắt.

  // --- Khu vực mũi ---
  NOSE_TIP: 1,          // Vị trí: Đỉnh mũi. Dùng để: Ước lượng góc nghiêng lên/xuống (Pitch).
  NOSE_BRIDGE: 168,     // Vị trí: Sống mũi (giữa 2 mắt). Dùng để: Làm điểm gốc (Position) đặt trọng tâm của kính.

  // --- Khu vực biên khuôn mặt ---
  LEFT_EAR: 234,        // Vị trí: Gần tai trái. Dùng để: Tính toán góc quay ngang (Yaw) và độ rộng tổng thể.
  RIGHT_EAR: 454,       // Vị trí: Gần tai phải. Dùng để: Tính toán Yaw.
  CHIN: 152             // Vị trí: Đáy cằm. Dùng để: Xác định tỷ lệ dọc của khuôn mặt.
} as const;

export const FACE_OVAL_INDICES = [
  10, 338, 297, 332, 284, 251, 389, 356, 454,
  323, 361, 288, 397, 365, 379, 378, 400, 377,
  152, 148, 176, 149, 150, 136, 172, 58, 132,
  93, 234, 127, 162, 21, 54, 103, 67, 109,
] as const;