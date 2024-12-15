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
        "label-small-bold": "'Inter Tight'",
        "body-tiny": "'Inter Tight'",
      },
      colors: {
        primary: "#05B99C",
        app_gray: "#CECECE",
        "color-common-white": "#fff",
        "color-text-default": "#1c211f",
        black: "#000",
        lightseagreen: "#2bb197",
        "color-common-primary": "#07a188",
        "color-text-invert": "#f4faf9",
        steelblue: {
          "100": "rgba(40, 156, 206, 0.1)",
          "200": "rgba(40, 156, 206, 0.2)",
          "300": "rgba(40, 156, 206, 0.3)",
          "400": "rgba(40, 156, 206, 0.4)",
          "500": "rgba(40, 156, 206, 0.5)",
          "600": "rgba(40, 156, 206, 0.7)",
          "700": "rgba(40, 156, 206, 0.8)",
        },
        mediumseagreen: {
          "100": "rgba(46, 162, 99, 0.1)",
          "200": "rgba(46, 162, 99, 0.2)",
          "300": "rgba(46, 162, 99, 0.3)",
          "400": "rgba(46, 162, 99, 0.4)",
          "500": "rgba(46, 162, 99, 0.5)",
          "600": "rgba(46, 162, 99, 0.6)",
          "700": "rgba(46, 162, 99, 0.7)",
        },
        crimson: {
          "100": "rgba(223, 62, 62, 0.1)",
          "200": "rgba(223, 62, 62, 0.2)",
          "300": "rgba(223, 62, 62, 0.3)",
          "400": "rgba(223, 62, 62, 0.4)",
          "500": "rgba(223, 62, 62, 0.5)",
          "600": "rgba(223, 62, 62, 0.6)",
          "700": "rgba(223, 62, 62, 0.7)",
        },
        "color-text-light": "#757a78",
      },
      spacing: {
        "number-spacing-spacing-xxxs": "8px",
        "number-spacing-spacing-xs": "16px",
      },

      borderRadius: {
        "981xl": "1000px",
        "number-common-radius-md": "12px",
        "number-common-radius-full": "1000px",
        "number-common-radius-sm": "8px",
      },
    },
    fontSize: {
      xs: "12px",
      sm: "14px",
      lg: "18px",
      "5xl": "24px",
      inherit: "inherit",
    },
  },
  plugins: [],
};
export default config;
