import Link from 'next/link';
import { ArrowLeft, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-6">
        <Compass className="w-12 h-12 text-[#e8342a] mx-auto animate-pulse" />
        <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#e8342a] block">
          Erro 404 — Coordenadas Não Encontradas
        </span>
        <h1 className="font-display text-4xl sm:text-5xl text-[#f5f1ea]">
          ESPAÇO INEXISTENTE
        </h1>
        <p className="text-sm text-[#f5f1ea]/70 leading-relaxed">
          O projeto ou a secção que procura foi reconfigurado, renomeado ou já não existe no
          catálogo atual.
        </p>
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#e8342a] text-white font-display text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar à Homepage</span>
          </Link>
          <Link
            href="/projects"
            className="px-6 py-3 border border-[#f5f1ea]/20 text-xs font-display uppercase tracking-widest text-[#f5f1ea] hover:border-[#e8342a] transition-colors"
          >
            Explorar Projetos
          </Link>
        </div>
      </div>
    </div>
  );
}
