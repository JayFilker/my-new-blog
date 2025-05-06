import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 检查操作系统
const isWindows = process.platform === 'win32';

try {
  // 确保目标目录存在
  const projectRoot = path.resolve(__dirname, '..');
  const publicDir = path.join(projectRoot, 'public');
  const publicPagefindDir = path.join(publicDir, 'pagefind');

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // 根据操作系统执行不同命令
  if (isWindows) {
    execSync('xcopy dist\\pagefind public\\pagefind\\ /E /I /Y', { cwd: projectRoot });
  } else {
    // 如果目标目录存在，先删除
    if (fs.existsSync(publicPagefindDir)) {
      execSync('rm -rf public/pagefind', { cwd: projectRoot });
    }
    execSync('cp -r dist/pagefind public/pagefind', { cwd: projectRoot });
  }

  console.log('Successfully copied pagefind files');
} catch (error) {
  console.error('Error copying pagefind files:', error);
  process.exit(1);
}
