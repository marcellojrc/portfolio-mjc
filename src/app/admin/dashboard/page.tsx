import { prisma } from '@/lib/db';
import Link from 'next/link';
import {
  FolderKanban,
  CheckCircle2,
  FileEdit,
  Mail,
  Image as ImageIcon,
  ArrowUpRight,
  PlusCircle,
  Clock,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const revalidate = 0; // Sempre atualizado no admin

export default async function AdminDashboardPage() {
  const [
    totalProjects,
    publishedProjects,
    draftProjects,
    totalMessages,
    unreadMessages,
    totalMedia,
    recentActivities,
    recentMessages,
  ] = await Promise.all([
    prisma.project.count(),
    prisma.project.count({ where: { published: true } }),
    prisma.project.count({ where: { published: false } }),
    prisma.contactMessage.count(),
    prisma.contactMessage.count({ where: { read: false } }),
    prisma.projectMedia.count(),
    prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
    }),
    prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: 4,
    }),
  ]);

  return (
    <div className="space-y-12">
      {/* Cabeçalho do Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-[#f5f1ea]/15 pb-8">
        <div className="space-y-1">
          <span className="text-[10px] font-display uppercase tracking-[0.2em] text-[#e8342a]">
            Painel de Administração
          </span>
          <h1 className="font-display text-3xl sm:text-4xl text-[#f5f1ea]">
            VISÃO GERAL DO ESTÚDIO
          </h1>
        </div>

        <Link
          href="/admin/projects/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#e8342a] text-white font-display text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Novo Projeto</span>
        </Link>
      </div>

      {/* Cartões de Métricas (KPIs) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-5 border border-[#f5f1ea]/10 bg-[#141416] space-y-1">
          <span className="text-xs uppercase tracking-wider text-[#f5f1ea]/50 flex items-center gap-1.5">
            <FolderKanban className="w-3.5 h-3.5 text-[#e8342a]" /> Projetos
          </span>
          <p className="font-display text-3xl text-[#f5f1ea]">{totalProjects}</p>
        </div>

        <div className="p-5 border border-[#f5f1ea]/10 bg-[#141416] space-y-1">
          <span className="text-xs uppercase tracking-wider text-[#f5f1ea]/50 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> Publicados
          </span>
          <p className="font-display text-3xl text-green-400">{publishedProjects}</p>
        </div>

        <div className="p-5 border border-[#f5f1ea]/10 bg-[#141416] space-y-1">
          <span className="text-xs uppercase tracking-wider text-[#f5f1ea]/50 flex items-center gap-1.5">
            <FileEdit className="w-3.5 h-3.5 text-amber-400" /> Rascunhos
          </span>
          <p className="font-display text-3xl text-amber-400">{draftProjects}</p>
        </div>

        <div className="p-5 border border-[#f5f1ea]/10 bg-[#141416] space-y-1">
          <span className="text-xs uppercase tracking-wider text-[#f5f1ea]/50 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-[#e8342a]" /> Mensagens
          </span>
          <p className="font-display text-3xl text-[#f5f1ea]">{totalMessages}</p>
        </div>

        <div className="p-5 border border-[#f5f1ea]/10 bg-[#141416] space-y-1">
          <span className="text-xs uppercase tracking-wider text-[#f5f1ea]/50 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-red-400" /> Não Lidas
          </span>
          <p className="font-display text-3xl text-[#e8342a]">{unreadMessages}</p>
        </div>

        <div className="p-5 border border-[#f5f1ea]/10 bg-[#141416] space-y-1">
          <span className="text-xs uppercase tracking-wider text-[#f5f1ea]/50 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-[#e8342a]" /> Mídia
          </span>
          <p className="font-display text-3xl text-[#f5f1ea]">{totalMedia}</p>
        </div>
      </div>

      {/* Secção Dupla: Mensagens Recentes & Logs de Atividade */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Mensagens Recentes */}
        <div className="lg:col-span-7 border border-[#f5f1ea]/10 bg-[#141416] p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#f5f1ea]/10 pb-4">
            <div className="space-y-0.5">
              <h3 className="font-display text-base text-[#f5f1ea]">Mensagens de Contacto</h3>
              <p className="text-xs text-[#f5f1ea]/50">Últimas consultas recebidas através do site</p>
            </div>
            <Link
              href="/admin/messages"
              className="text-xs font-display uppercase tracking-widest text-[#e8342a] hover:text-white transition-colors"
            >
              Ver Todas →
            </Link>
          </div>

          {recentMessages.length > 0 ? (
            <div className="divide-y divide-[#f5f1ea]/10">
              {recentMessages.map((msg) => (
                <div key={msg.id} className="py-4 space-y-1.5">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="font-display text-sm text-[#f5f1ea]">{msg.name}</span>
                    <span className="text-[11px] font-mono text-[#f5f1ea]/40">
                      {formatDate(msg.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-[#e8342a] font-medium">{msg.subject}</p>
                  <p className="text-xs text-[#f5f1ea]/70 line-clamp-2 leading-relaxed">
                    {msg.message}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-[#f5f1ea]/40">
              Nenhuma mensagem recebida ainda.
            </div>
          )}
        </div>

        {/* Registo de Atividade do Sistema */}
        <div className="lg:col-span-5 border border-[#f5f1ea]/10 bg-[#141416] p-6 space-y-6">
          <div className="space-y-0.5 border-b border-[#f5f1ea]/10 pb-4">
            <h3 className="font-display text-base text-[#f5f1ea]">Atividade Recente</h3>
            <p className="text-xs text-[#f5f1ea]/50">Auditoria e registo de alterações</p>
          </div>

          <div className="space-y-4">
            {recentActivities.map((act) => (
              <div key={act.id} className="flex items-start gap-3 text-xs">
                <Clock className="w-3.5 h-3.5 text-[#e8342a] flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-mono font-semibold text-[10px] uppercase text-[#e8342a] block">
                    {act.action}
                  </span>
                  <p className="text-[#f5f1ea]/80">{act.details}</p>
                  <span className="text-[10px] text-[#f5f1ea]/40 block">
                    {formatDate(act.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
