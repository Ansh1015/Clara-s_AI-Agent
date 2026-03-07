/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0A0F1E',
          800: '#0D1526',
          700: '#111B33',
          600: '#1a2744',
        },
        blue: {
          500: '#3B82F6',
          600: '#2563EB',
        },
        purple: {
          500: '#8B5CF6',
          600: '#7C3AED',
        }
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'glow-pulse': 'glow 2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.6s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        glow: {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(59,130,246,0.4)'
          },
          '50%': {
            boxShadow: '0 0 40px rgba(59,130,246,0.7)'
          },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
