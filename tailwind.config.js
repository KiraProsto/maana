/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: '#f2b13b',
        accentHover: '#e0a232',
        footer: '#63402a',
        grayText: '#555',
      },
      fontFamily: {
        main: ['TenorSans', 'sans-serif'],
        global: ['Florensa', 'serif'],
      },
    },
  },
  plugins: [],
};
