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
          50: "#eff0f8",
          100: "#dce0f2",
          500: "#293177",
          600: "#171c61",
          700: "#11164e",
          900: "#090c32",
        },
      },
    },
  },
  plugins: [],
};
export default config;
