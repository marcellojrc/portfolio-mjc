'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { slugify } from '@/lib/utils';
import { Save, ArrowLeft, Loader2, CheckCircle2, AlertCircle, Eye } from 'lucide-react';
import {
  ProjectMediaManager,
  type ProjectMediaItem,
} from '@/components/admin/ProjectMediaManager';
import { safeFetchJson } from '@/lib/api-client';

export interface ProjectFormData {
  id?: string;
  title: string;
  slug: string;
  number: string;
  category: string;
  location: string;
  year: string;
  status: string;
  area: string;
  role: string;
  software: string;
  services: string;
  concept: string;
  technicalDetails: string;
  coverImage: string;
  featured: boolean;
  published: boolean;
  description: string;
  media?: ProjectMediaItem[];
}

interface ProjectFormProps {
  initialData?: ProjectFormData;
  isEdit?: boolean;
}

const CATEGORIES = [
  'Habitacional',
  'Equipamento',
  'Urbano',
  'Reabilitação',
  'Interiores',
  'BIM & Técnico',
];

export function ProjectForm({ initialData, isEdit = false }: ProjectFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState<ProjectFormData>(
    initialData || {
      title: '',
      slug: '',
      number: '13',
      category: 'Habitacional',
      location: 'Maputo, Moçambique',
      year: new Date().getFullYear().toString(),
      status: 'Concluído',
      area: '',
      role: 'Arquiteto Autor',
      software: 'Revit, Lumion, AutoCAD',
      services: 'Projeto de Execução, Modelação BIM',
      concept: '',
      technicalDetails: '',
      coverImage: '',
      featured: false,
      published: true,
      description: '',
    }
  );

  const [mediaItems, setMediaItems] = useState<ProjectMediaItem[]>(
    initialData?.media || []
  );

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newTitle = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title: newTitle,
      slug: isEdit ? prev.slug : slugify(newTitle),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    // Validação mínima de imagem de capa
    const finalCover =
      formData.coverImage || (mediaItems.length > 0 ? mediaItems[0].url : '');

    if (!finalCover) {
      setLoading(false);
      setFeedback({
        type: 'error',
        text: 'Adicione pelo menos uma imagem ao projeto para definir a imagem de capa.',
      });
      return;
    }

    const payload = {
      ...formData,
      coverImage: finalCover,
      media: mediaItems,
    };

    const url = isEdit
      ? `/api/admin/projects/${formData.id}`
      : '/api/admin/projects';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const data = await safeFetchJson<{
        success: boolean;
        project?: { id: string };
        error?: string;
      }>(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!data.success) {
        throw new Error(data.error || 'Erro ao guardar o projeto.');
      }

      setFeedback({
        type: 'success',
        text: isEdit
          ? 'Projeto e mídias atualizados com sucesso!'
          : 'Projeto criado com sucesso! A redirecionar...',
      });

      if (!isEdit && data.project?.id) {
        const newProjectId = data.project.id;
        setTimeout(() => {
          router.push(`/admin/projects/${newProjectId}/edit`);
        }, 1200);
      } else {
        router.refresh();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro na comunicação.';
      setFeedback({ type: 'error', text: msg });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl">
      {/* Top Bar com Ações */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[#141416] border border-[#f5f1ea]/10 sticky top-0 z-20 backdrop-blur-md">
        <Link
          href="/admin/projects"
          className="inline-flex items-center gap-2 text-xs font-display uppercase tracking-wider text-[#f5f1ea]/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar à Lista</span>
        </Link>

        <div className="flex items-center gap-3">
          {isEdit && formData.slug && (
            <Link
              href={`/projects/${formData.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-[#f5f1ea]/20 text-xs font-display uppercase tracking-wider text-[#f5f1ea] hover:bg-white hover:text-black transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Ver no Site</span>
            </Link>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2 bg-[#e8342a] text-white font-display text-xs uppercase tracking-wider hover:bg-white hover:text-black transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isEdit ? 'Guardar Alterações' : 'Criar Projeto'}</span>
          </button>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-4 border flex items-center gap-3 text-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
              : 'bg-red-950/40 border-red-500/50 text-red-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* 01. Identificação Principal */}
      <div className="p-6 sm:p-8 border border-[#f5f1ea]/10 bg-[#141416] space-y-6">
        <h3 className="font-display text-base text-[#f5f1ea] uppercase tracking-wider text-[#e8342a]">
          01. Identificação Geral do Projeto
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-display uppercase tracking-widest text-[#f5f1ea]/70">
              Número *
            </label>
            <input
              type="text"
              required
              value={formData.number}
              onChange={(e) => setFormData({ ...formData, number: e.target.value })}
              placeholder="01"
              className="w-full px-4 py-2.5 bg-[#0c0c0d] border border-[#f5f1ea]/15 text-sm text-[#f5f1ea] font-mono focus:outline-none focus:border-[#e8342a]"
            />
          </div>

          <div className="md:col-span-6 space-y-2">
            <label className="text-xs font-display uppercase tracking-widest text-[#f5f1ea]/70">
              Título do Projeto *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={handleTitleChange}
              placeholder="Ex: Casa Q28C25"
              className="w-full px-4 py-2.5 bg-[#0c0c0d] border border-[#f5f1ea]/15 text-sm text-[#f5f1ea] focus:outline-none focus:border-[#e8342a]"
            />
          </div>

          <div className="md:col-span-4 space-y-2">
            <label className="text-xs font-display uppercase tracking-widest text-[#f5f1ea]/70">
              Slug (URL) *
            </label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: slugify(e.target.value) })}
              className="w-full px-4 py-2.5 bg-[#0c0c0d] border border-[#f5f1ea]/15 text-sm text-[#f5f1ea] font-mono focus:outline-none focus:border-[#e8342a]"
            />
          </div>

          <div className="md:col-span-4 space-y-2">
            <label className="text-xs font-display uppercase tracking-widest text-[#f5f1ea]/70">
              Categoria Arquitetónica *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2.5 bg-[#0c0c0d] border border-[#f5f1ea]/15 text-sm text-[#f5f1ea] focus:outline-none focus:border-[#e8342a]"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-4 space-y-2">
            <label className="text-xs font-display uppercase tracking-widest text-[#f5f1ea]/70">
              Localização *
            </label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Maputo, Moçambique"
              className="w-full px-4 py-2.5 bg-[#0c0c0d] border border-[#f5f1ea]/15 text-sm text-[#f5f1ea] focus:outline-none focus:border-[#e8342a]"
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-display uppercase tracking-widest text-[#f5f1ea]/70">
              Ano *
            </label>
            <input
              type="text"
              required
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              className="w-full px-4 py-2.5 bg-[#0c0c0d] border border-[#f5f1ea]/15 text-sm text-[#f5f1ea] font-mono focus:outline-none focus:border-[#e8342a]"
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-display uppercase tracking-widest text-[#f5f1ea]/70">
              Estado *
            </label>
            <input
              type="text"
              required
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              placeholder="Concluído"
              className="w-full px-4 py-2.5 bg-[#0c0c0d] border border-[#f5f1ea]/15 text-sm text-[#f5f1ea] focus:outline-none focus:border-[#e8342a]"
            />
          </div>
        </div>
      </div>

      {/* 02. Parâmetros Técnicos & Metadados */}
      <div className="p-6 sm:p-8 border border-[#f5f1ea]/10 bg-[#141416] space-y-6">
        <h3 className="font-display text-base text-[#f5f1ea] uppercase tracking-wider text-[#e8342a]">
          02. Parâmetros Técnicos & Competências
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-display uppercase tracking-widest text-[#f5f1ea]/70">
              Área de Intervenção
            </label>
            <input
              type="text"
              value={formData.area}
              onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              placeholder="Ex: 280 m²"
              className="w-full px-4 py-2.5 bg-[#0c0c0d] border border-[#f5f1ea]/15 text-sm text-[#f5f1ea] focus:outline-none focus:border-[#e8342a]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-display uppercase tracking-widest text-[#f5f1ea]/70">
              Papel Desempenhado (Role)
            </label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              placeholder="Ex: Arquiteto Autor, Modelação BIM"
              className="w-full px-4 py-2.5 bg-[#0c0c0d] border border-[#f5f1ea]/15 text-sm text-[#f5f1ea] focus:outline-none focus:border-[#e8342a]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-display uppercase tracking-widest text-[#f5f1ea]/70">
              Software Utilizado
            </label>
            <input
              type="text"
              value={formData.software}
              onChange={(e) => setFormData({ ...formData, software: e.target.value })}
              placeholder="Ex: Autodesk Revit, Lumion, AutoCAD"
              className="w-full px-4 py-2.5 bg-[#0c0c0d] border border-[#f5f1ea]/15 text-sm text-[#f5f1ea] focus:outline-none focus:border-[#e8342a]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-display uppercase tracking-widest text-[#f5f1ea]/70">
              Serviços Prestados
            </label>
            <input
              type="text"
              value={formData.services}
              onChange={(e) => setFormData({ ...formData, services: e.target.value })}
              placeholder="Ex: Estudo Prévio, Projeto de Execução, BIM"
              className="w-full px-4 py-2.5 bg-[#0c0c0d] border border-[#f5f1ea]/15 text-sm text-[#f5f1ea] focus:outline-none focus:border-[#e8342a]"
            />
          </div>
        </div>
      </div>

      {/* 03. Gestão Completa de Imagens & Capa */}
      <div className="p-6 sm:p-8 border border-[#f5f1ea]/10 bg-[#141416] space-y-6">
        <h3 className="font-display text-base text-[#f5f1ea] uppercase tracking-wider text-[#e8342a]">
          03. Mídias, Fotografias & Imagem de Capa
        </h3>

        <ProjectMediaManager
          media={mediaItems}
          coverImage={formData.coverImage}
          onCoverImageChange={(url) => setFormData((prev) => ({ ...prev, coverImage: url }))}
          onMediaChange={(newMedia) => setMediaItems(newMedia)}
        />
      </div>

      {/* 04. Memória Descritiva & Conteúdo */}
      <div className="p-6 sm:p-8 border border-[#f5f1ea]/10 bg-[#141416] space-y-6">
        <h3 className="font-display text-base text-[#f5f1ea] uppercase tracking-wider text-[#e8342a]">
          04. Memória Descritiva & Textos de Case Study
        </h3>

        <div className="space-y-2">
          <label className="text-xs font-display uppercase tracking-widest text-[#f5f1ea]/70">
            Descrição Geral do Projeto *
          </label>
          <textarea
            required
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 bg-[#0c0c0d] border border-[#f5f1ea]/15 text-sm text-[#f5f1ea] focus:outline-none focus:border-[#e8342a] resize-y"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-display uppercase tracking-widest text-[#f5f1ea]/70">
            Conceito Arquitetónico
          </label>
          <textarea
            rows={3}
            value={formData.concept}
            onChange={(e) => setFormData({ ...formData, concept: e.target.value })}
            placeholder="Princípios formais, bioclimáticos e de circulação..."
            className="w-full px-4 py-3 bg-[#0c0c0d] border border-[#f5f1ea]/15 text-sm text-[#f5f1ea] focus:outline-none focus:border-[#e8342a] resize-y"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-display uppercase tracking-widest text-[#f5f1ea]/70">
            Desenvolvimento Técnico / Sistemas Construtivos
          </label>
          <textarea
            rows={3}
            value={formData.technicalDetails}
            onChange={(e) => setFormData({ ...formData, technicalDetails: e.target.value })}
            placeholder="Detalhes estruturais, quantitativos BIM ou soluções executivas..."
            className="w-full px-4 py-3 bg-[#0c0c0d] border border-[#f5f1ea]/15 text-sm text-[#f5f1ea] focus:outline-none focus:border-[#e8342a] resize-y"
          />
        </div>

        <div className="flex items-center gap-8 pt-4 border-t border-[#f5f1ea]/10">
          <label className="flex items-center gap-2.5 cursor-pointer text-xs font-display uppercase tracking-wider text-[#f5f1ea]">
            <input
              type="checkbox"
              checked={formData.published}
              onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
              className="w-4 h-4 accent-[#e8342a]"
            />
            <span>Publicado no Website</span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer text-xs font-display uppercase tracking-wider text-[#f5f1ea]">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="w-4 h-4 accent-[#e8342a]"
            />
            <span>Destacar na Homepage</span>
          </label>
        </div>
      </div>
    </form>
  );
}
