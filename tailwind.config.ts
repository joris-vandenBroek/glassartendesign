import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#060607',
        charcoal: '#1c1e22',
        graphite: '#2a2d33',
        silver: '#e2e4e8',
        'silver-dim': '#9aa0aa',
      },
    },
  },
  plugins: [],
};

export default config;
