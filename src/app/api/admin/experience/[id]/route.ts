import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession, requireRoles } from '@/lib/auth';
import { experienceSchema } from '@/schemas';

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
    const parseResult = experienceSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos.', details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updated = await prisma.experience.update({
      where: { id },
      data: parseResult.data,
    });

    await prisma.activityLog.create({
      data: {
        userId: session!.userId,
        action: 'EXPERIENCE_UPDATED',
        details: `Experiência atualizada: "${updated.role}" em ${updated.organization}.`,
      },
    });

    return NextResponse.json({ success: true, experience: updated });
  } catch (error) {
    console.error('Erro ao atualizar experiência:', error);
    return NextResponse.json({ error: 'Erro ao atualizar experiência.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Props) {
  const session = await getSession();
  const authError = requireRoles(session, ['ADMIN']);
  if (authError) return authError;

  const { id } = await params;

  try {
    const deleted = await prisma.experience.delete({
      where: { id },
    });

    await prisma.activityLog.create({
      data: {
        userId: session!.userId,
        action: 'EXPERIENCE_DELETED',
        details: `Experiência removida: "${deleted.role}" em ${deleted.organization}.`,
      },
    });

    return NextResponse.json({ success: true, id: deleted.id });
  } catch (error) {
    console.error('Erro ao remover experiência:', error);
    return NextResponse.json({ error: 'Erro ao remover experiência.' }, { status: 500 });
  }
}
