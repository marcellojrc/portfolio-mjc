import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession, requireRoles } from '@/lib/auth';
import { projectSchema } from '@/schemas';

export async function POST(request: Request) {
  const session = await getSession();
  const authError = requireRoles(session, ['ADMIN', 'EDITOR']);
  if (authError) return authError;

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

    const count = await prisma.project.count();

    const newProject = await prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          ...projectData,
          order: count + 1,
        },
      });

      if (media && media.length > 0) {
        await tx.projectMedia.createMany({
          data: media.map((m, idx) => ({
            projectId: project.id,
            url: m.url,
            type: m.type,
            alt: m.alt || project.title,
            caption: m.caption,
            order: m.order || idx + 1,
          })),
        });
      }

      return project;
    });

    await prisma.activityLog.create({
      data: {
        userId: session!.userId,
        action: 'PROJECT_CREATED',
        details: `Projeto criado: "${newProject.title}" (#${newProject.number}).`,
      },
    });

    return NextResponse.json({ success: true, project: newProject }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar projeto:', error);
    return NextResponse.json({ error: 'Erro ao criar projeto.' }, { status: 500 });
  }
}
