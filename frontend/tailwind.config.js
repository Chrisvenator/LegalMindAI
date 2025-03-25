/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'fbc-blue-60': '#0060df',
        'fbc-blue-70': '#353131',
        'fbc-gray-20': '#DEDEDE',
        'fbc-light-gray': '#F0F0F4',
        'fbc-white': '#ffffff',
        'fbc-primary-text': '#15141A',
        'fbc-secondary-text': '#5B5B66',
      },
      fontSize: {
        'fbc-base': '13px',
      },
      transitionProperty: {
        'fbc-transition': 'all .15s cubic-bezier(.07,.95,0,1)',
      },
      borderWidth: {
        'fbc-borders': '1px',
      }
    },
  },
  plugins: [],
}