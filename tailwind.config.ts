import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        pretendard: ["var(--font-pretendard)"],
        suit: ["var(--font-suit)"],
      },
      colors: {
        primary: "#05B99C",
        app_gray: "#CECECE",
      },
    },
  },
  plugins: [],
};
export default config;
