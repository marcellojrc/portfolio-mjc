/**
 * Validador estrito de ficheiros de imagem via inspeção de Magic Bytes (assinaturas binárias).
 * Impede ficheiros forjados (ex.: executáveis ou scripts renomeados com extensão de imagem).
 */

export interface ImageValidationResult {
  valid: boolean;
  mimeType?: string;
  extension?: string;
  error?: string;
}

export const MAX_IMAGE_SIZE_BYTES = 50 * 1024 * 1024; // 50 Megabytes (Regra de negócio CMS para Direct Client Upload)
export const MAX_IMAGE_SIZE_LABEL = '50MB';

export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
] as const;

export const ALLOWED_IMAGE_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.avif',
] as const;

/**
 * Validação no cliente antes de enviar o pedido HTTP pela rede.
 * Evita roundtrips e bloqueios de gateway no Vercel.
 */
export function validateFileBeforeUpload(file: File | null | undefined): {
  valid: boolean;
  error?: string;
} {
  if (!file) {
    return { valid: false, error: 'Nenhum ficheiro selecionado.' };
  }

  if (file.size === 0) {
    return { valid: false, error: 'O ficheiro selecionado está vazio (0 bytes).' };
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    const sizeMb = (file.size / 1024 / 1024).toFixed(2);
    return {
      valid: false,
      error: `A imagem selecionada (${sizeMb}MB) excede o limite máximo de ${MAX_IMAGE_SIZE_LABEL} permitido para upload direto. Por favor comprima ou redimensione o ficheiro antes de carregar.`,
    };
  }

  const lowerName = (file.name || '').toLowerCase();

  // 1. Bloqueio explícito de SVG por extensão ou tipo MIME
  if (
    lowerName.endsWith('.svg') ||
    lowerName.includes('.svg.') ||
    file.type === 'image/svg+xml' ||
    (file.type && file.type.toLowerCase().includes('svg'))
  ) {
    return {
      valid: false,
      error: 'Ficheiros SVG não são permitidos no CMS. Formatos aceites: JPG, PNG, WebP ou AVIF.',
    };
  }

  // 2. Bloqueio de GIF (não utilizado no CMS de arquitetura)
  if (lowerName.endsWith('.gif') || file.type === 'image/gif') {
    return {
      valid: false,
      error: 'Formato GIF não é permitido. Por favor utilize JPG, PNG, WebP ou AVIF.',
    };
  }

  // 3. Validação do MIME declarado
  if (file.type && !ALLOWED_IMAGE_MIME_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_MIME_TYPES)[number])) {
    return {
      valid: false,
      error: 'Formato de ficheiro não suportado. Por favor utilize JPG, PNG, WebP ou AVIF.',
    };
  }

  // 4. Validação da extensão do nome
  const dotIndex = lowerName.lastIndexOf('.');
  if (dotIndex !== -1) {
    const ext = lowerName.slice(dotIndex);
    if (!ALLOWED_IMAGE_EXTENSIONS.includes(ext as (typeof ALLOWED_IMAGE_EXTENSIONS)[number])) {
      return {
        valid: false,
        error: 'Extensão de ficheiro não suportada. Por favor utilize JPG, PNG, WebP ou AVIF.',
      };
    }
  }

  return { valid: true };
}

/**
 * Validação assíncrona que combina verificação de metadados e inspeção binária rápida (Magic Bytes).
 * Deteta tentativas de forjar extensões (ex: SVG ou script renomeado para .jpg).
 */
export async function validateFileContentBeforeUpload(file: File | null | undefined): Promise<{
  valid: boolean;
  error?: string;
}> {
  const basic = validateFileBeforeUpload(file);
  if (!basic.valid) return basic;

  try {
    const slice = await file!.slice(0, 128).arrayBuffer();
    const bufferCheck = validateImageBuffer(new Uint8Array(slice), file!.type);
    if (!bufferCheck.valid) {
      return {
        valid: false,
        error: bufferCheck.error || 'Formato de ficheiro inválido.',
      };
    }
    return { valid: true };
  } catch {
    return {
      valid: false,
      error: 'Não foi possível inspecionar o conteúdo do ficheiro.',
    };
  }
}

/**
 * Inspeciona os primeiros bytes do buffer e determina o formato real da imagem.
 * Rejeita explicitamente SVG, ficheiros corrompidos ou não-imagem.
 */
