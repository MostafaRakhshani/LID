
import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "#0B1F3B",
        teal: "#0EA5A6",
        grayText: "#344054",
      },
      boxShadow: {
        soft: "0 4px 16px rgba(0,0,0,.08)"
      },
      borderRadius: {
        '2xl': "1rem"
      }
    },
  },
  plugins: [],
} satisfies Config;
