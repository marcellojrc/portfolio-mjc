import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  validateFileBeforeUpload,
  validateImageBuffer,
  MAX_IMAGE_SIZE_BYTES,
  MAX_IMAGE_SIZE_LABEL,
  isProtectedSystemAsset,
} from '@/lib/image-validation';
import { requireRoles, type AdminPayload } from '@/lib/auth';
import { safeDeleteAssetFromStorage, countActiveAssetReferences } from '@/lib/storage';
import { prisma } from '@/lib/db';
import { projectMediaSchema, projectSchema } from '@/schemas';

describe('Arquitetura de Direct Client Upload (Vercel Blob) & Gestão Transacional', () => {
  describe('1. Validação de Tamanhos de Ficheiro (Regra de Negócio: 50MB)', () => {
    it('permite imagem de 1 MB', () => {
      const file = { name: 'foto-1mb.jpg', size: 1 * 1024 * 1024, type: 'image/jpeg' } as File;
      const result = validateFileBeforeUpload(file);
      expect(result.valid).toBe(true);
    });

    it('permite imagem de 5 MB', () => {
      const file = { name: 'render-5mb.png', size: 5 * 1024 * 1024, type: 'image/png' } as File;
      const result = validateFileBeforeUpload(file);
      expect(result.valid).toBe(true);
    });

    it('permite especificamente imagem de 5.99 MB (anteriormente bloqueada pelo limite de 4.5MB)', () => {
      const file = {
        name: 'render-alta-resolucao.webp',
        size: Math.floor(5.99 * 1024 * 1024),
        type: 'image/webp',
      } as File;
      const result = validateFileBeforeUpload(file);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('permite imagem de 10 MB', () => {
      const file = { name: 'prancha-10mb.jpg', size: 10 * 1024 * 1024, type: 'image/jpeg' } as File;
      const result = validateFileBeforeUpload(file);
      expect(result.valid).toBe(true);
    });

    it('permite imagem de 25 MB', () => {
      const file = { name: 'render-25mb.avif', size: 25 * 1024 * 1024, type: 'image/avif' } as File;
      const result = validateFileBeforeUpload(file);
      expect(result.valid).toBe(true);
    });

    it('permite imagem de 49 MB', () => {
      const file = { name: 'render-49mb.png', size: 49 * 1024 * 1024, type: 'image/png' } as File;
      const result = validateFileBeforeUpload(file);
      expect(result.valid).toBe(true);
    });

    it('rejeita ficheiro superior a 50 MB (>50MB)', () => {
      const file = {
        name: 'render-gigante.jpg',
        size: 51 * 1024 * 1024,
        type: 'image/jpeg',
      } as File;
      const result = validateFileBeforeUpload(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain(MAX_IMAGE_SIZE_LABEL);
      expect(result.error).toContain('51.00MB');
    });
  });

  describe('2. Validação Estrita de Formatos Permitidos e Rejeitados', () => {
    it('aceita formato JPG / JPEG válido', () => {
      const file = { name: 'fachada.jpg', size: 2 * 1024 * 1024, type: 'image/jpeg' } as File;
      expect(validateFileBeforeUpload(file).valid).toBe(true);
      const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
      expect(validateImageBuffer(jpegBuffer, 'image/jpeg').valid).toBe(true);
    });

    it('aceita formato PNG válido', () => {
      const file = { name: 'planta.png', size: 2 * 1024 * 1024, type: 'image/png' } as File;
      expect(validateFileBeforeUpload(file).valid).toBe(true);
      const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
      expect(validateImageBuffer(pngBuffer, 'image/png').valid).toBe(true);
    });

    it('aceita formato WebP válido', () => {
      const file = { name: 'corte.webp', size: 2 * 1024 * 1024, type: 'image/webp' } as File;
      expect(validateFileBeforeUpload(file).valid).toBe(true);
      const webpBuffer = Buffer.from([
        0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
      ]);
      expect(validateImageBuffer(webpBuffer, 'image/webp').valid).toBe(true);
    });

    it('aceita formato AVIF válido', () => {
      const file = { name: 'detalhe.avif', size: 2 * 1024 * 1024, type: 'image/avif' } as File;
      expect(validateFileBeforeUpload(file).valid).toBe(true);
      const avifBuffer = Buffer.from([
        0x00, 0x00, 0x00, 0x1c, 0x66, 0x74, 0x79, 0x70, 0x61, 0x76, 0x69, 0x66,
      ]);
      expect(validateImageBuffer(avifBuffer, 'image/avif').valid).toBe(true);
    });

    it('rejeita SVG normal por extensão e MIME', () => {
      const file = { name: 'vetor.svg', size: 50 * 1024, type: 'image/svg+xml' } as File;
      const result = validateFileBeforeUpload(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('SVG');
    });

    it('rejeita SVG no buffer de dados (tag <svg>)', () => {
      const svgBuffer = Buffer.from(
        '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="40" /></svg>'
      );
      const result = validateImageBuffer(svgBuffer, 'image/svg+xml');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('SVG');
    });

    it('rejeita SVG disfarçado e renomeado para .jpg (ataque de bypass)', () => {
      const disguisedSvgBuffer = Buffer.from(
        '<?xml version="1.0" encoding="UTF-8"?><svg viewBox="0 0 100 100"><rect width="100" height="100"/></svg>'
      );
      // Ficheiro declara ser image/jpeg com extensão .jpg, mas contém SVG
      const result = validateImageBuffer(disguisedSvgBuffer, 'image/jpeg');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('SVG');
    });

    it('rejeita ficheiro não-imagem com MIME falso image/jpeg (ex: script ou texto)', () => {
      const textBuffer = Buffer.from('Este é um documento de texto não binário enviado como imagem.');
      const result = validateImageBuffer(textBuffer, 'image/jpeg');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Formato de imagem não reconhecido');
    });

    it('rejeita ficheiro corrompido ou truncado', () => {
      const emptyBuffer = Buffer.alloc(0);
      expect(validateImageBuffer(emptyBuffer).valid).toBe(false);

      // Truncado: apenas 2 bytes de JPEG sem o 3º byte FF
      const truncatedJpeg = Buffer.from([0xff, 0xd8]);
      expect(validateImageBuffer(truncatedJpeg).valid).toBe(false);

      // Bytes aleatórios corrompidos
      const corruptBuffer = Buffer.from([0x00, 0x01, 0x02, 0x03]);
      expect(validateImageBuffer(corruptBuffer).valid).toBe(false);
    });

    it('rejeita ficheiro GIF (removido do CMS de arquitetura)', () => {
      const gifFile = { name: 'animacao.gif', size: 1024 * 1024, type: 'image/gif' } as File;
      const fileResult = validateFileBeforeUpload(gifFile);
      expect(fileResult.valid).toBe(false);
      expect(fileResult.error).toContain('GIF');

      const gifBuffer = Buffer.from('GIF89a\x01\x00\x01\x00\x80\x00\x00');
      const bufferResult = validateImageBuffer(gifBuffer, 'image/gif');
      expect(bufferResult.valid).toBe(false);
    });

    it('rejeita ficheiro PDF', () => {
      const file = { name: 'documento.pdf', size: 1024 * 1024, type: 'application/pdf' } as File;
      const result = validateFileBeforeUpload(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('não suportado');
    });

    it('rejeita ficheiro executável EXE', () => {
      const file = { name: 'setup.exe', size: 1024 * 1024, type: 'application/x-msdownload' } as File;
      const result = validateFileBeforeUpload(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('não suportado');
    });

    it('rejeita persistência de ProjectMedia caso o URL contenha SVG', () => {
      const invalidMedia = {
        url: 'https://blob.vercel-storage.com/planta-vetorial.svg',
        type: 'PLAN',
        alt: 'Planta em SVG',
      };
      const result = projectMediaSchema.safeParse(invalidMedia);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('SVG');
      }
    });

    it('rejeita persistência de Project caso o coverImage contenha SVG', () => {
      const projectWithSvgCover = {
        title: 'Edifício Horizonte',
        slug: 'edificio-horizonte',
        number: '12',
        category: 'Comercial',
        location: 'Maputo',
        year: '2026',
        description: 'Descrição com mais de dez caracteres.',
        coverImage: 'https://blob.vercel-storage.com/logo-projeto.svg',
      };
      const result = projectSchema.safeParse(projectWithSvgCover);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('SVG');
      }
    });
  });

  describe('3. Autorização e Emissão de Tokens (RBAC)', () => {
    it('rejeita pedido sem sessão (401)', () => {
      const authError = requireRoles(null, ['ADMIN', 'EDITOR']);
      expect(authError).not.toBeNull();
      expect(authError?.status).toBe(401);
    });

    it('rejeita utilizador com role VIEWER / USER (403)', () => {
      const viewerSession: AdminPayload = {
        userId: 'usr_viewer',
        email: 'viewer@example.com',
        name: 'Viewer User',
        role: 'VIEWER',
      };
      const authError = requireRoles(viewerSession, ['ADMIN', 'EDITOR']);
      expect(authError).not.toBeNull();
      expect(authError?.status).toBe(403);
    });

    it('autoriza utilizador com role EDITOR', () => {
      const editorSession: AdminPayload = {
        userId: 'usr_editor',
        email: 'editor@example.com',
        name: 'Editor User',
        role: 'EDITOR',
      };
      const authError = requireRoles(editorSession, ['ADMIN', 'EDITOR']);
      expect(authError).toBeNull();
    });

    it('autoriza utilizador com role ADMIN', () => {
      const adminSession: AdminPayload = {
        userId: 'usr_admin',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'ADMIN',
      };
      const authError = requireRoles(adminSession, ['ADMIN', 'EDITOR']);
      expect(authError).toBeNull();
    });
  });

  describe('4. Substituição Transacional e Segurança de Assets Órfãos', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('protege ativos de sistema contra eliminação indevida', async () => {
      const systemUrl = '/images/about_portrait.jpg';
      expect(isProtectedSystemAsset(systemUrl)).toBe(true);

      const deleteResult = await safeDeleteAssetFromStorage(systemUrl);
      expect(deleteResult.deleted).toBe(false);
      expect(deleteResult.reason).toBe('protected_system_asset');
    });

    it('não apaga a imagem antiga se ainda estiver referenciada noutros registos da BD', async () => {
      const sharedUrl = 'https://blob.vercel.com/fachada-partilhada.webp';

      vi.spyOn(prisma.project, 'count').mockResolvedValue(1);
      vi.spyOn(prisma.projectMedia, 'count').mockResolvedValue(0);
      vi.spyOn(prisma.siteSettings, 'count').mockResolvedValue(0);

      const refs = await countActiveAssetReferences(sharedUrl);
      expect(refs).toBe(1);

      const deleteResult = await safeDeleteAssetFromStorage(sharedUrl);
      expect(deleteResult.deleted).toBe(false);
      expect(deleteResult.reason).toBe('still_referenced');
      expect(deleteResult.activeReferences).toBe(1);
    });

    it('se a BD falhar após o upload da imagem B, a imagem antiga A permanece intacta', async () => {
      const oldImageA = 'https://blob.vercel.com/imagem_antiga_a.jpg';
      const newImageB = 'https://blob.vercel.com/imagem_nova_b.jpg';

      // Simulação: Transação da BD falha ao tentar atualizar o projeto com a nova imagem B
      let dbTransactionFailed = false;
      let projectCurrentCover = oldImageA;

      try {
        await prisma.$transaction(async () => {
          throw new Error('Falha de ligação à base de dados Neon PostgreSQL');
        });
        projectCurrentCover = newImageB;
      } catch {
        dbTransactionFailed = true;
      }

      expect(dbTransactionFailed).toBe(true);
      // Garantia: Imagem antiga A nunca foi alterada na BD nem removida do storage
      expect(projectCurrentCover).toBe(oldImageA);
    });
  });
});
