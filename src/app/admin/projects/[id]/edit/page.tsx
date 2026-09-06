import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { ProjectForm } from '@/components/admin/ProjectForm';
import { ProjectMediaItem } from '@/components/admin/ProjectMediaManager';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: Props) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      media: {
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!project) {
    notFound();
  }

  const initialData = {
    id: project.id,
    title: project.title,
    slug: project.slug,
    number: project.number,
    category: project.category,
    location: project.location,
    year: project.year,
    status: project.status,
    area: project.area || '',
    role: project.role || '',
    software: project.software || '',
    services: project.services || '',
    concept: project.concept || '',
    technicalDetails: project.technicalDetails || '',
    coverImage: project.coverImage,
    featured: project.featured,
    published: project.published,
    description: project.description,
    media: project.media.map((m) => ({
      id: m.id,
      url: m.url,
      type: m.type as ProjectMediaItem['type'],
      alt: m.alt,
      caption: m.caption,
      order: m.order,
    })),
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <span className="text-[10px] font-display uppercase tracking-[0.2em] text-[#e8342a]">
          Edição Editorial
        </span>
        <h1 className="font-display text-3xl text-[#f5f1ea]">
          EDITAR PROJETO {project.number} — {project.title}
        </h1>
      </div>

      <ProjectForm initialData={initialData} isEdit={true} />
    </div>
  );
}
