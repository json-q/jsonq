// scripts/copy-files.js
const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

try {
  // next-sitemap
  execSync('next-sitemap', { stdio: 'inherit' });

  // pagefind
  execSync('pagefind --site .next/server/app --output-path public/_pagefind', {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'production',
    },
  });

  const outputDir = path.join(process.cwd(), 'out');
  const publicDir = path.join(process.cwd(), 'public');

  // 复制 _pagefind 目录
  fs.copySync(path.join(publicDir, '_pagefind'), path.join(outputDir, '_pagefind'), {
    overwrite: true,
  });

  const seoFiles = ['robots.txt', 'sitemap.xml'];
  seoFiles.forEach((file) => {
    fs.copySync(path.join(publicDir, file), path.join(outputDir, file), { overwrite: true });
  });
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
