import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession, requireRoles } from '@/lib/auth';
import { skillSchema } from '@/schemas';

export async function GET() {
  const session = await getSession();
  const authError = requireRoles(session, ['ADMIN', 'EDITOR', 'VIEWER']);
  if (authError) return authError;

  try {
    const skills = await prisma.skill.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json({ success: true, skills });
  } catch (error) {
    console.error('Erro ao listar competências:', error);
    return NextResponse.json({ error: 'Erro ao listar competências.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  const authError = requireRoles(session, ['ADMIN', 'EDITOR']);
  if (authError) return authError;

  try {
    const body = await request.json();
    const parseResult = skillSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos.', details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const count = await prisma.skill.count();
    const newSkill = await prisma.skill.create({
      data: {
        ...parseResult.data,
        order: parseResult.data.order || count + 1,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: session!.userId,
        action: 'SKILL_CREATED',
        details: `Competência criada: "${newSkill.name}" (${newSkill.level}).`,
      },
    });

    return NextResponse.json({ success: true, skill: newSkill }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar competência:', error);
    return NextResponse.json({ error: 'Erro ao criar competência.' }, { status: 500 });
  }
}
