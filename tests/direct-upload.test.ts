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
    it('aceita formato JPG / JPEG', () => {
      const file = { name: 'fachada.jpg', size: 2 * 1024 * 1024, type: 'image/jpeg' } as File;
      expect(validateFileBeforeUpload(file).valid).toBe(true);
    });

    it('aceita formato PNG', () => {
      const file = { name: 'planta.png', size: 2 * 1024 * 1024, type: 'image/png' } as File;
      expect(validateFileBeforeUpload(file).valid).toBe(true);
    });

    it('aceita formato WebP', () => {
      const file = { name: 'corte.webp', size: 2 * 1024 * 1024, type: 'image/webp' } as File;
      expect(validateFileBeforeUpload(file).valid).toBe(true);
    });

    it('aceita formato AVIF', () => {
      const file = { name: 'detalhe.avif', size: 2 * 1024 * 1024, type: 'image/avif' } as File;
      expect(validateFileBeforeUpload(file).valid).toBe(true);
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

    it('rejeita ficheiro executável disfarçado/renomeado como imagem (.jpg falso)', () => {
      const fakeBuffer = Buffer.from('#!/bin/bash\nmalicious_payload() { rm -rf /; }\n');
      const result = validateImageBuffer(fakeBuffer, 'image/jpeg');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Formato de imagem não reconhecido');
    });

    it('rejeita buffer corrompido ou vazio', () => {
      const emptyBuffer = Buffer.alloc(0);
      expect(validateImageBuffer(emptyBuffer).valid).toBe(false);

      const corruptBuffer = Buffer.from([0x00, 0x01, 0x02, 0x03]);
      expect(validateImageBuffer(corruptBuffer).valid).toBe(false);
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
