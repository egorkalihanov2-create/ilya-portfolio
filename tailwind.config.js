/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0d0d0d",
        graphite: "#2f2f2f",
        accent: "#ffb900",
        panel: "#f8f8f8",
      },
      fontFamily: {
        object: ["Object Sans", "Arial", "sans-serif"],
        vasek: ["Vasek", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

