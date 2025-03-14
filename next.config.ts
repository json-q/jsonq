import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  reactStrictMode: true,
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx', 'json'],
  // https://github.com/hashicorp/next-mdx-remote?tab=readme-ov-file#installation
  transpilePackages: ['next-mdx-remote'],
  experimental: {
    reactCompiler: true,
  },
  images: {
    // 静态导出无法优化
    unoptimized: true,
  },
};

export default nextConfig;
