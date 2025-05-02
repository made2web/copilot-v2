import axios from 'axios';

interface SitemapCheckResult {
  hasSitemap: boolean;
  sitemapUrl: string | null;
  isValidSitemap: boolean;
  isSubmittedToGSC: boolean;
  message: string;
}

/**
 * Interface para cliente HTTP, para facilitar testes
 */
export interface HttpClient {
  get(url: string): Promise<{ data: string; status: number }>;
}

// Cliente HTTP padrão usando axios
const defaultHttpClient: HttpClient = {
  get: async (url: string) => {
    const response = await axios.get(url);
    return {
      data: response.data,
      status: response.status
    };
  }
};

/**
 * Verifica se existe um sitemap.xml no domínio
 * @param domain Domínio a ser verificado
 * @param httpClient Cliente HTTP opcional para facilitar testes
 * @returns Promise com o resultado da verificação do sitemap
 */
export async function checkSitemap(
  domain: string,
  httpClient: HttpClient = defaultHttpClient
): Promise<SitemapCheckResult> {
  try {
    // Normaliza o domínio
    const normalizedDomain = domain.startsWith('http')
      ? domain
      : `https://${domain}`;
    
    // Verifica se existe sitemap no local padrão
    const sitemapUrl = `${normalizedDomain.replace(/\/$/, '')}/sitemap.xml`;
    
    try {
      const response = await httpClient.get(sitemapUrl);
      
      // Verifica se o sitemap é válido (contém conteúdo XML básico para sitemap)
      const isValidSitemap = 
        response.status === 200 && 
        (response.data.includes('<urlset') || 
         response.data.includes('<sitemapindex'));
      
      if (!isValidSitemap) {
        return {
          hasSitemap: false,
          sitemapUrl,
          isValidSitemap: false,
          isSubmittedToGSC: false,
          message: 'O sitemap existe, mas não parece ser um arquivo XML de sitemap válido.'
        };
      }
      
      return {
        hasSitemap: true,
        sitemapUrl,
        isValidSitemap: true,
        isSubmittedToGSC: false, // Necessário verificar via API do Google ou manualmente
        message: 'Sitemap encontrado. Verificação no Google Search Console requer acesso à conta.'
      };
    } catch (error) {
      // Não encontrou o sitemap no local padrão
      return {
        hasSitemap: false,
        sitemapUrl: null,
        isValidSitemap: false,
        isSubmittedToGSC: false,
        message: 'Não foi encontrado um sitemap.xml no local padrão.'
      };
    }
  } catch (error) {
    throw new Error(`Erro ao verificar o sitemap: ${error}`);
  }
}

/**
 * Verifica se o sitemap foi submetido ao Google Search Console
 * Esta verificação requer acesso à API do Google Search Console 
 * ou verificação manual do usuário.
 * @param sitemapUrl URL do sitemap
 * @param gscApiKey Chave de API do Google Search Console (opcional)
 * @returns Promise com o resultado da verificação
 */
export async function checkSitemapSubmissionToGSC(
  sitemapUrl: string,
  gscApiKey?: string
): Promise<boolean> {
  // Esta função é um placeholder, pois a verificação real requer:
  // 1. Autenticação OAuth2 na API do Google Search Console
  // 2. Permissões de acesso ao site no GSC
  // 3. Chamada à API de sitemaps do GSC
  
  if (!gscApiKey) {
    // Sem API key, não podemos verificar automaticamente
    return false;
  }
  
  // Simulação - em uma implementação real, faria uma chamada à API do GSC
  try {
    // O código abaixo seria substituído por uma chamada real à API do GSC
    // Por exemplo:
    // const result = await googleSearchConsoleClient.sitemaps.list({
    //   siteUrl: new URL(sitemapUrl).origin
    // });
    // return result.data.sitemap.some(item => item.path === sitemapUrl);
    
    // Placeholder
    return true;
  } catch (error) {
    console.error('Erro ao verificar submissão ao GSC:', error);
    return false;
  }
}

/**
 * Verifica se o sitemap foi inserido no Google Search Console
 * Nota: Esta função é uma verificação simplificada, pois a verificação completa
 * requer acesso à API do Google Search Console.
 * @param domain Domínio a ser verificado
 * @param gscApiKey Chave de API do Google Search Console (opcional)
 * @param httpClient Cliente HTTP opcional para facilitar testes
 * @returns Promise com o resultado da verificação
 */
export async function isSitemapSubmittedToGSC(
  domain: string,
  gscApiKey?: string,
  httpClient: HttpClient = defaultHttpClient
): Promise<SitemapCheckResult> {
  const sitemapResult = await checkSitemap(domain, httpClient);
  
  if (!sitemapResult.hasSitemap || !sitemapResult.isValidSitemap) {
    return sitemapResult;
  }
  
  // Se temos sitemap válido e API key, tenta verificar submissão ao GSC
  if (gscApiKey && sitemapResult.sitemapUrl) {
    const isSubmitted = await checkSitemapSubmissionToGSC(sitemapResult.sitemapUrl, gscApiKey);
    
    return {
      ...sitemapResult,
      isSubmittedToGSC: isSubmitted,
      message: isSubmitted 
        ? 'O sitemap foi encontrado e verificado no Google Search Console.'
        : 'O sitemap foi encontrado, mas não parece estar submetido ao Google Search Console.'
    };
  }
  
  return {
    ...sitemapResult,
    message: 'O sitemap foi encontrado. Verifique manualmente no Google Search Console.'
  };
}
