/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark mode: Black backgrounds with beige accents
        'dark-bg': '#000000',
        'dark-bg-elevated': '#0a0a0a',
        'dark-surface': '#141414',
        'dark-border': '#2a2a2a',
        'dark-accent': '#d4c5b9',
        'dark-accent-muted': '#b8a99a',
        
        // Light mode: Beige backgrounds with black accents
        'light-bg': '#f5f1ed',
        'light-bg-elevated': '#ebe6e0',
        'light-surface': '#ffffff',
        'light-border': '#d1c7bf',
        'light-accent': '#000000',
        'light-accent-muted': '#1a1a1a',
        
        // Shared purple accent
        'primary': '#a78bfa',
        'primary-dark': '#7c3aed',
        'primary-light': '#c4b5fd',
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
      },
      animation: {
        'pulse-soft': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
