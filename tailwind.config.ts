import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        pp: "450px",
        mds: "800px",
        md: "900px",
        lgg: "1200px",
        lxl: "1350px",
        ggxl: "1750px",
      },
      colors: {
        primary: {
          DEFAULT: "#4572BB",
          dark: "#11245D",
          light: "#DFEAF6",
          secondary: "#3B7DC0",
        },
        gray: {
          "10": "#E6E6E6",
          "20": "#B6B6B6",
          "30": "#757575",
          "40": "#363636",
        },
        red: {
          DEFAULT: "#CD4242",
          dark: "#611A1A",
          light: "#ECB6B6",
        },
        orange: {
          DEFAULT: "#E7843D",
          dark: "#6E350C",
          light: "#F7DBCA",
        },
        green: {
          DEFAULT: "#42CD98",
          dark: "#144D36",
          light: "#B6ECD7",
        },
      },
      fontFamily: {
        montserrat: ["Montserrat", "sans-serif"],
      },
      fontSize: {
        "display-s": [
          "48px",
          {
            lineHeight: "120%",
            fontWeight: "700",
          },
        ],
        "display-g": [
          "64px",
          {
            lineHeight: "120%",
            fontWeight: "700",
          },
        ],
        "header-xs": [
          "20px",
          {
            lineHeight: "120%",
            fontWeight: "600",
          },
        ],
        "header-s": [
          "24px",
          {
            lineHeight: "120%",
            fontWeight: "600",
          },
        ],
        "header-m": [
          "32px",
          {
            lineHeight: "120%",
            fontWeight: "600",
          },
        ],
        "header-g": [
          "40px",
          {
            lineHeight: "120%",
            fontWeight: "600",
          },
        ],
        "body-s": [
          "12px",
          {
            lineHeight: "140%",
            fontWeight: "500",
          },
        ],
        "body-m": [
          "14px",
          {
            lineHeight: "140%",
            fontWeight: "500",
          },
        ],
        "body-g": [
          "16px",
          {
            lineHeight: "140%",
            fontWeight: "500",
          },
        ],
        "body-gg": [
          "20px",
          {
            lineHeight: "140%",
            fontWeight: "500",
          },
        ],
      },
      spacing: {
        xpp: "4px",
        pp: "8px",
        p: "12px",
        m: "16px",
        g: "24px",
        gg: "32px",
        xgg: "40px",
        huge: "48px",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
