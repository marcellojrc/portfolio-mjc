'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import {
  Upload,
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  Trash2,
  Star,
  ArrowUp,
  ArrowDown,
  Loader2,
  X,
  AlertCircle,
} from 'lucide-react';

export interface ProjectMediaItem {
  id?: string;
  url: string;
  type: 'IMAGE' | 'PLAN' | 'SECTION' | 'ELEVATION' | 'RENDER' | 'PHOTO';
  alt: string;
  caption?: string | null;
  order: number;
}

interface ProjectMediaManagerProps {
  media: ProjectMediaItem[];
  coverImage: string;
  onCoverImageChange: (url: string) => void;
  onMediaChange: (media: ProjectMediaItem[]) => void;
}

const MEDIA_TYPES = [
  { value: 'RENDER', label: 'Renderização 3D' },
  { value: 'PHOTO', label: 'Fotografia de Obra' },
  { value: 'PLAN', label: 'Planta Arquitetónica' },
  { value: 'SECTION', label: 'Corte Técnico' },
  { value: 'ELEVATION', label: 'Alçado / Fachada' },
  { value: 'IMAGE', label: 'Imagem Geral' },
];

export function ProjectMediaManager({
  media,
  coverImage,
  onCoverImageChange,
  onMediaChange,
}: ProjectMediaManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Biblioteca Modal
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [libraryMedia, setLibraryMedia] = useState<{ id: string; url: string; alt: string }[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);

  // Processar ficheiro enviado
  async function handleUploadFile(file: File) {
    setUploading(true);
    setError(null);
    setUploadProgress(`A carregar ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)...`);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Falha ao processar upload.');
      }

      // Adicionar nova imagem à lista de mídias
      const newItem: ProjectMediaItem = {
        url: data.url,
        type: 'RENDER',
        alt: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        caption: '',
        order: media.length + 1,
      };

      const updated = [...media, newItem];
      onMediaChange(updated);

      // Se não houver capa ainda, definir como capa
      if (!coverImage || coverImage === '') {
        onCoverImageChange(data.url);
      }

      setUploadProgress('Upload concluído com sucesso!');
      setTimeout(() => setUploadProgress(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao carregar ficheiro.';
      setError(msg);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleUploadFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUploadFile(file);
  }

  // Abrir biblioteca para reutilizar imagens
  async function openLibrary() {
    setIsLibraryOpen(true);
    if (libraryMedia.length === 0) {
      setLoadingLibrary(true);
      try {
        const res = await fetch('/api/admin/media');
        const data = await res.json();
        if (data.success && data.media) {
          setLibraryMedia(data.media);
        }
      } catch {
        setError('Não foi possível carregar a biblioteca de imagens.');
      } finally {
        setLoadingLibrary(false);
      }
    }
  }

  function addFromLibrary(url: string, alt: string) {
    // Verificar se já existe na galeria
    if (media.some((m) => m.url === url)) {
      setError('Esta imagem já está incluída na galeria do projeto.');
      setIsLibraryOpen(false);
      return;
    }

    const newItem: ProjectMediaItem = {
      url,
      type: 'RENDER',
      alt: alt || 'Imagem do projeto',
      caption: '',
      order: media.length + 1,
    };

    const updated = [...media, newItem];
    onMediaChange(updated);

    if (!coverImage) {
      onCoverImageChange(url);
    }

    setIsLibraryOpen(false);
  }

  function updateItem(index: number, field: keyof ProjectMediaItem, value: unknown) {
    const updated = [...media];
    updated[index] = { ...updated[index], [field]: value };
    onMediaChange(updated);
  }

  function removeItem(index: number) {
    const itemToRemove = media[index];
    const updated = media.filter((_, i) => i !== index);

    // Reordenar
    const reordered = updated.map((item, idx) => ({ ...item, order: idx + 1 }));
    onMediaChange(reordered);

    // Se removeu a imagem de capa, reatribuir para a primeira restante
    if (coverImage === itemToRemove.url) {
      onCoverImageChange(reordered.length > 0 ? reordered[0].url : '');
    }
  }

  function moveItem(index: number, direction: 'up' | 'down') {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === media.length - 1)
    ) {
      return;
    }

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...media];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);

    const reordered = updated.map((item, idx) => ({ ...item, order: idx + 1 }));
    onMediaChange(reordered);
  }

  return (
    <div className="space-y-6">
      {/* 1. ZONA DE UPLOAD INTERACTIVA */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`p-6 sm:p-8 border-2 border-dashed transition-all text-center space-y-4 ${
          isDragOver
            ? 'border-[#e8342a] bg-[#e8342a]/10'
            : 'border-[#f5f1ea]/20 bg-[#0c0c0d] hover:border-[#f5f1ea]/40'
        }`}
      >
        <div className="flex justify-center gap-3 text-[#e8342a]">
          <Upload className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <h4 className="font-display text-sm uppercase tracking-wider text-[#f5f1ea]">
            Adicionar Imagem ou Desenho ao Projeto
          </h4>
          <p className="text-xs text-[#f5f1ea]/60 max-w-md mx-auto">
            Arraste e largue uma imagem aqui, carregue do seu computador ou utilize a câmara do
            telemóvel. Formatos: JPG, PNG, WebP ou AVIF (máx. 15MB).
          </p>
        </div>

        {/* Inputs de ficheiro ocultos */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={handleFileChange}
          className="hidden"
          id="file-upload-dialog"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
          id="camera-upload-dialog"
        />

        {/* Botões de Ação */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#e8342a] text-white font-display text-xs uppercase tracking-wider hover:bg-white hover:text-black transition-colors disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            <span>Carregar Imagem</span>
          </button>

          <button
            type="button"
            disabled={uploading}
            onClick={() => cameraInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#f5f1ea]/20 text-[#f5f1ea] font-display text-xs uppercase tracking-wider hover:border-[#e8342a] hover:text-[#e8342a] transition-colors disabled:opacity-50"
          >
            <Camera className="w-4 h-4" />
            <span>Tirar com Câmara</span>
          </button>

          <button
            type="button"
            disabled={uploading}
            onClick={openLibrary}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#f5f1ea]/20 text-[#f5f1ea] font-display text-xs uppercase tracking-wider hover:border-white hover:text-white transition-colors disabled:opacity-50"
          >
            <ImageIcon className="w-4 h-4" />
            <span>Escolher da Biblioteca</span>
          </button>
        </div>

        {/* Estado de Upload & Feedback */}
        {uploading && (
          <div className="pt-2 flex items-center justify-center gap-2 text-xs text-[#e8342a] font-mono">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{uploadProgress || 'A processar upload do ficheiro...'}</span>
          </div>
        )}

        {uploadProgress && !uploading && (
          <div className="pt-2 flex items-center justify-center gap-2 text-xs text-emerald-400 font-medium">
            <CheckCircle2 className="w-4 h-4" />
            <span>{uploadProgress}</span>
          </div>
        )}

        {error && (
          <div className="pt-2 flex items-center justify-center gap-2 text-xs text-red-400 font-medium">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* 2. GRELHA DE MÍDIAS DO PROJETO */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#f5f1ea]/10 pb-3">
          <div className="space-y-0.5">
            <h4 className="font-display text-xs uppercase tracking-widest text-[#f5f1ea]/80">
              Galeria do Projeto ({media.length} {media.length === 1 ? 'mídia' : 'mídias'})
            </h4>
            <p className="text-[11px] text-[#f5f1ea]/50">
              Selecione a imagem de capa, defina a tipologia arquitetónica, legendas e textos
              alternativos.
            </p>
          </div>

          {coverImage && (
            <span className="text-[10px] font-mono text-[#e8342a] uppercase tracking-wider border border-[#e8342a]/30 px-2 py-1 bg-[#e8342a]/5">
              Capa Ativa Definida
            </span>
          )}
        </div>

        {media.length === 0 ? (
          <div className="p-8 border border-[#f5f1ea]/10 bg-[#0c0c0d] text-center space-y-2">
            <ImageIcon className="w-8 h-8 text-[#f5f1ea]/30 mx-auto" />
            <p className="text-xs text-[#f5f1ea]/50">
              Ainda não existem imagens associadas a este projeto. Utilize os botões acima para
              adicionar.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {media.map((item, index) => {
              const isCover = coverImage === item.url;

              return (
                <div
                  key={item.id || item.url + index}
                  className={`p-4 border transition-all bg-[#0c0c0d] grid grid-cols-1 md:grid-cols-12 gap-4 items-start ${
                    isCover
                      ? 'border-[#e8342a] ring-1 ring-[#e8342a]/50'
                      : 'border-[#f5f1ea]/10 hover:border-[#f5f1ea]/25'
                  }`}
                >
                  {/* Thumbnail e Badge de Capa */}
                  <div className="md:col-span-3 space-y-2">
                    <div className="relative aspect-[16/10] bg-black overflow-hidden border border-[#f5f1ea]/10">
                      <Image
                        src={item.url}
                        alt={item.alt || 'Mídia do projeto'}
                        fill
                        sizes="(max-width: 768px) 100vw, 200px"
                        className="object-cover"
                      />

                      {isCover && (
                        <div className="absolute top-2 left-2 bg-[#e8342a] text-white px-2 py-0.5 text-[9px] font-display uppercase tracking-widest flex items-center gap-1 shadow-md">
                          <Star className="w-3 h-3 fill-current" />
                          <span>Capa</span>
                        </div>
                      )}
                    </div>

                    {/* Botão para definir como capa */}
                    <button
                      type="button"
                      onClick={() => onCoverImageChange(item.url)}
                      className={`w-full py-1.5 px-2 text-[11px] font-display uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors ${
                        isCover
                          ? 'bg-[#e8342a] text-white'
                          : 'border border-[#f5f1ea]/20 text-[#f5f1ea]/80 hover:border-[#e8342a] hover:text-[#e8342a]'
                      }`}
                    >
                      <Star className={`w-3 h-3 ${isCover ? 'fill-current' : ''}`} />
                      <span>{isCover ? 'Imagem de Capa' : 'Definir como Capa'}</span>
                    </button>
                  </div>

                  {/* Campos de Edição da Mídia */}
                  <div className="md:col-span-8 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Tipo de Mídia */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-display uppercase tracking-widest text-[#f5f1ea]/60">
                          Tipo de Desenho / Fotografia
                        </label>
                        <select
                          value={item.type}
                          onChange={(e) =>
                            updateItem(
                              index,
                              'type',
                              e.target.value as ProjectMediaItem['type']
                            )
                          }
                          className="w-full px-3 py-1.5 bg-[#141416] border border-[#f5f1ea]/15 text-xs text-[#f5f1ea] focus:outline-none focus:border-[#e8342a]"
                        >
                          {MEDIA_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Texto Alternativo (ALT) */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-display uppercase tracking-widest text-[#f5f1ea]/60">
                          Texto Alternativo / Acessibilidade (ALT)
                        </label>
                        <input
                          type="text"
                          value={item.alt}
                          onChange={(e) => updateItem(index, 'alt', e.target.value)}
                          placeholder="Ex: Perspetiva frontal da fachada poente"
                          className="w-full px-3 py-1.5 bg-[#141416] border border-[#f5f1ea]/15 text-xs text-[#f5f1ea] focus:outline-none focus:border-[#e8342a]"
                        />
                      </div>
                    </div>

                    {/* Legenda (Caption) Visível */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-display uppercase tracking-widest text-[#f5f1ea]/60">
                        Legenda Editorial da Imagem (visível no website)
                      </label>
                      <input
                        type="text"
                        value={item.caption || ''}
                        onChange={(e) => updateItem(index, 'caption', e.target.value)}
                        placeholder="Ex: Pormenor dos elementos vazados de ventilação natural."
                        className="w-full px-3 py-1.5 bg-[#141416] border border-[#f5f1ea]/15 text-xs text-[#f5f1ea] focus:outline-none focus:border-[#e8342a]"
                      />
                    </div>

                    {/* URL direta (apenas informativa) */}
                    <div className="text-[10px] font-mono text-[#f5f1ea]/40 truncate">
                      Caminho: {item.url}
                    </div>
                  </div>

                  {/* Ações de Reordenação e Eliminação */}
                  <div className="md:col-span-1 flex md:flex-col items-center justify-between md:justify-start gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveItem(index, 'up')}
                      title="Mover para cima"
                      className="p-1.5 text-[#f5f1ea]/50 hover:text-white disabled:opacity-20 transition-colors"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      disabled={index === media.length - 1}
                      onClick={() => moveItem(index, 'down')}
                      title="Mover para baixo"
                      className="p-1.5 text-[#f5f1ea]/50 hover:text-white disabled:opacity-20 transition-colors"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      title="Remover imagem"
                      className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors md:mt-4"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL DA BIBLIOTECA DE MÍDIA */}
      {isLibraryOpen && (
        <div
          className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-w-4xl w-full max-h-[85vh] bg-[#141416] border border-[#f5f1ea]/15 flex flex-col justify-between overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-[#f5f1ea]/10 flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg text-[#f5f1ea]">Biblioteca Geral de Imagens</h3>
                <p className="text-xs text-[#f5f1ea]/50">
                  Clique numa imagem para a adicionar à galeria deste projeto.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsLibraryOpen(false)}
                className="p-2 text-[#f5f1ea]/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-grow">
              {loadingLibrary ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3 text-xs text-[#f5f1ea]/60">
                  <Loader2 className="w-8 h-8 animate-spin text-[#e8342a]" />
                  <span>A carregar biblioteca...</span>
                </div>
              ) : libraryMedia.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {libraryMedia.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => addFromLibrary(m.url, m.alt)}
                      className="group relative aspect-[4/3] bg-black cursor-pointer border border-[#f5f1ea]/10 hover:border-[#e8342a] overflow-hidden transition-all"
                    >
                      <Image
                        src={m.url}
                        alt={m.alt || 'Imagem da biblioteca'}
                        fill
                        sizes="200px"
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-x-0 bottom-0 p-1.5 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[9px] font-mono text-[#f5f1ea] block truncate">
                          {m.url.replace('/images/', '')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-12 text-xs text-[#f5f1ea]/40">
                  Nenhuma imagem disponível na biblioteca.
                </p>
              )}
            </div>

            <div className="p-4 border-t border-[#f5f1ea]/10 flex justify-end">
              <button
                type="button"
                onClick={() => setIsLibraryOpen(false)}
                className="px-5 py-2 border border-[#f5f1ea]/20 text-xs font-display uppercase tracking-wider text-[#f5f1ea] hover:bg-white hover:text-black transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
