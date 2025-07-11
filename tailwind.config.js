/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#605DC8',
          50: '#f3f2ff',
          100: '#e8e7fa',
          200: '#d6d3f7',
          300: '#bbb6f1',
          400: '#9c94e9',
          500: '#8B89E6',
          600: '#605DC8',
          700: '#4c46a5',
          800: '#3f3a87',
          900: '#36326f',
        },
      }
    },
  },
  plugins: [],
}
