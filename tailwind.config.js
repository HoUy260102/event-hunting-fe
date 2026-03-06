/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "primary": "#46ec13",
        "primary-dark": "#3ad60f",
        "background-light": "#f6f8f6",
        "background-dark": "#142210",
        "surface-light": "#ffffff",
        "surface-dark": "#1c2e18",
        "border-light": "#e5e7eb",
        "border-dark": "#2a4225",
        "text-main-light": "#111b0d",
        "text-main-dark": "#ffffff",
        "text-secondary-light": "#6b7280",
        "text-secondary-dark": "#a1aebf",
      },
      fontFamily: {
        display: ["Manrope", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
    },
  },
  plugins: [],
};
