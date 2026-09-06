'use client';

import { useState, useEffect } from 'react';
import {
  Briefcase,
  Plus,
  Save,
  Trash2,
  ArrowUp,
  ArrowDown,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';

interface ExperienceItem {
  id: string;
  period: string;
  role: string;
  organization: string;
  description: string;
  order: number;
}

export default function AdminExperiencePage() {
  const [experiences, setExperiences] = useState<ExperienceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  // Formulário modal/inline de criação
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    period: '',
    role: '',
    organization: '',
    description: '',
    order: 0,
  });

  async function loadExperiences() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/experience');
      const data = await res.json();
      if (data.success && data.experiences) {
        setExperiences(data.experiences);
      }
    } catch {
      setFeedback({ type: 'error', text: 'Não foi possível carregar as experiências.' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadExperiences();
  }, []);

  function startCreate() {
    setFormData({
      period: '2026 — Presente',
      role: '',
      organization: '',
      description: '',
      order: experiences.length + 1,
    });
    setEditingId(null);
    setIsCreating(true);
  }

  function startEdit(exp: ExperienceItem) {
    setFormData({
      period: exp.period,
      role: exp.role,
      organization: exp.organization,
      description: exp.description,
      order: exp.order,
    });
    setEditingId(exp.id);
    setIsCreating(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);

    const isEdit = !!editingId;
    const url = isEdit ? `/api/admin/experience/${editingId}` : '/api/admin/experience';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao gravar experiência.');
      }

      setFeedback({
        type: 'success',
        text: isEdit ? 'Experiência atualizada com sucesso!' : 'Nova experiência adicionada!',
      });
      setIsCreating(false);
      setEditingId(null);
      await loadExperiences();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao gravar.';
      setFeedback({ type: 'error', text: msg });
    }
  }

  async function handleDelete(id: string, role: string) {
    if (!confirm(`Tem a certeza de que deseja eliminar a experiência "${role}"?`)) return;

    try {
      const res = await fetch(`/api/admin/experience/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({ type: 'success', text: 'Experiência eliminada com sucesso.' });
        await loadExperiences();
      } else {
        throw new Error(data.error || 'Erro ao eliminar.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao eliminar.';
      setFeedback({ type: 'error', text: msg });
    }
  }

  async function handleMove(index: number, direction: 'up' | 'down') {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === experiences.length - 1)
    ) {
      return;
    }

    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const current = experiences[index];
    const target = experiences[targetIdx];

    try {
      // Inverter ordens
      await Promise.all([
        fetch(`/api/admin/experience/${current.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...current, order: target.order }),
        }),
        fetch(`/api/admin/experience/${target.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...target, order: current.order }),
        }),
      ]);

      await loadExperiences();
    } catch {
      setFeedback({ type: 'error', text: 'Erro ao reordenar experiências.' });
    }
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Topo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#f5f1ea]/10 pb-6">
        <div>
          <span className="text-[10px] font-display uppercase tracking-[0.2em] text-[#e8342a]">
            CMS Editorial
          </span>
          <h1 className="font-display text-3xl text-[#f5f1ea]">Experiência Profissional</h1>
          <p className="text-xs text-[#f5f1ea]/60">
            Adicione, edite e reordene as suas experiências e docência no portfolio.
          </p>
        </div>

        <button
          onClick={startCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#e8342a] text-white font-display text-xs uppercase tracking-wider hover:bg-white hover:text-black transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Experiência</span>
        </button>
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

      {/* Formulário de Criação / Edição */}
      {(isCreating || editingId) && (
        <form
          onSubmit={handleSave}
          className="p-6 border border-[#e8342a]/40 bg-[#141416] space-y-4 animate-in fade-in"
        >
          <div className="flex items-center justify-between border-b border-[#f5f1ea]/10 pb-3">
            <h3 className="font-display text-sm uppercase tracking-wider text-[#e8342a]">
              {editingId ? 'Editar Experiência' : 'Adicionar Nova Experiência'}
            </h3>
            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
                setEditingId(null);
              }}
              className="text-[#f5f1ea]/60 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-display uppercase tracking-widest text-[#f5f1ea]/70">
                Período *
              </label>
              <input
                type="text"
                required
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                placeholder="Ex: Abr — Ago 2026"
                className="w-full px-3 py-2 bg-[#0c0c0d] border border-[#f5f1ea]/15 text-xs text-[#f5f1ea] focus:outline-none focus:border-[#e8342a]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-display uppercase tracking-widest text-[#f5f1ea]/70">
                Cargo / Função *
              </label>
              <input
                type="text"
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="Ex: Estágio de Arquitetura"
                className="w-full px-3 py-2 bg-[#0c0c0d] border border-[#f5f1ea]/15 text-xs text-[#f5f1ea] focus:outline-none focus:border-[#e8342a]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-display uppercase tracking-widest text-[#f5f1ea]/70">
                Organização / Empresa *
              </label>
              <input
                type="text"
                required
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                placeholder="Ex: LDM Arquitectos, Lda."
                className="w-full px-3 py-2 bg-[#0c0c0d] border border-[#f5f1ea]/15 text-xs text-[#f5f1ea] focus:outline-none focus:border-[#e8342a]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-display uppercase tracking-widest text-[#f5f1ea]/70">
              Descrição Detalhada das Atividades *
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva as responsabilidades, projetos desenvolvidos e colaboração..."
              className="w-full px-3 py-2 bg-[#0c0c0d] border border-[#f5f1ea]/15 text-xs text-[#f5f1ea] focus:outline-none focus:border-[#e8342a] resize-y"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
                setEditingId(null);
              }}
              className="px-4 py-2 border border-[#f5f1ea]/20 text-xs font-display uppercase tracking-wider text-[#f5f1ea] hover:bg-white hover:text-black"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 bg-[#e8342a] text-white font-display text-xs uppercase tracking-wider hover:bg-white hover:text-black"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Guardar</span>
            </button>
          </div>
        </form>
      )}

      {/* Listagem */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-xs text-[#f5f1ea]/50">
          <Loader2 className="w-6 h-6 animate-spin text-[#e8342a]" />
          <span>A carregar experiências...</span>
        </div>
      ) : experiences.length === 0 ? (
        <div className="p-12 text-center border border-[#f5f1ea]/10 bg-[#141416] space-y-2">
          <Briefcase className="w-8 h-8 text-[#f5f1ea]/30 mx-auto" />
          <p className="text-sm text-[#f5f1ea]/60">Nenhuma experiência registada.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {experiences.map((exp, idx) => (
            <div
              key={exp.id}
              className="p-6 border border-[#f5f1ea]/10 bg-[#141416] hover:border-[#f5f1ea]/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2 max-w-2xl">
                <span className="text-xs font-mono text-[#e8342a] uppercase tracking-wider block">
                  {exp.period}
                </span>
                <h3 className="font-display text-xl text-[#f5f1ea]">{exp.role}</h3>
                <p className="text-xs font-medium text-[#f5f1ea]/80">{exp.organization}</p>
                <p className="text-xs text-[#f5f1ea]/60 leading-relaxed">{exp.description}</p>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => handleMove(idx, 'up')}
                  title="Mover para cima"
                  className="p-2 border border-[#f5f1ea]/10 text-[#f5f1ea]/60 hover:text-white disabled:opacity-20"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  disabled={idx === experiences.length - 1}
                  onClick={() => handleMove(idx, 'down')}
                  title="Mover para baixo"
                  className="p-2 border border-[#f5f1ea]/10 text-[#f5f1ea]/60 hover:text-white disabled:opacity-20"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => startEdit(exp)}
                  className="px-3 py-2 border border-[#f5f1ea]/20 text-xs font-display uppercase tracking-wider text-[#f5f1ea] hover:bg-white hover:text-black"
                >
                  Editar
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(exp.id, exp.role)}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-950/30 border border-red-500/20"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
