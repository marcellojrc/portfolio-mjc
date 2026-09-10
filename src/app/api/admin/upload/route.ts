import { NextResponse } from 'next/server';
import { getSession, requireRoles } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { slugify } from '@/lib/utils';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { put } from '@vercel/blob';
import { validateImageBuffer, MAX_IMAGE_SIZE_BYTES } from '@/lib/image-validation';

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

    if (file.size === 0) {
      return NextResponse.json({ error: 'O ficheiro enviado está vazio (0 bytes).' }, { status: 400 });
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'O ficheiro excede o tamanho máximo de 15MB.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1. Validação estrita de Magic Bytes (Assinatura binária real do ficheiro)
    const validation = validateImageBuffer(buffer, file.type);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || 'Formato de imagem inválido.' },
        { status: 400 }
      );
    }

    // 2. Sanitização de nome de ficheiro e atribuição da extensão real validada
    const rawName = path.parse(file.name).name;
    const safeExt = validation.extension || '.jpg';
    const timestamp = Date.now();
    const safeFilename = `${slugify(rawName || 'upload')}-${timestamp}${safeExt}`;

    let publicUrl: string;

    // 4. Armazenamento persistente:
    // Na Vercel (produção ou preview), o @vercel/blob utiliza autenticação OIDC nativa
    // em conjunto com BLOB_STORE_ID (ou BLOB_READ_WRITE_TOKEN caso configurado).
    const isVercelOrProduction =
      process.env.NODE_ENV === 'production' ||
      Boolean(process.env.VERCEL) ||
      Boolean(process.env.BLOB_STORE_ID) ||
      Boolean(process.env.BLOB_READ_WRITE_TOKEN);

    if (isVercelOrProduction) {
      try {
        const blob = await put(safeFilename, buffer, {
          access: 'public',
          contentType: file.type,
        });
        publicUrl = blob.url;
      } catch (blobErr) {
        console.error('Erro no upload para Vercel Blob:', blobErr);

        // Fallback para disco local caso estejamos em desenvolvimento local sem credenciais ativas
        if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
          console.warn('Aviso: Armazenamento Vercel Blob indisponível localmente. A utilizar disco local.');
          const uploadDir = path.join(process.cwd(), 'public', 'images', 'uploads');
          await mkdir(uploadDir, { recursive: true });

          const filePath = path.join(uploadDir, safeFilename);
          await writeFile(filePath, buffer);
          publicUrl = `/images/uploads/${safeFilename}`;
        } else {
          return NextResponse.json(
            { error: 'Não foi possível guardar o ficheiro no armazenamento na nuvem. Verifique a configuração do Vercel Blob.' },
            { status: 502 }
          );
        }
      }
    } else {
      // Disco local em desenvolvimento offline
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
