import Link from 'next/link';
import { ArrowUpRight, Lock } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-[#f5f1ea]/10 bg-[#0c0c0d] text-[#f5f1ea] py-16 sm:py-24">
      <div className="arch-container">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 pb-16 border-b border-[#f5f1ea]/10">
          {/* Coluna 1: Assinatura */}
          <div className="md:col-span-5 space-y-4">
            <Link
              href="/"
              className="font-display text-2xl sm:text-3xl tracking-tighter text-[#f5f1ea] hover:text-[#e8342a] transition-colors"
            >
              MJC
            </Link>
            <p className="text-sm text-[#f5f1ea]/60 max-w-sm leading-relaxed">
              Marcelo Júnior Cumbe — Arquitetura & Planeamento Físico pela Universidade Eduardo
              Mondlane (UEM). Prática focada em desenho sustentável, modelagem BIM e soluções urbanas
              humanitárias em Moçambique.
            </p>
            <div className="pt-2 text-xs uppercase tracking-[0.16em] text-[#f5f1ea]/40">
              Catembe, Rua da Igreja — Maputo, Moçambique
            </div>
          </div>

          {/* Coluna 2: Navegação */}
          <div className="md:col-span-3 space-y-3">
            <div className="text-[11px] font-display uppercase tracking-[0.2em] text-[#e8342a]">
              Navegação
            </div>
            <ul className="space-y-2 text-sm text-[#f5f1ea]/70">
              <li>
                <Link href="/projects" className="hover:text-white transition-colors">
                  Projetos Arquitetónicos
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Perfil & Filosofia
                </Link>
              </li>
              <li>
                <Link href="/experience" className="hover:text-white transition-colors">
                  Trajetória & Docência
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contacto Direto
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Contacto & Redes */}
          <div className="md:col-span-4 space-y-3">
            <div className="text-[11px] font-display uppercase tracking-[0.2em] text-[#e8342a]">
              Conectar
            </div>
            <ul className="space-y-2.5 text-sm text-[#f5f1ea]/70">
              <li>
                <a
                  href="mailto:marcelojuniord07@gmail.com"
                  className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <span>marcelojuniord07@gmail.com</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="https://wa.link/qdv2hj"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <span>WhatsApp: +258 84 713 0805</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/marcellojrc/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <span>LinkedIn — marcellojrc</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/marcellojrc/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <span>Instagram — @marcellojrc</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Linha inferior */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#f5f1ea]/40">
          <div>
            © {new Date().getFullYear()} Marcelo Júnior Cumbe. Todos os direitos reservados.
          </div>
          <div className="flex items-center gap-6">
            <span>Universidade Eduardo Mondlane — FAPF</span>
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1 hover:text-[#f5f1ea] transition-colors"
              title="Área Administrativa"
            >
              <Lock className="w-3 h-3" />
              <span>CMS</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
