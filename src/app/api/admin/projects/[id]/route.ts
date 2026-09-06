import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { projectSchema } from '@/schemas';

interface Props {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: Props) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

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

    const updated = await prisma.project.update({
      where: { id },
      data: parseResult.data,
    });

    await prisma.activityLog.create({
      data: {
        userId: session.userId,
        action: 'PROJECT_UPDATED',
        details: `Projeto atualizado: "${updated.title}".`,
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
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

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
        userId: session.userId,
        action: 'PROJECT_STATUS_CHANGED',
        details: `Estado do projeto "${updated.title}" alterado (Publicado: ${updated.published}).`,
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
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const deleted = await prisma.project.delete({
      where: { id },
    });

    await prisma.activityLog.create({
      data: {
        userId: session.userId,
        action: 'PROJECT_DELETED',
        details: `Projeto removido: "${deleted.title}".`,
      },
    });

    return NextResponse.json({ success: true, id: deleted.id });
  } catch (error) {
    console.error('Erro ao apagar projeto:', error);
    return NextResponse.json({ error: 'Erro ao apagar projeto.' }, { status: 500 });
  }
}
