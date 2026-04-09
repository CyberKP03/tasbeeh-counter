/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#12100E',
        text: '#E6E1D8',
        accent: '#C19A6B',
        panel: {
          bg: 'rgba(255, 255, 255, 0.03)',
          border: 'rgba(255, 255, 255, 0.08)'
        },
        wood: {
          color: '#8D5A3F',
          shadow: '#3C2213',
        },
        stone: {
          color: '#1F1F1F',
          shadow: '#0A0A0A',
          reflect: '#3B3B3B'
        },
        tasbeeh: {
          primary: '#1F1F1F',
          sec: '#3B3B3B'
        },
        maala: {
          primary: '#B26A42',
          sec: '#D38965'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      animation: {
        pulse: 'pulse 2s infinite ease-in-out',
      }
    },
  },
  plugins: [],
}
