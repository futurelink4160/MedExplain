/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1E3A8A', // Deep navy blue
          dark: '#1E40AF',
          light: '#3B82F6',
        },
        secondary: {
          DEFAULT: '#14B8A6', // Vibrant teal
          dark: '#0D9488',
          light: '#2DD4BF',
        },
        accent: {
          DEFAULT: '#8B5CF6', // Purple
          dark: '#7C3AED',
          light: '#A78BFA',
        },
        background: {
          main: '#F1F5F9',
          card: '#FFFFFF',
        },
        text: {
          primary: '#1E293B',
          secondary: '#64748B',
        },
        status: {
          success: '#10B981', // Green
          warning: '#F97316', // Orange
          alert: '#EF4444', // Red
          info: '#60A5FA', // Light blue
        },
      },
    },
  },
  plugins: [],
};
