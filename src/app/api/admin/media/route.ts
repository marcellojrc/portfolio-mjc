import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession, requireRoles } from '@/lib/auth';
import { safeDeleteAssetFromStorage, countActiveAssetReferences } from '@/lib/storage';
import { isProtectedSystemAsset } from '@/lib/image-validation';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  try {
    const media = await prisma.projectMedia.findMany({
      select: {
        id: true,
        url: true,
        alt: true,
        caption: true,
        type: true,
      },
      orderBy: { createdAt: 'desc' },
      distinct: ['url'],
    });

    return NextResponse.json({ success: true, media });
  } catch (error) {
    console.error('Erro ao listar mídia:', error);
    return NextResponse.json({ error: 'Erro ao listar mídia.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getSession();
  const authError = requireRoles(session, ['ADMIN']);
  if (authError) return authError;

  try {
    const body = await request.json().catch(() => ({}));
    const { mediaId, url } = body as { mediaId?: string; url?: string };

    if (!mediaId && !url) {
      return NextResponse.json(
        { error: 'Deve fornecer o mediaId ou o URL da imagem a eliminar.' },
        { status: 400 }
      );
    }

    let targetUrl = url;

    // Caso 1: Eliminar ProjectMedia específico pelo ID
    if (mediaId) {
      const existingMedia = await prisma.projectMedia.findUnique({
        where: { id: mediaId },
        include: {
          project: { select: { id: true, title: true, coverImage: true } },
        },
      });

      if (!existingMedia) {
        return NextResponse.json({ error: 'Registo de mídia não encontrado.' }, { status: 404 });
      }

      targetUrl = existingMedia.url;

      // 1. Remover o registo ProjectMedia da galeria do projeto
      await prisma.projectMedia.delete({
        where: { id: mediaId },
      });

      // 2. Se a imagem removida for a imagem de capa do projeto, atualizar a capa para a próxima mídia disponível ou vazia
      if (existingMedia.project && existingMedia.project.coverImage === targetUrl) {
        const nextMedia = await prisma.projectMedia.findFirst({
          where: { projectId: existingMedia.projectId },
          orderBy: { order: 'asc' },
        });

        await prisma.project.update({
          where: { id: existingMedia.projectId },
          data: { coverImage: nextMedia ? nextMedia.url : '' },
        });
      }

      // 3. Tentar remover fisicamente do storage APENAS se não houver mais referências ativas
      const storageResult = await safeDeleteAssetFromStorage(targetUrl);

      await prisma.activityLog.create({
        data: {
          userId: session!.userId,
          action: 'PROJECT_MEDIA_DELETED',
          details: `Mídia removida do projeto "${existingMedia.project?.title || existingMedia.projectId}". Storage físico removido: ${storageResult.deleted}`,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Mídia removida da galeria com sucesso.',
        mediaId,
        physicalFileDeleted: storageResult.deleted,
      });
    }

    // Caso 2: Eliminar asset isolado pelo URL (ex.: limpeza da biblioteca de mídia)
    if (targetUrl) {
      if (isProtectedSystemAsset(targetUrl)) {
        return NextResponse.json(
          { error: 'Não é permitido eliminar ativos estáticos protegidos do sistema.' },
          { status: 403 }
        );
      }

      const activeRefs = await countActiveAssetReferences(targetUrl);
      if (activeRefs > 0) {
        return NextResponse.json(
          {
            error: `Não é possível eliminar o ficheiro físico: este asset continua a ser utilizado em ${activeRefs} local(is) ativo(s) no portfólio.`,
            activeReferences: activeRefs,
          },
          { status: 409 }
        );
      }

      const storageResult = await safeDeleteAssetFromStorage(targetUrl);

      await prisma.activityLog.create({
        data: {
          userId: session!.userId,
          action: 'ASSET_CLEANUP_DELETED',
          details: `Ficheiro órfão eliminado do storage: ${targetUrl}. Sucesso: ${storageResult.deleted}`,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Ficheiro eliminado do armazenamento com sucesso.',
        url: targetUrl,
        storageResult,
      });
    }

    return NextResponse.json({ error: 'Parâmetros inválidos.' }, { status: 400 });
  } catch (error) {
    console.error('Erro ao processar eliminação de mídia:', error);
    return NextResponse.json(
      { error: 'Ocorreu um erro interno ao processar a eliminação.' },
      { status: 500 }
    );
  }
}
