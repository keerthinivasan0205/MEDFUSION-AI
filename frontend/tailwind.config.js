/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0B0F1A',
          800: '#0f1628',
          700: '#141d35',
          600: '#1a2540',
          500: '#1e2d4d',
        },
        neon: {
          blue: '#00d4ff',
          purple: '#7c3aed',
          green: '#00ff88',
          red: '#ff3366',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
