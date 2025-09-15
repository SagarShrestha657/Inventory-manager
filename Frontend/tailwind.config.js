/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3f51b5',
          light: '#757de8',
          dark: '#002984',
        },
        secondary: {
          DEFAULT: '#f50057',
          light: '#ff4081',
          dark: '#c51162',
        },
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false, // Disable Tailwind's base styles to prevent conflicts with MUI
  },
}
