import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';

interface ProjectCardProps {
  slug: string;
  number: string;
  title: string;
  category: string;
  location: string;
  year: string;
  area?: string | null;
  coverImage: string;
  description: string;
  featured?: boolean;
}

export function ProjectCard({
  slug,
  number,
  title,
  category,
  location,
  year,
  area,
  coverImage,
  description,
  featured = false,
}: ProjectCardProps) {
  return (
    <article className="group relative flex flex-col justify-between border border-[#f5f1ea]/10 bg-[#121214] hover:border-[#f5f1ea]/30 transition-all duration-300">
      {/* Imagem com enquadramento */}
      <Link href={`/projects/${slug}`} className="relative aspect-[16/10] overflow-hidden bg-black block">
        <Image
          src={coverImage}
          alt={`Render ou fotografia de ${title}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0d] via-transparent to-transparent opacity-60" />

        {/* Categoria Badge */}
        <span className="absolute top-4 left-4 px-2.5 py-1 text-[10px] font-display uppercase tracking-widest bg-[#0c0c0d]/80 backdrop-blur-md text-[#f5f1ea] border border-[#f5f1ea]/15">
          {category}
        </span>

        {/* Número do Projeto */}
        <span className="absolute bottom-4 right-4 font-display text-2xl text-[#f5f1ea]/40 group-hover:text-[#e8342a] transition-colors">
          {number}
        </span>
      </Link>

      {/* Conteúdo Informativo */}
      <div className="p-6 sm:p-8 flex flex-col justify-between flex-grow">
        <div>
          <div className="flex items-baseline justify-between gap-4 mb-2">
            <span className="text-[11px] uppercase tracking-widest text-[#f5f1ea]/50 font-medium">
              {location} · {year}
            </span>
            {area && (
              <span className="text-[11px] uppercase tracking-wider text-[#e8342a] font-semibold">
                {area}
              </span>
            )}
          </div>

          <h3 className="font-display text-xl sm:text-2xl text-[#f5f1ea] group-hover:text-[#e8342a] transition-colors line-clamp-1 mb-3">
            <Link href={`/projects/${slug}`}>{title}</Link>
          </h3>

          <p className="text-sm text-[#f5f1ea]/65 line-clamp-3 leading-relaxed mb-6 font-normal">
            {description}
          </p>
        </div>

        {/* Link para Case Study */}
        <div className="pt-4 border-t border-[#f5f1ea]/10 flex items-center justify-between">
          <Link
            href={`/projects/${slug}`}
            className="inline-flex items-center gap-2 text-xs font-display uppercase tracking-widest text-[#f5f1ea] group-hover:text-[#e8342a] transition-colors"
          >
            <span>Ver Case Study</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          <span className="text-[11px] text-[#f5f1ea]/40 font-mono">
            {featured ? 'Destaque' : 'Portfólio'}
          </span>
        </div>
      </div>
    </article>
  );
}
