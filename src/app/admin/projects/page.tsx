import { prisma } from '@/lib/db';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { ProjectsTable } from '@/components/admin/ProjectsTable';

export const revalidate = 0;

export default async function AdminProjectsListPage() {
  const projects = await prisma.project.findMany({
    orderBy: { order: 'asc' },
    select: {
      id: true,
      slug: true,
      number: true,
      title: true,
      category: true,
      location: true,
      year: true,
      coverImage: true,
      published: true,
      featured: true,
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#f5f1ea]/15 pb-6">
        <div className="space-y-1">
          <span className="text-[10px] font-display uppercase tracking-[0.2em] text-[#e8342a]">
            Gestão Editorial
          </span>
          <h1 className="font-display text-3xl text-[#f5f1ea]">
            PROJETOS ARQUITETÓNICOS ({projects.length})
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

      <ProjectsTable initialProjects={projects} />
    </div>
  );
}
