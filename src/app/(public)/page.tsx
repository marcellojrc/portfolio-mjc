import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/db';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { JsonLd } from '@/components/seo/JsonLd';
import { getPersonSchema, getWebSiteSchema, getWebPageSchema } from '@/lib/seo';
import { ArrowUpRight, ArrowDown, Compass, Layers, MapPin, Building2 } from 'lucide-react';

export const revalidate = 60; // Revalidação a cada minuto

export default async function HomePage() {
  const [featuredProjects, allProjectsCount, experiences, rawSettings] = await Promise.all([
    prisma.project.findMany({
      where: { published: true, featured: true },
      orderBy: { order: 'asc' },
      take: 6,
    }),
    prisma.project.count({ where: { published: true } }),
    prisma.experience.findMany({
      orderBy: { order: 'asc' },
      take: 4,
    }),
    prisma.siteSettings.findMany(),
  ]);

  const settings = Object.fromEntries(rawSettings.map((s) => [s.key, s.value]));

  const homepageSchema = [
    getPersonSchema(),
    getWebSiteSchema(),
    getWebPageSchema({
      path: '/',
      name: 'MJC — Marcelo Cumbe | Arquitetura & Planeamento Físico',
      description:
        'Portfólio contemporâneo de arquitetura, urbanismo e tecnologias BIM/GIS por Marcelo Júnior Cumbe. Maputo, Moçambique.',
    }),
  ];

  return (
    <div className="space-y-24 sm:space-y-36 pb-24">
      <JsonLd data={homepageSchema} />

      {/* 1. HERO CINEMÁTICO */}
      <section className="relative min-h-[92vh] flex flex-col justify-end px-5 sm:px-12 pb-16 pt-32 overflow-hidden bg-black">
        {/* Imagem de Fundo com Escala Arquitetónica */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero_bg.jpg"
            alt="MJC Architecture — Portfólio de Marcelo Júnior Cumbe"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-40 brightness-75 scale-105 transition-transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0d] via-[#0c0c0d]/50 to-black/60" />
        </div>

        <div className="arch-container relative z-10 space-y-12">
          {/* Eyebrow / Tagline */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#f5f1ea]/15 pb-6">
            <span className="text-xs uppercase tracking-[0.2em] text-[#f5f1ea]/70 font-medium">
              {settings.author_name || 'Marcelo Júnior Cumbe'} — Portfólio {new Date().getFullYear()}
            </span>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-[#e8342a]">
              <MapPin className="w-3.5 h-3.5" />
              <span>{settings.author_location?.split('—')[1]?.trim() || 'Maputo · Moçambique'}</span>
            </div>
          </div>

          {/* Título Monumental */}
          <div className="space-y-2 max-w-5xl">
            <h1 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tighter leading-[0.88] text-[#f5f1ea]">
              ARQUITETURA <br />
              <span className="text-[#e8342a]">& PLANEAMENTO.</span>
            </h1>
          </div>

          {/* Subtítulo & CTAs */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end pt-4">
            <p className="md:col-span-7 text-base sm:text-lg text-[#f5f1ea]/75 font-normal leading-relaxed max-w-2xl">
              Prática focada na interseção entre técnica construtiva, modelação paramétrica BIM e
              planeamento físico sustentável. Projetos concebidos a partir do rigor do detalhe até ao
              impacto social no território africano.
            </p>

            <div className="md:col-span-5 flex flex-wrap items-center gap-4 md:justify-end">
              <Link
                href="/projects"
                className="px-6 py-3.5 bg-[#e8342a] text-white font-display text-xs uppercase tracking-widest hover:bg-white hover:text-[#0c0c0d] transition-all"
              >
                Ver Todos os Projetos ({allProjectsCount})
              </Link>
              <Link
                href="/contact"
                className="px-6 py-3.5 border border-[#f5f1ea]/30 text-[#f5f1ea] font-display text-xs uppercase tracking-widest hover:bg-[#f5f1ea] hover:text-[#0c0c0d] transition-all"
              >
                Iniciar Conversa
              </Link>
            </div>
          </div>

          {/* Scroll cue */}
          <div className="pt-8 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-[#f5f1ea]/40">
            <ArrowDown className="w-3.5 h-3.5 animate-bounce text-[#e8342a]" />
            <span>Explorar Obras Selecionadas</span>
          </div>
        </div>
      </section>

      {/* 2. STATS & INDICADORES ESSENCIAIS (CONFIGURÁVEIS PELO CMS) */}
      <section className="arch-container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 border-y border-[#f5f1ea]/15 py-12">
          <div className="space-y-1">
            <span className="font-display text-3xl sm:text-5xl text-[#e8342a]">
              {settings.hero_stat_1_val || String(allProjectsCount)}
            </span>
            <p className="text-xs uppercase tracking-widest text-[#f5f1ea]/60">
              {settings.hero_stat_1_lbl || 'Projetos no Catálogo'}
            </p>
          </div>
          <div className="space-y-1">
            <span className="font-display text-3xl sm:text-5xl text-[#f5f1ea]">
              {settings.hero_stat_2_val || 'BIM'}
            </span>
            <p className="text-xs uppercase tracking-widest text-[#f5f1ea]/60">
              {settings.hero_stat_2_lbl || 'Revit Avançado & Dynamo'}
            </p>
          </div>
          <div className="space-y-1">
            <span className="font-display text-3xl sm:text-5xl text-[#e8342a]">
              {settings.hero_stat_3_val || 'GIS'}
            </span>
            <p className="text-xs uppercase tracking-widest text-[#f5f1ea]/60">
              {settings.hero_stat_3_lbl || 'Mapeamento Humanitário'}
            </p>
          </div>
          <div className="space-y-1">
            <span className="font-display text-3xl sm:text-5xl text-[#f5f1ea]">
              {settings.hero_stat_4_val || '3D'}
            </span>
            <p className="text-xs uppercase tracking-widest text-[#f5f1ea]/60">
              {settings.hero_stat_4_lbl || 'Modelação & Execução'}
            </p>
          </div>
        </div>
      </section>

      {/* 3. PROJETOS EM DESTAQUE */}
      <section className="arch-container space-y-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-[#f5f1ea]/10 pb-6">
          <div className="space-y-2">
            <span className="text-[11px] font-display uppercase tracking-[0.2em] text-[#e8342a]">
              Trabalho Selecionado
            </span>
            <h2 className="font-display text-3xl sm:text-5xl text-[#f5f1ea]">
              OBRAS EM DESTAQUE
            </h2>
          </div>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-xs font-display uppercase tracking-widest text-[#f5f1ea] hover:text-[#e8342a] transition-colors"
          >
            <span>Ver Índice Completo de Projetos</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              slug={project.slug}
              number={project.number}
              title={project.title}
              category={project.category}
              location={project.location}
              year={project.year}
              area={project.area}
              coverImage={project.coverImage}
              description={project.description}
              featured={project.featured}
            />
          ))}
        </div>
      </section>

      {/* 4. MANIFESTO & FILOSOFIA DE DESIGN */}
      <section className="bg-[#141416] border-y border-[#f5f1ea]/10 py-20 sm:py-32">
        <div className="arch-container grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-[11px] font-display uppercase tracking-[0.2em] text-[#e8342a]">
              Filosofia & Abordagem
            </span>
            <h2 className="font-display text-3xl sm:text-5xl text-[#f5f1ea] leading-[1.05]">
              TÉCNICA, CRIATIVIDADE <br />
              E IMPACTO SOCIAL.
            </h2>
            <div className="space-y-4 text-sm sm:text-base text-[#f5f1ea]/75 leading-relaxed">
              <p>
                A arquitetura em contextos emergentes não pode ser mero ornamento formal. Cada
                solução espacial exige precisão bioclimática, adequação aos materiais disponíveis e
                respeito à identidade das comunidades.
              </p>
              <p>
                Com dedicação à modelagem de informação da construção (BIM), projeto paramétrico e
                sistemas de informação geográfica (SIG), integro dados empíricos a conceitos
                sensíveis para responder a desafios urbanos e habitacionais reais.
              </p>
            </div>

            <div className="pt-4">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-xs font-display uppercase tracking-widest text-[#e8342a] hover:text-white transition-colors"
              >
                <span>Ler Percurso Completo & Ferramentas</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 relative aspect-square sm:aspect-[4/3] overflow-hidden border border-[#f5f1ea]/15">
            <Image
              src="/images/about_portrait.jpg"
              alt="Marcelo Júnior Cumbe"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover grayscale contrast-125 hover:grayscale-0 transition-all duration-700"
            />
            <div className="absolute bottom-4 left-4 bg-[#0c0c0d]/90 backdrop-blur-md px-4 py-2 border border-[#f5f1ea]/10">
              <span className="text-xs uppercase tracking-wider text-[#f5f1ea] font-medium">
                Marcelo Júnior Cumbe — Catembe, Maputo
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ÁREAS DE ATUAÇÃO E DISCIPLINAS */}
      <section className="arch-container space-y-12">
        <div className="space-y-2 border-b border-[#f5f1ea]/10 pb-6">
          <span className="text-[11px] font-display uppercase tracking-[0.2em] text-[#e8342a]">
            Domínios de Prática
          </span>
          <h2 className="font-display text-3xl sm:text-5xl text-[#f5f1ea]">
            DISCIPLINAS INTEGRADAS
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-8 border border-[#f5f1ea]/10 bg-[#121214] space-y-4">
            <Building2 className="w-8 h-8 text-[#e8342a]" />
            <h3 className="font-display text-xl text-[#f5f1ea]">Projeto Arquitetónico</h3>
            <p className="text-sm text-[#f5f1ea]/65 leading-relaxed">
              Habitação multifamiliar, equipamentos de ensino e saúde, intervenções de interiores e
              reabilitações de fachadas sob medida.
            </p>
          </div>

          <div className="p-8 border border-[#f5f1ea]/10 bg-[#121214] space-y-4">
            <Compass className="w-8 h-8 text-[#e8342a]" />
            <h3 className="font-display text-xl text-[#f5f1ea]">Planeamento Urbano</h3>
            <p className="text-sm text-[#f5f1ea]/65 leading-relaxed">
              Masterplans territoriais, análise de tecidos informais, hierarquia viária, mobilidade
              suave e loteamentos residenciais.
            </p>
          </div>

          <div className="p-8 border border-[#f5f1ea]/10 bg-[#121214] space-y-4">
            <Layers className="w-8 h-8 text-[#e8342a]" />
            <h3 className="font-display text-xl text-[#f5f1ea]">Modelação BIM</h3>
            <p className="text-sm text-[#f5f1ea]/65 leading-relaxed">
              Desenvolvimento de modelos em Revit, fluxos paramétricos em Dynamo, extração
              automatizada de quantitativos e orçamentação.
            </p>
          </div>

          <div className="p-8 border border-[#f5f1ea]/10 bg-[#121214] space-y-4">
            <MapPin className="w-8 h-8 text-[#e8342a]" />
            <h3 className="font-display text-xl text-[#f5f1ea]">Cartografia & GIS</h3>
            <p className="text-sm text-[#f5f1ea]/65 leading-relaxed">
              Análise geoespacial com QGIS, mapeamento colaborativo OpenStreetMap e campanhas de
              campo para infraestruturas humanitárias.
            </p>
          </div>
        </div>
      </section>

      {/* 6. TRAJETÓRIA RECENTE RESUMIDA */}
      <section className="arch-container space-y-8">
        <div className="flex items-end justify-between border-b border-[#f5f1ea]/10 pb-6">
          <div>
            <span className="text-[11px] font-display uppercase tracking-[0.2em] text-[#e8342a]">
              Atividade Profissional
            </span>
            <h2 className="font-display text-2xl sm:text-4xl text-[#f5f1ea]">
              EXPERIÊNCIA & DOCÊNCIA
            </h2>
          </div>
          <Link
            href="/experience"
            className="text-xs font-display uppercase tracking-widest text-[#f5f1ea]/70 hover:text-[#e8342a] transition-colors"
          >
            Ver Detalhes →
          </Link>
        </div>

        <div className="divide-y divide-[#f5f1ea]/10">
          {experiences.map((exp) => (
            <div key={exp.id} className="py-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-baseline">
              <span className="md:col-span-3 text-xs font-mono text-[#e8342a] uppercase">
                {exp.period}
              </span>
              <div className="md:col-span-4">
                <h4 className="font-display text-base text-[#f5f1ea]">{exp.role}</h4>
                <p className="text-xs text-[#f5f1ea]/50">{exp.organization}</p>
              </div>
              <p className="md:col-span-5 text-sm text-[#f5f1ea]/70 font-normal">
                {exp.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. BANNER DE CONTACTO */}
      <section className="arch-container">
        <div className="relative border border-[#f5f1ea]/15 bg-gradient-to-r from-[#141416] to-[#0c0c0d] p-8 sm:p-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <span className="text-[10px] font-display uppercase tracking-[0.2em] text-[#e8342a]">
              Disponibilidade Para Novos Projetos
            </span>
            <h2 className="font-display text-3xl sm:text-5xl text-[#f5f1ea] leading-tight">
              VAMOS CONSTRUIR O PRÓXIMO PROJETO?
            </h2>
            <p className="text-sm text-[#f5f1ea]/65">
              Aberto a colaborações em projeto arquitetónico, consultoria BIM, desenho urbano e
              parcerias institucionais.
            </p>
          </div>

          <Link
            href="/contact"
            className="px-8 py-4 bg-[#e8342a] text-white font-display text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-200 shadow-xl"
          >
            Entrar em Contacto
          </Link>
        </div>
      </section>
    </div>
  );
}
