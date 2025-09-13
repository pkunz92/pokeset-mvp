/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./pages/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff7e6",
          100: "#ffedc2",
          200: "#ffe199",
          300: "#ffd166",
          400: "#ffc233",
          500: "#ffb100",
          600: "#e39f00",
          700: "#b78100",
          800: "#8c6500",
          900: "#5a4100"
        },
        ink: "#0f172a"
      },
      borderRadius: {
        '2xl': '1rem'
      }
    },
  },
  plugins: [],
};