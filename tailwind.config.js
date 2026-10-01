/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: "#F8FAE5",
          muted: "#F0F3D6",
          card: "rgba(255, 255, 255, 0.72)",
          dark: "#1A2220",
        },
        forest: {
          DEFAULT: "#43766C",
          dark: "#2A4E47",
          light: "#5B968B",
          ultradark: "#1B332E",
        },
        bronze: {
          DEFAULT: "#B19470",
          light: "#CBB394",
          dark: "#8C7150",
          muted: "rgba(177, 148, 112, 0.25)",
        },
        terracotta: {
          DEFAULT: "#76453B",
          light: "#9A5D51",
          dark: "#573029",
          badge: "rgba(118, 69, 59, 0.12)",
        },
      },
      fontFamily: {
        editorial: ["'Playfair Display'", "Georgia", "serif"],
        sans: ["'Plus Jakarta Sans'", "system-ui", "-apple-system", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      boxShadow: {
        editorial: "0 20px 40px -15px rgba(67, 118, 108, 0.12)",
        card: "0 10px 30px -8px rgba(42, 78, 71, 0.08)",
        hologram: "0 0 35px rgba(67, 118, 108, 0.35)",
      },
    },
  },
  plugins: [],
}
