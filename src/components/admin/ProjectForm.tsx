'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { slugify } from '@/lib/utils';
import { Save, ArrowLeft, Loader2, CheckCircle2, AlertCircle, Eye } from 'lucide-react';

interface ProjectFormData {
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
      coverImage: '/images/proj01_01.jpg',
      featured: false,
      published: true,
      description: '',
    }
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

    const url = isEdit
      ? `/api/admin/projects/${formData.id}`
      : '/api/admin/projects';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setFeedback({
          type: 'success',
          text: isEdit ? 'Projeto atualizado com sucesso!' : 'Novo projeto criado com sucesso!',
        });
        setTimeout(() => {
          router.push('/admin/projects');
          router.refresh();
        }, 1200);
      } else {
        setFeedback({
          type: 'error',
          text: data.error || 'Erro ao gravar os dados do projeto.',
        });
      }
    } catch {
      setFeedback({ type: 'error', text: 'Erro de ligação ao servidor.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between border-b border-[#f5f1ea]/15 pb-6">
        <Link
          href="/admin/projects"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#f5f1ea]/60 hover:text-[#e8342a] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar à Lista</span>
        </Link>

        <div className="flex items-center gap-4">
          {isEdit && formData.slug && (
            <Link
              href={`/projects/${formData.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#f5f1ea]/20 text-xs font-display uppercase tracking-widest text-[#f5f1ea] hover:border-[#e8342a] transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Ver no Site</span>
            </Link>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#e8342a] text-white font-display text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isEdit ? 'Guardar Alterações' : 'Publicar Projeto'}</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 border text-xs flex items-center gap-3 ${
            feedback.type === 'success'
              ? 'bg-green-950/40 border-green-500/30 text-green-300'
              : 'bg-red-950/40 border-red-500/30 text-red-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-green-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Identificação Geral */}
      <div className="p-6 sm:p-8 border border-[#f5f1ea]/10 bg-[#141416] space-y-6">
        <h3 className="font-display text-base text-[#f5f1ea] uppercase tracking-wider text-[#e8342a]">
          01. Identificação Geral
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">
          <div className="sm:col-span-2 space-y-2">
            <label className="text-xs font-display uppercase tracking-widest text-[#f5f1ea]/70">
              N.º Projeto *
            </label>
            <input
              type="text"
              required
              value={formData.number}
              onChange={(e) => setFormData({ ...formData, number: e.target.value })}
              className="w-full px-4 py-2.5 bg-[#0c0c0d] border border-[#f5f1ea]/15 text-sm text-[#f5f1ea] focus:outline-none focus:border-[#e8342a]"
            />
          </div>

          <div className="sm:col-span-6 space-y-2">
            <label className="text-xs font-display uppercase tracking-widest text-[#f5f1ea]/70">
              Título da Obra *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={handleTitleChange}
              placeholder="Ex.: Casa Q28C25"
              className="w-full px-4 py-2.5 bg-[#0c0c0d] border border-[#f5f1ea]/15 text-sm text-[#f5f1ea] focus:outline-none focus:border-[#e8342a]"
            />
          </div>

          <div className="sm:col-span-4 space-y-2">
            <label className="text-xs font-display uppercase tracking-widest text-[#f5f1ea]/70">
              Slug URL *
            </label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-4 py-2.5 bg-[#0c0c0d] border border-[#f5f1ea]/15 text-sm text-[#f5f1ea] font-mono focus:outline-none focus:border-[#e8342a]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-display uppercase tracking-widest text-[#f5f1ea]/70">
              Categoria *
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

          <div className="space-y-2">
            <label className="text-xs font-display uppercase tracking-widest text-[#f5f1ea]/70">
              Localização *
            </label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Ex.: Maputo, Moçambique"
              className="w-full px-4 py-2.5 bg-[#0c0c0d] border border-[#f5f1ea]/15 text-sm text-[#f5f1ea] focus:outline-none focus:border-[#e8342a]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-display uppercase tracking-widest text-[#f5f1ea]/70">
              Ano de Execução *
            </label>
            <input
              type="text"
              required
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              className="w-full px-4 py-2.5 bg-[#0c0c0d] border border-[#f5f1ea]/15 text-sm text-[#f5f1ea] focus:outline-none focus:border-[#e8342a]"
            />
          </div>
        </div>
      </div>

      {/* Ficha Técnica & Parâmetros */}
      <div className="p-6 sm:p-8 border border-[#f5f1ea]/10 bg-[#141416] space-y-6">
        <h3 className="font-display text-base text-[#f5f1ea] uppercase tracking-wider text-[#e8342a]">
          02. Parâmetros Arquitetónicos
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-display uppercase tracking-widest text-[#f5f1ea]/70">
              Área de Intervenção (m²)
            </label>
            <input
              type="text"
              value={formData.area}
              onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              placeholder="Ex.: 449 m²"
              className="w-full px-4 py-2.5 bg-[#0c0c0d] border border-[#f5f1ea]/15 text-sm text-[#f5f1ea] focus:outline-none focus:border-[#e8342a]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-display uppercase tracking-widest text-[#f5f1ea]/70">
              Papel / Responsabilidade
            </label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              placeholder="Ex.: Arquiteto Autor & Coordenação BIM"
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
              placeholder="Ex.: Revit (BIM), Dynamo, Lumion"
              className="w-full px-4 py-2.5 bg-[#0c0c0d] border border-[#f5f1ea]/15 text-sm text-[#f5f1ea] focus:outline-none focus:border-[#e8342a]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-display uppercase tracking-widest text-[#f5f1ea]/70">
              Estado da Obra
            </label>
            <input
              type="text"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              placeholder="Ex.: Concluído / Em Obra / Fase BIM"
              className="w-full px-4 py-2.5 bg-[#0c0c0d] border border-[#f5f1ea]/15 text-sm text-[#f5f1ea] focus:outline-none focus:border-[#e8342a]"
            />
          </div>
        </div>
      </div>

      {/* Memória Descritiva & Mídia */}
      <div className="p-6 sm:p-8 border border-[#f5f1ea]/10 bg-[#141416] space-y-6">
        <h3 className="font-display text-base text-[#f5f1ea] uppercase tracking-wider text-[#e8342a]">
          03. Memória Descritiva & Mídia
        </h3>

        <div className="space-y-2">
          <label className="text-xs font-display uppercase tracking-widest text-[#f5f1ea]/70">
            Caminho da Imagem de Capa *
          </label>
          <input
            type="text"
            required
            value={formData.coverImage}
            onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
            placeholder="/images/proj01_01.jpg"
            className="w-full px-4 py-2.5 bg-[#0c0c0d] border border-[#f5f1ea]/15 text-sm text-[#f5f1ea] font-mono focus:outline-none focus:border-[#e8342a]"
          />
        </div>

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
