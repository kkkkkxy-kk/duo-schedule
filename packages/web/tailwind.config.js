/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
        accent: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
        },
      },
      boxShadow: {
        glass: '0 8px 32px rgba(14, 165, 233, 0.12), 0 2px 8px rgba(236, 72, 153, 0.08)',
        'glass-lg': '0 12px 40px rgba(14, 165, 233, 0.15), 0 4px 12px rgba(236, 72, 153, 0.1)',
      },
    },
  },
  plugins: [],
};
