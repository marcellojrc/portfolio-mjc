import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession, requireRoles } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  const authError = requireRoles(session, ['ADMIN', 'EDITOR', 'VIEWER']);
  if (authError) return authError;

  try {
    const settings = await prisma.siteSettings.findMany();
    const dictionary: Record<string, string> = {};
    for (const s of settings) {
      dictionary[s.key] = s.value;
    }
    return NextResponse.json({ success: true, settings: dictionary });
  } catch (error) {
    console.error('Erro ao ler definições do site:', error);
    return NextResponse.json({ error: 'Erro ao ler definições do site.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getSession();
  const authError = requireRoles(session, ['ADMIN', 'EDITOR']);
  if (authError) return authError;

  try {
    const body = await request.json();
    const settings = body.settings as Record<string, string> | undefined;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { error: 'Formato inválido. O corpo deve conter o objeto "settings".' },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      for (const [key, value] of Object.entries(settings)) {
        await tx.siteSettings.upsert({
          where: { key },
          update: { value: String(value ?? '') },
          create: { key, value: String(value ?? '') },
        });
      }
    });

    await prisma.activityLog.create({
      data: {
        userId: session!.userId,
        action: 'SETTINGS_UPDATED',
        details: `Configurações globais do site atualizadas por ${session!.email}.`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    return NextResponse.json({ error: 'Erro ao atualizar configurações.' }, { status: 500 });
  }
}
