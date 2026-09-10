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

export const MAX_IMAGE_SIZE_BYTES = 4.5 * 1024 * 1024; // 4.5 Megabytes (Limite de payload Vercel Serverless Functions)
export const MAX_IMAGE_SIZE_LABEL = '4.5MB';

/**
 * Validação no cliente antes de enviar o pedido HTTP pela rede.
 * Evita roundtrips e bloqueios de gateway (HTTP 413) no Vercel.
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

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
  if (file.type && !allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Formato de ficheiro não suportado. Por favor utilize JPG, PNG, WebP ou AVIF.',
    };
  }

  return { valid: true };
}

/**
 * Inspeciona os primeiros bytes do buffer e determina o formato real da imagem.
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

  // 5. GIF: GIF87a ou GIF89a (se suportado)
  if (
    b.length >= 6 &&
    b[0] === 0x47 && // G
    b[1] === 0x49 && // I
    b[2] === 0x46 && // F
    b[3] === 0x38 && // 8
    (b[4] === 0x37 || b[4] === 0x39) && // 7 ou 9
    b[5] === 0x61 // a
  ) {
    return {
      valid: true,
      mimeType: 'image/gif',
      extension: '.gif',
    };
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
