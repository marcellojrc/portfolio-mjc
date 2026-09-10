import {
  handleUpload,
  handleUploadPresigned,
  type HandleUploadBody,
  type HandleUploadPresignedBody,
} from '@vercel/blob/client';
import { issueSignedToken } from '@vercel/blob';
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

// Fallback dummy public key for local test environments when BLOB_WEBHOOK_PUBLIC_KEY is not in env
const DUMMY_WEBHOOK_PUBLIC_KEY =
  '-----BEGIN PUBLIC KEY-----\nMCowBQYDK2VwAyEA0000000000000000000000000000000000000000000=\n-----END PUBLIC KEY-----';

/**
 * Endpoint de Autorização e Emissão de Tokens/URLs Pré-assinadas para Direct Client Upload (Vercel Blob).
 *
 * Suporta:
 * 1. Arquitetura moderna OIDC da Vercel via handleUploadPresigned + issueSignedToken.
 * 2. Tokens read-write estáticos legados via handleUpload.
 * 3. Validação estrita de RBAC (ADMIN e EDITOR).
 * 4. Bloqueio absoluto de SVG e GIF.
 * 5. Limite estrito de 50 MB.
 * 6. Validação de projectId na base de dados.
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
  const hasBlobConfig =
    Boolean(process.env.BLOB_READ_WRITE_TOKEN) || Boolean(process.env.BLOB_STORE_ID);

  // Regra de Produção: erro explícito se a infraestrutura Blob não estiver configurada
  if (isProduction && !hasBlobConfig) {
    return NextResponse.json(
      {
        error:
          'Armazenamento Vercel Blob não configurado em ambiente de produção. Verifique as credenciais do Blob Store.',
      },
      { status: 500 }
    );
  }

  // Regra de Desenvolvimento Local: se não houver qualquer configuração de Blob,
  // sinaliza para fallback de disco local
  if (!isProduction && !hasBlobConfig) {
    return NextResponse.json(
      {
        error: 'BLOB_NOT_CONFIGURED_LOCAL',
        message: 'Vercel Blob não configurado localmente. Utilizar armazenamento em disco local.',
      },
      { status: 501 }
    );
  }

  try {
    const rawBody = (await request.json()) as {
      type: string;
      payload?: {
        pathname?: string;
        clientPayload?: string | null;
        multipart?: boolean;
      };
    };

    // Helper comum de validação estrita do asset e autorização de projeto
    const validateAssetAndProject = async (
      pathname: string,
      clientPayload: string | null
    ): Promise<{ projectId: string | null }> => {
      const cleanPath = (pathname || '').toLowerCase();
      const dotIndex = cleanPath.lastIndexOf('.');
      const ext = dotIndex !== -1 ? cleanPath.slice(dotIndex) : '';

      if (cleanPath.endsWith('.svg') || cleanPath.includes('.svg.') || ext === '.svg') {
        throw new Error(
          'Ficheiros SVG não são permitidos no CMS. Formatos aceites: JPG, PNG, WebP ou AVIF.'
        );
      }

      if (cleanPath.endsWith('.gif') || ext === '.gif') {
        throw new Error('Formato GIF não é permitido. Formatos aceites: JPG, PNG, WebP ou AVIF.');
      }

      if (!ALLOWED_IMAGE_EXTENSIONS.includes(ext as (typeof ALLOWED_IMAGE_EXTENSIONS)[number])) {
        throw new Error(
          'Extensão de ficheiro não permitida. Apenas JPG, PNG, WebP e AVIF são aceites.'
        );
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

      return { projectId };
    };

    // 1. FLUXO MODERNO VERCEL BLOB: URL Pré-assinada (OIDC / Vercel Signed URLs)
    if (rawBody.type === 'blob.generate-presigned-url') {
      const webhookKey = process.env.BLOB_WEBHOOK_PUBLIC_KEY || DUMMY_WEBHOOK_PUBLIC_KEY;

      const jsonResponse = await handleUploadPresigned({
        body: rawBody as HandleUploadPresignedBody,
        request,
        webhookPublicKey: webhookKey,
        getSignedToken: async (pathname: string, clientPayload: string | null) => {
          const { projectId } = await validateAssetAndProject(pathname, clientPayload);

          const token = await issueSignedToken({
            pathname,
            operations: ['put'],
            allowedContentTypes: [...ALLOWED_IMAGE_MIME_TYPES],
            maximumSizeInBytes: MAX_IMAGE_SIZE_BYTES, // 50MB
            validUntil: Date.now() + 60 * 60 * 1000,
          });

          return {
            token,
            urlOptions: {
              allowedContentTypes: [...ALLOWED_IMAGE_MIME_TYPES],
              maximumSizeInBytes: MAX_IMAGE_SIZE_BYTES,
              validUntil: Date.now() + 10 * 60 * 1000,
              addRandomSuffix: true,
              allowOverwrite: false,
              cacheControlMaxAge: 30 * 24 * 60 * 60,
              tokenPayload: JSON.stringify({
                userId: session.userId,
                userRole: session.role,
                projectId,
              }),
            },
          };
        },
        onUploadCompleted: async ({ blob, tokenPayload }) => {
          try {
            console.log(`[Vercel Blob Direct Upload] Asset carregado com sucesso: ${blob.url}`);
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
    }

    // 2. FLUXO LEGADO: Client Token HMAC a partir de BLOB_READ_WRITE_TOKEN
    if (rawBody.type === 'blob.generate-client-token') {
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        return NextResponse.json(
          {
            error:
              'A infraestrutura Vercel Blob deste projeto utiliza Vercel Signed URLs (OIDC). O cliente deve utilizar uploadPresigned.',
          },
          { status: 400 }
        );
      }

      const jsonResponse = await handleUpload({
        body: rawBody as HandleUploadBody,
        request,
        onBeforeGenerateToken: async (pathname: string, clientPayload: string | null) => {
          const { projectId } = await validateAssetAndProject(pathname, clientPayload);

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
    }

    // 3. Callback de conclusão de upload
    if (rawBody.type === 'blob.upload-completed') {
      if (process.env.BLOB_WEBHOOK_PUBLIC_KEY) {
        const jsonResponse = await handleUploadPresigned({
          body: rawBody as HandleUploadPresignedBody,
          request,
          webhookPublicKey: process.env.BLOB_WEBHOOK_PUBLIC_KEY,
          getSignedToken: async () => {
            throw new Error('Operação getSignedToken não permitida no callback upload-completed.');
          },
        });
        return NextResponse.json(jsonResponse);
      }

      if (process.env.BLOB_READ_WRITE_TOKEN) {
        const jsonResponse = await handleUpload({
          body: rawBody as HandleUploadBody,
          request,
          onBeforeGenerateToken: async () => {
            throw new Error('Operação onBeforeGenerateToken não permitida no callback.');
          },
        });
        return NextResponse.json(jsonResponse);
      }

      return NextResponse.json({ type: rawBody.type, response: 'ok' });
    }

    return NextResponse.json({ error: 'Tipo de evento não suportado.' }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao processar token de upload.';
    console.error('Erro no endpoint de token de upload:', message);

    const status = message.includes('não foi encontrado') ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
