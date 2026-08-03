/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FAF8F5',
          100: '#F5EFE6',
          200: '#EADFCF',
          300: '#DECDB8',
          400: '#D2BBA1',
          500: '#B89874',
        },
        espresso: {
          50: '#F6F4F3',
          100: '#E6E1DE',
          200: '#C9BEB7',
          500: '#5C4A3E',
          700: '#3D3129',
          800: '#2A211B',
          900: '#1C1612',
        },
        gold: {
          400: '#F3C969',
          500: '#D4AF37',
          600: '#B28E28',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'cream-sm': '0 2px 8px rgba(92, 74, 62, 0.04)',
        'cream-md': '0 8px 24px rgba(92, 74, 62, 0.08)',
        'cream-lg': '0 16px 36px rgba(92, 74, 62, 0.12)',
        'gold-glow': '0 0 20px rgba(212, 175, 55, 0.25)',
      },
      keyframes: {
        'shimmer': {
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        }
      },
      animation: {
        'shimmer': 'shimmer 2s infinite',
        'pulse-subtle': 'pulse-subtle 3s ease-in-out infinite',
      }
    },
  },
  plugins: [],
};
