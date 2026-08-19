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
        dark: {
          950: '#070a0f',
          900: '#0c1017',
          850: '#111722',
          800: '#161e2e',
          700: '#1e293b',
          600: '#334155'
        },
        gold: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          glow: 'rgba(245, 158, 11, 0.15)'
        },
        bullish: '#089981',
        bearish: '#f23645'
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Roboto Mono', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flash-green': 'flashGreen 0.8s ease-out',
        'flash-red': 'flashRed 0.8s ease-out',
      },
      keyframes: {
        flashGreen: {
          '0%': { backgroundColor: 'rgba(8, 153, 129, 0.4)' },
          '100%': { backgroundColor: 'transparent' }
        },
        flashRed: {
          '0%': { backgroundColor: 'rgba(242, 54, 69, 0.4)' },
          '100%': { backgroundColor: 'transparent' }
        }
      }
    },
  },
  plugins: [],
}
