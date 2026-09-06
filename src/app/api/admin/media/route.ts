import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  try {
    const media = await prisma.projectMedia.findMany({
      select: {
        id: true,
        url: true,
        alt: true,
        caption: true,
        type: true,
      },
      orderBy: { createdAt: 'desc' },
      distinct: ['url'],
    });

    return NextResponse.json({ success: true, media });
  } catch (error) {
    console.error('Erro ao listar mídia:', error);
    return NextResponse.json({ error: 'Erro ao listar mídia.' }, { status: 500 });
  }
}
