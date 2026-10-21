/** @type {import('tailwindcss').Config} */
import tailwindcssAnimate from 'tailwindcss-animate';

export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: 'rgb(var(--paper-0-rgb) / <alpha-value>)',
          1: 'rgb(var(--paper-1-rgb) / <alpha-value>)',
          2: 'rgb(var(--paper-2-rgb) / <alpha-value>)',
        },
        ink: {
          DEFAULT: 'rgb(var(--ink-1-rgb) / <alpha-value>)',
          2: 'rgb(var(--ink-2-rgb) / <alpha-value>)',
          3: 'rgb(var(--ink-3-rgb) / <alpha-value>)',
        },
        line: {
          subtle: 'var(--line-subtle)',
          strong: 'var(--line-strong)',
        },
        accent: {
          DEFAULT: 'rgb(var(--accent-rgb) / <alpha-value>)',
          strong: 'rgb(var(--accent-strong-rgb) / <alpha-value>)',
          soft: 'var(--accent-soft)',
          fg: 'var(--on-accent)',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        heading: ['"Playfair Display"', 'Georgia', 'serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'paper': '0 1px 2px rgba(33,27,20,0.04), 0 8px 24px -12px rgba(33,27,20,0.10)',
        'paper-hover': '0 2px 4px rgba(33,27,20,0.05), 0 20px 44px -16px rgba(33,27,20,0.18)',
        'glass': '0 4px 30px rgba(33, 27, 20, 0.05)',
        'glass-hover': '0 10px 40px rgba(33, 27, 20, 0.1)',
        'glass-dark': '0 4px 30px rgba(0, 0, 0, 0.4)',
        'glass-dark-hover': '0 10px 40px rgba(0, 0, 0, 0.6)',
        'glow': '0 0 20px var(--glow-primary)',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.1)',
        'smooth': 'cubic-bezier(0.23, 1, 0.32, 1)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [
    tailwindcssAnimate,
    function ({ addUtilities }) {
      addUtilities({
        '.translate-z-0': { transform: 'translateZ(0px)' },
        '.translate-z-10': { transform: 'translateZ(10px)' },
        '.translate-z-20': { transform: 'translateZ(20px)' },
        '.translate-z-30': { transform: 'translateZ(30px)' },
        '.translate-z-40': { transform: 'translateZ(40px)' },
        '.translate-z-50': { transform: 'translateZ(50px)' },
        '.translate-z-negative-50': { transform: 'translateZ(-50px)' },
        '.translate-z-negative-100': { transform: 'translateZ(-100px)' },
        '.preserve-3d': { transformStyle: 'preserve-3d' },
      });
    }
  ],
}
