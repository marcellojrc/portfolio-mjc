import { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { ProjectsCatalog } from '@/components/projects/ProjectsCatalog';

export const metadata: Metadata = {
  title: 'Projetos Arquitetónicos',
  description:
    'Catálogo completo de projetos de arquitetura, habitação multifamiliar, equipamentos públicos, planeamento urbano e modelagem BIM por Marcelo Júnior Cumbe.',
};

export const revalidate = 60;

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    where: { published: true },
    orderBy: { order: 'asc' },
    select: {
      id: true,
      slug: true,
      number: true,
      title: true,
      category: true,
      location: true,
      year: true,
      area: true,
      coverImage: true,
      description: true,
      software: true,
      featured: true,
    },
  });

  return (
    <div className="arch-container py-12 sm:py-20 space-y-12">
      {/* Cabeçalho da Página */}
      <div className="space-y-4 max-w-3xl border-b border-[#f5f1ea]/15 pb-8">
        <span className="text-[11px] font-display uppercase tracking-[0.2em] text-[#e8342a]">
          Índice de Obras & Estudos
        </span>
        <h1 className="font-display text-4xl sm:text-6xl text-[#f5f1ea] tracking-tight">
          PROJETOS ARQUITETÓNICOS
        </h1>
        <p className="text-base text-[#f5f1ea]/70 leading-relaxed font-normal">
          Conjunto de obras desenvolvidas em contexto académico, colaborações profissionais e
          encomendas reais em Moçambique. Da escala do detalhe habitacional à dimensão do desenho
          urbano territorial.
        </p>
      </div>

      {/* Catálogo com Filtros */}
      <ProjectsCatalog initialProjects={projects} />
    </div>
  );
}
