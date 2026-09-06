import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession, requireRoles } from '@/lib/auth';
import { educationSchema } from '@/schemas';

export async function GET() {
  const session = await getSession();
  const authError = requireRoles(session, ['ADMIN', 'EDITOR', 'VIEWER']);
  if (authError) return authError;

  try {
    const educations = await prisma.education.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json({ success: true, educations });
  } catch (error) {
    console.error('Erro ao listar formações:', error);
    return NextResponse.json({ error: 'Erro ao listar formações.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  const authError = requireRoles(session, ['ADMIN', 'EDITOR']);
  if (authError) return authError;

  try {
    const body = await request.json();
    const parseResult = educationSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos.', details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const count = await prisma.education.count();
    const newEdu = await prisma.education.create({
      data: {
        ...parseResult.data,
        order: parseResult.data.order || count + 1,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: session!.userId,
        action: 'EDUCATION_CREATED',
        details: `Formação criada: "${newEdu.degree}" em ${newEdu.institution}.`,
      },
    });

    return NextResponse.json({ success: true, education: newEdu }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar formação:', error);
    return NextResponse.json({ error: 'Erro ao criar formação.' }, { status: 500 });
  }
}
