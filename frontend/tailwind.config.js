/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Sora"', 'sans-serif'],
        sans: ['"Inter"', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eef1ff',
          100: '#e0e4ff',
          200: '#c6ccff',
          300: '#a3a8ff',
          400: '#7f7ffb',
          500: '#5b57f0',
          600: '#4638d6',
          700: '#392eb0',
          800: '#2f298c',
          900: '#282670',
          950: '#181642',
        },
        amber: {
          50: '#fff9ec',
          100: '#fef0cb',
          200: '#fddd92',
          300: '#fcc450',
          400: '#faa722',
          500: '#f28c0f',
          600: '#d66a0a',
          700: '#b14b0c',
          800: '#8f3a11',
          900: '#753111',
        },
        ink: {
          50: '#f5f6fa',
          100: '#e9ebf3',
          200: '#cfd3e3',
          300: '#a7aecb',
          400: '#7a83ac',
          500: '#5b6390',
          600: '#464c74',
          700: '#393e5e',
          800: '#262a41',
          900: '#15172a',
          950: '#0b0c17',
        },
      },
      boxShadow: {
        soft: '0 1px 2px 0 rgb(15 17 42 / 0.04), 0 4px 16px -4px rgb(15 17 42 / 0.08)',
        softer: '0 1px 3px 0 rgb(15 17 42 / 0.06)',
      },
      borderRadius: {
        xl2: '1.1rem',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0, transform: 'translateY(4px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
      },
      animation: {
        fadeIn: 'fadeIn 0.25s ease-out',
      },
    },
  },
  plugins: [],
};
