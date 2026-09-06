import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession, requireRoles } from '@/lib/auth';
import { skillSchema } from '@/schemas';

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
    const parseResult = skillSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos.', details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updated = await prisma.skill.update({
      where: { id },
      data: parseResult.data,
    });

    await prisma.activityLog.create({
      data: {
        userId: session!.userId,
        action: 'SKILL_UPDATED',
        details: `Competência atualizada: "${updated.name}" (${updated.level}).`,
      },
    });

    return NextResponse.json({ success: true, skill: updated });
  } catch (error) {
    console.error('Erro ao atualizar competência:', error);
    return NextResponse.json({ error: 'Erro ao atualizar competência.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Props) {
  const session = await getSession();
  const authError = requireRoles(session, ['ADMIN']);
  if (authError) return authError;

  const { id } = await params;

  try {
    const deleted = await prisma.skill.delete({
      where: { id },
    });

    await prisma.activityLog.create({
      data: {
        userId: session!.userId,
        action: 'SKILL_DELETED',
        details: `Competência removida: "${deleted.name}".`,
      },
    });

    return NextResponse.json({ success: true, id: deleted.id });
  } catch (error) {
    console.error('Erro ao remover competência:', error);
    return NextResponse.json({ error: 'Erro ao remover competência.' }, { status: 500 });
  }
}
