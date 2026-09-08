import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { CaseStudyGallery } from '@/components/projects/CaseStudyGallery';
import { JsonLd } from '@/components/seo/JsonLd';
import { getProjectSchema, getBreadcrumbListSchema } from '@/lib/seo';
import { ArrowLeft, ArrowRight, MapPin, Calendar, Maximize, UserCheck, Wrench, ShieldCheck } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

// Projetos são conteúdo de CMS: gerar em runtime evita que o build dependa do Neon.
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await prisma.project.findUnique({
    where: { slug },
  });

  if (!project) return { title: 'Projeto Não Encontrado' };

  return {
    title: `${project.title} — ${project.category}`,
    description: project.description.slice(0, 160),
    alternates: {
      canonical: `/projects/${project.slug}`,
    },
    openGraph: {
      title: `${project.title} | MJC Architecture`,
      description: project.description.slice(0, 160),
      url: `/projects/${project.slug}`,
      images: [{ url: project.coverImage }],
    },
  };
}

export default async function ProjectCaseStudyPage({ params }: Props) {
  const { slug } = await params;

  const project = await prisma.project.findUnique({
    where: { slug },
    include: {
      media: {
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!project || !project.published) {
    notFound();
  }

  // Buscar projeto anterior e seguinte para navegação contínua
  const [prevProject, nextProject] = await Promise.all([
    prisma.project.findFirst({
      where: { published: true, order: { lt: project.order } },
      orderBy: { order: 'desc' },
      select: { slug: true, title: true, number: true },
    }),
    prisma.project.findFirst({
      where: { published: true, order: { gt: project.order } },
      orderBy: { order: 'asc' },
      select: { slug: true, title: true, number: true },
    }),
  ]);

  // Schema.org Structured Data
  const projectSchema = getProjectSchema({
    slug: project.slug,
    title: project.title,
    category: project.category,
    description: project.description,
    coverImage: project.coverImage,
    location: project.location,
    year: project.year,
  });

  const breadcrumbsSchema = getBreadcrumbListSchema([
    { name: 'Início', url: '/' },
    { name: 'Projetos', url: '/projects' },
    { name: project.title, url: `/projects/${project.slug}` },
  ]);

  return (
    <article className="space-y-16 sm:space-y-24 pb-24">
      <JsonLd data={[projectSchema, breadcrumbsSchema]} />

      {/* 1. HERO DO PROJETO COM IMAGEM DE CAPA */}
      <section className="relative min-h-[60vh] sm:min-h-[75vh] flex flex-col justify-end px-5 sm:px-12 pb-12 pt-28 bg-black overflow-hidden border-b border-[#f5f1ea]/15">
        <div className="absolute inset-0 z-0">
          <Image
            src={project.coverImage}
            alt={`${project.title} — ${project.category}`}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-60 brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0d] via-[#0c0c0d]/40 to-transparent" />
        </div>

        <div className="arch-container relative z-10 space-y-6">
          <div className="flex items-center gap-4 text-xs uppercase tracking-[0.2em] text-[#e8342a]">
            <Link href="/projects" className="inline-flex items-center gap-1.5 hover:text-white transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar ao Índice</span>
            </Link>
            <span>/</span>
            <span>Projeto {project.number}</span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-[#f5f1ea] tracking-tight max-w-5xl">
            {project.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-xs uppercase tracking-widest text-[#f5f1ea]/70">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#e8342a]" />
              {project.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#e8342a]" />
              Ano {project.year}
            </span>
            <span className="px-2.5 py-1 bg-[#e8342a] text-white font-display text-[10px]">
              {project.category}
            </span>
          </div>
        </div>
      </section>

      {/* 2. FICHA TÉCNICA (METADATA BAR) */}
      <section className="arch-container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 border border-[#f5f1ea]/15 bg-[#121214]">
          {project.area && (
            <div className="space-y-1">
              <span className="text-[10px] font-display uppercase tracking-widest text-[#f5f1ea]/40 flex items-center gap-1.5">
                <Maximize className="w-3.5 h-3.5 text-[#e8342a]" /> Área de Intervenção
              </span>
              <p className="font-display text-lg sm:text-xl text-[#f5f1ea]">{project.area}</p>
            </div>
          )}

          {project.role && (
            <div className="space-y-1">
              <span className="text-[10px] font-display uppercase tracking-widest text-[#f5f1ea]/40 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-[#e8342a]" /> Papel / Responsabilidade
              </span>
              <p className="font-display text-base sm:text-lg text-[#f5f1ea]">{project.role}</p>
            </div>
          )}

          {project.software && (
            <div className="space-y-1">
              <span className="text-[10px] font-display uppercase tracking-widest text-[#f5f1ea]/40 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-[#e8342a]" /> Ferramentas de Projeto
              </span>
              <p className="text-sm font-medium text-[#f5f1ea]">{project.software}</p>
            </div>
          )}

          <div className="space-y-1">
            <span className="text-[10px] font-display uppercase tracking-widest text-[#f5f1ea]/40 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#e8342a]" /> Estado da Obra
            </span>
            <p className="font-display text-base sm:text-lg text-[#e8342a]">{project.status}</p>
          </div>
        </div>
      </section>

      {/* 3. MEMÓRIA DESCRITIVA E CONCEITO */}
      <section className="arch-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-4 space-y-3">
            <span className="text-[11px] font-display uppercase tracking-[0.2em] text-[#e8342a]">
              01 — Memória Descritiva
            </span>
            <h2 className="font-display text-2xl sm:text-3xl text-[#f5f1ea]">
              CONTEXTO & PROGRAMA
            </h2>
          </div>

          <div className="lg:col-span-8 space-y-6 text-base sm:text-lg text-[#f5f1ea]/80 leading-relaxed font-normal">
            <p>{project.description}</p>

            {project.concept && (
              <div className="pt-4 border-t border-[#f5f1ea]/10 space-y-2">
                <h3 className="font-display text-sm uppercase tracking-wider text-[#e8342a]">
                  Conceito Arquitetónico
                </h3>
                <p className="text-base text-[#f5f1ea]/70">{project.concept}</p>
              </div>
            )}

            {project.technicalDetails && (
              <div className="pt-4 border-t border-[#f5f1ea]/10 space-y-2">
                <h3 className="font-display text-sm uppercase tracking-wider text-[#e8342a]">
                  Desenvolvimento Técnico
                </h3>
                <p className="text-base text-[#f5f1ea]/70">{project.technicalDetails}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. GALERIA DE DESENHOS, PLANTAS E RENDERS */}
      <section className="arch-container space-y-8">
        <div className="flex items-center justify-between border-b border-[#f5f1ea]/10 pb-6">
          <div className="space-y-1">
            <span className="text-[11px] font-display uppercase tracking-[0.2em] text-[#e8342a]">
              02 — Representação Visual
            </span>
            <h2 className="font-display text-2xl sm:text-3xl text-[#f5f1ea]">
              PLANTAS, CORTES & RENDERS ({project.media.length})
            </h2>
          </div>
          <span className="text-xs text-[#f5f1ea]/40 font-mono hidden sm:inline-block">
            Clique em qualquer imagem para ampliar
          </span>
        </div>

        <CaseStudyGallery media={project.media} projectTitle={project.title} />
      </section>

      {/* 5. NAVEGAÇÃO ENTRE PROJETOS */}
      <section className="arch-container pt-12 border-t border-[#f5f1ea]/15">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {prevProject ? (
            <Link
              href={`/projects/${prevProject.slug}`}
              className="p-6 border border-[#f5f1ea]/10 bg-[#121214] hover:border-[#e8342a] transition-all group flex flex-col justify-between space-y-2"
            >
              <span className="text-xs uppercase tracking-widest text-[#f5f1ea]/40 flex items-center gap-1.5">
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                Projeto Anterior ({prevProject.number})
              </span>
              <h4 className="font-display text-lg text-[#f5f1ea] group-hover:text-[#e8342a] transition-colors">
                {prevProject.title}
              </h4>
            </Link>
          ) : (
            <div className="p-6 border border-[#f5f1ea]/5 bg-[#0e0e10] opacity-30 text-xs uppercase tracking-widest">
              Início do Catálogo
            </div>
          )}

          {nextProject ? (
            <Link
              href={`/projects/${nextProject.slug}`}
              className="p-6 border border-[#f5f1ea]/10 bg-[#121214] hover:border-[#e8342a] transition-all group flex flex-col justify-between text-right space-y-2"
            >
              <span className="text-xs uppercase tracking-widest text-[#f5f1ea]/40 flex items-center justify-end gap-1.5">
                Próximo Projeto ({nextProject.number})
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
              <h4 className="font-display text-lg text-[#f5f1ea] group-hover:text-[#e8342a] transition-colors">
                {nextProject.title}
              </h4>
            </Link>
          ) : (
            <div className="p-6 border border-[#f5f1ea]/5 bg-[#0e0e10] opacity-30 text-xs uppercase tracking-widest text-right">
              Fim do Catálogo
            </div>
          )}
        </div>
      </section>
    </article>
  );
}
