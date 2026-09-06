'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Lightbox, type GalleryMediaItem } from '@/components/gallery/Lightbox';
import { Maximize2 } from 'lucide-react';

interface CaseStudyGalleryProps {
  media: GalleryMediaItem[];
  projectTitle: string;
}

export function CaseStudyGallery({ media, projectTitle }: CaseStudyGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (!media || media.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {media.map((item, idx) => (
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
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />

            {/* Hover overlay com ícone de expansão */}
            <div className="absolute top-4 right-4 p-2 bg-[#0c0c0d]/80 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
              <Maximize2 className="w-4 h-4 text-[#f5f1ea]" />
            </div>

            {/* Legenda na base */}
            {item.caption && (
              <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-xs text-[#f5f1ea]/90 font-normal line-clamp-1">
                  {item.caption}
                </p>
              </div>
            )}
          </div>
        ))}
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
