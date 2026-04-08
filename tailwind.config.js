/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--primary-teal)",
          teal: "var(--primary-teal)",
          deep: "var(--deep-teal)",
        },
        accent: {
          mint: "var(--mint-green)",
          muted: "var(--muted-teal)",
          light: "var(--light-green)",
          mid: "var(--mid-green)",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: "var(--surface)",
        dark: {
          50: "#f9fafb",
          100: "#f3f4f6",
          950: "#030712",
          900: "#111827",
          800: "#1f2937",
          700: "#374151",
          600: "#4b5563",
          500: "#6b7280",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite",
        "gradient-shift": "gradient-shift 3s ease infinite",
      },
      keyframes: {
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "glow": {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        "gradient-shift": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Outfit", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "glow-sm": "0 0 20px rgba(15, 143, 122, 0.3)",
        "glow-md": "0 0 40px rgba(15, 143, 122, 0.4)",
        "glow-lg": "0 0 60px rgba(15, 143, 122, 0.5)",
      },
    },
  },
  plugins: [],
}