export function validateImageBuffer(
  buffer: Buffer | Uint8Array,
  declaredMimeType?: string
): ImageValidationResult {
  if (!buffer || buffer.length === 0) {
    return {
      valid: false,
      error: 'O ficheiro enviado está vazio (0 bytes).',
    };
  }

  if (buffer.length > MAX_IMAGE_SIZE_BYTES) {
    return {
      valid: false,
      error: `O ficheiro excede o tamanho máximo permitido de ${MAX_IMAGE_SIZE_LABEL} (${(buffer.length / 1024 / 1024).toFixed(2)}MB recebidos).`,
    };
  }

  const b = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);

  // Verificação de assinaturas de texto/XML para rejeição imediata de SVG
  const snippet = b.subarray(0, Math.min(b.length, 256)).toString('utf8').trim().toLowerCase();
  if (
    snippet.startsWith('<?xml') ||
    snippet.startsWith('<svg') ||
    snippet.includes('<svg') ||
    snippet.includes('xmlns="http://www.w3.org/2000/svg"') ||
    snippet.startsWith('<!doctype svg')
  ) {
    return {
      valid: false,
      error: 'Ficheiros SVG não são permitidos no CMS. Formatos aceites: JPG, PNG, WebP ou AVIF.',
    };
  }

  // 1. JPEG: FF D8 FF
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) {
    return {
      valid: true,
      mimeType: 'image/jpeg',
      extension: '.jpg',
    };
  }

  // 2. PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    b.length >= 8 &&
    b[0] === 0x89 &&
    b[1] === 0x4e &&
    b[2] === 0x47 &&
    b[3] === 0x0d &&
    b[4] === 0x0a &&
    b[5] === 0x1a &&
    b[6] === 0x0a
  ) {
    return {
      valid: true,
      mimeType: 'image/png',
      extension: '.png',
    };
  }
  // Alternativa PNG de 8 bytes canónica (89 50 4E 47 0D 0A 1A 0A)
  if (
    b.length >= 8 &&
    b[0] === 0x89 &&
    b[1] === 0x50 &&
    b[2] === 0x4e &&
    b[3] === 0x47 &&
    b[4] === 0x0d &&
    b[5] === 0x0a &&
    b[6] === 0x1a &&
    b[7] === 0x0a
  ) {
    return {
      valid: true,
      mimeType: 'image/png',
      extension: '.png',
    };
  }

  // 3. WebP: RIFF .... WEBP
  if (
    b.length >= 12 &&
    b[0] === 0x52 && // R
    b[1] === 0x49 && // I
    b[2] === 0x46 && // F
    b[3] === 0x46 && // F
    b[8] === 0x57 && // W
    b[9] === 0x45 && // E
    b[10] === 0x42 && // B
    b[11] === 0x50 // P
  ) {
    return {
      valid: true,
      mimeType: 'image/webp',
      extension: '.webp',
    };
  }

  // 4. AVIF: .... ftyp avif / avis / mif1
  if (b.length >= 12) {
    const ftyp = b.subarray(4, 8).toString('ascii');
    const brand = b.subarray(8, 12).toString('ascii');
    if (ftyp === 'ftyp' && (brand === 'avif' || brand === 'avis' || brand === 'mif1')) {
      return {
        valid: true,
        mimeType: 'image/avif',
        extension: '.avif',
      };
    }
  }

  return {
    valid: false,
    error: `Formato de imagem não reconhecido ou ficheiro corrompido. Formatos permitidos: JPG, PNG, WebP ou AVIF.${
      declaredMimeType ? ` (Cabeçalho recebido: ${declaredMimeType})` : ''
    }`,
  };
}

/**
 * Determina se uma URL de imagem corresponde a um ativo estático permanente do sistema/código.
 * Ativos em /images/ que NÃO estão na pasta /images/uploads/ NUNCA podem ser destruídos fisicamente.
 */
export function isProtectedSystemAsset(url: string | null | undefined): boolean {
  if (!url) return false;
  const cleanUrl = url.trim();

  // Ativos de sistema estáticos em public/images/ (ex.: hero_bg.jpg, about_portrait.jpg, proj01_01.jpg)
  if (cleanUrl.startsWith('/images/') && !cleanUrl.startsWith('/images/uploads/')) {
    return true;
  }

  return false;
}
