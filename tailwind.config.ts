import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        garage: {
          orange: "#F97316",
          dark: "#1A1A1A",
        },
      },
    },
  },
  plugins: [],
};

export default config;
