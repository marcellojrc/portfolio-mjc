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
    <aside className="w-64 border-r border-[#f5f1ea]/10 bg-[#121214] flex flex-col justify-between p-6 flex-shrink-0 min-h-screen">
      <div className="space-y-8">
        <div className="space-y-1">
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

        {/* Links de Navegação */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 text-xs font-display uppercase tracking-wider transition-colors ${
                  isActive
                    ? 'bg-[#e8342a] text-white'
                    : 'text-[#f5f1ea]/70 hover:bg-[#f5f1ea]/5 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Utilizador & Ações */}
      <div className="space-y-4 pt-6 border-t border-[#f5f1ea]/10">
        <div className="space-y-0.5">
          <p className="font-display text-xs text-[#f5f1ea] truncate">{userName}</p>
          <p className="text-[11px] text-[#f5f1ea]/40 truncate">{userEmail}</p>
        </div>

        <div className="flex flex-col gap-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 text-xs text-[#f5f1ea]/70 hover:text-white hover:bg-[#f5f1ea]/5 transition-colors border border-[#f5f1ea]/10"
          >
            <span>Ver Site Público</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center justify-between w-full px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors border border-red-500/20"
          >
            <span>Terminar Sessão</span>
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
