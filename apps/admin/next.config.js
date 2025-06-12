/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 13+ App Router 默认支持 tsconfig.json 中的 paths 配置
  // 如果使用的是 Pages Router，则需要以下配置：
  /*
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './'),
    };
    return config;
  },
  */
  experimental: {
    fontLoaders: [
      {
        loader: "@next/font/local",
        options: {
          customFontDir: "./public/fonts", // 自定义字体目录
        },
      },
    ],
  },
  transpilePackages: ["three"],
};

export default nextConfig;
