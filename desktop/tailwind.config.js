/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/renderer/index.html",
    "./src/renderer/src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "#050811",
          "bg-2": "#0a0f1f",
          cyan: "#00f0ff",
          red: "#ff3333",
          green: "#39ff14",
          yellow: "#ffae00",
          purple: "#b400ff",
          text: "#e6f7ff",
          muted: "#5c6b7a",
        },
      },
      fontFamily: {
        display: ["Orbitron", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
