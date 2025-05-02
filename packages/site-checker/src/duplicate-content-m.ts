import { isURL } from "./utils";
import { analyzeTextWithOpenAI } from "./utils-ai";

export interface DuplicateContentResult {
  url: string;
  hasDuplicateContent: boolean;
  similarityPercentage: number;
  comparedWith?: string;
  error?: string;
}

/**
 * Compara o conteúdo textual de duas páginas web e calcula a percentagem de similaridade
 * @param content1 - O conteúdo HTML da primeira página
 * @param content2 - O conteúdo HTML da segunda página
 * @returns Promise<number> - Percentagem de similaridade entre os conteúdos (0-100)
 */
export async function compareContentSimilarity(content1: string, content2: string): Promise<number> {
  try {
    // Extrair texto do HTML removendo tags e espaços em excesso
    const extractText = (html: string): string => {
      return html
        .replace(/<[^>]+>/g, ' ')
        .replace(/&#?[a-z0-9]+;/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    };

    const text1 = extractText(content1);
    const text2 = extractText(content2);

    // Para conteúdos pequenos, podemos usar uma comparação simples
    if (text1.length < 500 || text2.length < 500) {
      return calculateSimilarityPercentage(text1, text2);
    }

    // Para conteúdos maiores, usamos a OpenAI para análise mais sofisticada
    const prompt = `
    Analise os dois textos abaixo e calcule a percentagem de conteúdo duplicado ou muito similar entre eles. 
    Retorne apenas um número de 0 a 100 que representa a percentagem de similaridade.
    
    TEXTO 1:
    ${text1.substring(0, 2000)}
    
    TEXTO 2:
    ${text2.substring(0, 2000)}
    `;

    const result = await analyzeTextWithOpenAI({
      prompt,
      maxTokens: 100,
      temperature: 0.1,
    });

    // Extrair a percentagem da resposta do AI
    const percentageMatch = result.analysis.match(/\d+/);
    if (percentageMatch) {
      return parseInt(percentageMatch[0], 10);
    }

    // Fallback para método simples se a análise falhar
    return calculateSimilarityPercentage(text1, text2);
  } catch (error) {
    console.error("Erro ao comparar conteúdos:", error);
    // Fallback para método simples se a análise falhar
    const text1 = content1.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const text2 = content2.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    return calculateSimilarityPercentage(text1, text2);
  }
}

/**
 * Calcula uma percentagem de similaridade simples baseada em tokens de texto
 * @param text1 - Primeiro texto para comparação
 * @param text2 - Segundo texto para comparação
 * @returns number - Percentagem de similaridade (0-100)
 */
function calculateSimilarityPercentage(text1: string, text2: string): number {
  // Tokenizar os textos em palavras
  const tokens1 = text1.toLowerCase().split(/\s+/).filter(t => t.length > 3);
  const tokens2 = text2.toLowerCase().split(/\s+/).filter(t => t.length > 3);
  
  // Contar tokens comuns
  const commonTokens = tokens1.filter(token => tokens2.includes(token));
  
  // Calcular percentagem de similaridade
  const maxLength = Math.max(tokens1.length, tokens2.length);
  if (maxLength === 0) return 0;
  
  return Math.round((commonTokens.length / maxLength) * 100);
}

/**
 * Verifica se uma URL tem conteúdo duplicado em comparação com outras URLs
 * @param url - URL a ser verificada
 * @param compareUrls - Lista de URLs para comparar
 * @returns Promise<DuplicateContentResult> - Resultado da verificação
 */
export async function checkDuplicateContent(url: string, compareUrls: string[]): Promise<DuplicateContentResult> {
  try {
    if (!isURL(url)) {
      return {
        url,
        hasDuplicateContent: false,
        similarityPercentage: 0,
        error: "URL inválida"
      };
    }

    // Obter conteúdo da URL principal
    const mainResponse = await fetch(url);
    if (!mainResponse.ok) {
      return {
        url,
        hasDuplicateContent: false,
        similarityPercentage: 0,
        error: `Erro HTTP: ${mainResponse.status} ${mainResponse.statusText}`
      };
    }
    const mainContent = await mainResponse.text();

    // Verificar cada URL de comparação
    let highestSimilarity = 0;
    let mostSimilarUrl = "";

    for (const compareUrl of compareUrls) {
      if (compareUrl === url) continue; // Pular a mesma URL
      
      try {
        const compareResponse = await fetch(compareUrl);
        if (!compareResponse.ok) continue;
        
        const compareContent = await compareResponse.text();
        const similarity = await compareContentSimilarity(mainContent, compareContent);
        
        if (similarity > highestSimilarity) {
          highestSimilarity = similarity;
          mostSimilarUrl = compareUrl;
        }
      } catch (error) {
        console.warn(`Erro ao verificar URL ${compareUrl}:`, error);
        // Continuar com próxima URL
      }
    }

    return {
      url,
      hasDuplicateContent: highestSimilarity >= 65,
      similarityPercentage: highestSimilarity,
      comparedWith: highestSimilarity > 0 ? mostSimilarUrl : undefined
    };
  } catch (error) {
    return {
      url,
      hasDuplicateContent: false,
      similarityPercentage: 0,
      error: error instanceof Error ? error.message : "Erro desconhecido"
    };
  }
}

/**
 * Verifica múltiplas URLs para conteúdo duplicado
 * @param urls - Lista de URLs para verificar
 * @returns Promise<DuplicateContentResult[]> - Resultados para cada URL
 */
export async function checkMultipleUrlsForDuplicateContent(urls: string[]): Promise<DuplicateContentResult[]> {
  const results: DuplicateContentResult[] = [];
  
  for (const url of urls) {
    // Para cada URL, comparamos com todas as outras URLs
    const otherUrls = urls.filter(u => u !== url);
    const result = await checkDuplicateContent(url, otherUrls);
    results.push(result);
  }
  
  return results;
}
