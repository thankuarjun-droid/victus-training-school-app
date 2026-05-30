import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#1E2761",
        gold: "#E8A317",
        coral: "#D14545",
        green: "#2D7D46",
      },
      fontFamily: {
        sans: ["Calibri", "Arial", "sans-serif"],
        tamil: ["Nirmala UI", "Latha", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
