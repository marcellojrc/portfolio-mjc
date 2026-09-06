'use client';

import { useState, useEffect } from 'react';
import {
  GraduationCap,
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

interface EducationItem {
  id: string;
  period: string;
  degree: string;
  institution: string;
  description: string;
  order: number;
}

export default function AdminEducationPage() {
  const [educations, setEducations] = useState<EducationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    period: '',
    degree: '',
    institution: '',
    description: '',
    order: 0,
  });

  async function loadEducations() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/education');
      const data = await res.json();
      if (data.success && data.educations) {
        setEducations(data.educations);
      }
    } catch {
      setFeedback({ type: 'error', text: 'Não foi possível carregar as formações.' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEducations();
  }, []);

  function startCreate() {
    setFormData({
      period: '2024 — 2026',
      degree: '',
      institution: '',
      description: '',
      order: educations.length + 1,
    });
    setEditingId(null);
    setIsCreating(true);
  }

  function startEdit(edu: EducationItem) {
    setFormData({
      period: edu.period,
      degree: edu.degree,
      institution: edu.institution,
      description: edu.description,
      order: edu.order,
    });
    setEditingId(edu.id);
    setIsCreating(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);

    const isEdit = !!editingId;
    const url = isEdit ? `/api/admin/education/${editingId}` : '/api/admin/education';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao gravar formação.');
      }

      setFeedback({
        type: 'success',
        text: isEdit ? 'Formação atualizada com sucesso!' : 'Nova formação adicionada!',
      });
      setIsCreating(false);
      setEditingId(null);
      await loadEducations();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao gravar.';
      setFeedback({ type: 'error', text: msg });
    }
  }

  async function handleDelete(id: string, degree: string) {
    if (!confirm(`Tem a certeza de que deseja eliminar a formação "${degree}"?`)) return;

    try {
      const res = await fetch(`/api/admin/education/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({ type: 'success', text: 'Formação eliminada com sucesso.' });
        await loadEducations();
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
      (direction === 'down' && index === educations.length - 1)
    ) {
      return;
    }

    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const current = educations[index];
    const target = educations[targetIdx];

    try {
      await Promise.all([
        fetch(`/api/admin/education/${current.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...current, order: target.order }),
        }),
        fetch(`/api/admin/education/${target.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...target, order: current.order }),
        }),
      ]);

      await loadEducations();
    } catch {
      setFeedback({ type: 'error', text: 'Erro ao reordenar formações.' });
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
          <h1 className="font-display text-3xl text-[#f5f1ea]">Formação & Percurso Académico</h1>
          <p className="text-xs text-[#f5f1ea]/60">
            Adicione e edite cursos, instituições, foco académico e informações complementares.
          </p>
        </div>

        <button
          onClick={startCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#e8342a] text-white font-display text-xs uppercase tracking-wider hover:bg-white hover:text-black transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Formação</span>
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
              {editingId ? 'Editar Formação' : 'Adicionar Nova Formação'}
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
                placeholder="Ex: 2022 — Presente"
                className="w-full px-3 py-2 bg-[#0c0c0d] border border-[#f5f1ea]/15 text-xs text-[#f5f1ea] focus:outline-none focus:border-[#e8342a]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-display uppercase tracking-widest text-[#f5f1ea]/70">
                Curso / Grau Académico *
              </label>
              <input
                type="text"
                required
                value={formData.degree}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                placeholder="Ex: Licenciatura em Arquitetura e Planeamento Físico"
                className="w-full px-3 py-2 bg-[#0c0c0d] border border-[#f5f1ea]/15 text-xs text-[#f5f1ea] focus:outline-none focus:border-[#e8342a]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-display uppercase tracking-widest text-[#f5f1ea]/70">
                Instituição de Ensino *
              </label>
              <input
                type="text"
                required
                value={formData.institution}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                placeholder="Ex: Universidade Eduardo Mondlane (UEM)"
                className="w-full px-3 py-2 bg-[#0c0c0d] border border-[#f5f1ea]/15 text-xs text-[#f5f1ea] focus:outline-none focus:border-[#e8342a]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-display uppercase tracking-widest text-[#f5f1ea]/70">
              Descrição do Curso / Foco Académico / Atividades *
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva o foco do curso, especialização, áreas de interesse ou projetos desenvolvidos..."
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
          <span>A carregar percurso académico...</span>
        </div>
      ) : educations.length === 0 ? (
        <div className="p-12 text-center border border-[#f5f1ea]/10 bg-[#141416] space-y-2">
          <GraduationCap className="w-8 h-8 text-[#f5f1ea]/30 mx-auto" />
          <p className="text-sm text-[#f5f1ea]/60">Nenhuma formação registada.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {educations.map((edu, idx) => (
            <div
              key={edu.id}
              className="p-6 border border-[#f5f1ea]/10 bg-[#141416] hover:border-[#f5f1ea]/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2 max-w-2xl">
                <span className="text-xs font-mono text-[#e8342a] uppercase tracking-wider block">
                  {edu.period}
                </span>
                <h3 className="font-display text-xl text-[#f5f1ea]">{edu.degree}</h3>
                <p className="text-xs font-medium text-[#f5f1ea]/80">{edu.institution}</p>
                <p className="text-xs text-[#f5f1ea]/60 leading-relaxed">{edu.description}</p>
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
                  disabled={idx === educations.length - 1}
                  onClick={() => handleMove(idx, 'down')}
                  title="Mover para baixo"
                  className="p-2 border border-[#f5f1ea]/10 text-[#f5f1ea]/60 hover:text-white disabled:opacity-20"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => startEdit(edu)}
                  className="px-3 py-2 border border-[#f5f1ea]/20 text-xs font-display uppercase tracking-wider text-[#f5f1ea] hover:bg-white hover:text-black"
                >
                  Editar
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(edu.id, edu.degree)}
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
