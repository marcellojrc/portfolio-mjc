const fs = require('fs');
const path = require('path');

console.log('Writing config files...');

// 1. tsconfig.json
const tsconfig = {
  compilerOptions: {
    target: 'ES2022',
    lib: ['dom', 'dom.iterable', 'esnext'],
    allowJs: true,
    skipLibCheck: true,
    strict: true,
    noEmit: true,
    esModuleInterop: true,
    module: 'esnext',
    moduleResolution: 'bundler',
    resolveJsonModule: true,
    isolatedModules: true,
    jsx: 'preserve',
    incremental: true,
    plugins: [{ name: 'next' }],
    paths: {
      '@/*': ['./src/*']
    }
  },
  include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
  exclude: ['node_modules']
};
fs.writeFileSync('tsconfig.json', JSON.stringify(tsconfig, null, 2) + '\n');

// 2. next.config.ts
const nextConfig = `import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
`;
fs.writeFileSync('next.config.ts', nextConfig);

// 3. postcss.config.mjs
const postcssConfig = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`;
fs.writeFileSync('postcss.config.mjs', postcssConfig);

// 4. tailwind.config.ts
const tailwindConfig = `import type { Config } from 'tailwindcss';

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
`;
fs.writeFileSync('tailwind.config.ts', tailwindConfig);

// 5. .env & .env.example
const envExample = `# Base de Dados (SQLite por defeito para dev local)
DATABASE_URL="file:./dev.db"

# Autenticação e Segurança
AUTH_SECRET="mjc-super-secret-architecture-portfolio-key-2026"
ADMIN_EMAIL="marcelojuniord07@gmail.com"
ADMIN_DEFAULT_PASSWORD="admin_mjc_2026!"

# URL do Website
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
`;

fs.writeFileSync('.env.example', envExample);
if (!fs.existsSync('.env')) {
  fs.writeFileSync('.env', envExample);
}

console.log('All configs generated successfully.');
