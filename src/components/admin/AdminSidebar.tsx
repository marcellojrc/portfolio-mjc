'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FolderKanban,
  PlusCircle,
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  Settings,
  Inbox,
  Image as ImageIcon,
  ExternalLink,
  LogOut,
} from 'lucide-react';

interface AdminSidebarProps {
  userName: string;
  userEmail: string;
}

export function AdminSidebar({ userName, userEmail }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  const navItems = [
    { label: 'Visão Geral', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Projetos', href: '/admin/projects', icon: FolderKanban },
    { label: 'Novo Projeto', href: '/admin/projects/new', icon: PlusCircle },
    { label: 'Sobre / Perfil', href: '/admin/about', icon: User },
    { label: 'Experiência', href: '/admin/experience', icon: Briefcase },
    { label: 'Formação', href: '/admin/education', icon: GraduationCap },
    { label: 'Competências', href: '/admin/skills', icon: Wrench },
    { label: 'Definições do Site', href: '/admin/settings', icon: Settings },
    { label: 'Mensagens', href: '/admin/messages', icon: Inbox },
    { label: 'Biblioteca Mídia', href: '/admin/media', icon: ImageIcon },
  ];

  return (
    <aside className="w-14 sm:w-16 md:w-64 border-r border-[#f5f1ea]/10 bg-[#121214] flex flex-col justify-between p-2 sm:p-3 md:p-6 flex-shrink-0 min-h-screen transition-all duration-300">
      <div className="space-y-6 md:space-y-8">
        {/* Cabeçalho Desktop */}
        <div className="hidden md:block space-y-1">
          <Link
            href="/admin/dashboard"
            className="font-display text-xl tracking-tight text-[#f5f1ea] hover:text-[#e8342a] transition-colors"
          >
            MJC CMS
          </Link>
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#e8342a] block">
            Painel de Controlo
          </span>
        </div>

        {/* Cabeçalho Mobile Compacto */}
        <div className="flex md:hidden flex-col items-center justify-center pt-2 pb-1 border-b border-[#f5f1ea]/10">
          <Link
            href="/admin/dashboard"
            aria-label="MJC CMS — Painel de Controlo"
            title="MJC CMS"
            className="font-display text-sm tracking-wider text-[#e8342a] hover:text-white transition-colors"
          >
            MJC
          </Link>
        </div>

        {/* Links de Navegação */}
        <nav className="space-y-1.5 md:space-y-1" aria-label="Navegação do Painel de Controlo">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
                className={`relative flex items-center justify-center md:justify-start gap-3 px-2 md:px-3 py-2.5 text-xs font-display uppercase tracking-wider transition-colors rounded-sm md:rounded-none ${
                  isActive
                    ? 'bg-[#e8342a] text-white font-semibold'
                    : 'text-[#f5f1ea]/70 hover:bg-[#f5f1ea]/5 hover:text-white'
                }`}
              >
                {/* Indicador visual adicional para acessibilidade além da cor */}
                {isActive && (
                  <span
                    className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-white rounded-r hidden md:block"
                    aria-hidden="true"
                  />
                )}
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate hidden md:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Utilizador & Ações */}
      <div className="space-y-3 md:space-y-4 pt-4 md:pt-6 border-t border-[#f5f1ea]/10">
        {/* Identificação do Utilizador Desktop */}
        <div className="hidden md:block space-y-0.5">
          <p className="font-display text-xs text-[#f5f1ea] truncate">{userName}</p>
          <p className="text-[11px] text-[#f5f1ea]/40 truncate">{userEmail}</p>
        </div>

        {/* Identificação do Utilizador Mobile (Avatar compacto) */}
        <div className="flex md:hidden justify-center">
          <div
            className="w-7 h-7 rounded-full bg-[#f5f1ea]/10 flex items-center justify-center text-[10px] font-display text-[#f5f1ea] border border-[#f5f1ea]/15"
            title={`${userName} (${userEmail})`}
            aria-label={`Sessão de ${userName}`}
          >
            {userName ? userName.slice(0, 2).toUpperCase() : 'MJ'}
          </div>
        </div>

        <div className="flex flex-col gap-1.5 md:gap-2">
          {/* Ver Site Público */}
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title="Ver Site Público"
            aria-label="Ver Site Público"
            className="flex items-center justify-center md:justify-between p-2 md:px-3 md:py-2 text-xs text-[#f5f1ea]/70 hover:text-white hover:bg-[#f5f1ea]/5 transition-colors border border-[#f5f1ea]/10 rounded-sm md:rounded-none"
          >
            <span className="hidden md:inline">Ver Site Público</span>
            <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
          </Link>

          {/* Terminar Sessão */}
          <button
            onClick={handleLogout}
            title="Terminar Sessão"
            aria-label="Terminar Sessão"
            className="flex items-center justify-center md:justify-between w-full p-2 md:px-3 md:py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors border border-red-500/20 rounded-sm md:rounded-none"
          >
            <span className="hidden md:inline">Terminar Sessão</span>
            <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
          </button>
        </div>
      </div>
    </aside>
  );
}
