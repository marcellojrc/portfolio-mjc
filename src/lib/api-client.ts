import { upload } from '@vercel/blob/client';
import { validateFileBeforeUpload } from './image-validation';
import { slugify } from './utils';

/**
 * Utilitário seguro para efetuar pedidos e parsing de respostas da API no CMS.
 * Garante que NUNCA é chamado `response.json()` de forma cega em respostas de texto simples ou HTML,
 * prevenindo o erro: SyntaxError: "Unexpected token 'R', 'Request Er'... is not valid JSON".
 */

export interface ApiResponse<T = any> {
  success?: boolean;
  error?: string;
  [key: string]: any;
}

/**
 * Faz o parsing seguro de uma resposta HTTP, inspecionando Content-Type e status code
 * antes de invocar `.json()` ou `.text()`.
 */
export async function parseApiResponse<T = any>(res: Response): Promise<T> {
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.toLowerCase().includes('application/json');

  if (!res.ok) {
    // 1. Se a resposta for JSON estruturado com mensagem de erro da nossa API
    if (isJson) {
      try {
        const errorData = await res.json();
        const msg = errorData?.error || errorData?.message || `Erro no pedido (HTTP ${res.status})`;
        throw new Error(msg);
      } catch (jsonErr: unknown) {
        // Se já for um Error instanciado acima com a mensagem do backend, propaga-lo
        if (jsonErr instanceof Error && !jsonErr.message.includes('JSON')) {
          throw jsonErr;
        }
      }
    }

    // 2. Se NÃO for JSON (ex.: texto simples ou HTML do Vercel/Proxy/Gateway)
    const rawText = await res.text().catch(() => '');
    const cleanText = rawText.trim();
    const lowerText = cleanText.toLowerCase();

    // 2.1. Erro 413 - Payload / Request Entity Too Large
    if (
      res.status === 413 ||
      lowerText.includes('entity too large') ||
      lowerText.includes('payload too large') ||
      lowerText.includes('function_payload_too_large')
    ) {
      throw new Error(
        'A imagem excede o tamanho máximo permitido pelo servidor (máx. 50MB). Por favor redimensione ou comprima o ficheiro antes de carregar.'
      );
    }

    // 2.2. Erro 408 / 504 - Timeout de rede ou gateway
    if (
      res.status === 408 ||
      res.status === 504 ||
      lowerText.includes('gateway timeout') ||
      lowerText.includes('request timeout')
    ) {
      throw new Error(
        'O envio da imagem expirou (timeout). A ligação à internet é lenta ou o ficheiro é muito pesado.'
      );
    }

    // 2.3. Erro 401 / 403 - Autenticação / Permissões
    if (res.status === 401 || res.status === 403) {
      throw new Error(
        'A sua sessão expirou ou não tem permissões de administrador. Por favor inicie sessão novamente.'
      );
    }

    // 2.4. Erro 429 - Rate Limit
    if (res.status === 429) {
      throw new Error('Demasiados pedidos efetuados. Aguarde um momento antes de tentar novamente.');
    }

    // 2.5. Outros erros 5xx de infraestrutura
    if (res.status >= 500) {
      throw new Error(
        'Ocorreu um erro no servidor ao processar o ficheiro. Tente novamente dentro de instantes.'
      );
    }

    // 2.6. Se for um texto simples curto e legível (não HTML)
    if (cleanText && !cleanText.startsWith('<') && cleanText.length <= 150) {
      throw new Error(cleanText);
    }

    throw new Error(`Erro na comunicação com o servidor (Código HTTP ${res.status}).`);
  }

  // Se a resposta for de sucesso (status 200..299):
  if (isJson) {
    try {
      return (await res.json()) as T;
    } catch {
      throw new Error('A resposta do servidor foi corrompida (formato JSON inválido).');
    }
  }

  // Caso incomum: status 2xx mas sem content-type application/json
  const rawText = await res.text().catch(() => '');
  throw new Error(
    `Resposta inesperada do servidor (esperado JSON, recebido ${contentType || 'formato desconhecido'}).`
  );
}

/**
 * Wrapper de fetch que garante parsing robusto e tipado de respostas JSON,
 * capturando falhas de gateway e erros não-JSON antes de qualquer SyntaxError.
 */
export async function safeFetchJson<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(input, init);
  return parseApiResponse<T>(res);
}

export interface DirectUploadOptions {
  projectId?: string;
  onProgress?: (percentage: number) => void;
}

export interface DirectUploadResult {
  url: string;
  pathname: string;
  size: number;
  contentType: string;
}

/**
 * Executa o Direct Client Upload para o Vercel Blob.
 *
 * 1. O ficheiro binário é transmitido DIRECTAMENTE do navegador para o Vercel Blob
 *    (sem passar pelo limite de 4.5MB da Serverless Function).
 * 2. Em produção: o Direct Client Upload é obrigatório. Se falhar, emite erro claro.
 * 3. Em desenvolvimento local offline: caso o Vercel Blob não esteja configurado,
 *    utiliza fallback para o disco local de modo a permitir desenvolvimento sem credenciais de nuvem.
 */
export async function uploadAssetDirectly(
  file: File,
  options?: DirectUploadOptions
): Promise<DirectUploadResult> {
  // 1. Validação prévia de arquivo no cliente (tamanho até 50MB, MIME real, ficheiro não vazio)
  const validation = validateFileBeforeUpload(file);
  if (!validation.valid) {
    throw new Error(validation.error || 'Ficheiro inválido.');
  }

  // Sanitizar o nome base para o pathname
  const rawName = file.name.replace(/\.[^/.]+$/, '');
  const cleanBase = slugify(rawName || 'upload');
  const dotIndex = file.name.lastIndexOf('.');
  const ext = dotIndex !== -1 ? file.name.slice(dotIndex).toLowerCase() : '.jpg';
  const pathname = `projects/${cleanBase}${ext}`;

  try {
    // 2. Direct Client Upload para o Vercel Blob com suporte a multipart
    const blob = await upload(pathname, file, {
      access: 'public',
      handleUploadUrl: '/api/admin/upload/token',
      clientPayload: JSON.stringify({ projectId: options?.projectId || null }),
      multipart: true,
      onUploadProgress: ({ percentage }) => {
        if (options?.onProgress) {
          options.onProgress(Math.round(percentage));
        }
      },
    });

    return {
      url: blob.url,
      pathname: blob.pathname,
      size: file.size,
      contentType: blob.contentType || file.type,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);

    // Se for erro de permissões ou autorização, propagar sem tentar fallback
    if (errorMsg.includes('Não autenticado') || errorMsg.includes('Acesso negado')) {
      throw err;
    }

    // Regra 5: Fallback para disco local APENAS em desenvolvimento local se o Vercel Blob não estiver configurado
    const isLocalDev =
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    if (isLocalDev && errorMsg.includes('BLOB_NOT_CONFIGURED_LOCAL')) {
      console.warn('Vercel Blob ausente em ambiente local. A utilizar armazenamento em disco local.');
      const formData = new FormData();
      formData.append('file', file);

      const localData = await safeFetchJson<{
        success: boolean;
        url: string;
        filename?: string;
        error?: string;
      }>('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!localData.success || !localData.url) {
        throw new Error(localData.error || 'Falha no upload local.');
      }

      if (options?.onProgress) {
        options.onProgress(100);
      }

      return {
        url: localData.url,
        pathname: localData.filename || file.name,
        size: file.size,
        contentType: file.type,
      };
    }

    // Regra 4: Em produção, Direct Client Upload é estritamente obrigatório
    throw new Error(`Falha no upload direto para o Vercel Blob: ${errorMsg}`);
  }
}
