import { prisma } from '@/lib/db';
import Image from 'next/image';
import Link from 'next/link';
import { Image as ImageIcon, Layers } from 'lucide-react';

export const revalidate = 0;

export default async function AdminMediaPage() {
  const mediaItems = await prisma.projectMedia.findMany({
    include: {
      project: {
        select: {
          id: true,
          title: true,
          number: true,
          slug: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-8">
      <div className="space-y-1 border-b border-[#f5f1ea]/15 pb-6">
        <span className="text-[10px] font-display uppercase tracking-[0.2em] text-[#e8342a]">
          Catálogo Visual
        </span>
        <h1 className="font-display text-3xl text-[#f5f1ea]">
          BIBLIOTECA DE MÍDIA ({mediaItems.length})
        </h1>
        <p className="text-xs text-[#f5f1ea]/60">
          Imagens, plantas técnicas, cortes e renders vinculados aos projetos arquitetónicos.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {mediaItems.map((item) => (
          <div
            key={item.id}
            className="group border border-[#f5f1ea]/10 bg-[#141416] overflow-hidden flex flex-col justify-between"
          >
            <div className="relative aspect-[4/3] bg-black overflow-hidden">
              <Image
                src={item.url}
                alt={item.alt || 'Mídia de projeto'}
                fill
                sizes="(max-width: 768px) 50vw, 20vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-[#0c0c0d]/90 text-[9px] font-display uppercase tracking-widest text-[#e8342a]">
                {item.type}
              </span>
            </div>

            <div className="p-3 space-y-1 text-xs">
              <Link
                href={`/admin/projects/${item.project.id}/edit`}
                className="font-display text-[#f5f1ea] hover:text-[#e8342a] line-clamp-1 transition-colors block"
              >
                {item.project.number} — {item.project.title}
              </Link>
              <p className="text-[10px] text-[#f5f1ea]/50 line-clamp-1 font-normal">
                {item.caption || item.alt}
              </p>
              <span className="text-[9px] font-mono text-[#f5f1ea]/30 block truncate">
                {item.url}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
