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
        "label-large-bold": "'Inter Tight'",
        eurostile: "Eurostile",
      },
      colors: {
        primary: "#05B99C",
        app_gray: "#CECECE",
        "color-common-white": "#fff",
        "color-text-default": "#1c211f",
        black: "#000",
        lightseagreen: "#2bb197",
      },
      spacing: {
        "number-spacing-spacing-xxxs": "8px",
      },
      borderRadius: {
        "981xl": "1000px",
        "number-common-radius-md": "12px",
      },
    },
    fontSize: {
      lg: "18px",
      "5xl": "24px",
      inherit: "inherit",
    },
  },
  plugins: [],
};
export default config;
