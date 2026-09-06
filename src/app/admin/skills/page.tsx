'use client';

import { useState, useEffect } from 'react';
import {
  Wrench,
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

interface SkillItem {
  id: string;
  name: string;
  level: string;
  category: string;
  order: number;
}

const CATEGORIES = [
  'Modelagem & Desenho',
  'Renderização',
  'BIM & GIS',
  'Planeamento & SIG',
  'Documentação Técnica',
  'Outras Ferramentas',
];

const LEVELS = ['Avançado', 'Intermédio', 'Básico', 'Ferramenta'];

export default function AdminSkillsPage() {
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    level: 'Avançado',
    category: 'Modelagem & Desenho',
    order: 0,
  });

  async function loadSkills() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/skills');
      const data = await res.json();
      if (data.success && data.skills) {
        setSkills(data.skills);
      }
    } catch {
      setFeedback({ type: 'error', text: 'Não foi possível carregar as competências.' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSkills();
  }, []);

  function startCreate() {
    setFormData({
      name: '',
      level: 'Avançado',
      category: 'Modelagem & Desenho',
      order: skills.length + 1,
    });
    setEditingId(null);
    setIsCreating(true);
  }

  function startEdit(s: SkillItem) {
    setFormData({
      name: s.name,
      level: s.level,
      category: s.category,
      order: s.order,
    });
    setEditingId(s.id);
    setIsCreating(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);

    const isEdit = !!editingId;
    const url = isEdit ? `/api/admin/skills/${editingId}` : '/api/admin/skills';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao gravar competência.');
      }

      setFeedback({
        type: 'success',
        text: isEdit ? 'Competência atualizada!' : 'Nova competência adicionada!',
      });
      setIsCreating(false);
      setEditingId(null);
      await loadSkills();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao gravar.';
      setFeedback({ type: 'error', text: msg });
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Tem a certeza de que deseja eliminar a competência "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/skills/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({ type: 'success', text: 'Competência eliminada com sucesso.' });
        await loadSkills();
      } else {
        throw new Error(data.error || 'Erro ao eliminar.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao eliminar.';
      setFeedback({ type: 'error', text: msg });
    }
  }

  async function handleMove(index: number, direction: 'up' | 'down') {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === skills.length - 1)) {
      return;
    }

    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const current = skills[index];
    const target = skills[targetIdx];

    try {
      await Promise.all([
        fetch(`/api/admin/skills/${current.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...current, order: target.order }),
        }),
        fetch(`/api/admin/skills/${target.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...target, order: current.order }),
        }),
      ]);

      await loadSkills();
    } catch {
      setFeedback({ type: 'error', text: 'Erro ao reordenar competências.' });
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
          <h1 className="font-display text-3xl text-[#f5f1ea]">Software & Competências</h1>
          <p className="text-xs text-[#f5f1ea]/60">
            Faça a gestão dos softwares, níveis de domínio e categorias técnicas exibidas no site.
          </p>
        </div>

        <button
          onClick={startCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#e8342a] text-white font-display text-xs uppercase tracking-wider hover:bg-white hover:text-black transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Competência</span>
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
              {editingId ? 'Editar Competência' : 'Adicionar Nova Competência'}
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
                Nome do Software / Competência *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Autodesk Revit"
                className="w-full px-3 py-2 bg-[#0c0c0d] border border-[#f5f1ea]/15 text-xs text-[#f5f1ea] focus:outline-none focus:border-[#e8342a]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-display uppercase tracking-widest text-[#f5f1ea]/70">
                Nível de Domínio *
              </label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full px-3 py-2 bg-[#0c0c0d] border border-[#f5f1ea]/15 text-xs text-[#f5f1ea] focus:outline-none focus:border-[#e8342a]"
              >
                {LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-display uppercase tracking-widest text-[#f5f1ea]/70">
                Categoria Técnica *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-[#0c0c0d] border border-[#f5f1ea]/15 text-xs text-[#f5f1ea] focus:outline-none focus:border-[#e8342a]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
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

      {/* Grelha de Competências */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-xs text-[#f5f1ea]/50">
          <Loader2 className="w-6 h-6 animate-spin text-[#e8342a]" />
          <span>A carregar competências...</span>
        </div>
      ) : skills.length === 0 ? (
        <div className="p-12 text-center border border-[#f5f1ea]/10 bg-[#141416] space-y-2">
          <Wrench className="w-8 h-8 text-[#f5f1ea]/30 mx-auto" />
          <p className="text-sm text-[#f5f1ea]/60">Nenhuma competência registada.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.map((s, idx) => (
            <div
              key={s.id}
              className="p-5 border border-[#f5f1ea]/10 bg-[#141416] hover:border-[#f5f1ea]/30 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-[#e8342a] tracking-wider">
                    {s.category}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-[#f5f1ea]/5 text-[#f5f1ea]/70 border border-[#f5f1ea]/10">
                    {s.level}
                  </span>
                </div>
                <h4 className="font-display text-lg text-[#f5f1ea]">{s.name}</h4>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#f5f1ea]/10">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, 'up')}
                    title="Mover para cima"
                    className="p-1 text-[#f5f1ea]/50 hover:text-white disabled:opacity-20"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === skills.length - 1}
                    onClick={() => handleMove(idx, 'down')}
                    title="Mover para baixo"
                    className="p-1 text-[#f5f1ea]/50 hover:text-white disabled:opacity-20"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(s)}
                    className="text-[11px] font-display uppercase tracking-wider text-[#f5f1ea]/70 hover:text-white"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(s.id, s.name)}
                    className="text-[11px] font-display uppercase tracking-wider text-red-400 hover:text-red-300"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
