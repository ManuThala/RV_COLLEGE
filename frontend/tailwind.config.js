/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 0 30px rgba(34, 211, 238, 0.35)',
      },
      colors: {
        cyber: {
          50: '#edf8ff',
          100: '#d9f0ff',
          200: '#bfe4ff',
          300: '#8ed0ff',
          400: '#53b2ff',
          500: '#298eff',
          700: '#1d5fd8',
          900: '#0f172a',
        },
      },
    },
  },
  plugins: [],
}
