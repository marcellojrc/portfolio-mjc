'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const [formData, setFormData] = useState({
    site_title: 'MJC — Arquitetura & Planeamento Físico',
    site_description:
      'Portfólio e plataforma de arquitetura de Marcelo Júnior Cumbe. Maputo, Moçambique.',
    author_name: 'Marcelo Júnior Cumbe',
    author_profession: 'Arquiteto & Planeador Físico',
    author_location: 'Catembe, Rua da Igreja — Maputo, Moçambique',
    author_email: 'marcelojuniord07@gmail.com',
    author_whatsapp: '+258847130805',
    author_linkedin: 'https://www.linkedin.com/in/marcellojrc/',
    author_instagram: 'https://www.instagram.com/marcellojrc/',
    site_copyright: '© Marcelo Junior — {year}',
    // Stats da Homepage (Substituindo menção indevida da UEM)
    hero_stat_1_val: '12',
    hero_stat_1_lbl: 'Projetos no Catálogo',
    hero_stat_2_val: 'BIM',
    hero_stat_2_lbl: 'Revit Avançado & Dynamo',
    hero_stat_3_val: 'GIS',
    hero_stat_3_lbl: 'Mapeamento Humanitário',
    hero_stat_4_val: '3D',
    hero_stat_4_lbl: 'Modelação & Execução',
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        if (data.success && data.settings) {
          setFormData((prev) => ({
            ...prev,
            ...data.settings,
          }));
        }
      } catch {
        setFeedback({ type: 'error', text: 'Não foi possível carregar as definições.' });
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
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
        throw new Error(data.error || 'Erro ao gravar configurações.');
      }

      setFeedback({
        type: 'success',
        text: 'Configurações globais gravadas com sucesso! As páginas públicas refletem estas alterações.',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao gravar.';
      setFeedback({ type: 'error', text: msg });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 text-xs text-[#f5f1ea]/50">
        <Loader2 className="w-6 h-6 animate-spin text-[#e8342a]" />
        <span>A carregar definições do site...</span>
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
          <h1 className="font-display text-3xl text-[#f5f1ea]">Definições Globais do Site</h1>
          <p className="text-xs text-[#f5f1ea]/60">
            Configure contactos, redes sociais, copyright, métricas da homepage e SEO.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#e8342a] text-white font-display text-xs uppercase tracking-wider hover:bg-white hover:text-black transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Guardar Definições</span>
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
        {/* Identificação Geral & SEO */}
        <div className="p-6 sm:p-8 border border-[#f5f1ea]/10 bg-[#141416] space-y-6">
          <h3 className="font-display text-base text-[#f5f1ea] uppercase tracking-wider text-[#e8342a]">
            01. Identidade do Website & SEO
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-display uppercase tracking-widest text-[#f5f1ea]/70">
                Título Geral do Website *
              </label>
              <input
                type="text"
                required
                value={formData.site_title}
                onChange={(e) => setFormData({ ...formData, site_title: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#0c0c0d] border border-[#f5f1ea]/15 text-sm text-[#f5f1ea] focus:outline-none focus:border-[#e8342a]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-display uppercase tracking-widest text-[#f5f1ea]/70">
                Nome do Autor / Titular *
              </label>
              <input
                type="text"
                required
                value={formData.author_name}
                onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#0c0c0d] border border-[#f5f1ea]/15 text-sm text-[#f5f1ea] focus:outline-none focus:border-[#e8342a]"
              />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className="text-xs font-display uppercase tracking-widest text-[#f5f1ea]/70">
                Descrição Geral para Motores de Busca (SEO Meta Description) *
              </label>
              <textarea
                required
                rows={2}
                value={formData.site_description}
                onChange={(e) => setFormData({ ...formData, site_description: e.target.value })}
                className="w-full px-4 py-3 bg-[#0c0c0d] border border-[#f5f1ea]/15 text-sm text-[#f5f1ea] focus:outline-none focus:border-[#e8342a] resize-y"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-display uppercase tracking-widest text-[#f5f1ea]/70">
                Fórmula de Copyright no Rodapé *
              </label>
              <input
                type="text"
                required
                value={formData.site_copyright}
                onChange={(e) => setFormData({ ...formData, site_copyright: e.target.value })}
                placeholder="Ex: © Marcelo Junior — {year}"
                className="w-full px-4 py-2.5 bg-[#0c0c0d] border border-[#f5f1ea]/15 text-sm text-[#f5f1ea] focus:outline-none focus:border-[#e8342a]"
              />
              <span className="text-[10px] text-[#f5f1ea]/40 font-mono">
                Dica: O código &#123;year&#125; será substituído automaticamente pelo ano atual.
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-display uppercase tracking-widest text-[#f5f1ea]/70">
                Localização Física / Morada *
              </label>
              <input
                type="text"
                required
                value={formData.author_location}
                onChange={(e) => setFormData({ ...formData, author_location: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#0c0c0d] border border-[#f5f1ea]/15 text-sm text-[#f5f1ea] focus:outline-none focus:border-[#e8342a]"
              />
            </div>
          </div>
        </div>

        {/* Contactos & Canais */}
        <div className="p-6 sm:p-8 border border-[#f5f1ea]/10 bg-[#141416] space-y-6">
          <h3 className="font-display text-base text-[#f5f1ea] uppercase tracking-wider text-[#e8342a]">
            02. Canais de Comunicação & Redes
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-display uppercase tracking-widest text-[#f5f1ea]/70">
                Email de Contacto Profissional *
              </label>
              <input
                type="email"
                required
                value={formData.author_email}
                onChange={(e) => setFormData({ ...formData, author_email: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#0c0c0d] border border-[#f5f1ea]/15 text-sm text-[#f5f1ea] focus:outline-none focus:border-[#e8342a]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-display uppercase tracking-widest text-[#f5f1ea]/70">
                WhatsApp / Contacto Telefónico *
              </label>
              <input
                type="text"
                required
                value={formData.author_whatsapp}
                onChange={(e) => setFormData({ ...formData, author_whatsapp: e.target.value })}
                placeholder="+258847130805"
                className="w-full px-4 py-2.5 bg-[#0c0c0d] border border-[#f5f1ea]/15 text-sm text-[#f5f1ea] focus:outline-none focus:border-[#e8342a]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-display uppercase tracking-widest text-[#f5f1ea]/70">
                Perfil LinkedIn (URL Completo)
              </label>
              <input
                type="url"
                value={formData.author_linkedin}
                onChange={(e) => setFormData({ ...formData, author_linkedin: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#0c0c0d] border border-[#f5f1ea]/15 text-sm text-[#f5f1ea] focus:outline-none focus:border-[#e8342a]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-display uppercase tracking-widest text-[#f5f1ea]/70">
                Perfil Instagram (URL Completo)
              </label>
              <input
                type="url"
                value={formData.author_instagram}
                onChange={(e) => setFormData({ ...formData, author_instagram: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#0c0c0d] border border-[#f5f1ea]/15 text-sm text-[#f5f1ea] focus:outline-none focus:border-[#e8342a]"
              />
            </div>
          </div>
        </div>

        {/* Indicadores / Estatísticas da Homepage */}
        <div className="p-6 sm:p-8 border border-[#f5f1ea]/10 bg-[#141416] space-y-6">
          <div className="space-y-1">
            <h3 className="font-display text-base text-[#f5f1ea] uppercase tracking-wider text-[#e8342a]">
              03. Métricas e Estatísticas da Homepage
            </h3>
            <p className="text-xs text-[#f5f1ea]/50">
              Personalize os 4 indicadores em destaque na secção superior da página inicial.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border border-[#f5f1ea]/10 bg-[#0c0c0d] space-y-2">
              <span className="text-[10px] font-mono text-[#e8342a]">INDICADOR 01</span>
              <input
                type="text"
                value={formData.hero_stat_1_val}
                onChange={(e) => setFormData({ ...formData, hero_stat_1_val: e.target.value })}
                placeholder="12"
                className="w-full px-3 py-1.5 bg-[#141416] border border-[#f5f1ea]/15 text-lg font-display text-[#f5f1ea]"
              />
              <input
                type="text"
                value={formData.hero_stat_1_lbl}
                onChange={(e) => setFormData({ ...formData, hero_stat_1_lbl: e.target.value })}
                placeholder="Projetos no Catálogo"
                className="w-full px-3 py-1 bg-[#141416] border border-[#f5f1ea]/10 text-xs text-[#f5f1ea]/70"
              />
            </div>

            <div className="p-4 border border-[#f5f1ea]/10 bg-[#0c0c0d] space-y-2">
              <span className="text-[10px] font-mono text-[#e8342a]">INDICADOR 02</span>
              <input
                type="text"
                value={formData.hero_stat_2_val}
                onChange={(e) => setFormData({ ...formData, hero_stat_2_val: e.target.value })}
                placeholder="BIM"
                className="w-full px-3 py-1.5 bg-[#141416] border border-[#f5f1ea]/15 text-lg font-display text-[#f5f1ea]"
              />
              <input
                type="text"
                value={formData.hero_stat_2_lbl}
                onChange={(e) => setFormData({ ...formData, hero_stat_2_lbl: e.target.value })}
                placeholder="Revit Avançado & Dynamo"
                className="w-full px-3 py-1 bg-[#141416] border border-[#f5f1ea]/10 text-xs text-[#f5f1ea]/70"
              />
            </div>

            <div className="p-4 border border-[#f5f1ea]/10 bg-[#0c0c0d] space-y-2">
              <span className="text-[10px] font-mono text-[#e8342a]">INDICADOR 03</span>
              <input
                type="text"
                value={formData.hero_stat_3_val}
                onChange={(e) => setFormData({ ...formData, hero_stat_3_val: e.target.value })}
                placeholder="GIS"
                className="w-full px-3 py-1.5 bg-[#141416] border border-[#f5f1ea]/15 text-lg font-display text-[#f5f1ea]"
              />
              <input
                type="text"
                value={formData.hero_stat_3_lbl}
                onChange={(e) => setFormData({ ...formData, hero_stat_3_lbl: e.target.value })}
                placeholder="Mapeamento Humanitário"
                className="w-full px-3 py-1 bg-[#141416] border border-[#f5f1ea]/10 text-xs text-[#f5f1ea]/70"
              />
            </div>

            <div className="p-4 border border-[#f5f1ea]/10 bg-[#0c0c0d] space-y-2">
              <span className="text-[10px] font-mono text-[#e8342a]">INDICADOR 04</span>
              <input
                type="text"
                value={formData.hero_stat_4_val}
                onChange={(e) => setFormData({ ...formData, hero_stat_4_val: e.target.value })}
                placeholder="3D"
                className="w-full px-3 py-1.5 bg-[#141416] border border-[#f5f1ea]/15 text-lg font-display text-[#f5f1ea]"
              />
              <input
                type="text"
                value={formData.hero_stat_4_lbl}
                onChange={(e) => setFormData({ ...formData, hero_stat_4_lbl: e.target.value })}
                placeholder="Modelação & Execução"
                className="w-full px-3 py-1 bg-[#141416] border border-[#f5f1ea]/10 text-xs text-[#f5f1ea]/70"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
