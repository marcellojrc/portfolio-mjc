'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, Image as ImageIcon, Check, X, Loader2, RefreshCw } from 'lucide-react';
import { uploadAssetDirectly, safeFetchJson } from '@/lib/api-client';
import { validateFileBeforeUpload } from '@/lib/image-validation';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

interface MediaOption {
  id: string;
  url: string;
  alt: string;
}

export function ImageUploader({ value, onChange, label = 'Imagem de Capa' }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgressPercentage, setUploadProgressPercentage] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [libraryMedia, setLibraryMedia] = useState<MediaOption[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validação preventiva no cliente antes de transmitir bytes pela rede
    const clientValidation = validateFileBeforeUpload(file);
    if (!clientValidation.valid) {
      setError(clientValidation.error || 'Ficheiro inválido.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploading(true);
    setUploadProgressPercentage(0);

    try {
      const result = await uploadAssetDirectly(file, {
        onProgress: (pct) => {
          setUploadProgressPercentage(pct);
        },
      });

      if (result.url) {
        onChange(result.url);
      } else {
        setError('Falha no upload do ficheiro.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao enviar o ficheiro.';
      setError(msg);
    } finally {
      setUploading(false);
      setUploadProgressPercentage(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function openLibrary() {
    setIsLibraryOpen(true);
    if (libraryMedia.length === 0) {
      setLoadingLibrary(true);
      try {
        const data = await safeFetchJson<{
          success: boolean;
          media?: MediaOption[];
          error?: string;
        }>('/api/admin/media');

        if (data.success && data.media) {
          setLibraryMedia(data.media);
        } else {
          setError(data.error || 'Não foi possível carregar a biblioteca de mídia.');
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Não foi possível carregar a biblioteca de mídia.';
        setError(msg);
      } finally {
        setLoadingLibrary(false);
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-xs font-display uppercase tracking-widest text-[#f5f1ea]/70">
          {label} *
        </label>
        <button
          type="button"
          onClick={() => setShowManualInput(!showManualInput)}
          className="text-[10px] uppercase tracking-wider text-[#e8342a] hover:underline"
        >
          {showManualInput ? 'Ocultar caminho manual' : 'Editar caminho manual'}
        </button>
      </div>

      {/* Cartão de Visualização e Ações */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 p-4 sm:p-6 border border-[#f5f1ea]/15 bg-[#0c0c0d]">
        {/* Pré-visualização da Imagem Atual */}
        <div className="sm:col-span-5 relative aspect-[16/10] bg-black overflow-hidden border border-[#f5f1ea]/10 flex items-center justify-center">
          {value ? (
            <Image
              src={value}
              alt="Pré-visualização da imagem"
              fill
              sizes="(max-width: 640px) 100vw, 300px"
              className="object-cover"
            />
          ) : (
            <div className="text-center p-4 text-[#f5f1ea]/40 space-y-1">
              <ImageIcon className="w-8 h-8 mx-auto opacity-40" />
              <span className="text-[11px] block">Nenhuma imagem selecionada</span>
            </div>
          )}

          {uploading && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-2 text-xs text-[#f5f1ea]">
              <Loader2 className="w-6 h-6 animate-spin text-[#e8342a]" />
              <span>
                {uploadProgressPercentage !== null
                  ? `A carregar: ${uploadProgressPercentage}%`
                  : 'A carregar ficheiro...'}
              </span>
            </div>
          )}
        </div>

        {/* Botões de Ação */}
        <div className="sm:col-span-7 flex flex-col justify-center space-y-4">
          <p className="text-xs text-[#f5f1ea]/60 leading-relaxed">
            Pode carregar uma nova imagem diretamente do seu computador (JPG, PNG, WebP, AVIF) ou escolher
            uma fotografia ou desenho existente na biblioteca do projeto.
          </p>

          <div className="flex flex-wrap gap-3">
            {/* Botão de Upload do Computador */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="hidden"
              id="file-upload-input"
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#e8342a] text-white font-display text-xs uppercase tracking-wider hover:bg-white hover:text-black transition-colors disabled:opacity-50"
            >
              {value ? <RefreshCw className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
              <span>
                {uploading
                  ? value
                    ? 'A substituir imagem...'
                    : 'A carregar ficheiro...'
                  : value
                    ? 'Substituir Imagem'
                    : 'Carregar do Computador'}
              </span>
            </button>

            {/* Botão para Escolher da Biblioteca */}
            <button
              type="button"
              onClick={openLibrary}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#f5f1ea]/20 text-[#f5f1ea] font-display text-xs uppercase tracking-wider hover:border-[#e8342a] hover:text-[#e8342a] transition-colors"
            >
              <ImageIcon className="w-4 h-4" />
              <span>Escolher da Biblioteca</span>
            </button>
          </div>

          {error && (
            <p className="text-xs text-red-400 mt-2 font-medium">{error}</p>
          )}
        </div>
      </div>

      {/* Campo Manual de URL (opcional para quem quiser digitar) */}
      {showManualInput && (
        <div className="space-y-1 animate-in fade-in duration-200">
          <input
            type="text"
            required
            value={value}
            onChange={(e) => {
              const val = e.target.value;
              if (val.toLowerCase().endsWith('.svg') || val.includes('.svg?')) {
                setError('Ficheiros SVG não são permitidos no CMS. Formatos aceites: JPG, PNG, WebP ou AVIF.');
              } else {
                setError(null);
              }
              onChange(val);
            }}
            placeholder="/images/proj01_01.jpg"
            className="w-full px-4 py-2.5 bg-[#0c0c0d] border border-[#f5f1ea]/15 text-xs text-[#f5f1ea] font-mono focus:outline-none focus:border-[#e8342a]"
          />
          <span className="text-[10px] text-[#f5f1ea]/40 font-mono">
            Exemplo: /images/proj01_01.jpg ou /images/uploads/meu-render.jpg (Formatos: JPG, PNG, WebP, AVIF)
          </span>
        </div>
      )}

      {/* Modal da Biblioteca de Mídia */}
      {isLibraryOpen && (
        <div
          className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-w-5xl w-full max-h-[85vh] bg-[#141416] border border-[#f5f1ea]/15 flex flex-col justify-between overflow-hidden shadow-2xl">
            {/* Topo do Modal */}
            <div className="p-6 border-b border-[#f5f1ea]/10 flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg text-[#f5f1ea]">Biblioteca de Imagens do Portfólio</h3>
                <p className="text-xs text-[#f5f1ea]/50">
                  Clique sobre qualquer render ou prancha para definir como imagem de capa.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsLibraryOpen(false)}
                className="p-2 text-[#f5f1ea]/70 hover:text-white transition-colors"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo com Grelha de Imagens */}
            <div className="p-6 overflow-y-auto flex-grow">
              {loadingLibrary ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3 text-xs text-[#f5f1ea]/60">
                  <Loader2 className="w-8 h-8 animate-spin text-[#e8342a]" />
                  <span>A carregar imagens existentes...</span>
                </div>
              ) : libraryMedia.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {libraryMedia.map((m) => {
                    const isSelected = value === m.url;
                    return (
                      <div
                        key={m.id}
                        onClick={() => {
                          onChange(m.url);
                          setIsLibraryOpen(false);
                        }}
                        className={`group relative aspect-[4/3] bg-black cursor-pointer border overflow-hidden transition-all ${
                          isSelected
                            ? 'border-[#e8342a] ring-2 ring-[#e8342a]'
                            : 'border-[#f5f1ea]/10 hover:border-[#f5f1ea]/40'
                        }`}
                      >
                        <Image
                          src={m.url}
                          alt={m.alt || 'Imagem do projeto'}
                          fill
                          sizes="(max-width: 768px) 50vw, 20vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {isSelected && (
                          <div className="absolute top-2 right-2 p-1 bg-[#e8342a] text-white rounded-full">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 p-1.5 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[9px] font-mono text-[#f5f1ea] block truncate">
                            {m.url.replace('/images/', '')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center py-12 text-xs text-[#f5f1ea]/40">
                  Nenhuma imagem encontrada na biblioteca.
                </p>
              )}
            </div>

            {/* Rodapé do Modal */}
            <div className="p-4 border-t border-[#f5f1ea]/10 flex justify-end">
              <button
                type="button"
                onClick={() => setIsLibraryOpen(false)}
                className="px-5 py-2 border border-[#f5f1ea]/20 text-xs font-display uppercase tracking-wider text-[#f5f1ea] hover:bg-white hover:text-black transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
