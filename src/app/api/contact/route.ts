import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { contactSchema } from '@/schemas';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limiter = rateLimit(`contact:${ip}`, 5, 10 * 60 * 1000); // 5 mensagens a cada 10 minutos

  if (!limiter.success) {
    return NextResponse.json(
      {
        error: 'Limite de envio excedido. Aguarde alguns minutos antes de enviar uma nova mensagem.',
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

    // Validação com Zod
    const result = contactSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Dados inválidos.', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = result.data;

    // Gravação na Base de Dados
    const newMessage = await prisma.contactMessage.create({
      data: {
        name,
        email,
        subject: subject || 'Sem assunto',
        message,
      },
    });

    // Registar log de atividade
    await prisma.activityLog.create({
      data: {
        action: 'MESSAGE_RECEIVED',
        details: `Nova mensagem recebida de ${name} (${email}).`,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'A sua mensagem foi enviada com sucesso. Entrarei em contacto brevemente.',
        id: newMessage.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao processar mensagem de contacto:', error);
    return NextResponse.json(
      { error: 'Ocorreu um erro interno ao enviar a sua mensagem. Tente novamente mais tarde.' },
      { status: 500 }
    );
  }
}
