import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { projectSchema } from '@/schemas';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parseResult = projectSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos.', details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const count = await prisma.project.count();
    const newProject = await prisma.project.create({
      data: {
        ...parseResult.data,
        order: count + 1,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: session.userId,
        action: 'PROJECT_CREATED',
        details: `Projeto criado: "${newProject.title}" (${newProject.number}).`,
      },
    });

    return NextResponse.json({ success: true, project: newProject }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar projeto:', error);
    return NextResponse.json({ error: 'Erro ao criar projeto.' }, { status: 500 });
  }
}
