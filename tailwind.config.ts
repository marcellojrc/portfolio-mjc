import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        'bg-alt': 'var(--bg-alt)',
        surface: 'var(--surface)',
        cream: 'var(--cream)',
        'cream-dim': 'var(--cream-dim)',
        red: 'var(--red)',
        terra: 'var(--terra)',
        line: 'var(--line)',
      },
      fontFamily: {
        display: ['var(--font-archivo-black)', 'sans-serif'],
        body: ['var(--font-archivo)', 'sans-serif'],
      },
      screens: {
        xs: '475px',
      },
    },
  },
  plugins: [],
};

export default config;
