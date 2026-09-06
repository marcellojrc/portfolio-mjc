import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

interface Props {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: Props) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  try {
    const updated = await prisma.contactMessage.update({
      where: { id },
      data: { read: body.read ?? true },
    });

    return NextResponse.json({ success: true, message: updated });
  } catch (error) {
    console.error('Erro ao atualizar mensagem:', error);
    return NextResponse.json({ error: 'Erro ao atualizar mensagem.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Props) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.contactMessage.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao eliminar mensagem:', error);
    return NextResponse.json({ error: 'Erro ao eliminar mensagem.' }, { status: 500 });
  }
}
