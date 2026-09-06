'use client';

import { useEffect, useCallback } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export interface GalleryMediaItem {
  url: string;
  alt: string;
  caption?: string | null;
  type?: string;
}

interface LightboxProps {
  media: GalleryMediaItem[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function Lightbox({
  media,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
}: LightboxProps) {
  const currentItem = media[currentIndex];

  const handleNext = useCallback(() => {
    if (media.length === 0) return;
    onNavigate((currentIndex + 1) % media.length);
  }, [currentIndex, media.length, onNavigate]);

  const handlePrev = useCallback(() => {
    if (media.length === 0) return;
    onNavigate((currentIndex - 1 + media.length) % media.length);
  }, [currentIndex, media.length, onNavigate]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, handleNext, handlePrev]);

  if (!isOpen || !currentItem) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0c0c0d]/95 backdrop-blur-2xl animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Visualizador de imagem em tela cheia"
    >
      {/* Botão Fechar */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-10 p-3 text-[#f5f1ea]/70 hover:text-white hover:bg-[#f5f1ea]/10 rounded-full transition-colors"
        aria-label="Fechar visualizador"
      >
        <X className="w-7 h-7" />
      </button>

      {/* Controles de Navegação */}
      {media.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 sm:left-8 z-10 p-3 text-[#f5f1ea]/70 hover:text-white hover:bg-[#f5f1ea]/10 rounded-full transition-colors"
            aria-label="Imagem anterior"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 sm:right-8 z-10 p-3 text-[#f5f1ea]/70 hover:text-white hover:bg-[#f5f1ea]/10 rounded-full transition-colors"
            aria-label="Próxima imagem"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </>
      )}

      {/* Imagem Central */}
      <div className="relative max-w-6xl w-full h-[80vh] mx-4 sm:mx-16 flex flex-col items-center justify-center">
        <div className="relative w-full h-full">
          <Image
            src={currentItem.url}
            alt={currentItem.alt || 'Imagem do projeto'}
            fill
            sizes="100vw"
            className="object-contain"
            priority
          />
        </div>

        {/* Legenda & Contador */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-2 w-full max-w-3xl text-center sm:text-left">
          <p className="text-sm text-[#f5f1ea]/80 font-normal">
            {currentItem.caption || currentItem.alt}
          </p>
          <span className="text-xs font-mono text-[#f5f1ea]/40 whitespace-nowrap">
            {currentIndex + 1} / {media.length}
          </span>
        </div>
      </div>
    </div>
  );
}
