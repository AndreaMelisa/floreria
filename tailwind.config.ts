import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        rose: {
          pastel: "#FDF4F6",
          soft: "#F7E2E7",
          dusty: "#B85D73",
          deep: "#8C3B50",
          dark: "#5C2131",
        },
        cream: {
          DEFAULT: "#FAF7F2",
          ivory: "#FFFEFB",
          warm: "#F3EDE2",
          border: "#E5DDD0",
        },
        sage: {
          light: "#EEF3EE",
          soft: "#D5E2D6",
          DEFAULT: "#4A6B53",
          deep: "#2E4736",
        },
        charcoal: {
          DEFAULT: "#1F1A1C",
          muted: "#4A4044",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "'Times New Roman'", "Times", "serif"],
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
