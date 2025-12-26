/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0F2A44',
          dark: '#0A1E30',
          light: '#1A3A5C',
        },
        secondary: {
          DEFAULT: '#2FB7A4',
          dark: '#259A8A',
          light: '#52C8B7',
        },
        accent: {
          DEFAULT: '#6B7CFF',
          dark: '#5566E6',
          light: '#8A99FF',
        },
        background: {
          main: '#F7F9FC',
          card: '#FFFFFF',
        },
        text: {
          primary: '#1E293B',
          secondary: '#64748B',
        },
        status: {
          success: '#22C55E',
          warning: '#F59E0B',
          alert: '#EF4444',
        },
      },
    },
  },
  plugins: [],
};
