import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef6ff",
          100: "#d9eaff",
          500: "#1d6fd6",
          600: "#175bb0",
          700: "#134a8e",
          900: "#0d3562",
        },
      },
    },
  },
  plugins: [],
};
export default config;
