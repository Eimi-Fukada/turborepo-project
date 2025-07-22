const appEnv = process.env.NEXT_PUBLIC_APP_ENV || "development";

const envMap = {
  development: {
    NEXT_PUBLIC_API_URL: "http://dev/api",
  },
  uat: {
    NEXT_PUBLIC_API_URL: "https://api.uat.com",
  },
  production: {
    NEXT_PUBLIC_API_URL: "https://api.prod.com",
  },
};

/**
 * @type {import('next').NextConfig}
 */
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
  env: {
    NEXT_PUBLIC_APP_ENV: appEnv,
    NEXT_PUBLIC_API_URL: envMap[appEnv].NEXT_PUBLIC_API_URL,
  },
  transpilePackages: ["three"],
  output: "standalone",
};

export default nextConfig;
