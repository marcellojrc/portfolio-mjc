import { NextResponse } from 'next/server';
import { getSession, requireRoles } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { slugify } from '@/lib/utils';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { put } from '@vercel/blob';

export async function POST(request: Request) {
  const session = await getSession();
  const authError = requireRoles(session, ['ADMIN', 'EDITOR']);
  if (authError) return authError;

  const ip = getClientIp(request);
  const limiter = rateLimit(`upload:${session!.userId || ip}`, 30, 60 * 1000); // 30 uploads por minuto
  if (!limiter.success) {
    return NextResponse.json(
      { error: 'Limite de uploads excedido. Aguarde um minuto.' },
      { status: 429 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum ficheiro recebido no pedido.' }, { status: 400 });
    }

    // 1. Validação de formato MIME estrito (Formatos seguros para arquitetura)
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            'Formato inválido. Apenas ficheiros de imagem (JPG, JPEG, PNG, WebP ou AVIF) são permitidos.',
        },
        { status: 400 }
      );
    }

    // 2. Limite de tamanho: 15MB
    const maxSize = 15 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'O ficheiro excede o tamanho máximo de 15MB.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 3. Sanitização de nome de ficheiro
    const rawName = path.parse(file.name).name;
    const cleanExt = path.parse(file.name).ext.toLowerCase() || '.jpg';
    const timestamp = Date.now();
    const safeFilename = `${slugify(rawName || 'upload')}-${timestamp}${cleanExt}`;

    let publicUrl: string;

    // 4. Armazenamento persistente: Vercel Blob em produção se token existir
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(safeFilename, buffer, {
        access: 'public',
        contentType: file.type,
      });
      publicUrl = blob.url;
    } else {
      // Fallback para disco local (Desenvolvimento local)
      const uploadDir = path.join(process.cwd(), 'public', 'images', 'uploads');
      await mkdir(uploadDir, { recursive: true });

      const filePath = path.join(uploadDir, safeFilename);
      await writeFile(filePath, buffer);
      publicUrl = `/images/uploads/${safeFilename}`;
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: safeFilename,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error('Erro no processamento de upload:', error);
    return NextResponse.json(
      { error: 'Ocorreu um erro interno ao guardar o ficheiro de imagem.' },
      { status: 500 }
    );
  }
}
