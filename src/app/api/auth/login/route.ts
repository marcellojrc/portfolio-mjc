import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyPassword, createSession } from '@/lib/auth';
import { loginSchema } from '@/schemas';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limiter = rateLimit(`login:${ip}`, 5, 60 * 1000); // 5 tentativas por minuto

  if (!limiter.success) {
    return NextResponse.json(
      {
        error: 'Demasiadas tentativas de autenticação. Por favor, aguarde um minuto antes de tentar novamente.',
      },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil((limiter.reset - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  try {
    const body = await request.json();

    const parseResult = loginSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Credenciais com formato inválido.' },
        { status: 400 }
      );
    }

    const { email, password } = parseResult.data;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Email ou palavra-passe incorretos.' },
        { status: 401 }
      );
    }

    const passwordMatch = await verifyPassword(password, user.passwordHash);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Email ou palavra-passe incorretos.' },
        { status: 401 }
      );
    }

    // Criar Sessão JWT no Cookie
    await createSession({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    // Registar Log
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'ADMIN_LOGIN',
        details: `Sessão iniciada com sucesso pelo utilizador ${user.email}.`,
      },
    });

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { error: 'Ocorreu um erro interno ao processar a autenticação.' },
      { status: 500 }
    );
  }
}
