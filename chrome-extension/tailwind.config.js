// chrome-extension/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./popup.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Your color scheme from the design
        'slate': {
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
          500: '#64748b',
          400: '#94a3b8',
          300: '#cbd5e1',
          200: '#e2e8f0',
          100: '#f1f5f9',
        },
        'blue': {
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
        },
        // Primary colors from your design
        'primary': '#3b82f6', // Blue-500
        'secondary': '#8b5cf6', // Purple-500
        'accent': '#10b981', // Emerald-500
      },
      backgroundImage: {
        'gradient-slate': 'linear-gradient(to bottom right, #0f172a, #1e293b)',
        'gradient-blue': 'linear-gradient(to right, #3b82f6, #8b5cf6)',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}