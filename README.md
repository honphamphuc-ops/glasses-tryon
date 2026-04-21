# 👓 Virtual Glasses Try-On (React + Three.js + MediaPipe)

Dự án ứng dụng thử kính thực tế ảo trên nền tảng Web, kết hợp nhận diện khuôn mặt AI và kết xuất đồ họa 3D.

## ✨ Tính năng nổi bật (Tuần 2 - Milestone T2)
- Nhận diện khuôn mặt thời gian thực với **MediaPipe Face Mesh** (478 điểm).
- Kiến trúc luồng đôi tối ưu hiệu năng: **Render 60fps / Tracking 30fps**.
- Tự động hiệu chỉnh tỉ lệ khuôn mặt (Auto-Calibration) dựa trên khoảng cách 2 mắt.
- Giao diện Debug Overlay: Hiển thị Bounding Box, điểm mũi, và thông số FPS theo thời gian thực.
- Hỗ trợ lật hình camera như soi gương (Mirror Mode).

## 🚀 Hướng dẫn cài đặt và chạy dự án

### Yêu cầu hệ thống
- Node.js (phiên bản 18+ khuyến nghị)
- Trình duyệt hỗ trợ WebGL và quyền truy cập Camera (Chrome/Safari/Edge).

### Các bước cài đặt

1. **Clone dự án:**
   ```bash
   git clone <link-github-cua-ban>
   cd glasses-tryon