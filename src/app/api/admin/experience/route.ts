import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession, requireRoles } from '@/lib/auth';
import { experienceSchema } from '@/schemas';

export async function GET() {
  const session = await getSession();
  const authError = requireRoles(session, ['ADMIN', 'EDITOR', 'VIEWER']);
  if (authError) return authError;

  try {
    const experiences = await prisma.experience.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json({ success: true, experiences });
  } catch (error) {
    console.error('Erro ao listar experiências:', error);
    return NextResponse.json({ error: 'Erro ao listar experiências.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  const authError = requireRoles(session, ['ADMIN', 'EDITOR']);
  if (authError) return authError;

  try {
    const body = await request.json();
    const parseResult = experienceSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos.', details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const count = await prisma.experience.count();
    const newExp = await prisma.experience.create({
      data: {
        ...parseResult.data,
        order: parseResult.data.order || count + 1,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: session!.userId,
        action: 'EXPERIENCE_CREATED',
        details: `Experiência criada: "${newExp.role}" em ${newExp.organization}.`,
      },
    });

    return NextResponse.json({ success: true, experience: newExp }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar experiência:', error);
    return NextResponse.json({ error: 'Erro ao criar experiência.' }, { status: 500 });
  }
}
