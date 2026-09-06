import { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { Briefcase, Calendar, MapPin, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Trajetória Profissional & Docência',
  description:
    'Experiência profissional de Marcelo Júnior Cumbe em arquitetura, docência de software BIM (Revit) e coordenação de mapeamento humanitário digital.',
};

export const revalidate = 60;

export default async function ExperiencePage() {
  const experiences = await prisma.experience.findMany({
    orderBy: { order: 'asc' },
  });

  return (
    <div className="arch-container py-12 sm:py-20 space-y-16">
      {/* Cabeçalho */}
      <div className="space-y-4 max-w-3xl border-b border-[#f5f1ea]/15 pb-8">
        <span className="text-[11px] font-display uppercase tracking-[0.2em] text-[#e8342a]">
          Carreira & Contribuições
        </span>
        <h1 className="font-display text-4xl sm:text-6xl text-[#f5f1ea] tracking-tight">
          TRAJETÓRIA PROFISSIONAL
        </h1>
        <p className="text-base text-[#f5f1ea]/70 leading-relaxed font-normal">
          Percurso de prática em ateliês de arquitetura, formação técnica para empresas públicas e
          liderança em iniciativas internacionais de dados geoespaciais abertos.
        </p>
      </div>

      {/* Linha do Tempo Editorial */}
      <div className="relative border-l border-[#f5f1ea]/15 ml-4 sm:ml-8 space-y-12 pl-6 sm:pl-10">
        {experiences.map((exp, idx) => (
          <div key={exp.id} className="relative group space-y-3">
            {/* Ponto indicador da timeline */}
            <div className="absolute -left-[31px] sm:-left-[47px] top-1.5 w-3 h-3 bg-[#e8342a] border-2 border-[#0c0c0d] group-hover:scale-125 transition-transform" />

            {/* Período */}
            <span className="text-xs font-mono uppercase text-[#e8342a] tracking-wider block">
              {exp.period}
            </span>

            {/* Cargo e Organização */}
            <div>
              <h3 className="font-display text-2xl text-[#f5f1ea] group-hover:text-[#e8342a] transition-colors">
                {exp.role}
              </h3>
              <p className="text-sm font-medium text-[#f5f1ea]/80">{exp.organization}</p>
            </div>

            {/* Descrição detalhada */}
            <p className="text-base text-[#f5f1ea]/70 leading-relaxed max-w-3xl font-normal">
              {exp.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
