import { prisma } from './db';
import { del } from '@vercel/blob';
import { unlink } from 'fs/promises';
import path from 'path';
import { isProtectedSystemAsset } from './image-validation';

export interface DeleteAssetResult {
  deleted: boolean;
  reason?: 'protected_system_asset' | 'still_referenced' | 'not_found' | 'error';
  activeReferences?: number;
  error?: string;
}

/**
 * Conta quantas entidades na base de dados continuam a referenciar uma determinada URL de imagem.
 * Verifica:
 * - Capas de Projetos (Project.coverImage)
 * - Mídias de Projetos (ProjectMedia.url)
 * - Definições Globais do Site (SiteSettings.value, ex.: about_portrait)
 */
export async function countActiveAssetReferences(url: string): Promise<number> {
  if (!url) return 0;
  const targetUrl = url.trim();

  const [projectCoversCount, projectMediaCount, settingsCount] = await Promise.all([
    prisma.project.count({
      where: { coverImage: targetUrl },
    }),
    prisma.projectMedia.count({
      where: { url: targetUrl },
    }),
    prisma.siteSettings.count({
      where: { value: targetUrl },
    }),
  ]);

  return projectCoversCount + projectMediaCount + settingsCount;
}

/**
 * Elimina com segurança um asset do storage físico (Vercel Blob ou disco local),
 * APENAS E SOMENTE SE não estiver protegido e não possuir referências ativas em nenhuma tabela.
 */
export async function safeDeleteAssetFromStorage(url: string): Promise<DeleteAssetResult> {
  if (!url) {
    return { deleted: false, reason: 'not_found' };
  }

  const cleanUrl = url.trim();

  // 1. Regra de Ouro: Nunca apagar ativos estáticos de sistema (/images/*.jpg)
  if (isProtectedSystemAsset(cleanUrl)) {
    return {
      deleted: false,
      reason: 'protected_system_asset',
    };
  }

  // 2. Verificar se ainda está referenciado por algum registo na BD
  const activeRefs = await countActiveAssetReferences(cleanUrl);
  if (activeRefs > 0) {
    return {
      deleted: false,
      reason: 'still_referenced',
      activeReferences: activeRefs,
    };
  }

  // 3. Asset sem referências: proceder à remoção física do storage
  try {
    // 3.1. Vercel Blob
    if (cleanUrl.includes('public.blob.vercel-storage.com')) {
      try {
        await del(cleanUrl);
        return { deleted: true };
      } catch (blobErr) {
        console.warn('Aviso: Erro ao eliminar do Vercel Blob:', cleanUrl, blobErr);
        return {
          deleted: false,
          reason: 'error',
          error: blobErr instanceof Error ? blobErr.message : 'Erro no Vercel Blob',
        };
      }
    }

    // 3.2. Ficheiro em disco local (/images/uploads/...)
    if (cleanUrl.startsWith('/images/uploads/')) {
      const filename = path.basename(cleanUrl);
      const filePath = path.join(process.cwd(), 'public', 'images', 'uploads', filename);
      try {
        await unlink(filePath);
        return { deleted: true };
      } catch (fsErr: unknown) {
        // Se o ficheiro já não existia no disco, considerar resolvido
        const code = (fsErr as { code?: string })?.code;
        if (code === 'ENOENT') {
          return { deleted: true };
        }
        console.warn('Aviso: Erro ao eliminar ficheiro do disco local:', filePath, fsErr);
        return {
          deleted: false,
          reason: 'error',
          error: fsErr instanceof Error ? fsErr.message : 'Erro ao remover ficheiro local',
        };
      }
    }

    return { deleted: false, reason: 'not_found' };
  } catch (err) {
    console.error('Erro inesperado em safeDeleteAssetFromStorage:', err);
    return {
      deleted: false,
      reason: 'error',
      error: err instanceof Error ? err.message : 'Erro desconhecido',
    };
  }
}
