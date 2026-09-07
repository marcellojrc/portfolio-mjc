import type { Metadata, Viewport } from 'next';
import { Archivo, Archivo_Black } from 'next/font/google';
import { getBaseUrl } from '@/lib/utils';
import './globals.css';

const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

const archivoBlack = Archivo_Black({
  subsets: ['latin'],
  variable: '--font-archivo-black',
  display: 'swap',
  weight: ['400'],
});

export const viewport: Viewport = {
  themeColor: '#0c0c0d',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: {
    default: 'MJC — Marcelo Cumbe | Arquitetura & Planeamento Físico',
    template: '%s | MJC Architecture',
  },
  verification: {
    google: 'I2ePfSxLJEWAVKAoc6XYAG6q-oMacf1BNiC7heUztsQ',
  },
  description:
    'Portfólio e plataforma de arquitetura de Marcelo Júnior Cumbe. Projetos habitacionais, equipamentos públicos, planeamento urbano, modelação BIM e cartografia em Moçambique.',
  keywords: [
    'Arquitetura',
    'Planeamento Físico',
    'Marcelo Cumbe',
    'BIM',
    'Revit',
    'QGIS',
    'Moçambique',
    'Maputo',
    'UEM',
    'YouthMappers',
    'Urbanismo',
  ],
  authors: [{ name: 'Marcelo Júnior Cumbe' }],
  creator: 'Marcelo Júnior Cumbe',
  openGraph: {
    type: 'website',
    locale: 'pt_MZ',
    url: '/',
    title: 'MJC — Marcelo Cumbe | Arquitetura & Planeamento Físico',
    description:
      'Portfólio contemporâneo de arquitetura, urbanismo e tecnologias BIM/GIS por Marcelo Júnior Cumbe. Maputo, Moçambique.',
    siteName: 'MJC Architecture Portfolio',
    images: [
      {
        url: '/images/hero_bg.jpg',
        width: 1920,
        height: 1080,
        alt: 'MJC Architecture Portfolio Cover',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MJC — Marcelo Cumbe | Arquitetura & Planeamento Físico',
    description: 'Projetos de arquitetura, urbanismo e soluções BIM em Moçambique.',
    images: ['/images/hero_bg.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt" className={`${archivo.variable} ${archivoBlack.variable}`}>
      <body className="font-body bg-[#0c0c0d] text-[#f5f1ea] antialiased selection:bg-[#e8342a] selection:text-white">
        <a
          href="#main-content"
          className="fixed left-4 top-[-100px] z-[100] bg-[#e8342a] px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition-all focus:top-4"
        >
          Saltar para o conteúdo principal
        </a>
        <div className="grain" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
