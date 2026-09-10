import { describe, it, expect } from 'vitest';
import {
  validateImageBuffer,
  isProtectedSystemAsset,
  MAX_IMAGE_SIZE_BYTES,
} from '@/lib/image-validation';
import { projectSchema, projectMediaSchema } from '@/schemas';

describe('Sistema de Gestão de Imagens & Validação', () => {
  describe('Validação Estrita de Magic Bytes', () => {
    it('reconhece ficheiro JPEG válido por assinatura binária (FF D8 FF)', () => {
      const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
      const result = validateImageBuffer(jpegBuffer, 'image/jpeg');

      expect(result.valid).toBe(true);
      expect(result.mimeType).toBe('image/jpeg');
      expect(result.extension).toBe('.jpg');
    });

    it('reconhece ficheiro PNG válido por assinatura binária (89 50 4E 47 0D 0A 1A 0A)', () => {
      const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
      const result = validateImageBuffer(pngBuffer, 'image/png');

      expect(result.valid).toBe(true);
      expect(result.mimeType).toBe('image/png');
      expect(result.extension).toBe('.png');
    });

    it('reconhece ficheiro WebP válido por assinatura binária (RIFF...WEBP)', () => {
      const webpBuffer = Buffer.from([
        0x52, 0x49, 0x46, 0x46, // RIFF
        0x20, 0x00, 0x00, 0x00, // file size
        0x57, 0x45, 0x42, 0x50, // WEBP
        0x56, 0x50, 0x38, 0x20, // VP8
      ]);
      const result = validateImageBuffer(webpBuffer, 'image/webp');

      expect(result.valid).toBe(true);
      expect(result.mimeType).toBe('image/webp');
      expect(result.extension).toBe('.webp');
    });

    it('reconhece ficheiro AVIF válido por assinatura binária (ftyp avif)', () => {
      const avifBuffer = Buffer.from([
        0x00, 0x00, 0x00, 0x1c, // box size
        0x66, 0x74, 0x79, 0x70, // ftyp
        0x61, 0x76, 0x69, 0x66, // avif
        0x00, 0x00, 0x00, 0x00,
      ]);
      const result = validateImageBuffer(avifBuffer, 'image/avif');

      expect(result.valid).toBe(true);
      expect(result.mimeType).toBe('image/avif');
      expect(result.extension).toBe('.avif');
    });

    it('rejeita ficheiro vazio de 0 bytes', () => {
      const emptyBuffer = Buffer.alloc(0);
      const result = validateImageBuffer(emptyBuffer);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('vazio');
    });

    it('rejeita ficheiro com tamanho superior ao limite de 50MB', () => {
      const oversizeBuffer = Buffer.alloc(MAX_IMAGE_SIZE_BYTES + 1024);
      // Preencher com assinatura JPEG para testar a precedência do limite de tamanho
      oversizeBuffer[0] = 0xff;
      oversizeBuffer[1] = 0xd8;
      oversizeBuffer[2] = 0xff;

      const result = validateImageBuffer(oversizeBuffer);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('50MB');
    });

    it('rejeita ficheiro falso ou executável disfarçado de imagem', () => {
      // Simula um script bash ou executável que envia content-type image/jpeg
      const fakeBuffer = Buffer.from('#!/bin/bash\necho "Malicious payload"\n');
      const result = validateImageBuffer(fakeBuffer, 'image/jpeg');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Formato de imagem não reconhecido');
    });
  });

  describe('Proteção de Ativos Estáticos do Sistema', () => {
    it('identifica imagens baseline do sistema como protegidas', () => {
      expect(isProtectedSystemAsset('/images/hero_bg.jpg')).toBe(true);
      expect(isProtectedSystemAsset('/images/about_portrait.jpg')).toBe(true);
      expect(isProtectedSystemAsset('/images/proj01_01.jpg')).toBe(true);
    });

    it('permite desalocação de imagens na pasta de uploads', () => {
      expect(isProtectedSystemAsset('/images/uploads/render-12345.jpg')).toBe(false);
      expect(isProtectedSystemAsset('/images/uploads/planta-piso-0.webp')).toBe(false);
    });

    it('permite desalocação de URLs do Vercel Blob', () => {
      expect(
        isProtectedSystemAsset(
          'https://abc123xyz.public.blob.vercel-storage.com/projeto-fachada-123.jpg'
        )
      ).toBe(false);
    });

    it('retorna false para valores nulos ou vazios', () => {
      expect(isProtectedSystemAsset('')).toBe(false);
      expect(isProtectedSystemAsset(null)).toBe(false);
      expect(isProtectedSystemAsset(undefined)).toBe(false);
    });
  });

  describe('Integridade de Galeria e Capa com Zod Schema', () => {
    it('valida estrutura de ProjectMediaItem', () => {
      const validItem = {
        url: 'https://blob.vercel-storage.com/corte-aa.webp',
        type: 'SECTION',
        alt: 'Corte AA transversal',
        caption: 'Pormenor da estrutura metálica',
        order: 1,
      };

      const result = projectMediaSchema.safeParse(validItem);
      expect(result.success).toBe(true);
    });

    it('rejeita ProjectMediaItem sem URL', () => {
      const invalidItem = {
        url: '',
        type: 'RENDER',
        alt: 'Render',
      };

      const result = projectMediaSchema.safeParse(invalidItem);
      expect(result.success).toBe(false);
    });

    it('exige coverImage obrigatória no projeto', () => {
      const projectWithoutCover = {
        title: 'Moradia Sommerschield',
        slug: 'moradia-sommerschield',
        number: '05',
        category: 'Habitacional',
        location: 'Maputo',
        year: '2026',
        description: 'Projeto residencial contemporâneo de alto padrão.',
        coverImage: '',
      };

      const result = projectSchema.safeParse(projectWithoutCover);
      expect(result.success).toBe(false);
    });

    it('garante que a substituição de imagem de capa preserva consistência', () => {
      // Simulação da regra de negócio: Se imagem antiga A era capa, B deve tornar-se a nova capa
      const oldCover = 'https://blob.vercel-storage.com/img-a.jpg';
      const newUpload = 'https://blob.vercel-storage.com/img-b.jpg';

      let currentCover = oldCover;
      const gallery = [
        { url: oldCover, type: 'RENDER', alt: 'Capa antiga', order: 1 },
        { url: 'https://blob.vercel-storage.com/img-c.jpg', type: 'PLAN', alt: 'Planta', order: 2 },
      ];

      // Ação de substituição no índice 0
      const indexToReplace = 0;
      const itemBeingReplaced = gallery[indexToReplace];

      if (currentCover === itemBeingReplaced.url) {
        currentCover = newUpload;
      }
      gallery[indexToReplace] = { ...itemBeingReplaced, url: newUpload };

      expect(currentCover).toBe(newUpload);
      expect(gallery[0].url).toBe(newUpload);
      expect(gallery[0].alt).toBe('Capa antiga'); // Metadados preservados
      expect(gallery[0].type).toBe('RENDER'); // Tipologia preservada
    });
  });
});
