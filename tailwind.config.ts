import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './src/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0E1A2B',
        mint: '#0E7A6E',
        shell: '#F4F6F9',
      },
    },
  },
  darkMode: 'class',
  plugins: [],
} satisfies Config;
