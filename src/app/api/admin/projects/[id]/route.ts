import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession, requireRoles } from '@/lib/auth';
import { projectSchema } from '@/schemas';

import { safeDeleteAssetFromStorage } from '@/lib/storage';

interface Props {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: Props) {
  const session = await getSession();
  const authError = requireRoles(session, ['ADMIN', 'EDITOR']);
  if (authError) return authError;

  const { id } = await params;

  try {
    const body = await request.json();
    const parseResult = projectSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos.', details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { media, ...projectData } = parseResult.data;

    // Coletar mídias e capa anteriores para verificação posterior de órfãos
    const [previousMedia, currentProject] = await Promise.all([
      prisma.projectMedia.findMany({
        where: { projectId: id },
        select: { url: true },
      }),
      prisma.project.findUnique({
        where: { id },
        select: { coverImage: true },
      }),
    ]);

    const updated = await prisma.$transaction(async (tx) => {
      const project = await tx.project.update({
        where: { id },
        data: projectData,
      });

      if (media !== undefined) {
        // Remover mídias antigas do projeto e recriar com a nova ordem e legendas
        await tx.projectMedia.deleteMany({
          where: { projectId: id },
        });

        if (media.length > 0) {
          await tx.projectMedia.createMany({
            data: media.map((m, idx) => ({
              projectId: id,
              url: m.url,
              type: m.type,
              alt: m.alt || project.title,
              caption: m.caption,
              order: m.order || idx + 1,
            })),
          });
        }
      }

      return project;
    });

    // Limpeza segura em segundo plano de assets antigos substituídos ou removidos
    // Se a BD já foi atualizada com sucesso, tentamos desalocar assets físicos órfãos
    try {
      const newUrls = new Set<string>();
      if (projectData.coverImage) newUrls.add(projectData.coverImage);
      if (media) {
        for (const m of media) newUrls.add(m.url);
      }

      const candidateUrls = new Set<string>();
      if (currentProject?.coverImage && !newUrls.has(currentProject.coverImage)) {
        candidateUrls.add(currentProject.coverImage);
      }
      for (const pm of previousMedia) {
        if (!newUrls.has(pm.url)) {
          candidateUrls.add(pm.url);
        }
      }

      for (const url of candidateUrls) {
        safeDeleteAssetFromStorage(url).catch((err) => {
          console.warn('Aviso: Limpeza em segundo plano de asset substituído:', url, err);
        });
      }
    } catch (cleanupErr) {
      console.warn('Aviso: Erro ao calcular assets para limpeza:', cleanupErr);
    }

    await prisma.activityLog.create({
      data: {
        userId: session!.userId,
        action: 'PROJECT_UPDATED',
        details: `Projeto atualizado: "${updated.title}" (#${updated.number}) com galeria sincronizada.`,
      },
    });

    return NextResponse.json({ success: true, project: updated });
  } catch (error) {
    console.error('Erro ao atualizar projeto:', error);
    return NextResponse.json({ error: 'Erro ao atualizar projeto.' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Props) {
  const session = await getSession();
  const authError = requireRoles(session, ['ADMIN', 'EDITOR']);
  if (authError) return authError;

  const { id } = await params;

  try {
    const body = await request.json();
    const { published, featured } = body;

    const dataToUpdate: Record<string, boolean> = {};
    if (typeof published === 'boolean') dataToUpdate.published = published;
    if (typeof featured === 'boolean') dataToUpdate.featured = featured;

    const updated = await prisma.project.update({
      where: { id },
      data: dataToUpdate,
    });

    await prisma.activityLog.create({
      data: {
        userId: session!.userId,
        action: 'PROJECT_STATUS_CHANGED',
        details: `Estado do projeto "${updated.title}" alterado (Publicado: ${updated.published}, Destaque: ${updated.featured}).`,
      },
    });

    return NextResponse.json({ success: true, project: updated });
  } catch (error) {
    console.error('Erro ao alterar status:', error);
    return NextResponse.json({ error: 'Erro ao alterar estado.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Props) {
  const session = await getSession();
  const authError = requireRoles(session, ['ADMIN']); // Apenas ADMIN pode eliminar
  if (authError) return authError;

  const { id } = await params;

  try {
    const projectToDelete = await prisma.project.findUnique({
      where: { id },
      include: { media: true },
    });

    if (!projectToDelete) {
      return NextResponse.json({ error: 'Projeto não encontrado.' }, { status: 404 });
    }

    const deleted = await prisma.project.delete({
      where: { id },
    });

    // Limpeza de assets físicos em segundo plano caso não sejam referenciados por mais nada
    try {
      const urlsToCheck = new Set<string>();
      if (projectToDelete.coverImage) urlsToCheck.add(projectToDelete.coverImage);
      for (const m of projectToDelete.media) {
        urlsToCheck.add(m.url);
      }

      for (const u of urlsToCheck) {
        safeDeleteAssetFromStorage(u).catch((err) => {
          console.warn('Aviso: Limpeza pós-deleção de projeto:', u, err);
        });
      }
    } catch (cleanupErr) {
      console.warn('Aviso: Erro ao calcular assets pós-deleção:', cleanupErr);
    }

    await prisma.activityLog.create({
      data: {
        userId: session!.userId,
        action: 'PROJECT_DELETED',
        details: `Projeto removido: "${deleted.title}" (#${deleted.number}).`,
      },
    });

    return NextResponse.json({ success: true, id: deleted.id });
  } catch (error) {
    console.error('Erro ao apagar projeto:', error);
    return NextResponse.json({ error: 'Erro ao apagar projeto.' }, { status: 500 });
  }
}
