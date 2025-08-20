/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'oee-green': '#4CAF50',
        'oee-orange': '#FF9800', 
        'oee-red': '#F44336',
        'oee-blue': '#2196F3'
      }
    },
  },
  plugins: [],
}
