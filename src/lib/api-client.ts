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
        'A imagem excede o tamanho máximo permitido pelo servidor (máx. 4.5MB). Por favor redimensione ou comprima o ficheiro antes de carregar.'
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
