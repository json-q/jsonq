const { execSync } = require('child_process');
const { copySync } = require('fs-extra');
const { join } = require('path');

try {
  // next-sitemap
  execSync('next-sitemap', { stdio: 'inherit' });

  // pagefind
  execSync('pagefind --site .next/server/app --output-path public/_pagefind', {
    stdio: 'inherit',
  });

  const outputDir = join(process.cwd(), 'out');
  const publicDir = join(process.cwd(), 'public');

  // === copy ===

  copySync(join(publicDir, '_pagefind'), join(outputDir, '_pagefind'));

  const seoFiles = ['robots.txt', 'sitemap.xml'];
  for (const file of seoFiles) {
    copySync(join(publicDir, file), join(outputDir, file));
  }
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
