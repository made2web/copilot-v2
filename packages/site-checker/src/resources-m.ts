import axios from 'axios';

interface ResourceInfo {
  url: string;
  type: 'css' | 'js';
  size: number;
  isAsync: boolean;
  isDefer: boolean;
  isInline: boolean;
}

export interface OptimizableResourcesResult {
  optimizableResources: ResourceInfo[];
  totalCssSize: number;
  totalJsSize: number;
  hasIssues: boolean;
}

// Interface para o cliente HTTP, para facilitar testes
export interface HttpClient {
  get(url: string): Promise<{ data: string }>;
}

// Cliente HTTP padrão usando axios
const defaultHttpClient: HttpClient = {
  get: async (url: string) => axios.get(url)
};

/**
 * Extrai URLs de arquivos CSS do HTML usando expressões regulares
 */
function extractCssUrls(html: string): string[] {
  const regex = /<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi;
  const urls: string[] = [];
  let match;
  
  while ((match = regex.exec(html)) !== null) {
    if (match[1]) {
      urls.push(match[1]);
    }
  }
  
  return urls;
}

/**
 * Extrai informações de scripts do HTML usando expressões regulares
 */
function extractScriptInfo(html: string): { src?: string; content?: string; isAsync: boolean; isDefer: boolean }[] {
  const scriptInfos: { src?: string; content?: string; isAsync: boolean; isDefer: boolean }[] = [];
  
  // Scripts com src
  const externalScriptRegex = /<script[^>]*src=["']([^"']+)["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  
  while ((match = externalScriptRegex.exec(html)) !== null) {
    const scriptTag = match[0];
    const src = match[1];
    const isAsync = scriptTag.includes('async');
    const isDefer = scriptTag.includes('defer');
    
    scriptInfos.push({
      src,
      isAsync,
      isDefer
    });
  }
  
  // Scripts inline (sem src)
  const inlineScriptRegex = /<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi;
  
  while ((match = inlineScriptRegex.exec(html)) !== null) {
    const content = match[1];
    
    if (content && content.trim()) {
      scriptInfos.push({
        content,
        isAsync: false,
        isDefer: false
      });
    }
  }
  
  return scriptInfos;
}

/**
 * Verifica arquivos CSS e JS que podem ser reduzidos ou adiados
 * @param html Conteúdo HTML da página
 * @param baseUrl URL base do site
 * @param httpClient Cliente HTTP opcional para fazer requisições (facilita testes)
 * @returns Informações sobre recursos que podem ser otimizados
 */
export async function checkOptimizableResources(
  html: string, 
  baseUrl: string,
  httpClient: HttpClient = defaultHttpClient
): Promise<OptimizableResourcesResult> {
  const optimizableResources: ResourceInfo[] = [];
  let totalCssSize = 0;
  let totalJsSize = 0;
  
  try {
    // Processar arquivos CSS
    const cssUrls = extractCssUrls(html);
    for (const cssRelativePath of cssUrls) {
      try {
        const cssUrl = new URL(cssRelativePath, baseUrl).toString();
        const cssResponse = await httpClient.get(cssUrl);
        const size = cssResponse.data.length;
        totalCssSize += size;
        
        // CSS grande é candidato a otimização
        if (size > 20000) {
          optimizableResources.push({
            url: cssUrl,
            type: 'css',
            size,
            isAsync: false,
            isDefer: false,
            isInline: false
          });
        }
      } catch (error) {
        console.error(`Erro ao acessar CSS: ${cssRelativePath}`, error);
      }
    }
    
    // Processar scripts
    const scriptInfos = extractScriptInfo(html);
    for (const scriptInfo of scriptInfos) {
      if (scriptInfo.src) {
        // Script externo
        try {
          const scriptUrl = new URL(scriptInfo.src, baseUrl).toString();
          const scriptResponse = await httpClient.get(scriptUrl);
          const size = scriptResponse.data.length;
          totalJsSize += size;
          
          // Scripts grandes sem async/defer são candidatos a otimização
          if (size > 30000 && !scriptInfo.isAsync && !scriptInfo.isDefer) {
            optimizableResources.push({
              url: scriptUrl,
              type: 'js',
              size,
              isAsync: scriptInfo.isAsync,
              isDefer: scriptInfo.isDefer,
              isInline: false
            });
          }
        } catch (error) {
          console.error(`Erro ao acessar script: ${scriptInfo.src}`, error);
        }
      } else if (scriptInfo.content) {
        // Script inline
        const size = scriptInfo.content.length;
        totalJsSize += size;
        
        // Scripts inline grandes são candidatos a otimização
        if (size > 20000) {
          optimizableResources.push({
            url: `${baseUrl}#inline-script`,
            type: 'js',
            size,
            isAsync: false,
            isDefer: false,
            isInline: true
          });
        }
      }
    }
    
    return {
      optimizableResources,
      totalCssSize,
      totalJsSize,
      hasIssues: optimizableResources.length > 0
    };
  } catch (error) {
    throw new Error(`Erro ao verificar recursos otimizáveis: ${error}`);
  }
}

/**
 * Analisa HTML e identifica os recursos que podem ser otimizados
 * @param url URL da página a ser analisada
 * @param httpClient Cliente HTTP opcional para fazer requisições (facilita testes)
 * @returns Resultado com recursos otimizáveis
 */
export async function analyzePageResources(
  url: string,
  httpClient: HttpClient = defaultHttpClient
): Promise<OptimizableResourcesResult> {
  try {
    const response = await httpClient.get(url);
    const html = response.data;
    return checkOptimizableResources(html, url, httpClient);
  } catch (error) {
    throw new Error(`Erro ao analisar recursos da página: ${error}`);
  }
}
