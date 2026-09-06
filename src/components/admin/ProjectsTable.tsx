'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, ExternalLink, Eye, EyeOff, Star, Loader2 } from 'lucide-react';

interface ProjectRecord {
  id: string;
  slug: string;
  number: string;
  title: string;
  category: string;
  location: string;
  year: string;
  coverImage: string;
  published: boolean;
  featured: boolean;
}

interface ProjectsTableProps {
  initialProjects: ProjectRecord[];
}

export function ProjectsTable({ initialProjects }: ProjectsTableProps) {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectRecord[]>(initialProjects);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleTogglePublished(id: string, current: boolean) {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !current }),
      });

      if (res.ok) {
        setProjects((prev) =>
          prev.map((p) => (p.id === id ? { ...p, published: !current } : p))
        );
        router.refresh();
      }
    } finally {
      setLoadingId(null);
    }
  }

  async function handleToggleFeatured(id: string, current: boolean) {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !current }),
      });

      if (res.ok) {
        setProjects((prev) =>
          prev.map((p) => (p.id === id ? { ...p, featured: !current } : p))
        );
        router.refresh();
      }
    } finally {
      setLoadingId(null);
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Tem a certeza que deseja eliminar o projeto "${title}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/projects/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
        router.refresh();
      }
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="border border-[#f5f1ea]/10 bg-[#141416] overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="border-b border-[#f5f1ea]/10 bg-[#0c0c0d]/50 uppercase tracking-widest text-[#f5f1ea]/50 text-[10px]">
          <tr>
            <th className="p-4">N.º / Capa</th>
            <th className="p-4">Título do Projeto</th>
            <th className="p-4">Categoria</th>
            <th className="p-4">Localização & Ano</th>
            <th className="p-4 text-center">Estado</th>
            <th className="p-4 text-center">Destaque</th>
            <th className="p-4 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#f5f1ea]/5">
          {projects.map((project) => (
            <tr key={project.id} className="hover:bg-[#f5f1ea]/5 transition-colors">
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <span className="font-display text-sm text-[#e8342a]">{project.number}</span>
                  <div className="relative w-12 h-8 bg-black overflow-hidden border border-[#f5f1ea]/10 flex-shrink-0">
                    <Image
                      src={project.coverImage}
                      alt={project.title}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                </div>
              </td>

              <td className="p-4 font-display text-sm text-[#f5f1ea]">
                <div className="line-clamp-1">{project.title}</div>
                <span className="text-[10px] font-mono text-[#f5f1ea]/40 font-normal">
                  /{project.slug}
                </span>
              </td>

              <td className="p-4">
                <span className="px-2 py-0.5 border border-[#f5f1ea]/15 text-[10px] font-display uppercase tracking-wider text-[#f5f1ea]/80">
                  {project.category}
                </span>
              </td>

              <td className="p-4 text-[#f5f1ea]/70">
                <div>{project.location}</div>
                <span className="text-[10px] font-mono text-[#f5f1ea]/40">{project.year}</span>
              </td>

              {/* Toggle Publicado / Rascunho */}
              <td className="p-4 text-center">
                <button
                  onClick={() => handleTogglePublished(project.id, project.published)}
                  disabled={loadingId === project.id}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-display uppercase tracking-wider transition-colors ${
                    project.published
                      ? 'bg-green-950/50 text-green-300 border border-green-500/30 hover:bg-green-900/60'
                      : 'bg-amber-950/50 text-amber-300 border border-amber-500/30 hover:bg-amber-900/60'
                  }`}
                  title="Clique para alternar estado de publicação"
                >
                  {project.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  <span>{project.published ? 'Publicado' : 'Rascunho'}</span>
                </button>
              </td>

              {/* Toggle Destaque */}
              <td className="p-4 text-center">
                <button
                  onClick={() => handleToggleFeatured(project.id, project.featured)}
                  disabled={loadingId === project.id}
                  className={`p-1.5 transition-colors ${
                    project.featured ? 'text-amber-400 hover:text-amber-300' : 'text-[#f5f1ea]/20 hover:text-amber-400'
                  }`}
                  title={project.featured ? 'Remover dos destaques da Home' : 'Destacar na Home'}
                >
                  <Star className="w-4 h-4 fill-current" />
                </button>
              </td>

              {/* Ações */}
              <td className="p-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={`/projects/${project.slug}`}
                    target="_blank"
                    className="p-1.5 text-[#f5f1ea]/60 hover:text-white hover:bg-[#f5f1ea]/10 transition-colors"
                    title="Ver no site público"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>

                  <Link
                    href={`/admin/projects/${project.id}/edit`}
                    className="p-1.5 text-[#f5f1ea]/60 hover:text-[#e8342a] hover:bg-[#f5f1ea]/10 transition-colors"
                    title="Editar projeto"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={() => handleDelete(project.id, project.title)}
                    disabled={loadingId === project.id}
                    className="p-1.5 text-[#f5f1ea]/60 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                    title="Eliminar projeto"
                  >
                    {loadingId === project.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#e8342a]" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
