import { cleanDomainName } from "./utils";

interface CacheCheckResult {
  isCacheActive: boolean;
  cacheControlHeader?: string;
  error?: string;
}

interface GzipCheckResult {
  isGzipEnabled: boolean;
  contentEncodingHeader?: string;
  error?: string;
}

/**
 * Verifica se o cache está ativo no site usando uma requisição HEAD
 * @param domain - O domínio a ser verificado (ex: "made2web.com")
 * @returns Promise<CacheCheckResult> - Resultado da verificação
 */
export async function checkCacheActive(domain: string): Promise<CacheCheckResult> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const response = await fetch(`https://${cleanDomain}`, { method: 'HEAD' });
    const cacheControl = response.headers.get('Cache-Control');
    const isCacheActive = cacheControl !== null;
    return {
      isCacheActive,
      cacheControlHeader: cacheControl || undefined,
    };
  } catch (error) {
    console.error("Erro ao verificar cache:", error);
    return {
      isCacheActive: false,
      error: error instanceof Error ? error.message : "Erro desconhecido ao verificar cache",
    };
  }
}

/**
 * Verifica se o cache está desativado no site usando uma requisição HEAD
 * @param domain - O domínio a ser verificado (ex: "made2web.com")
 * @returns Promise<CacheCheckResult> - Resultado da verificação
 */
export async function checkCacheInactive(domain: string): Promise<CacheCheckResult> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const response = await fetch(`https://${cleanDomain}`, { method: 'HEAD' });
    const cacheControl = response.headers.get('Cache-Control');
    const isCacheActive = cacheControl !== null;
    return {
      isCacheActive: !isCacheActive,
      cacheControlHeader: cacheControl || undefined,
    };
  } catch (error) {
    console.error("Erro ao verificar cache:", error);
    return {
      isCacheActive: false,
      error: error instanceof Error ? error.message : "Erro desconhecido ao verificar cache",
    };
  }
}

/**
 * Checks if GZIP compression is enabled for domain
 * @param domain - Domain to check (ex: "made2web.com")
 * @returns Promise<GzipCheckResult> - Verification result
 */
export async function checkGzipEnabled(domain: string): Promise<GzipCheckResult> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const response = await fetch(`https://${cleanDomain}`, { method: 'HEAD' });
    const contentEncoding = response.headers.get('Content-Encoding');
    return {
      isGzipEnabled: contentEncoding?.includes('gzip') ?? false,
      contentEncodingHeader: contentEncoding || undefined
    };
  } catch (error) {
    return {
      isGzipEnabled: false,
      error: error instanceof Error ? error.message : "Unknown error checking GZIP"
    };
  }
}

/**
 * Checks if GZIP compression is NOT enabled for domain
 * @param domain - Domain to check (ex: "made2web.com")
 * @returns Promise<GzipCheckResult> - Verification result
 */
export async function checkGzipDisabled(domain: string): Promise<GzipCheckResult> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const response = await fetch(`https://${cleanDomain}`, { method: 'HEAD' });
    const contentEncoding = response.headers.get('Content-Encoding');
    return {
      isGzipEnabled: !contentEncoding?.includes('gzip') ?? false,
      contentEncodingHeader: contentEncoding || undefined
    };
  } catch (error) {
    return {
      isGzipEnabled: false,
      error: error instanceof Error ? error.message : "Unknown error checking GZIP"
    };
  }
}