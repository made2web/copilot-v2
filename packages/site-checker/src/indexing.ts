import { searchSerper } from "./libs/serper-dev/index.js";
import type { SerperSearchResult } from "./libs/serper-dev/types.js";
import { cleanDomainName } from "./utils.js";

interface IndexCheckResult {
  isIndexed: boolean;
  totalResults: number;
  error?: string;
}

interface BrandRankingResult {
  isRankingFirst: boolean;
  position?: number;
  topResult?: {
    link: string;
  };
  error?: string;
}

interface FaviconCheckResult {
  isFaviconPresent: boolean;
  faviconUrl?: string;
  error?: string;
}

interface RobotsSitemapCheckResult {
  mentionsSitemap: boolean;
  error?: string;
}

/**
 * Verifica se um domínio está indexado no Google usando a API do Serper
 * @param domain - O domínio a ser verificado (ex: "example.com")
 * @returns Promise<IndexCheckResult> - Resultado da verificação
 */
export async function checkDomainIndexing(
  domain: string,
): Promise<IndexCheckResult> {
  try {
    // Limpa o domínio de protocolos e www se presentes
    const cleanDomain = cleanDomainName(domain);

    // Faz a busca usando o operador site: do Google
    const searchQuery = `site:${cleanDomain}`;
    const searchResult = await searchSerper({ q: searchQuery });

    // Verifica se há resultados orgânicos
    const hasResults =
      Array.isArray(searchResult.organic) && searchResult.organic.length > 0;

    return {
      isIndexed: hasResults,
      totalResults: searchResult.organic?.length || 0,
    };
  } catch (error) {
    console.error("Erro ao verificar indexação:", error);
    return {
      isIndexed: false,
      totalResults: 0,
      error:
        error instanceof Error
          ? error.message
          : "Erro desconhecido ao verificar indexação",
    };
  }
}

/**
 * Verifica se o domínio está ranking em primeiro lugar para sua marca
 * @param domain - O domínio a ser verificado (ex: "example.com")
 * @param brand - O nome da marca a ser pesquisada
 * @returns Promise<BrandRankingResult> - Resultado da verificação
 */
export async function checkBrandRanking(
  domain: string,
  brand: string,
): Promise<BrandRankingResult> {
  try {
    // Limpa o domínio de protocolos e www se presentes
    const cleanDomain = cleanDomainName(domain);

    // Faz a busca pelo nome da marca
    const searchResult = await searchSerper({ q: brand });

    // Verifica se há resultados orgânicos
    if (
      !Array.isArray(searchResult.organic) ||
      searchResult.organic.length === 0
    ) {
      return {
        isRankingFirst: false,
        error: "Nenhum resultado encontrado para a marca",
      };
    }

    // Encontra a posição do site nos resultados (se existir)
    const position =
      searchResult.organic.findIndex(
        (result: SerperSearchResult["organic"][0]) =>
          cleanDomainName(result.link).startsWith(cleanDomain),
      ) + 1; // +1 porque findIndex retorna índice baseado em 0

    return {
      isRankingFirst: position === 1,
      position: position || undefined,
      topResult:
        position === 1
          ? {
              link: searchResult.organic[0].link,
            }
          : undefined,
    };
  } catch (error) {
    console.error("Erro ao verificar ranking da marca:", error);
    return {
      isRankingFirst: false,
      error:
        error instanceof Error
          ? error.message
          : "Erro desconhecido ao verificar ranking da marca",
    };
  }
}

/**
 * Verifica se o favicon está presente no domínio
 * @param domain - O domínio a ser verificado (ex: "example.com")
 * @returns Promise<FaviconCheckResult> - Resultado da verificação
 */
export async function checkFavicon(domain: string): Promise<FaviconCheckResult> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const faviconUrl = `https://${cleanDomain}/favicon.ico`;

    const response = await fetch(faviconUrl, { method: 'HEAD' });

    return {
      isFaviconPresent: response.ok,
      faviconUrl: response.ok ? faviconUrl : undefined,
    };
  } catch (error) {
    console.error("Erro ao verificar favicon:", error);
    return {
      isFaviconPresent: false,
      error:
        error instanceof Error
          ? error.message
          : "Erro desconhecido ao verificar favicon",
    };
  }
}

/**
 * Verifica se o arquivo robots.txt menciona o sitemap.xml do site
 * @param domain - O domínio a ser verificado (ex: "example.com")
 * @returns Promise<RobotsSitemapCheckResult> - Resultado da verificação
 */
export async function checkRobotsForSitemap(domain: string): Promise<RobotsSitemapCheckResult> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const robotsUrl = `https://${cleanDomain}/robots.txt`;

    const response = await fetch(robotsUrl);
    if (!response.ok) {
      return {
        mentionsSitemap: false,
        error: `Failed to fetch robots.txt: ${response.status}`,
      };
    }

    const robotsContent = await response.text();
    const sitemapMentioned = robotsContent.includes("sitemap.xml");

    return {
      mentionsSitemap: sitemapMentioned,
    };
  } catch (error) {
    console.error("Erro ao verificar robots.txt:", error);
    return {
      mentionsSitemap: false,
      error:
        error instanceof Error
          ? error.message
          : "Erro desconhecido ao verificar robots.txt",
    };
  }
}

export async function getIndexedTestSubdomains(domain: string): Promise<string[]> {
  const testSubdomains = ['test', 'staging', 'dev'];
  const cleanDomain = cleanDomainName(domain);
  const indexedSubdomains: string[] = [];
  for (const sub of testSubdomains) {
    const subdomain = `${sub}.${cleanDomain}`;
    const result = await checkDomainIndexing(subdomain);
    if (result.isIndexed) {
      indexedSubdomains.push(subdomain);
    }
  }
  return indexedSubdomains;
}

// Exemplo de uso:
/*
const result = await checkDomainIndexing('example.com');
console.log(result);
// { isIndexed: true, totalResults: 42 }
// ou
// { isIndexed: false, totalResults: 0 }
*/