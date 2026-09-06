'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Lightbox, type GalleryMediaItem } from '@/components/gallery/Lightbox';
import { Maximize2 } from 'lucide-react';

interface CaseStudyGalleryProps {
  media: GalleryMediaItem[];
  projectTitle: string;
}

const TYPE_LABELS: Record<string, string> = {
  PLAN: 'PLANTA',
  SECTION: 'CORTE TÉCNICO',
  ELEVATION: 'ALÇADO',
  RENDER: 'RENDERIZAÇÃO',
  PHOTO: 'FOTOGRAFIA',
  IMAGE: 'IMAGEM',
};

export function CaseStudyGallery({ media, projectTitle }: CaseStudyGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (!media || media.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {media.map((item, idx) => {
          const typeLabel = item.type ? TYPE_LABELS[item.type] || item.type : null;

          return (
            <div
              key={item.url + idx}
              onClick={() => setLightboxIndex(idx)}
              className={`group relative overflow-hidden bg-[#141416] border border-[#f5f1ea]/10 hover:border-[#e8342a]/50 transition-all cursor-pointer ${
                idx === 0 && media.length % 2 !== 0 ? 'md:col-span-2 aspect-[21/10]' : 'aspect-[16/10]'
              }`}
            >
              <Image
                src={item.url}
                alt={item.alt || `${projectTitle} - imagem ${idx + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/25 group-hover:bg-transparent transition-colors" />

              {/* Tag de Tipo de Mídia Arquitetónica no Topo Esquerdo */}
              {typeLabel && (
                <div className="absolute top-4 left-4 z-10 px-2.5 py-1 bg-[#0c0c0d]/80 backdrop-blur-md border border-[#f5f1ea]/15">
                  <span className="text-[9px] font-mono uppercase tracking-[0.16em] text-[#e8342a]">
                    {typeLabel}
                  </span>
                </div>
              )}

              {/* Hover overlay com ícone de expansão no Topo Direito */}
              <div className="absolute top-4 right-4 z-10 p-2 bg-[#0c0c0d]/80 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 className="w-4 h-4 text-[#f5f1ea]" />
              </div>

              {/* Legenda Editorial na base */}
              {item.caption && (
                <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                  <p className="text-xs sm:text-sm text-[#f5f1ea]/95 font-normal leading-snug line-clamp-2">
                    {item.caption}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Lightbox
        media={media}
        currentIndex={lightboxIndex ?? 0}
        isOpen={lightboxIndex !== null}
        onClose={() => setLightboxIndex(null)}
        onNavigate={(index) => setLightboxIndex(index)}
      />
    </>
  );
}
