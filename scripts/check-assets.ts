import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MODELS_DIR = path.resolve(__dirname, '../public/models');
const THUMBNAILS_DIR = path.resolve(__dirname, '../public/thumbnails');

console.log('🔍 Đang kiểm tra thư mục Assets...');

function checkDir(dirPath: string, extension: string) {
  if (!fs.existsSync(dirPath)) {
    console.error(`❌ Thư mục không tồn tại: ${dirPath}`);
    return;
  }

  const files = fs.readdirSync(dirPath).filter((f: string) => f.endsWith(extension));

  if (files.length === 0) {
    console.warn(`⚠️ Cảnh báo: Không tìm thấy file ${extension} nào trong ${dirPath}`);
  } else {
    console.log(`✅ Tìm thấy ${files.length} file ${extension} trong ${path.basename(dirPath)}`);
    files.forEach((f: string) => console.log(`   - ${f}`));
  }
}

checkDir(MODELS_DIR, '.glb');
checkDir(THUMBNAILS_DIR, '.png');

console.log('Kiểm tra hoàn tất!');