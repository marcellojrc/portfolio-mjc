import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { getSession, requireRoles } from '@/lib/auth';
import { prisma } from '@/lib/db';
import {
  MAX_IMAGE_SIZE_BYTES,
  ALLOWED_IMAGE_EXTENSIONS,
  ALLOWED_IMAGE_MIME_TYPES,
} from '@/lib/image-validation';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Endpoint de Autorização e Emissão de Tokens para Direct Client Upload (Vercel Blob).
 *
 * Garante que:
 * 1. Apenas administradores e editores autenticados obtêm tokens de upload.
 * 2. O token restringe estritamente os tipos de arquivo permitidos (JPG, PNG, WebP, AVIF).
 * 3. O token restringe o tamanho máximo (50 MB).
 * 4. Se projectId for fornecido, valida se o projeto existe na base de dados antes de autorizar.
 * 5. Em produção, se o Vercel Blob não estiver configurado, devolve erro 500 explícito.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: 'Não autenticado. Inicie sessão para continuar.' },
      { status: 401 }
    );
  }

  const authError = requireRoles(session, ['ADMIN', 'EDITOR']);
  if (authError) return authError;

  const isProduction = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
  const hasBlobToken = Boolean(process.env.BLOB_READ_WRITE_TOKEN) || Boolean(process.env.BLOB_STORE_ID);

  // Regra de Produção: erro explícito se a infraestrutura Blob não estiver pronta
  if (isProduction && !hasBlobToken) {
    return NextResponse.json(
      {
        error:
          'Armazenamento Vercel Blob não configurado em ambiente de produção. Verifique as credenciais do Blob Store.',
      },
      { status: 500 }
    );
  }

  // Regra de Desenvolvimento Local: sinaliza ao cliente para utilizar o armazenamento local se não houver token
  if (!isProduction && !hasBlobToken) {
    return NextResponse.json(
      {
        error: 'BLOB_NOT_CONFIGURED_LOCAL',
        message: 'Vercel Blob não configurado localmente. Utilizar armazenamento em disco local.',
      },
      { status: 501 }
    );
  }

  try {
    const body = (await request.json()) as HandleUploadBody;

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname: string, clientPayload: string | null) => {
        // Bloqueio explícito de SVG e extensões não autorizadas no token
        const cleanPath = (pathname || '').toLowerCase();
        const dotIndex = cleanPath.lastIndexOf('.');
        const ext = dotIndex !== -1 ? cleanPath.slice(dotIndex) : '';

        if (cleanPath.endsWith('.svg') || cleanPath.includes('.svg.') || ext === '.svg') {
          throw new Error('Ficheiros SVG não são permitidos no CMS. Formatos aceites: JPG, PNG, WebP ou AVIF.');
        }

        if (cleanPath.endsWith('.gif') || ext === '.gif') {
          throw new Error('Formato GIF não é permitido. Formatos aceites: JPG, PNG, WebP ou AVIF.');
        }

        if (!ALLOWED_IMAGE_EXTENSIONS.includes(ext as (typeof ALLOWED_IMAGE_EXTENSIONS)[number])) {
          throw new Error('Extensão de ficheiro não permitida. Apenas JPG, PNG, WebP e AVIF são aceites.');
        }

        let projectId: string | null = null;

        if (clientPayload) {
          try {
            const parsed = JSON.parse(clientPayload) as { projectId?: string };
            if (parsed.projectId) {
              projectId = parsed.projectId;
              const project = await prisma.project.findUnique({
                where: { id: projectId },
                select: { id: true },
              });

              if (!project) {
                throw new Error(`O projeto especificado (ID "${projectId}") não foi encontrado.`);
              }
            }
          } catch (err: unknown) {
            if (err instanceof Error && err.message.includes('não foi encontrado')) {
              throw err;
            }
          }
        }

        return {
          allowedContentTypes: [...ALLOWED_IMAGE_MIME_TYPES],
          maximumSizeInBytes: MAX_IMAGE_SIZE_BYTES, // 50MB
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({
            userId: session.userId,
            userRole: session.role,
            projectId,
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        try {
          console.log(`[Vercel Blob Direct Upload] Asset carregado com sucesso: ${blob.url}`);
          // Registar atividade de upload
          let userId = session.userId;
          if (tokenPayload) {
            try {
              const parsed = JSON.parse(tokenPayload);
              if (parsed.userId) userId = parsed.userId;
            } catch {
              // fallback
            }
          }

          await prisma.activityLog.create({
            data: {
              userId,
              action: 'ASSET_UPLOADED_DIRECT',
              details: `Upload direto para Vercel Blob concluído: ${blob.pathname} (${blob.url})`,
            },
          });
        } catch (logErr) {
          console.warn('Aviso: Falha ao registar ActivityLog no callback onUploadCompleted:', logErr);
        }
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao processar token de upload.';
    console.error('Erro no endpoint de token de upload:', message);

    const status = message.includes('não foi encontrado') ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
