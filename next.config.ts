import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  reactStrictMode: true,
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx', 'json'],
  // https://github.com/hashicorp/next-mdx-remote?tab=readme-ov-file#installation
  transpilePackages: ['next-mdx-remote'],
  images: {
    // 静态导出无法优化
    unoptimized: true,
  },

  // 可选：阻止自动 `/me` -> `/me/`
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
