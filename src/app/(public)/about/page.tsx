import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { ArrowUpRight, GraduationCap, MapPin, Wrench, Globe } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sobre Marcelo Cumbe',
  description:
    'Perfil profissional, formação académica, filosofia arquitetónica e ferramentas de Marcelo Júnior Cumbe.',
};

export const revalidate = 60;

export default async function AboutPage() {
  const [skills, educations, rawSettings] = await Promise.all([
    prisma.skill.findMany({ orderBy: { order: 'asc' } }),
    prisma.education.findMany({ orderBy: { order: 'asc' } }),
    prisma.siteSettings.findMany(),
  ]);

  const settings = Object.fromEntries(rawSettings.map((s) => [s.key, s.value]));

  const authorName = settings.author_name || 'MARCELO JÚNIOR CUMBE';
  const presentationTitle =
    settings.about_presentation_title || 'Arquiteto & Planeador Físico em formação contínua.';
  const bioP1 =
    settings.about_bio_p1 ||
    'Estudante finalista de Arquitetura e Planeamento Físico na Universidade Eduardo Mondlane (UEM), com conclusão prevista para fevereiro de 2027. Desde a infância fascinado pelos processos de construção civil e pela dinâmica do território, encontrei na arquitetura o canal ideal para articular rigor técnico, criatividade espacial e responsabilidade social.';
  const bioP2 =
    settings.about_bio_p2 ||
    'Durante a minha trajetória académica e profissional, especializei-me na modelagem de informação da construção (BIM com Autodesk Revit e Dynamo) e na aplicação de Sistemas de Informação Geográfica (SIG com QGIS e OpenStreetMap), conectando o desenho do edifício às necessidades de infraestrutura e gestão urbana das cidades moçambicanas.';
  const bioP3 =
    settings.about_bio_p3 ||
    'Atuei como coordenador da comunidade YouthMappers Moçambique, liderando equipas em campanhas internacionais de dados abertos para mitigação de riscos de desastres e planeamento participativo em assentamentos informais.';

  const portrait = settings.about_portrait || '/images/about_portrait.jpg';
  const workBase = settings.about_work_base || 'Catembe, Maputo';
  const focus = settings.about_focus || 'BIM · GIS · Arquitetura Sustentável';
  const cvUrl =
    settings.author_cv_url ||
    'https://drive.google.com/file/d/1PLqDbRhrFCbv4OgxCZhGxB1yKRgxhRoX/view?usp=sharing';

  return (
    <div className="arch-container py-12 sm:py-20 space-y-20 sm:space-y-32">
      {/* 1. CABEÇALHO & APRESENTAÇÃO */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        <div className="lg:col-span-7 space-y-6">
          <span className="text-[11px] font-display uppercase tracking-[0.2em] text-[#e8342a]">
            Perfil & Filosofia
          </span>
          <h1 className="font-display text-4xl sm:text-6xl text-[#f5f1ea] leading-[0.95]">
            {authorName.toUpperCase()}
          </h1>
          <p className="text-xl sm:text-2xl text-[#f5f1ea]/90 font-display">
            {presentationTitle}
          </p>

          <div className="space-y-4 text-base sm:text-lg text-[#f5f1ea]/75 leading-relaxed font-normal">
            <p>{bioP1}</p>
            {bioP2 && <p>{bioP2}</p>}
            {bioP3 && <p>{bioP3}</p>}
          </div>

          <div className="pt-4 flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="px-6 py-3 bg-[#e8342a] text-white font-display text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
            >
              Falar Conmigo
            </Link>
            {cvUrl && (
              <a
                href={cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 border border-[#f5f1ea]/20 text-xs font-display uppercase tracking-widest text-[#f5f1ea] hover:bg-white hover:text-black transition-colors"
              >
                <span>Download CV Completo</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Retrato e Dados Rápidos */}
        <div className="lg:col-span-5 space-y-6">
          <div className="relative aspect-[4/5] overflow-hidden border border-[#f5f1ea]/15 bg-[#141416]">
            <Image
              src={portrait}
              alt={authorName}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover object-center grayscale hover:grayscale-0 transition-all duration-700"
            />
          </div>

          <div className="p-6 border border-[#f5f1ea]/10 bg-[#121214] space-y-3">
            <div className="flex items-center justify-between text-xs text-[#f5f1ea]/60">
              <span className="font-display uppercase text-[#e8342a]">Base de Trabalho</span>
              <span>{workBase}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-[#f5f1ea]/60">
              <span className="font-display uppercase text-[#e8342a]">Foco Profissional</span>
              <span>{focus}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. REGISTOS FOTOGRÁFICOS DE ATIVIDADE */}
      <section className="space-y-8">
        <div className="border-b border-[#f5f1ea]/10 pb-4">
          <span className="text-[11px] font-display uppercase tracking-[0.2em] text-[#e8342a]">
            Prática em Campo & Ensino
          </span>
          <h2 className="font-display text-2xl sm:text-4xl text-[#f5f1ea]">
            ATIVIDADES, FORMAÇÃO & COMUNIDADE
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative aspect-[4/3] overflow-hidden border border-[#f5f1ea]/10 group">
            <Image
              src="/images/activity_1.jpg"
              alt="Docência de Revit para CFM-Beira"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-x-0 bottom-0 p-3 bg-black/80">
              <p className="text-xs text-[#f5f1ea]">Docência de Revit (BIM) — CFM Beira 2025</p>
            </div>
          </div>

          <div className="relative aspect-[4/3] overflow-hidden border border-[#f5f1ea]/10 group">
            <Image
              src="/images/activity_2.jpg"
              alt="GIZ School 2024"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-x-0 bottom-0 p-3 bg-black/80">
              <p className="text-xs text-[#f5f1ea]">Participação em Workshop GIZ 2024</p>
            </div>
          </div>

          <div className="relative aspect-[4/3] overflow-hidden border border-[#f5f1ea]/10 group">
            <Image
              src="/images/activity_3.jpg"
              alt="Mapeamento Colaborativo YouthMappers"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-x-0 bottom-0 p-3 bg-black/80">
              <p className="text-xs text-[#f5f1ea]">Mapeamento Colaborativo YouthMappers 2025</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CAIXA DE FERRAMENTAS TÉCNICAS */}
      <section className="space-y-8">
        <div className="border-b border-[#f5f1ea]/10 pb-4">
          <span className="text-[11px] font-display uppercase tracking-[0.2em] text-[#e8342a]">
            Domínio Tecnológico
          </span>
          <h2 className="font-display text-2xl sm:text-4xl text-[#f5f1ea]">
            SOFTWARE & FERRAMENTAS DE PROJETO
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {skills.map((skill) => (
            <div
              key={skill.id}
              className="p-5 border border-[#f5f1ea]/10 bg-[#121214] space-y-2 hover:border-[#e8342a]/50 transition-colors"
            >
              <Wrench className="w-4 h-4 text-[#e8342a]" />
              <h4 className="font-display text-base text-[#f5f1ea]">{skill.name}</h4>
              <p className="text-xs font-mono text-[#f5f1ea]/50">{skill.level}</p>
              <span className="text-[10px] uppercase tracking-wider text-[#e8342a] block">
                {skill.category}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. PERCURSO EDUCACIONAL (EDITÁVEL PELO CMS) */}
      <section className="space-y-8">
        <div className="border-b border-[#f5f1ea]/10 pb-4">
          <span className="text-[11px] font-display uppercase tracking-[0.2em] text-[#e8342a]">
            Qualificações & Formação
          </span>
          <h2 className="font-display text-2xl sm:text-4xl text-[#f5f1ea]">
            PERCURSO ACADÉMICO
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {educations.map((edu) => (
            <div key={edu.id} className="p-8 border border-[#f5f1ea]/10 bg-[#121214] space-y-3">
              <span className="text-xs font-mono text-[#e8342a] uppercase">{edu.period}</span>
              <h3 className="font-display text-xl text-[#f5f1ea]">{edu.degree}</h3>
              <p className="text-sm font-medium text-[#f5f1ea]/80">{edu.institution}</p>
              <p className="text-sm text-[#f5f1ea]/60 leading-relaxed">{edu.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
