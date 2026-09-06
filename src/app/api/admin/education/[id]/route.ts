import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession, requireRoles } from '@/lib/auth';
import { educationSchema } from '@/schemas';

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
    const parseResult = educationSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos.', details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updated = await prisma.education.update({
      where: { id },
      data: parseResult.data,
    });

    await prisma.activityLog.create({
      data: {
        userId: session!.userId,
        action: 'EDUCATION_UPDATED',
        details: `Formação atualizada: "${updated.degree}" em ${updated.institution}.`,
      },
    });

    return NextResponse.json({ success: true, education: updated });
  } catch (error) {
    console.error('Erro ao atualizar formação:', error);
    return NextResponse.json({ error: 'Erro ao atualizar formação.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Props) {
  const session = await getSession();
  const authError = requireRoles(session, ['ADMIN']);
  if (authError) return authError;

  const { id } = await params;

  try {
    const deleted = await prisma.education.delete({
      where: { id },
    });

    await prisma.activityLog.create({
      data: {
        userId: session!.userId,
        action: 'EDUCATION_DELETED',
        details: `Formação removida: "${deleted.degree}" em ${deleted.institution}.`,
      },
    });

    return NextResponse.json({ success: true, id: deleted.id });
  } catch (error) {
    console.error('Erro ao remover formação:', error);
    return NextResponse.json({ error: 'Erro ao remover formação.' }, { status: 500 });
  }
}
