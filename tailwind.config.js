/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f5fa',
          100: '#e1eaf4',
          200: '#c7d9ea',
          300: '#9dbddc',
          400: '#6d9bcb',
          500: '#487cb7',
          600: '#356199',
          700: '#2a4d7d',
          800: '#264268',
          900: '#233756',
          950: '#17243b',
        },
        surface: '#fdfbff',
        'surface-variant': '#e1e2ec',
        'on-surface': '#1a1b1e',
        'on-surface-variant': '#44474e',
      },
      boxShadow: {
        'md3-1': '0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
        'md3-2': '0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 2px 6px 2px rgba(0, 0, 0, 0.15)',
        'md3-3': '0px 1px 3px 0px rgba(0, 0, 0, 0.3), 0px 4px 8px 3px rgba(0, 0, 0, 0.15)',
        'md3-4': '0px 2px 3px 0px rgba(0, 0, 0, 0.3), 0px 6px 10px 4px rgba(0, 0, 0, 0.15)',
        'md3-5': '0px 4px 4px 0px rgba(0, 0, 0, 0.3), 0px 8px 12px 6px rgba(0, 0, 0, 0.15)',
      },
      borderRadius: {
        'md3-xs': '0.25rem',
        'md3-sm': '0.5rem',
        'md3-md': '0.75rem',
        'md3-lg': '1rem',
        'md3-xl': '1.75rem',
        'md3-full': '9999px',
      }
    },
  },
  plugins: [],
}
