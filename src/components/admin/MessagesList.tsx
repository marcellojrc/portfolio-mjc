'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import { Mail, Check, Trash2, MailOpen, Loader2 } from 'lucide-react';

interface MessageItem {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  read: boolean;
  createdAt: Date;
}

interface MessagesListProps {
  initialMessages: MessageItem[];
}

export function MessagesList({ initialMessages }: MessagesListProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<MessageItem[]>(initialMessages);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleToggleRead(id: string, currentRead: boolean) {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: !currentRead }),
      });

      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, read: !currentRead } : m))
        );
        router.refresh();
      }
    } finally {
      setLoadingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Eliminar esta mensagem permanentemente?')) return;
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/messages/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== id));
        router.refresh();
      }
    } finally {
      setLoadingId(null);
    }
  }

  if (messages.length === 0) {
    return (
      <div className="p-16 border border-dashed border-[#f5f1ea]/15 text-center text-sm text-[#f5f1ea]/50 space-y-2">
        <Mail className="w-8 h-8 text-[#e8342a] mx-auto opacity-50" />
        <p>A sua caixa de entrada está vazia. Nenhuma mensagem recebida.</p>
      </div>
    );
  }

  return (
    <div className="border border-[#f5f1ea]/10 bg-[#141416] divide-y divide-[#f5f1ea]/10">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`p-6 space-y-4 transition-colors ${
            msg.read ? 'bg-transparent' : 'bg-[#18181c] border-l-2 border-l-[#e8342a]'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="font-display text-base text-[#f5f1ea]">{msg.name}</span>
              <a
                href={`mailto:${msg.email}`}
                className="text-xs font-mono text-[#e8342a] hover:underline"
              >
                {msg.email}
              </a>
              {!msg.read && (
                <span className="px-2 py-0.5 bg-[#e8342a] text-white text-[9px] font-display uppercase tracking-widest">
                  Nova
                </span>
              )}
            </div>

            <span className="text-xs font-mono text-[#f5f1ea]/40">
              {formatDate(msg.createdAt)}
            </span>
          </div>

          <div className="space-y-1">
            <h4 className="text-xs font-display uppercase tracking-wider text-[#f5f1ea]">
              {msg.subject || 'Sem assunto especificado'}
            </h4>
            <p className="text-sm text-[#f5f1ea]/75 leading-relaxed whitespace-pre-wrap font-normal">
              {msg.message}
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => handleToggleRead(msg.id, msg.read)}
              disabled={loadingId === msg.id}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#f5f1ea]/15 hover:border-[#f5f1ea]/40 text-xs text-[#f5f1ea]/70 transition-colors"
            >
              {msg.read ? (
                <>
                  <Mail className="w-3.5 h-3.5" />
                  <span>Marcar Não Lida</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 text-green-400" />
                  <span>Marcar Como Lida</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleDelete(msg.id)}
              disabled={loadingId === msg.id}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-red-500/20 hover:bg-red-950/30 text-xs text-red-400 transition-colors"
            >
              {loadingId === msg.id ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              <span>Eliminar</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
