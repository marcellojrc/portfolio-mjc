'use client';

import { useState, useEffect } from 'react';
import { User, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { ImageUploader } from '@/components/admin/ImageUploader';

export default function AdminAboutPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const [formData, setFormData] = useState({
    author_name: 'Marcelo Júnior Cumbe',
    about_presentation_title: 'Arquiteto & Planeador Físico em formação contínua.',
    about_bio_p1: '',
    about_bio_p2: '',
    about_bio_p3: '',
    about_portrait: '/images/about_portrait.jpg',
    about_work_base: 'Catembe, Maputo',
    about_focus: 'BIM · GIS · Arquitetura Sustentável',
    author_cv_url: '',
  });

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        if (data.success && data.settings) {
          setFormData((prev) => ({
            ...prev,
            author_name: data.settings.author_name || prev.author_name,
            about_presentation_title:
              data.settings.about_presentation_title || prev.about_presentation_title,
            about_bio_p1:
              data.settings.about_bio_p1 ||
              'Estudante finalista de Arquitetura e Planeamento Físico na Universidade Eduardo Mondlane (UEM), com conclusão prevista para fevereiro de 2027. Desde a infância fascinado pelos processos de construção civil e pela dinâmica do território, encontrei na arquitetura o canal ideal para articular rigor técnico, criatividade espacial e responsabilidade social.',
            about_bio_p2:
              data.settings.about_bio_p2 ||
              'Durante a minha trajetória académica e profissional, especializei-me na modelagem de informação da construção (BIM com Autodesk Revit e Dynamo) e na aplicação de Sistemas de Informação Geográfica (SIG com QGIS e OpenStreetMap), conectando o desenho do edifício às necessidades de infraestrutura e gestão urbana das cidades moçambicanas.',
            about_bio_p3:
              data.settings.about_bio_p3 ||
              'Atuei como coordenador da comunidade YouthMappers Moçambique, liderando equipas em campanhas internacionais de dados abertos para mitigação de riscos de desastres e planeamento participativo em assentamentos informais.',
            about_portrait: data.settings.about_portrait || prev.about_portrait,
            about_work_base: data.settings.about_work_base || prev.about_work_base,
            about_focus: data.settings.about_focus || prev.about_focus,
            author_cv_url: data.settings.author_cv_url || prev.author_cv_url,
          }));
        }
      } catch {
        setFeedback({ type: 'error', text: 'Não foi possível carregar os dados de perfil.' });
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: formData }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao guardar dados do perfil.');
      }

      setFeedback({
        type: 'success',
        text: 'Perfil e textos do Sobre atualizados com sucesso! As alterações já estão ativas.',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao guardar.';
      setFeedback({ type: 'error', text: msg });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 text-xs text-[#f5f1ea]/50">
        <Loader2 className="w-6 h-6 animate-spin text-[#e8342a]" />
        <span>A carregar perfil...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#f5f1ea]/10 pb-6">
        <div>
          <span className="text-[10px] font-display uppercase tracking-[0.2em] text-[#e8342a]">
            CMS Editorial
          </span>
          <h1 className="font-display text-3xl text-[#f5f1ea]">Perfil & Página Sobre</h1>
          <p className="text-xs text-[#f5f1ea]/60">
            Edite a biografia, retrato fotográfico, links e informações da página pública Sobre.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#e8342a] text-white font-display text-xs uppercase tracking-wider hover:bg-white hover:text-black transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Guardar Alterações</span>
        </button>
      </div>

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

      <form onSubmit={handleSave} className="space-y-8">
        {/* Identificação & Fotografia */}
        <div className="p-6 sm:p-8 border border-[#f5f1ea]/10 bg-[#141416] space-y-6">
          <h3 className="font-display text-base text-[#f5f1ea] uppercase tracking-wider text-[#e8342a]">
            01. Identificação & Fotografia de Perfil
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-display uppercase tracking-widest text-[#f5f1ea]/70">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.author_name}
                  onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0c0c0d] border border-[#f5f1ea]/15 text-sm text-[#f5f1ea] focus:outline-none focus:border-[#e8342a]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-display uppercase tracking-widest text-[#f5f1ea]/70">
                  Subtítulo de Apresentação *
                </label>
                <input
                  type="text"
                  required
                  value={formData.about_presentation_title}
                  onChange={(e) =>
                    setFormData({ ...formData, about_presentation_title: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-[#0c0c0d] border border-[#f5f1ea]/15 text-sm text-[#f5f1ea] focus:outline-none focus:border-[#e8342a]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-display uppercase tracking-widest text-[#f5f1ea]/70">
                  Link de Download do CV (Google Drive ou URL)
                </label>
                <input
                  type="url"
                  value={formData.author_cv_url}
                  onChange={(e) => setFormData({ ...formData, author_cv_url: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0c0c0d] border border-[#f5f1ea]/15 text-sm text-[#f5f1ea] focus:outline-none focus:border-[#e8342a]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <ImageUploader
                label="Fotografia de Perfil / Retrato"
                value={formData.about_portrait}
                onChange={(url) => setFormData({ ...formData, about_portrait: url })}
              />
            </div>
          </div>
        </div>

        {/* Biografia Editorial */}
        <div className="p-6 sm:p-8 border border-[#f5f1ea]/10 bg-[#141416] space-y-6">
          <h3 className="font-display text-base text-[#f5f1ea] uppercase tracking-wider text-[#e8342a]">
            02. Biografia & Manifesto Editorial
          </h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-display uppercase tracking-widest text-[#f5f1ea]/70">
                Parágrafo 1 — Introdução & Motivação *
              </label>
              <textarea
                required
                rows={3}
                value={formData.about_bio_p1}
                onChange={(e) => setFormData({ ...formData, about_bio_p1: e.target.value })}
                className="w-full px-4 py-3 bg-[#0c0c0d] border border-[#f5f1ea]/15 text-sm text-[#f5f1ea] focus:outline-none focus:border-[#e8342a] resize-y"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-display uppercase tracking-widest text-[#f5f1ea]/70">
                Parágrafo 2 — Especialização Técnica & BIM
              </label>
              <textarea
                rows={3}
                value={formData.about_bio_p2}
                onChange={(e) => setFormData({ ...formData, about_bio_p2: e.target.value })}
                className="w-full px-4 py-3 bg-[#0c0c0d] border border-[#f5f1ea]/15 text-sm text-[#f5f1ea] focus:outline-none focus:border-[#e8342a] resize-y"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-display uppercase tracking-widest text-[#f5f1ea]/70">
                Parágrafo 3 — Impacto Social & Comunidade
              </label>
              <textarea
                rows={3}
                value={formData.about_bio_p3}
                onChange={(e) => setFormData({ ...formData, about_bio_p3: e.target.value })}
                className="w-full px-4 py-3 bg-[#0c0c0d] border border-[#f5f1ea]/15 text-sm text-[#f5f1ea] focus:outline-none focus:border-[#e8342a] resize-y"
              />
            </div>
          </div>
        </div>

        {/* Dados Rápidos */}
        <div className="p-6 sm:p-8 border border-[#f5f1ea]/10 bg-[#141416] space-y-6">
          <h3 className="font-display text-base text-[#f5f1ea] uppercase tracking-wider text-[#e8342a]">
            03. Dados Rápidos do Cartão Lateral
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-display uppercase tracking-widest text-[#f5f1ea]/70">
                Base de Trabalho
              </label>
              <input
                type="text"
                value={formData.about_work_base}
                onChange={(e) => setFormData({ ...formData, about_work_base: e.target.value })}
                placeholder="Ex: Catembe, Maputo"
                className="w-full px-4 py-2.5 bg-[#0c0c0d] border border-[#f5f1ea]/15 text-sm text-[#f5f1ea] focus:outline-none focus:border-[#e8342a]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-display uppercase tracking-widest text-[#f5f1ea]/70">
                Foco Principal
              </label>
              <input
                type="text"
                value={formData.about_focus}
                onChange={(e) => setFormData({ ...formData, about_focus: e.target.value })}
                placeholder="Ex: BIM · GIS · Arquitetura Sustentável"
                className="w-full px-4 py-2.5 bg-[#0c0c0d] border border-[#f5f1ea]/15 text-sm text-[#f5f1ea] focus:outline-none focus:border-[#e8342a]"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
