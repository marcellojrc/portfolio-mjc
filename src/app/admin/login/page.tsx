'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/admin/dashboard';

  const [email, setEmail] = useState('marcelojuniord07@gmail.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push(redirectPath);
        router.refresh();
      } else {
        setError(data.error || 'Credenciais inválidas.');
      }
    } catch {
      setError('Erro de comunicação com o servidor.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0c0c0d] flex items-center justify-center p-4">
      <div className="max-w-md w-full border border-[#f5f1ea]/15 bg-[#141416] p-8 sm:p-12 space-y-8">
        <div className="space-y-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-display uppercase tracking-widest text-[#f5f1ea]/50 hover:text-[#e8342a] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao Site</span>
          </Link>

          <div className="pt-2 flex items-center justify-between">
            <h1 className="font-display text-2xl text-[#f5f1ea] tracking-tight">
              PAINEL EDITORIAL
            </h1>
            <Lock className="w-5 h-5 text-[#e8342a]" />
          </div>
          <p className="text-xs text-[#f5f1ea]/50 uppercase tracking-widest">
            MJC Architecture CMS — Acesso Restrito
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-display uppercase tracking-widest text-[#f5f1ea]/70">
              Email do Administrador
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-[#0c0c0d] border border-[#f5f1ea]/15 text-sm text-[#f5f1ea] focus:outline-none focus:border-[#e8342a] transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-display uppercase tracking-widest text-[#f5f1ea]/70">
              Palavra-passe
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-[#0c0c0d] border border-[#f5f1ea]/15 text-sm text-[#f5f1ea] focus:outline-none focus:border-[#e8342a] transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#e8342a] text-white font-display text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>A autenticar...</span>
              </>
            ) : (
              <span>Entrar no Painel</span>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-[#f5f1ea]/10 text-center">
          <span className="text-[10px] text-[#f5f1ea]/40 uppercase tracking-widest">
            Sessão criptografada com algoritmo HS256 & Cookies HttpOnly
          </span>
        </div>
      </div>
    </div>
  );
}
