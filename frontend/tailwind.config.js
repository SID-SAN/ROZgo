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
        rozgo: {
          50: '#f0f7f5',
          100: '#dceee9',
          200: '#bbded4',
          300: '#90c6b8',
          400: '#5da795',
          500: '#398a77',
          600: '#2a6e5f',
          700: '#22584d',
          800: '#1c463e',
          900: '#123B32', // Primary Brand Color
          950: '#091f1a',
        },
        darkbg: {
          base: '#091512',
          surface: '#0f221d',
          card: '#142c26',
          cardHover: '#1a3730',
          border: '#1e4037',
        }
      },
      fontFamily: {
        sans: ['Arial', 'Helvetica', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 12px -2px rgba(18, 59, 50, 0.08)',
        'soft-lg': '0 10px 25px -5px rgba(18, 59, 50, 0.12), 0 8px 10px -6px rgba(18, 59, 50, 0.06)',
        'card-hover': '0 14px 28px -4px rgba(18, 59, 50, 0.16)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      }
    },
  },
  plugins: [],
}
