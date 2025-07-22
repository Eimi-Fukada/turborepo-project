import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    // 引入共享组件的目录
    "../packages/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // 在这里可以扩展或覆盖默认主题
    },
  },
  plugins: [],
};

export default config;
