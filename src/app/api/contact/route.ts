import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { contactSchema } from '@/schemas';

export async function POST(request: Request) {
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
