import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { slugify } from '@/lib/utils';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum ficheiro enviado.' }, { status: 400 });
    }

    // Validar tipo de ficheiro
    const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml'];
    if (!validMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Formato não suportado. Envie ficheiros JPG, PNG, WebP ou AVIF.' },
        { status: 400 }
      );
    }

    // Limite de tamanho: 15MB
    const maxSize = 15 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'O ficheiro excede o tamanho máximo permitido de 15MB.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Gerar nome de ficheiro limpo e único
    const originalName = path.parse(file.name).name;
    const extension = path.parse(file.name).ext || '.jpg';
    const timestamp = Date.now();
    const safeFilename = `${slugify(originalName)}-${timestamp}${extension}`;

    // Diretório de destino
    const uploadDir = path.join(process.cwd(), 'public', 'images', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, safeFilename);
    await writeFile(filePath, buffer);

    const publicUrl = `/images/uploads/${safeFilename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: safeFilename,
      size: file.size,
    });
  } catch (error) {
    console.error('Erro no upload:', error);
    return NextResponse.json(
      { error: 'Ocorreu um erro interno ao processar o upload do ficheiro.' },
      { status: 500 }
    );
  }
}
