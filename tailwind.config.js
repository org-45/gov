/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        executive: '#3b82f6',
        legislative: '#10b981',
        judicial: '#f59e0b',
        constitutional: '#8b5cf6',
        ministry: '#06b6d4',
        provincial: '#ec4899',
        local: '#14b8a6',
      },
    },
  },
  plugins: [],
}
