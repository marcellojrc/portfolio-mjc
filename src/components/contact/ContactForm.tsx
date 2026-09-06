'use client';

import { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setFeedback(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus('success');
        setFeedback(data.message);
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus('error');
        setFeedback(data.error || 'Não foi possível enviar a mensagem.');
      }
    } catch {
      setStatus('error');
      setFeedback('Erro de ligação à rede. Por favor, verifique a sua conexão.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {status === 'success' && (
        <div className="p-4 bg-green-950/40 border border-green-500/30 text-green-300 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-green-400" />
          <span>{feedback}</span>
        </div>
      )}

      {status === 'error' && (
        <div className="p-4 bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
          <span>{feedback}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="name" className="text-xs font-display uppercase tracking-widest text-[#f5f1ea]/70">
            Nome Completo *
          </label>
          <input
            id="name"
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ex.: Paulo Jorge"
            className="w-full px-4 py-3 bg-[#121214] border border-[#f5f1ea]/15 text-sm text-[#f5f1ea] placeholder:text-[#f5f1ea]/30 focus:outline-none focus:border-[#e8342a] transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-xs font-display uppercase tracking-widest text-[#f5f1ea]/70">
            Endereço de Email *
          </label>
          <input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="seu.email@exemplo.com"
            className="w-full px-4 py-3 bg-[#121214] border border-[#f5f1ea]/15 text-sm text-[#f5f1ea] placeholder:text-[#f5f1ea]/30 focus:outline-none focus:border-[#e8342a] transition-colors"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="subject" className="text-xs font-display uppercase tracking-widest text-[#f5f1ea]/70">
          Assunto ou Natureza do Projeto
        </label>
        <input
          id="subject"
          type="text"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          placeholder="Ex.: Projeto Residencial / Consultoria BIM / Orçamentação"
          className="w-full px-4 py-3 bg-[#121214] border border-[#f5f1ea]/15 text-sm text-[#f5f1ea] placeholder:text-[#f5f1ea]/30 focus:outline-none focus:border-[#e8342a] transition-colors"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className="text-xs font-display uppercase tracking-widest text-[#f5f1ea]/70">
          Mensagem Detalhada *
        </label>
        <textarea
          id="message"
          required
          rows={5}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="Descreva o seu projeto, prazos estimados, localização ou questão técnica..."
          className="w-full px-4 py-3 bg-[#121214] border border-[#f5f1ea]/15 text-sm text-[#f5f1ea] placeholder:text-[#f5f1ea]/30 focus:outline-none focus:border-[#e8342a] transition-colors resize-y"
        />
      </div>

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full sm:w-auto px-8 py-4 bg-[#e8342a] text-white font-display text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {status === 'loading' ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>A enviar mensagem...</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>Enviar Mensagem</span>
          </>
        )}
      </button>
    </form>
  );
}
