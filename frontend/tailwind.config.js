/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        base: {
          DEFAULT: '#020617', // slate-950
          dark: '#030305',    // Mathematically darker for ultra-premium feel
        },
        primary: {
          DEFAULT: '#6366f1', // indigo-500
          hover: '#4f46e5',
        },
        success: {
          DEFAULT: '#10b981', // emerald-500
        },
        danger: {
          DEFAULT: '#f43f5e', // rose-500
        },
        warning: {
          DEFAULT: '#fbbf24', // amber-400
        }
      },
      boxShadow: {
        'custom': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'custom-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'glass-edge': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.15)',
        'glass-glow': '0 0 60px -15px rgba(99, 102, 241, 0.4)',
        'premium-glow': '0 0 40px 0 rgba(99, 102, 241, 0.2)',
      },
      borderRadius: {
        'custom': '0.75rem',
        'custom-lg': '1rem',
        'premium': '1.25rem',
      },
      animation: {
        'fade-up': 'fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fadeIn 1.2s cubic-bezier(0.16, 1, 0.3, 1) both',
        'shake': 'shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both',
        'float': 'float 8s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shake: {
          '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(4px, 0, 0)' },
        },
        modalScale: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        }
      }
    },
  },
  plugins: [],
}
