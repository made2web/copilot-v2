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

// Exemplo de uso:
/*
const result = await checkDomainIndexing('example.com');
console.log(result);
// { isIndexed: true, totalResults: 42 }
// ou
// { isIndexed: false, totalResults: 0 }
*/
