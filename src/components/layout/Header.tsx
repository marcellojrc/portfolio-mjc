'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowUpRight } from 'lucide-react';

interface HeaderProps {
  cvUrl?: string;
}

export function Header({ cvUrl = 'https://drive.google.com/file/d/1PLqDbRhrFCbv4OgxCZhGxB1yKRgxhRoX/view?usp=sharing' }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { label: 'Início', href: '/' },
    { label: 'Projetos', href: '/projects' },
    { label: 'Sobre', href: '/about' },
    { label: 'Experiência', href: '/experience' },
    { label: 'Contacto', href: '/contact' },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-5 sm:px-12 backdrop-blur-md bg-[#0c0c0d]/70 border-b border-[#f5f1ea]/10 transition-all">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="font-display text-xl sm:text-2xl tracking-tighter text-[#f5f1ea] hover:text-[#e8342a] transition-colors"
          >
            MJC
          </Link>
          <span className="hidden md:inline-block text-[11px] uppercase tracking-[0.2em] text-[#f5f1ea]/50 border-l border-[#f5f1ea]/15 pl-6 font-medium">
            Arquitetura & Planeamento Físico
          </span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[12px] uppercase tracking-[0.16em] transition-colors ${
                  isActive
                    ? 'text-[#e8342a] font-semibold'
                    : 'text-[#f5f1ea]/70 hover:text-[#f5f1ea]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-4">
          <a
            href={cvUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-display uppercase tracking-wider bg-[#f5f1ea] text-[#0c0c0d] hover:bg-[#e8342a] hover:text-white transition-all duration-200"
          >
            <span>Baixar CV</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-[#f5f1ea] hover:text-[#e8342a] transition-colors focus:outline-none"
            aria-label={isOpen ? 'Fechar Menu' : 'Abrir Menu'}
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#0c0c0d]/95 backdrop-blur-xl flex flex-col justify-center px-8 lg:hidden animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex flex-col gap-6 max-w-sm mx-auto w-full text-center">
            {navLinks.map((link, idx) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="font-display text-2xl sm:text-3xl uppercase tracking-tight text-[#f5f1ea]/80 hover:text-[#e8342a] transition-colors"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {link.label}
              </Link>
            ))}

            <div className="h-[1px] bg-[#f5f1ea]/10 my-4 w-24 mx-auto" />

            <a
              href={cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 font-display text-xs uppercase tracking-widest bg-[#e8342a] text-white hover:bg-white hover:text-black transition-colors"
            >
              <span>Download CV (PDF)</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>

            <div className="text-[11px] uppercase tracking-widest text-[#f5f1ea]/40 mt-6">
              Maputo, Moçambique
            </div>
          </div>
        </div>
      )}
    </>
  );
}
