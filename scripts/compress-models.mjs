#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const rawDir = './public/models/raw';
const outputDir = './public/models';

console.log('Bắt đầu nén mô hình 3D (Draco Compression)...');

// Đảm bảo thư mục đầu ra tồn tại
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Lấy danh sách các file .glb trong thư mục raw
const files = fs.readdirSync(rawDir).filter(file => file.endsWith('.glb'));

if (files.length === 0) {
  console.log('Không tìm thấy file .glb nào trong public/models/raw/');
  process.exit(0);
}

files.forEach(file => {
  const inputPath = path.join(rawDir, file);
  const outputPath = path.join(outputDir, file);
  
  console.log(`Đang nén: ${file} -> ${outputPath}`);
  
  try {
    // Sử dụng npx để chạy gltf-pipeline (sẽ tự động tải nếu chưa có)
    execSync(`npx gltf-pipeline -i "${inputPath}" -o "${outputPath}" -d`, { stdio: 'inherit' });
    console.log(`✅ Nén thành công: ${file}`);
  } catch (error) {
    console.error(`❌ Lỗi khi nén ${file}:`, error.message);
  }
});

console.log('Hoàn thành quá trình nén!');