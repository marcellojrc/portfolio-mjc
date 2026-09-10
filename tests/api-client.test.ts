import { describe, it, expect } from 'vitest';
import { parseApiResponse } from '@/lib/api-client';
import { validateFileBeforeUpload, MAX_IMAGE_SIZE_BYTES } from '@/lib/image-validation';

describe('Robust API Client & Response Parsing (Bug Fix Validation)', () => {
  describe('validateFileBeforeUpload', () => {
    it('rejeita ficheiros com tamanho superior a 4.5MB antes do upload', () => {
      const mockFile = {
        name: 'render_pesado.jpg',
        size: MAX_IMAGE_SIZE_BYTES + 500,
        type: 'image/jpeg',
      } as File;

      const result = validateFileBeforeUpload(mockFile);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('4.5MB');
    });

    it('aceita ficheiros dentro do limite de 4.5MB com formato permitido', () => {
      const mockFile = {
        name: 'render_valido.webp',
        size: 2 * 1024 * 1024, // 2MB
        type: 'image/webp',
      } as File;

      const result = validateFileBeforeUpload(mockFile);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('rejeita ficheiro vazio de 0 bytes', () => {
      const mockFile = {
        name: 'vazio.png',
        size: 0,
        type: 'image/png',
      } as File;

      const result = validateFileBeforeUpload(mockFile);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('vazio');
    });

    it('rejeita tipos MIME não suportados', () => {
      const mockFile = {
        name: 'script.exe',
        size: 1024,
        type: 'application/x-msdownload',
      } as File;

      const result = validateFileBeforeUpload(mockFile);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('não suportado');
    });
  });

  describe('parseApiResponse — Tratamento Robusto de Respostas Não-JSON', () => {
    it('retorna dados com sucesso quando a resposta é JSON válido (200 OK)', async () => {
      const mockResponse = new Response(
        JSON.stringify({ success: true, url: 'https://blob.vercel.com/imagem.jpg' }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const data = await parseApiResponse<{ success: boolean; url: string }>(mockResponse);
      expect(data.success).toBe(true);
      expect(data.url).toBe('https://blob.vercel.com/imagem.jpg');
    });

    it('captura erro 413 em texto simples ("Request Entity Too Large") SEM SyntaxError de JSON', async () => {
      // Simula o comportamento exacto do gateway da Vercel ao exceder 4.5MB
      const mockResponse = new Response('Request Entity Too Large', {
        status: 413,
        headers: { 'Content-Type': 'text/plain' },
      });

      await expect(parseApiResponse(mockResponse)).rejects.toThrow(
        'A imagem excede o tamanho máximo permitido pelo servidor (máx. 4.5MB)'
      );
    });

    it('captura erro com texto iniciado por "Request Error" sem rebentar com JSON.parse', async () => {
      const mockResponse = new Response('Request Error: Connection reset by peer', {
        status: 502,
        headers: { 'Content-Type': 'text/plain' },
      });

      await expect(parseApiResponse(mockResponse)).rejects.toThrow(
        'Ocorreu um erro no servidor ao processar o ficheiro.'
      );
    });

    it('captura erro 504 Timeout em texto simples com mensagem compreensível', async () => {
      const mockResponse = new Response('Gateway Timeout', {
        status: 504,
        headers: { 'Content-Type': 'text/plain' },
      });

      await expect(parseApiResponse(mockResponse)).rejects.toThrow('timeout');
    });

    it('extrai a mensagem do JSON de erro quando a API devolve status 400 com JSON', async () => {
      const mockResponse = new Response(
        JSON.stringify({ error: 'Formato de imagem inválido.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );

      await expect(parseApiResponse(mockResponse)).rejects.toThrow('Formato de imagem inválido.');
    });

    it('não expõe HTML bruto quando o servidor devolve página de erro HTML 500', async () => {
      const mockResponse = new Response(
        '<!DOCTYPE html><html><body><h1>500 Internal Server Error</h1></body></html>',
        {
          status: 500,
          headers: { 'Content-Type': 'text/html' },
        }
      );

      await expect(parseApiResponse(mockResponse)).rejects.toThrow(
        'Ocorreu um erro no servidor ao processar o ficheiro.'
      );
    });
  });
});
