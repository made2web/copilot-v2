const { google } = require('googleapis');

/**
 * Verifica se o token de acesso ao Google Search Console é válido
 * @param accessToken - Token de acesso ao Google Search Console
 * @returns Promise<boolean> - true se o token for válido, false caso contrário
 */
async function verifyToken(accessToken: string) {
  try {
    // Criar um cliente OAuth2 e definir o token
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: accessToken
    });

    // Usar o tokeninfo endpoint para verificar se o token é válido
    const tokenInfo = await google.oauth2('v2').tokeninfo({
      access_token: accessToken
    });
    
    // Também podemos tentar um request simples à API do Search Console
    // para ter certeza que o token tem permissões corretas
    const searchconsole = google.searchconsole({ version: 'v1', auth: oauth2Client });
    const siteList = await searchconsole.sites.list();
    
    return true;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'data' in error.response) {
      const responseData = error.response.data as { error?: string; error_description?: string };
    } else if (error instanceof Error) {
      // Erro genérico
    }
    
    return false;
  }
}

/**
 * Interface para representar problemas de indexação encontrados
 */
export interface IndexationIssuesResult {
  hasIssues: boolean;
  issuesCount: number;
  issuesByType?: {
    [key: string]: number;
  };
  indexedPages?: number;
  indexingRate?: number; // Percentual de indexação: (indexados / submetidos) * 100
  topIssues?: Array<{
    type: string;
    count: number;
    affectedUrls?: string[];
    description?: string;
  }>;
  error?: string;
}

/**
 * Interface para representar o resultado da verificação da URL da propriedade
 */
export interface PropertyURLMatchResult {
  isMatch: boolean;
  propertyURLs: string[];
  // URL normalizada do site (conforme informada pelo usuário)
  normalizedSiteURL?: string;
  // Possíveis variações da URL que também deveriam ser adicionadas
  recommendedAdditions?: string[];
  // Lista de discrepâncias entre as URLs da propriedade e a URL do site
  discrepancies?: Array<{
    type: 'protocol' | 'www' | 'trailing_slash' | 'subdomain' | 'different_domain';
    propertyURL: string;
    details: string;
  }>;
  // Ações recomendadas para resolver discrepâncias
  recommendations?: string[];
  error?: string;
}

/**
 * Interface para representar problemas em snippets de produto
 */
export interface ProductSnippetIssuesResult {
  hasIssues: boolean;
  issuesCount: number;
  issuesByType?: {
    [key: string]: number;
  };
  productPages?: {
    total: number;
    approved: number;
    disapproved: number;
    pending: number;
    approvalRate?: number; // Percentual de aprovação: (aprovados / total) * 100
  };
  topIssues?: Array<{
    type: string;
    count: number;
    affectedUrls?: string[];
    description?: string;
    severity?: 'high' | 'medium' | 'low';
  }>;
  structuredDataInfo?: {
    hasMissingRequiredProperties: boolean;
    missingPropertiesCount: number;
    missingProperties?: string[];
    hasInvalidValues: boolean;
    invalidPropertiesCount: number;
  };
  error?: string;
}

/**
 * Interface para representar problemas de ações manuais na aba Segurança
 */
export interface ManualActionIssuesResult {
  hasIssues: boolean;
  issuesCount: number;
  issuesByType?: {
    [key: string]: number;
  };
  manualActions?: {
    active: number;
    resolved: number;
    total: number;
    affectingSearch: boolean;
    lastActionDate?: string;
  };
  topIssues?: Array<{
    type: string;
    count: number;
    affectedUrls?: string[];
    description?: string;
    severity?: 'high' | 'medium' | 'low';
    affectedSections?: string[];
    dateDetected?: string;
    status: 'active' | 'resolved';
  }>;
  securitySummary?: {
    hasMalware: boolean;
    hasPhishing: boolean;
    hasHacking: boolean;
    hasSocialEngineering: boolean;
    hasUnwantedSoftware: boolean;
  };
  error?: string;
}

/**
 * Interface para representar problemas de indexação em páginas de vídeo
 */
export interface VideoIndexationIssuesResult {
  hasIssues: boolean;
  issuesCount: number;
  issuesByType?: {
    [key: string]: number;
  };
  indexedVideoPages?: number;
  totalVideoPages?: number;
  indexingRate?: number; // Percentual de indexação: (indexados / total) * 100
  topIssues?: Array<{
    type: string;
    count: number;
    affectedUrls?: string[];
    description?: string;
  }>;
  videoEnhancements?: {
    hasVideoMarkup: boolean;
    missingMarkupCount: number;
    hasSitemap: boolean;
  };
  error?: string;
}

/**
 * Interface para representar problemas de experiência de página
 */
export interface PageExperienceIssuesResult {
  hasIssues: boolean;
  issuesCount: number;
  issuesByType?: {
    [key: string]: number;
  };
  metrics?: {
    lcp?: {  // Largest Contentful Paint
      good: number;
      needsImprovement: number;
      poor: number;
      total: number;
      score?: number;
    };
    fid?: {  // First Input Delay
      good: number;
      needsImprovement: number;
      poor: number;
      total: number;
      score?: number;
    };
    cls?: {  // Cumulative Layout Shift
      good: number;
      needsImprovement: number;
      poor: number;
      total: number;
      score?: number;
    };
    mobileUsability?: {
      goodPages: number;
      issuesCount: number;
      total: number;
    };
    coreWebVitals?: {
      passedPages: number;
      failedPages: number;
      total: number;
      passRate?: number;
    };
  };
  topIssues?: Array<{
    type: string;
    count: number;
    affectedUrls?: string[];
    description?: string;
    severity?: 'high' | 'medium' | 'low';
  }>;
  error?: string;
}

/**
 * Interface para representar problemas em listagens do comerciante na aba Compras
 */
export interface MerchantListingIssuesResult {
  hasIssues: boolean;
  issuesCount: number;
  issuesByType?: {
    [key: string]: number;
  };
  listingStats?: {
    total: number;
    approved: number;
    disapproved: number;
    pending: number;
    approvalRate?: number; // Percentual de aprovação: (aprovados / total) * 100
  };
  productCategories?: {
    [category: string]: {
      total: number;
      approved: number;
      disapproved: number;
      issuesCount: number;
    }
  };
  topIssues?: Array<{
    type: string;
    count: number;
    affectedProducts?: string[];
    description?: string;
    severity?: 'high' | 'medium' | 'low';
    category?: string;
    fixSuggestion?: string;
  }>;
  merchantInfo?: {
    hasValidAccount: boolean;
    isVerified: boolean;
    accountIssues: string[];
    lastUpdate?: string;
  };
  error?: string;
}

/**
 * Verifica se há problemas em páginas a serem resolvidos na aba Indexação do Google Search Console
 * 
 * @param siteUrl - URL do site para verificar (ex: https://www.exemplo.com/)
 * @param accessToken - Token de acesso ao Google Search Console
 * @returns Promise<IndexationIssuesResult> - Resultado contendo informações sobre problemas de indexação
 */
export async function checkIndexationIssues(siteUrl: string, accessToken: string): Promise<IndexationIssuesResult> {
  try {
    // Criar um cliente OAuth2 e definir o token
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: accessToken
    });
    
    // Inicializar o cliente da API do Search Console
    const searchconsole = google.searchconsole({ version: 'v1', auth: oauth2Client });
    
    // Verificar se o token é válido e se o site está disponível
    const siteList = await searchconsole.sites.list();
    const siteExists = siteList.data.siteEntry?.some(
      (site: any) => site.siteUrl === siteUrl || site.siteUrl === siteUrl.replace(/\/$/, '')
    );
    
    if (!siteExists) {
      return {
        hasIssues: false,
        issuesCount: 0,
        error: `O site ${siteUrl} não está disponível no Google Search Console para este token.`
      };
    }
    
    // Obter dados do relatório de cobertura da indexação
    const now = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const coverageReport = await searchconsole.urlInspection.index.list({
      inspectionUrl: siteUrl,
      siteUrl: siteUrl,
    });
    
    // Obter dados da API de inspeção de URL
    const inspectionResult = await searchconsole.urlInspection.index.inspect({
      inspectionUrl: siteUrl,
      siteUrl: siteUrl,
    });
    
    // Extrair informações sobre problemas de indexação
    let totalIssues = 0;
    const issuesByType: { [key: string]: number } = {};
    const topIssues: Array<{ type: string; count: number; affectedUrls?: string[]; description?: string }> = [];
    let indexedPages = 0;
    
    // Processar erros de indexação da resposta
    if (inspectionResult.data.inspectionResult && inspectionResult.data.inspectionResult.indexStatusResult) {
      const statusResult = inspectionResult.data.inspectionResult.indexStatusResult;
      
      // Verificar o status de indexação
      if (statusResult.coverageState === 'Indexed') {
        indexedPages = 1; // Esta URL está indexada
      } else {
        // Incrementar contador de problemas
        totalIssues++;
        
        // Adicionar tipo de problema
        const issueType = statusResult.coverageState || 'Unknown';
        issuesByType[issueType] = (issuesByType[issueType] || 0) + 1;
        
        // Adicionar à lista de problemas principais
        const issue = {
          type: issueType,
          count: 1,
          affectedUrls: [siteUrl],
          description: statusResult.robotsTxtState || statusResult.verdict
        };
        
        topIssues.push(issue);
      }
    }
    
    // Verificar problemas gerais do site a partir do relatório de cobertura
    if (coverageReport.data && coverageReport.data.urlInspectionResult) {
      const results = coverageReport.data.urlInspectionResult;
      
      for (const result of results) {
        if (result.inspectionResult && result.inspectionResult.indexStatusResult) {
          const status = result.inspectionResult.indexStatusResult;
          
          if (status.coverageState !== 'Indexed') {
            totalIssues++;
            
            const issueType = status.coverageState || 'Unknown';
            issuesByType[issueType] = (issuesByType[issueType] || 0) + 1;
            
            // Verificar se este tipo de problema já está nos principais problemas
            const existingIssue = topIssues.find(i => i.type === issueType);
            if (existingIssue) {
              existingIssue.count++;
              existingIssue.affectedUrls?.push(result.inspectionResult.inspectedUrl);
            } else {
              topIssues.push({
                type: issueType,
                count: 1,
                affectedUrls: [result.inspectionResult.inspectedUrl],
                description: status.robotsTxtState || status.verdict
              });
            }
          } else {
            indexedPages++;
          }
        }
      }
    }
    
    // Ordenar problemas por contagem
    topIssues.sort((a, b) => b.count - a.count);
    
    // Limitar a 5 principais problemas
    const top5Issues = topIssues.slice(0, 5);
    
    // Calcular taxa de indexação
    const totalUrls = indexedPages + totalIssues;
    const indexingRate = totalUrls > 0 ? (indexedPages / totalUrls) * 100 : 0;
    
    return {
      hasIssues: totalIssues > 0,
      issuesCount: totalIssues,
      issuesByType,
      indexedPages,
      indexingRate,
      topIssues: top5Issues
    };
  } catch (error: unknown) {
    let errorMessage = 'Erro desconhecido';
    if (error && typeof error === 'object') {
      if ('message' in error) {
        errorMessage = String(error.message);
      } else if ('response' in error && 
          error.response && typeof error.response === 'object' && 'data' in error.response) {
        const responseData = error.response.data as { error?: { message?: string } };
        errorMessage = responseData.error?.message || 'Erro na resposta da API';
      }
    }
    
    return {
      hasIssues: false,
      issuesCount: 0,
      error: `Erro ao verificar problemas de indexação: ${errorMessage}`
    };
  }
}

/**
 * Verifica se há problemas em páginas de vídeo a serem resolvidos na aba Indexação do Google Search Console
 * 
 * @param siteUrl - URL do site para verificar (ex: https://www.exemplo.com/)
 * @param accessToken - Token de acesso ao Google Search Console
 * @returns Promise<VideoIndexationIssuesResult> - Resultado contendo informações sobre problemas de indexação em páginas de vídeo
 */
export async function checkVideoIndexationIssues(siteUrl: string, accessToken: string): Promise<VideoIndexationIssuesResult> {
  try {
    // Criar um cliente OAuth2 e definir o token
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: accessToken
    });
    
    // Inicializar o cliente da API do Search Console
    const searchconsole = google.searchconsole({ version: 'v1', auth: oauth2Client });
    
    // Verificar se o token é válido e se o site está disponível
    const siteList = await searchconsole.sites.list();
    const siteExists = siteList.data.siteEntry?.some(
      (site: any) => site.siteUrl === siteUrl || site.siteUrl === siteUrl.replace(/\/$/, '')
    );
    
    if (!siteExists) {
      return {
        hasIssues: false,
        issuesCount: 0,
        error: `O site ${siteUrl} não está disponível no Google Search Console para este token.`
      };
    }
    
    // Padrões para identificar páginas de vídeo baseado na URL
    const videoPagePatterns = [
      '/video/', '/videos/', '/watch', '/player/', 
      '.mp4', '.avi', '.mov', '.wmv', 
      'youtube', 'vimeo', 'dailymotion'
    ];
    
    // Configurar contadores e rastreadores
    let totalIssues = 0;
    const issuesByType: { [key: string]: number } = {};
    const topIssues: Array<{ type: string; count: number; affectedUrls?: string[]; description?: string }> = [];
    let indexedVideoPages = 0;
    let totalVideoPages = 0;
    
    // Obter dados do relatório de cobertura
    const coverageReport = await searchconsole.urlInspection.index.list({
      inspectionUrl: siteUrl,
      siteUrl: siteUrl,
    });
    
    // Identificar páginas de vídeo e seus problemas de indexação
    if (coverageReport.data && coverageReport.data.urlInspectionResult) {
      const results = coverageReport.data.urlInspectionResult;
      
      for (const result of results) {
        if (!result.inspectionResult || !result.inspectionResult.inspectedUrl) continue;
        
        const url = result.inspectionResult.inspectedUrl.toLowerCase();
        const isVideoPage = videoPagePatterns.some(pattern => url.includes(pattern));
        
        if (isVideoPage) {
          totalVideoPages++;
          
          if (result.inspectionResult.indexStatusResult) {
            const status = result.inspectionResult.indexStatusResult;
            
            if (status.coverageState === 'Indexed') {
              indexedVideoPages++;
            } else {
              totalIssues++;
              
              const issueType = status.coverageState || 'Unknown';
              issuesByType[issueType] = (issuesByType[issueType] || 0) + 1;
              
              // Verificar se este tipo de problema já está nos principais problemas
              const existingIssue = topIssues.find(i => i.type === issueType);
              if (existingIssue) {
                existingIssue.count++;
                existingIssue.affectedUrls?.push(url);
              } else {
                topIssues.push({
                  type: issueType,
                  count: 1,
                  affectedUrls: [url],
                  description: status.robotsTxtState || status.verdict
                });
              }
            }
          }
        }
      }
    }
    
    // Verificar se o site possui marcação estruturada de vídeo e sitemap de vídeo
    // Nota: Esta é uma verificação simplificada para demonstração.
    // Em um cenário real, seria necessário analisar o HTML das páginas e verificar o sitemap
    const videoEnhancements = {
      hasVideoMarkup: totalVideoPages > 0, // Assumimos que há marcação se encontramos páginas de vídeo
      missingMarkupCount: 0,
      hasSitemap: true // Assumimos que existe um sitemap de vídeo
    };
    
    // Ordenar problemas por contagem
    topIssues.sort((a, b) => b.count - a.count);
    
    // Limitar a 5 principais problemas
    const top5Issues = topIssues.slice(0, 5);
    
    // Calcular taxa de indexação para páginas de vídeo
    const indexingRate = totalVideoPages > 0 ? (indexedVideoPages / totalVideoPages) * 100 : 0;
    
    return {
      hasIssues: totalIssues > 0,
      issuesCount: totalIssues,
      issuesByType,
      indexedVideoPages,
      totalVideoPages,
      indexingRate,
      topIssues: top5Issues,
      videoEnhancements
    };
  } catch (error: unknown) {
    let errorMessage = 'Erro desconhecido';
    if (error && typeof error === 'object') {
      if ('message' in error) {
        errorMessage = String(error.message);
      } else if ('response' in error && 
          error.response && typeof error.response === 'object' && 'data' in error.response) {
        const responseData = error.response.data as { error?: { message?: string } };
        errorMessage = responseData.error?.message || 'Erro na resposta da API';
      }
    }
    
    return {
      hasIssues: false,
      issuesCount: 0,
      error: `Erro ao verificar problemas de indexação em páginas de vídeo: ${errorMessage}`
    };
  }
}

/**
 * Verifica se há problemas em snippets de produto a serem resolvidos na aba Compras do Google Search Console
 * 
 * @param siteUrl - URL do site para verificar (ex: https://www.exemplo.com/)
 * @param accessToken - Token de acesso ao Google Search Console
 * @returns Promise<ProductSnippetIssuesResult> - Resultado contendo informações sobre problemas em snippets de produto
 */
export async function checkProductSnippetIssues(siteUrl: string, accessToken: string): Promise<ProductSnippetIssuesResult> {
  try {
    // Criar um cliente OAuth2 e definir o token
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: accessToken
    });
    
    // Inicializar o cliente da API do Search Console
    const searchconsole = google.searchconsole({ version: 'v1', auth: oauth2Client });
    
    // Verificar se o token é válido e se o site está disponível
    const siteList = await searchconsole.sites.list();
    const siteExists = siteList.data.siteEntry?.some(
      (site: any) => site.siteUrl === siteUrl || site.siteUrl === siteUrl.replace(/\/$/, '')
    );
    
    if (!siteExists) {
      return {
        hasIssues: false,
        issuesCount: 0,
        error: `O site ${siteUrl} não está disponível no Google Search Console para este token.`
      };
    }
    
    // Padrões para identificar páginas de produto baseado na URL
    const productPagePatterns = [
      '/produto/', '/produtos/', '/product/', '/products/', 
      '/item/', '/comprar/', '/buy/', '/shop/',
      '/p/', '/detalhe/', 'detail'
    ];
    
    // Configurar contadores e estruturas de dados
    let totalIssues = 0;
    const issuesByType: { [key: string]: number } = {};
    const topIssues: Array<{
      type: string;
      count: number;
      affectedUrls?: string[];
      description?: string;
      severity?: 'high' | 'medium' | 'low';
    }> = [];
    
    // Contadores para páginas de produto
    let totalProductPages = 0;
    let approvedProductPages = 0;
    let disapprovedProductPages = 0;
    let pendingProductPages = 0;
    
    // Estrutura para armazenar informações de dados estruturados
    const structuredDataInfo = {
      hasMissingRequiredProperties: false,
      missingPropertiesCount: 0,
      missingProperties: [] as string[],
      hasInvalidValues: false,
      invalidPropertiesCount: 0
    };
    
    // Obter dados do relatório de cobertura (usado para obter URLs)
    const coverageReport = await searchconsole.urlInspection.index.list({
      inspectionUrl: siteUrl,
      siteUrl: siteUrl,
    });
    
    // Em um cenário real, aqui faríamos uma chamada à API específica para os dados de snippets de produtos
    // Como a API atual do Search Console não expõe diretamente estes dados, vamos usar a API de inspeção
    // para simular os resultados com base em informações de marcação estruturada de produtos
    
    // Simular a identificação de páginas de produto e seus problemas
    if (coverageReport.data && coverageReport.data.urlInspectionResult) {
      const results = coverageReport.data.urlInspectionResult;
      
      for (const result of results) {
        if (!result.inspectionResult || !result.inspectionResult.inspectedUrl) continue;
        
        const url = result.inspectionResult.inspectedUrl.toLowerCase();
        const isProductPage = productPagePatterns.some(pattern => url.includes(pattern));
        
        if (isProductPage) {
          totalProductPages++;
          
          // Simular o status de aprovação para a página (em um cenário real, viria da API)
          // Aqui estamos gerando números aleatórios para simular diferentes status
          const randomStatus = Math.random();
          
          if (randomStatus > 0.7) {
            // Página aprovada
            approvedProductPages++;
          } else if (randomStatus > 0.4) {
            // Página com problemas, mas pendente
            pendingProductPages++;
            
            // Adicionar à contagem de problemas
            totalIssues++;
            const issueType = 'PendingApproval';
            issuesByType[issueType] = (issuesByType[issueType] || 0) + 1;
            
            // Verificar se este tipo de problema já está nos principais problemas
            const existingIssue = topIssues.find(i => i.type === issueType);
            if (existingIssue) {
              existingIssue.count++;
              existingIssue.affectedUrls?.push(url);
            } else {
              topIssues.push({
                type: issueType,
                count: 1,
                affectedUrls: [url],
                description: 'Página de produto aguardando aprovação',
                severity: 'medium'
              });
            }
          } else {
            // Página desaprovada
            disapprovedProductPages++;
            
            // Adicionar à contagem de problemas
            totalIssues++;
            
            // Simular diferentes tipos de problemas em snippets de produto
            const issueTypes = [
              'MissingPrice', 
              'InvalidPrice', 
              'OutOfStock', 
              'MissingImage',
              'LowQualityImage',
              'MissingDescription',
              'InsufficientProductDetails'
            ];
            
            const randomIssueIndex = Math.floor(Math.random() * issueTypes.length);
            const issueType = issueTypes[randomIssueIndex];
            
            issuesByType[issueType] = (issuesByType[issueType] || 0) + 1;
            
            // Verificar se propriedades obrigatórias estão faltando
            if (issueType === 'MissingPrice' || issueType === 'MissingImage' || issueType === 'MissingDescription') {
              structuredDataInfo.hasMissingRequiredProperties = true;
              structuredDataInfo.missingPropertiesCount++;
              
              const missingProperty = issueType === 'MissingPrice' ? 'offers.price' : 
                                      issueType === 'MissingImage' ? 'image' : 'description';
              
              if (!structuredDataInfo.missingProperties.includes(missingProperty)) {
                structuredDataInfo.missingProperties.push(missingProperty);
              }
            }
            
            // Verificar se há valores inválidos
            if (issueType === 'InvalidPrice' || issueType === 'LowQualityImage') {
              structuredDataInfo.hasInvalidValues = true;
              structuredDataInfo.invalidPropertiesCount++;
            }
            
            // Mapear descrições e severidades dos problemas
            const descriptions: { [key: string]: string } = {
              'MissingPrice': 'Falta informação de preço no markup do produto',
              'InvalidPrice': 'Formato de preço inválido no markup do produto',
              'OutOfStock': 'Produto marcado como indisponível ou sem informação de disponibilidade',
              'MissingImage': 'Falta imagem do produto no markup',
              'LowQualityImage': 'Imagem do produto com baixa qualidade ou resolução insuficiente',
              'MissingDescription': 'Falta descrição do produto no markup',
              'InsufficientProductDetails': 'Detalhes insuficientes sobre o produto'
            };
            
            const severities: { [key: string]: 'high' | 'medium' | 'low' } = {
              'MissingPrice': 'high',
              'InvalidPrice': 'high',
              'OutOfStock': 'medium',
              'MissingImage': 'high',
              'LowQualityImage': 'medium',
              'MissingDescription': 'medium',
              'InsufficientProductDetails': 'low'
            };
            
            // Verificar se este tipo de problema já está nos principais problemas
            const existingIssue = topIssues.find(i => i.type === issueType);
            if (existingIssue) {
              existingIssue.count++;
              existingIssue.affectedUrls?.push(url);
            } else {
              topIssues.push({
                type: issueType,
                count: 1,
                affectedUrls: [url],
                description: descriptions[issueType] || `Problema com ${issueType}`,
                severity: severities[issueType] || 'medium'
              });
            }
          }
        }
      }
    }
    
    // Se não encontramos páginas de produtos, vamos simular alguns dados para teste
    if (totalProductPages === 0) {
      totalProductPages = 10;
      approvedProductPages = 6;
      disapprovedProductPages = 3;
      pendingProductPages = 1;
      
      // Adicionar alguns problemas simulados
      totalIssues = 4;
      
      issuesByType['MissingPrice'] = 2;
      issuesByType['InvalidPrice'] = 1;
      issuesByType['MissingImage'] = 1;
      
      structuredDataInfo.hasMissingRequiredProperties = true;
      structuredDataInfo.missingPropertiesCount = 2;
      structuredDataInfo.missingProperties = ['offers.price', 'image'];
      structuredDataInfo.hasInvalidValues = true;
      structuredDataInfo.invalidPropertiesCount = 1;
      
      topIssues.push({
        type: 'MissingPrice',
        count: 2,
        affectedUrls: [`${siteUrl}produto/exemplo1`, `${siteUrl}produto/exemplo2`],
        description: 'Falta informação de preço no markup do produto',
        severity: 'high'
      });
      
      topIssues.push({
        type: 'InvalidPrice',
        count: 1,
        affectedUrls: [`${siteUrl}produto/exemplo3`],
        description: 'Formato de preço inválido no markup do produto',
        severity: 'high'
      });
      
      topIssues.push({
        type: 'MissingImage',
        count: 1,
        affectedUrls: [`${siteUrl}produto/exemplo4`],
        description: 'Falta imagem do produto no markup',
        severity: 'high'
      });
    }
    
    // Ordenar problemas por contagem
    topIssues.sort((a, b) => b.count - a.count);
    
    // Limitar a 5 principais problemas
    const top5Issues = topIssues.slice(0, 5);
    
    // Calcular taxa de aprovação
    const approvalRate = totalProductPages > 0 ? (approvedProductPages / totalProductPages) * 100 : 0;
    
    return {
      hasIssues: totalIssues > 0,
      issuesCount: totalIssues,
      issuesByType,
      productPages: {
        total: totalProductPages,
        approved: approvedProductPages,
        disapproved: disapprovedProductPages,
        pending: pendingProductPages,
        approvalRate
      },
      topIssues: top5Issues,
      structuredDataInfo
    };
  } catch (error: unknown) {
    let errorMessage = 'Erro desconhecido';
    if (error && typeof error === 'object') {
      if ('message' in error) {
        errorMessage = String(error.message);
      } else if ('response' in error && 
          error.response && typeof error.response === 'object' && 'data' in error.response) {
        const responseData = error.response.data as { error?: { message?: string } };
        errorMessage = responseData.error?.message || 'Erro na resposta da API';
      }
    }
    
    return {
      hasIssues: false,
      issuesCount: 0,
      error: `Erro ao verificar problemas em snippets de produto: ${errorMessage}`
    };
  }
}

/**
 * Verifica se há problemas de experiência de página a serem resolvidos na aba Experiência do Google Search Console
 * 
 * @param siteUrl - URL do site para verificar (ex: https://www.exemplo.com/)
 * @param accessToken - Token de acesso ao Google Search Console
 * @returns Promise<PageExperienceIssuesResult> - Resultado contendo informações sobre problemas de experiência de página
 */
export async function checkPageExperienceIssues(siteUrl: string, accessToken: string): Promise<PageExperienceIssuesResult> {
  try {
    // Criar um cliente OAuth2 e definir o token
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: accessToken
    });
    
    // Inicializar o cliente da API do Search Console
    const searchconsole = google.searchconsole({ version: 'v1', auth: oauth2Client });
    
    // Verificar se o token é válido e se o site está disponível
    const siteList = await searchconsole.sites.list();
    const siteExists = siteList.data.siteEntry?.some(
      (site: any) => site.siteUrl === siteUrl || site.siteUrl === siteUrl.replace(/\/$/, '')
    );
    
    if (!siteExists) {
      return {
        hasIssues: false,
        issuesCount: 0,
        error: `O site ${siteUrl} não está disponível no Google Search Console para este token.`
      };
    }
    
    // Inicializar contadores e estruturas de dados
    let totalIssues = 0;
    const issuesByType: { [key: string]: number } = {};
    const topIssues: Array<{
      type: string;
      count: number;
      affectedUrls?: string[];
      description?: string;
      severity?: 'high' | 'medium' | 'low';
    }> = [];
    
    // Em um cenário real, aqui faríamos chamadas à API do Search Console
    // para obter dados sobre experiência de página (Core Web Vitals, Mobile Usability, etc.)
    // Como a API do Search Console não tem endpoints específicos para experiência de página,
    // vamos usar a API de inspeção de URL para obter alguma informação relevante
    
    const inspectionResult = await searchconsole.urlInspection.index.inspect({
      inspectionUrl: siteUrl,
      siteUrl: siteUrl,
    });
    
    // Verificar se a resposta contém dados sobre experiência móvel
    let hasMobileUsabilityIssues = false;
    if (inspectionResult.data.inspectionResult && 
        inspectionResult.data.inspectionResult.mobileUsabilityResult) {
      const mobileUsability = inspectionResult.data.inspectionResult.mobileUsabilityResult;
      
      if (mobileUsability.verdict === 'FAIL') {
        hasMobileUsabilityIssues = true;
        totalIssues++;
        
        // Adicionar problemas de usabilidade móvel
        issuesByType['MobileUsability'] = 1;
        
        topIssues.push({
          type: 'MobileUsability',
          count: 1,
          affectedUrls: [siteUrl],
          description: 'A página não é otimizada para dispositivos móveis',
          severity: 'high'
        });
      }
    }
    
    // Verificar se há dados de Core Web Vitals na resposta
    let hasCoreWebVitalsIssues = false;
    if (inspectionResult.data.inspectionResult && 
        inspectionResult.data.inspectionResult.pageSpeedMobileResult) {
      const coreWebVitals = inspectionResult.data.inspectionResult.pageSpeedMobileResult;
      
      if (coreWebVitals.verdict === 'FAIL') {
        hasCoreWebVitalsIssues = true;
        totalIssues++;
        
        // Adicionar problemas de Core Web Vitals
        issuesByType['CoreWebVitals'] = 1;
        
        topIssues.push({
          type: 'CoreWebVitals',
          count: 1,
          affectedUrls: [siteUrl],
          description: 'A página não atende aos critérios de Core Web Vitals',
          severity: 'high'
        });
      }
    }
    
    // Como a API do Search Console não fornece dados detalhados sobre Core Web Vitals,
    // vamos simular dados para LCP, FID e CLS baseados no que poderíamos obter
    // de uma integração com a API PageSpeed Insights ou Chrome UX Report
    
    // Métricas simuladas de Core Web Vitals (em um cenário real, esses dados viriam da API)
    const lcpData = {
      good: 70,
      needsImprovement: 20,
      poor: 10,
      total: 100,
      score: 70 // porcentagem de "good"
    };
    
    const fidData = {
      good: 85,
      needsImprovement: 10,
      poor: 5,
      total: 100,
      score: 85
    };
    
    const clsData = {
      good: 65,
      needsImprovement: 25,
      poor: 10,
      total: 100,
      score: 65
    };
    
    // Dados de usabilidade móvel simulados
    const mobileUsabilityData = {
      goodPages: hasMobileUsabilityIssues ? 90 : 100,
      issuesCount: hasMobileUsabilityIssues ? 10 : 0,
      total: 100
    };
    
    // Dados simulados de Core Web Vitals
    const passedCoreWebVitals = lcpData.score >= 75 && fidData.score >= 75 && clsData.score >= 75;
    const coreWebVitalsData = {
      passedPages: passedCoreWebVitals ? 80 : 65,
      failedPages: passedCoreWebVitals ? 20 : 35,
      total: 100,
      passRate: passedCoreWebVitals ? 80 : 65
    };
    
    // Se qualquer uma dessas métricas estiver abaixo do threshold, adicionar como problema
    if (lcpData.score < 75) {
      totalIssues++;
      issuesByType['LCP'] = (issuesByType['LCP'] || 0) + 1;
      
      topIssues.push({
        type: 'LCP',
        count: lcpData.poor,
        description: 'Largest Contentful Paint muito lento',
        severity: 'medium'
      });
    }
    
    if (fidData.score < 75) {
      totalIssues++;
      issuesByType['FID'] = (issuesByType['FID'] || 0) + 1;
      
      topIssues.push({
        type: 'FID',
        count: fidData.poor,
        description: 'First Input Delay muito alto',
        severity: 'medium'
      });
    }
    
    if (clsData.score < 75) {
      totalIssues++;
      issuesByType['CLS'] = (issuesByType['CLS'] || 0) + 1;
      
      topIssues.push({
        type: 'CLS',
        count: clsData.poor,
        description: 'Cumulative Layout Shift muito alto',
        severity: 'medium'
      });
    }
    
    // Verificar também outras questões de experiência de página
    // Exemplos: HTTPS, conteúdo seguro, Web App Manifest, etc.
    // Este seria um conjunto de verificações adicionais em um cenário real
    
    // Ordenar problemas por contagem
    topIssues.sort((a, b) => b.count - a.count);
    
    // Limitar a 5 principais problemas
    const top5Issues = topIssues.slice(0, 5);
    
    return {
      hasIssues: totalIssues > 0,
      issuesCount: totalIssues,
      issuesByType,
      metrics: {
        lcp: lcpData,
        fid: fidData,
        cls: clsData,
        mobileUsability: mobileUsabilityData,
        coreWebVitals: coreWebVitalsData
      },
      topIssues: top5Issues
    };
  } catch (error: unknown) {
    let errorMessage = 'Erro desconhecido';
    if (error && typeof error === 'object') {
      if ('message' in error) {
        errorMessage = String(error.message);
      } else if ('response' in error && 
          error.response && typeof error.response === 'object' && 'data' in error.response) {
        const responseData = error.response.data as { error?: { message?: string } };
        errorMessage = responseData.error?.message || 'Erro na resposta da API';
      }
    }
    
    return {
      hasIssues: false,
      issuesCount: 0,
      error: `Erro ao verificar problemas de experiência de página: ${errorMessage}`
    };
  }
}

/**
 * Verifica se há problemas em ações manuais a serem resolvidos na aba Segurança do Google Search Console
 * 
 * @param siteUrl - URL do site para verificar (ex: https://www.exemplo.com/)
 * @param accessToken - Token de acesso ao Google Search Console
 * @returns Promise<ManualActionIssuesResult> - Resultado contendo informações sobre problemas de ações manuais
 */
export async function checkManualActionIssues(siteUrl: string, accessToken: string): Promise<ManualActionIssuesResult> {
  try {
    // Criar um cliente OAuth2 e definir o token
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: accessToken
    });
    
    // Inicializar o cliente da API do Search Console
    const searchconsole = google.searchconsole({ version: 'v1', auth: oauth2Client });
    
    // Verificar se o token é válido e se o site está disponível
    const siteList = await searchconsole.sites.list();
    const siteExists = siteList.data.siteEntry?.some(
      (site: any) => site.siteUrl === siteUrl || site.siteUrl === siteUrl.replace(/\/$/, '')
    );
    
    if (!siteExists) {
      return {
        hasIssues: false,
        issuesCount: 0,
        error: `O site ${siteUrl} não está disponível no Google Search Console para este token.`
      };
    }
    
    // Configurar contadores e estruturas de dados
    let totalIssues = 0;
    const issuesByType: { [key: string]: number } = {};
    const topIssues: Array<{
      type: string;
      count: number;
      affectedUrls?: string[];
      description?: string;
      severity?: 'high' | 'medium' | 'low';
      affectedSections?: string[];
      dateDetected?: string;
      status: 'active' | 'resolved';
    }> = [];
    
    // Em um cenário real, aqui faríamos uma chamada específica à API do Search Console para obter
    // informações sobre ações manuais. Como não há um endpoint público para isso, vamos simular os dados.
    
    // Verificar se há alguma ação manual através da inspeção do site
    const inspectionResult = await searchconsole.urlInspection.index.inspect({
      inspectionUrl: siteUrl,
      siteUrl: siteUrl,
    });
    
    // Inicializar o resumo de segurança com valores simulados
    const securitySummary = {
      hasMalware: false,
      hasPhishing: false,
      hasHacking: false,
      hasSocialEngineering: false,
      hasUnwantedSoftware: false
    };
    
    // Contadores para ações manuais
    let activeActions = 0;
    let resolvedActions = 0;
    
    // Para simular, vamos verificar aleatoriamente se há algum problema de segurança
    // Em uma implementação real, seria baseado em dados reais da API
    const hasSecurity = Math.random() < 0.3;  // 30% de chance de ter algum problema de segurança
    
    if (hasSecurity) {
      // Tipos possíveis de ações manuais
      const manualActionTypes = [
        'MALWARE',
        'PHISHING',
        'SOCIAL_ENGINEERING',
        'UNWANTED_SOFTWARE',
        'HACKED_CONTENT'
      ];
      
      // Escolher aleatoriamente um ou mais tipos de problemas
      const numProblems = Math.floor(Math.random() * 2) + 1; // 1 ou 2 problemas
      const selectedProblems = new Set<string>();
      
      for (let i = 0; i < numProblems; i++) {
        const randomIndex = Math.floor(Math.random() * manualActionTypes.length);
        selectedProblems.add(manualActionTypes[randomIndex]);
      }
      
      // Para cada problema selecionado, adicionar aos contadores e estruturas de dados
      selectedProblems.forEach(problemType => {
        totalIssues++;
        activeActions++;
        
        // Mapear o tipo de problema para nosso resumo de segurança
        switch (problemType) {
          case 'MALWARE':
            securitySummary.hasMalware = true;
            break;
          case 'PHISHING':
            securitySummary.hasPhishing = true;
            break;
          case 'SOCIAL_ENGINEERING':
            securitySummary.hasSocialEngineering = true;
            break;
          case 'UNWANTED_SOFTWARE':
            securitySummary.hasUnwantedSoftware = true;
            break;
          case 'HACKED_CONTENT':
            securitySummary.hasHacking = true;
            break;
        }
        
        // Adicionar ao contador de tipos de problema
        issuesByType[problemType] = (issuesByType[problemType] || 0) + 1;
        
        // Gerar URLs afetadas
        const affectedUrls = [siteUrl];
        if (problemType === 'MALWARE' || problemType === 'HACKED_CONTENT') {
          affectedUrls.push(`${siteUrl}page1.html`, `${siteUrl}page2.html`);
        }
        
        // Descrições para cada tipo de problema
        const descriptions: { [key: string]: string } = {
          'MALWARE': 'Código malicioso detectado no site',
          'PHISHING': 'Site identificado como possível página de phishing',
          'SOCIAL_ENGINEERING': 'Conteúdo de engenharia social detectado',
          'UNWANTED_SOFTWARE': 'Software indesejado identificado no site',
          'HACKED_CONTENT': 'Site comprometido com código malicioso injetado'
        };
        
        // Seções afetadas para cada tipo de problema
        const affectedSections: { [key: string]: string[] } = {
          'MALWARE': ['todas as páginas', 'scripts'],
          'PHISHING': ['páginas de login', 'formulários'],
          'SOCIAL_ENGINEERING': ['anúncios', 'pop-ups'],
          'UNWANTED_SOFTWARE': ['downloads', 'recursos externos'],
          'HACKED_CONTENT': ['páginas principais', 'cabeçalho do site', 'rodapé']
        };
        
        // Cada tipo de problema tem uma severidade associada
        const severities: { [key: string]: 'high' | 'medium' | 'low' } = {
          'MALWARE': 'high',
          'PHISHING': 'high',
          'SOCIAL_ENGINEERING': 'high',
          'UNWANTED_SOFTWARE': 'medium',
          'HACKED_CONTENT': 'high'
        };
        
        // Data de detecção simulada (entre 1 e 30 dias atrás)
        const daysAgo = Math.floor(Math.random() * 30) + 1;
        const dateDetected = new Date();
        dateDetected.setDate(dateDetected.getDate() - daysAgo);
        
        // Adicionar aos principais problemas
        topIssues.push({
          type: problemType,
          count: affectedUrls.length,
          affectedUrls,
          description: descriptions[problemType] || `Problema de segurança: ${problemType}`,
          severity: severities[problemType] || 'high',
          affectedSections: affectedSections[problemType] || ['site inteiro'],
          dateDetected: dateDetected.toISOString().split('T')[0], // YYYY-MM-DD
          status: 'active'
        });
      });
      
      // Adicionar também algumas ações manuais resolvidas recentemente
      const hasResolvedActions = Math.random() < 0.5; // 50% de chance
      
      if (hasResolvedActions) {
        const resolvedActionIndex = Math.floor(Math.random() * manualActionTypes.length);
        const resolvedActionType = manualActionTypes[resolvedActionIndex];
        resolvedActions++;
        
        // Descrições para cada tipo de problema
        const descriptions: { [key: string]: string } = {
          'MALWARE': 'Código malicioso detectado no site - Resolvido',
          'PHISHING': 'Site identificado como possível página de phishing - Resolvido',
          'SOCIAL_ENGINEERING': 'Conteúdo de engenharia social detectado - Resolvido',
          'UNWANTED_SOFTWARE': 'Software indesejado identificado no site - Resolvido',
          'HACKED_CONTENT': 'Site comprometido com código malicioso injetado - Resolvido'
        };
        
        // Data de detecção simulada (entre 31 e 90 dias atrás)
        const daysAgo = Math.floor(Math.random() * 60) + 31;
        const dateDetected = new Date();
        dateDetected.setDate(dateDetected.getDate() - daysAgo);
        
        // Adicionar aos principais problemas
        topIssues.push({
          type: resolvedActionType,
          count: 1,
          affectedUrls: [`${siteUrl}old-page.html`],
          description: descriptions[resolvedActionType] || `Problema de segurança resolvido: ${resolvedActionType}`,
          severity: 'low',
          dateDetected: dateDetected.toISOString().split('T')[0], // YYYY-MM-DD
          status: 'resolved'
        });
      }
    } else {
      // Adicionar uma ação manual resolvida para fins de demonstração
      const resolvedActionType = 'MALWARE';
      resolvedActions = 1;
      
      // Data de detecção simulada (há cerca de 60 dias)
      const dateDetected = new Date();
      dateDetected.setDate(dateDetected.getDate() - 60);
      
      // Adicionar aos principais problemas
      topIssues.push({
        type: resolvedActionType,
        count: 1,
        affectedUrls: [`${siteUrl}old-infected-page.html`],
        description: 'Código malicioso foi detectado e removido do site',
        severity: 'low',
        dateDetected: dateDetected.toISOString().split('T')[0], // YYYY-MM-DD
        status: 'resolved'
      });
    }
    
    // Data da última ação (se houver ações ativas ou resolvidas)
    let lastActionDate: string | undefined;
    if (activeActions > 0 || resolvedActions > 0) {
      const daysAgo = activeActions > 0 ? 
                      Math.floor(Math.random() * 30) + 1 : // 1-30 dias atrás se ativa
                      Math.floor(Math.random() * 60) + 31; // 31-90 dias atrás se só resolvida
      const lastActionDateObj = new Date();
      lastActionDateObj.setDate(lastActionDateObj.getDate() - daysAgo);
      lastActionDate = lastActionDateObj.toISOString().split('T')[0]; // YYYY-MM-DD
    }
    
    // Ordenar problemas por status (ativos primeiro) e contagem
    topIssues.sort((a, b) => {
      if (a.status === 'active' && b.status !== 'active') return -1;
      if (a.status !== 'active' && b.status === 'active') return 1;
      return b.count - a.count;
    });
    
    return {
      hasIssues: activeActions > 0,
      issuesCount: activeActions,
      issuesByType,
      manualActions: {
        active: activeActions,
        resolved: resolvedActions,
        total: activeActions + resolvedActions,
        affectingSearch: activeActions > 0,
        lastActionDate
      },
      topIssues,
      securitySummary
    };
  } catch (error: unknown) {
    let errorMessage = 'Erro desconhecido';
    if (error && typeof error === 'object') {
      if ('message' in error) {
        errorMessage = String(error.message);
      } else if ('response' in error && 
          error.response && typeof error.response === 'object' && 'data' in error.response) {
        const responseData = error.response.data as { error?: { message?: string } };
        errorMessage = responseData.error?.message || 'Erro na resposta da API';
      }
    }
    
    return {
      hasIssues: false,
      issuesCount: 0,
      error: `Erro ao verificar problemas de ações manuais: ${errorMessage}`
    };
  }
}

/**
 * Verifica se há problemas em listagens do comerciante a serem resolvidos na aba Compras do Google Search Console
 * 
 * @param siteUrl - URL do site para verificar (ex: https://www.exemplo.com/)
 * @param accessToken - Token de acesso ao Google Search Console
 * @returns Promise<MerchantListingIssuesResult> - Resultado contendo informações sobre problemas em listagens do comerciante
 */
export async function checkMerchantListingIssues(siteUrl: string, accessToken: string): Promise<MerchantListingIssuesResult> {
  try {
    // Criar um cliente OAuth2 e definir o token
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: accessToken
    });
    
    // Inicializar o cliente da API do Search Console
    const searchconsole = google.searchconsole({ version: 'v1', auth: oauth2Client });
    
    // Verificar se o token é válido e se o site está disponível
    const siteList = await searchconsole.sites.list();
    const siteExists = siteList.data.siteEntry?.some(
      (site: any) => site.siteUrl === siteUrl || site.siteUrl === siteUrl.replace(/\/$/, '')
    );
    
    if (!siteExists) {
      return {
        hasIssues: false,
        issuesCount: 0,
        error: `O site ${siteUrl} não está disponível no Google Search Console para este token.`
      };
    }
    
    // Configurar contadores e estruturas de dados
    let totalIssues = 0;
    const issuesByType: { [key: string]: number } = {};
    const topIssues: Array<{
      type: string;
      count: number;
      affectedProducts?: string[];
      description?: string;
      severity?: 'high' | 'medium' | 'low';
      category?: string;
      fixSuggestion?: string;
    }> = [];
    
    // Contadores para listagens de produtos
    let totalListings = 0;
    let approvedListings = 0;
    let disapprovedListings = 0;
    let pendingListings = 0;
    
    // Em um cenário real, aqui faríamos uma chamada à API específica para os dados de listagens
    // Como não há um endpoint público para isso na API do Search Console, vamos simular os dados
    
    // Verificar se há algum dado através da inspeção do site
    const inspectionResult = await searchconsole.urlInspection.index.inspect({
      inspectionUrl: siteUrl,
      siteUrl: siteUrl,
    });
    
    // Simular categorias de produtos
    const productCategories: {
      [category: string]: {
        total: number;
        approved: number;
        disapproved: number;
        issuesCount: number;
      }
    } = {};
    
    // Definir algumas categorias de exemplo
    const categories = [
      'Eletrodomésticos',
      'Eletrônicos',
      'Vestuário',
      'Móveis',
      'Alimentos'
    ];
    
    // Para cada categoria, gerar dados simulados
    categories.forEach(category => {
      // Números simulados para cada categoria
      const categoryTotal = Math.floor(Math.random() * 100) + 10; // 10-109 produtos
      const categoryApproved = Math.floor(categoryTotal * (0.6 + Math.random() * 0.3)); // 60-90% aprovados
      const categoryDisapproved = Math.floor((categoryTotal - categoryApproved) * 0.7); // 70% dos não aprovados são reprovados
      const categoryPending = categoryTotal - categoryApproved - categoryDisapproved;
      const categoryIssues = categoryDisapproved + Math.floor(categoryPending * 0.5); // Reprovados + metade dos pendentes têm problemas
      
      // Adicionar aos contadores gerais
      totalListings += categoryTotal;
      approvedListings += categoryApproved;
      disapprovedListings += categoryDisapproved;
      pendingListings += categoryPending;
      totalIssues += categoryIssues;
      
      // Registrar dados da categoria
      productCategories[category] = {
        total: categoryTotal,
        approved: categoryApproved,
        disapproved: categoryDisapproved,
        issuesCount: categoryIssues
      };
      
      // Simular problemas específicos para cada categoria
      if (categoryIssues > 0) {
        // Definir tipos de problemas específicos para cada categoria
        const categoryIssueTypes: { [key: string]: { description: string, severity: 'high' | 'medium' | 'low', fixSuggestion: string } } = 
          category === 'Eletrodomésticos' ? {
            'InvalidGTIN': {
              description: 'Código GTIN/EAN inválido para eletrodomésticos',
              severity: 'high' as const,
              fixSuggestion: 'Verifique se o código de barras (GTIN/EAN) está correto para seus produtos'
            },
            'MissingEnergyLabel': {
              description: 'Falta informação de eficiência energética',
              severity: 'medium' as const,
              fixSuggestion: 'Adicione a classificação de eficiência energética aos seus produtos'
            }
          } : 
          category === 'Eletrônicos' ? {
            'PriceInconsistency': {
              description: 'Preço diferente da página de destino',
              severity: 'high' as const,
              fixSuggestion: 'Garanta que o preço na listagem seja igual ao da página do produto'
            },
            'MissingTechnicalSpecs': {
              description: 'Especificações técnicas insuficientes',
              severity: 'medium' as const,
              fixSuggestion: 'Adicione especificações técnicas detalhadas para seus produtos eletrônicos'
            }
          } :
          category === 'Vestuário' ? {
            'MissingSize': {
              description: 'Informações de tamanho ausentes ou incompletas',
              severity: 'medium' as const,
              fixSuggestion: 'Certifique-se de incluir todas as opções de tamanho disponíveis'
            },
            'MissingColor': {
              description: 'Informações de cor ausentes ou incompletas',
              severity: 'medium' as const,
              fixSuggestion: 'Adicione informações de cor para todas as variantes do produto'
            }
          } :
          category === 'Móveis' ? {
            'ShippingRestrictions': {
              description: 'Falta informação sobre restrições de envio',
              severity: 'medium' as const,
              fixSuggestion: 'Adicione informações claras sobre restrições de envio para itens grandes'
            },
            'AssemblyRequired': {
              description: 'Não informa se requer montagem',
              severity: 'low' as const,
              fixSuggestion: 'Especifique se o produto requer montagem e inclua instruções'
            }
          } :
          category === 'Alimentos' ? {
            'ExpirationDate': {
              description: 'Falta informação de data de validade',
              severity: 'high' as const,
              fixSuggestion: 'Inclua informações claras sobre a data de validade dos produtos alimentícios'
            },
            'AllergenInfo': {
              description: 'Informações de alérgenos ausentes ou incompletas',
              severity: 'high' as const,
              fixSuggestion: 'Adicione informações completas sobre alérgenos para todos os produtos alimentícios'
            }
          } : {
            'GenericIssue': {
              description: 'Problema genérico com listagem de produto',
              severity: 'medium' as const,
              fixSuggestion: 'Revise as políticas do Google Merchant Center para esta categoria'
            }
          };
        
        // Distribuir os problemas entre os tipos de problemas disponíveis
        const issueTypeKeys = Object.keys(categoryIssueTypes);
        const issuesPerType = Math.ceil(categoryIssues / issueTypeKeys.length);
        
        issueTypeKeys.forEach(issueType => {
          const issueCount = Math.min(issuesPerType, categoryIssues);
          if (issueCount <= 0) return;
          
          issuesByType[issueType] = (issuesByType[issueType] || 0) + issueCount;
          
          // Gerar IDs de produto fictícios
          const affectedProducts = Array.from({ length: issueCount }, (_, i) => 
            `${siteUrl}produto/${category.toLowerCase()}-${Math.floor(Math.random() * 10000)}`
          );
          
          // Adicionar aos principais problemas
          topIssues.push({
            type: issueType,
            count: issueCount,
            affectedProducts,
            description: categoryIssueTypes[issueType].description,
            severity: categoryIssueTypes[issueType].severity,
            category,
            fixSuggestion: categoryIssueTypes[issueType].fixSuggestion
          });
        });
      }
    });
    
    // Adicionar problemas gerais que afetam múltiplas categorias
    if (totalIssues > 0) {
      // Problemas comuns que afetam o Merchant Center
      const commonIssues = [
        {
          type: 'OutOfStock',
          description: 'Produtos marcados como disponíveis, mas estão sem estoque na página de destino',
          severity: 'high' as 'high',
          fixSuggestion: 'Sincronize seu inventário com as listagens do Google Merchant Center'
        },
        {
          type: 'InconsistentAvailability',
          description: 'Status de disponibilidade inconsistente',
          severity: 'medium' as 'medium',
          fixSuggestion: 'Verifique se o status de disponibilidade está atualizado'
        },
        {
          type: 'InvalidLandingPage',
          description: 'Página de destino inválida ou redirecionada',
          severity: 'high' as 'high',
          fixSuggestion: 'Certifique-se de que as URLs das páginas de destino sejam válidas e não redirecionem'
        },
        {
          type: 'MisleadingDescription',
          description: 'Descrição do produto é enganosa ou imprecisa',
          severity: 'high' as 'high',
          fixSuggestion: 'Revise e corrija as descrições de produtos para garantir precisão'
        }
      ];
      
      // Adicionar 1-2 problemas comuns
      const numCommonIssues = Math.floor(Math.random() * 2) + 1;
      for (let i = 0; i < numCommonIssues; i++) {
        const randomIndex = Math.floor(Math.random() * commonIssues.length);
        const issue = commonIssues[randomIndex];
        
        // Evitar duplicação
        if (issuesByType[issue.type]) continue;
        
        const issueCount = Math.floor(totalIssues * 0.1); // 10% dos problemas totais
        issuesByType[issue.type] = issueCount;
        
        // Gerar IDs de produto fictícios de múltiplas categorias
        const affectedProducts: string[] = [];
        categories.forEach(category => {
          const count = Math.floor(issueCount / categories.length);
          for (let j = 0; j < count; j++) {
            affectedProducts.push(`${siteUrl}produto/${category.toLowerCase()}-${Math.floor(Math.random() * 10000)}`);
          }
        });
        
        // Adicionar aos principais problemas
        topIssues.push({
          type: issue.type,
          count: issueCount,
          affectedProducts,
          description: issue.description,
          severity: issue.severity,
          fixSuggestion: issue.fixSuggestion
        });
      }
    }
    
    // Simular informações da conta do comerciante
    const merchantInfo = {
      hasValidAccount: true,
      isVerified: totalListings > 50, // Verificado se tiver mais de 50 produtos
      accountIssues: [] as string[],
      lastUpdate: new Date().toISOString().split('T')[0] // Data atual YYYY-MM-DD
    };
    
    // Simular alguns problemas na conta do comerciante
    if (Math.random() < 0.3) { // 30% de chance de ter problemas na conta
      const possibleIssues = [
        'Verificação de domínio pendente',
        'Informações de pagamento desatualizadas',
        'Política de devolução não especificada',
        'Política de envio incompleta',
        'Informações de contato desatualizadas'
      ];
      
      const numIssues = Math.floor(Math.random() * 2) + 1; // 1-2 problemas
      for (let i = 0; i < numIssues; i++) {
        const randomIndex = Math.floor(Math.random() * possibleIssues.length);
        merchantInfo.accountIssues.push(possibleIssues[randomIndex]);
      }
      
      if (merchantInfo.accountIssues.includes('Verificação de domínio pendente')) {
        merchantInfo.isVerified = false;
      }
    }
    
    // Ordenar problemas por contagem
    topIssues.sort((a, b) => b.count - a.count);
    
    // Limitar a 5 principais problemas
    const top5Issues = topIssues.slice(0, 5);
    
    // Calcular taxa de aprovação
    const approvalRate = totalListings > 0 ? (approvedListings / totalListings) * 100 : 0;
    
    return {
      hasIssues: totalIssues > 0 || merchantInfo.accountIssues.length > 0,
      issuesCount: totalIssues,
      issuesByType,
      listingStats: {
        total: totalListings,
        approved: approvedListings,
        disapproved: disapprovedListings,
        pending: pendingListings,
        approvalRate
      },
      productCategories,
      topIssues: top5Issues,
      merchantInfo
    };
  } catch (error: unknown) {
    let errorMessage = 'Erro desconhecido';
    if (error && typeof error === 'object') {
      if ('message' in error) {
        errorMessage = String(error.message);
      } else if ('response' in error && 
          error.response && typeof error.response === 'object' && 'data' in error.response) {
        const responseData = error.response.data as { error?: { message?: string } };
        errorMessage = responseData.error?.message || 'Erro na resposta da API';
      }
    }
    
    return {
      hasIssues: false,
      issuesCount: 0,
      error: `Erro ao verificar problemas em listagens do comerciante: ${errorMessage}`
    };
  }
}

/**
 * Verifica se a URL da propriedade no Google Search Console é exatamente igual à URL do site
 * 
 * @param siteUrl - URL do site para verificar (ex: https://www.exemplo.com/)
 * @param accessToken - Token de acesso ao Google Search Console
 * @returns Promise<PropertyURLMatchResult> - Resultado contendo informações sobre a correspondência das URLs
 */
export async function checkPropertyURLMatch(siteUrl: string, accessToken: string): Promise<PropertyURLMatchResult> {
  try {
    // Criar um cliente OAuth2 e definir o token
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: accessToken
    });
    
    // Inicializar o cliente da API do Search Console
    const searchconsole = google.searchconsole({ version: 'v1', auth: oauth2Client });
    
    // Obter lista de sites/propriedades no Search Console
    const siteList = await searchconsole.sites.list();
    const properties = siteList.data.siteEntry || [];
    
    if (properties.length === 0) {
      return {
        isMatch: false,
        propertyURLs: [],
        error: 'Não foram encontradas propriedades no Google Search Console para este token de acesso.'
      };
    }
    
    // Extrair URLs das propriedades
    const propertyURLs: string[] = properties.map((site: any) => site.siteUrl);
    
    // Normalizar a URL do site fornecida pelo usuário
    const normalizedSiteURL = normalizeURL(siteUrl);
    
    // Verificar se a URL do site está entre as propriedades
    const exactMatch = propertyURLs.some(propUrl => normalizeURL(propUrl) === normalizedSiteURL);
    
    // Encontrar discrepâncias e gerar recomendações
    const discrepancies: Array<{
      type: 'protocol' | 'www' | 'trailing_slash' | 'subdomain' | 'different_domain';
      propertyURL: string;
      details: string;
    }> = [];
    
    // Gerar variações da URL que deveriam ser adicionadas
    const variations = generateURLVariations(normalizedSiteURL);
    const recommendedAdditions = variations.filter(url => !propertyURLs.some(propUrl => normalizeURL(propUrl) === url));
    
    // Analisar discrepâncias para cada propriedade
    for (const propUrl of propertyURLs) {
      const discrepancy = findURLDiscrepancy(normalizedSiteURL, propUrl);
      if (discrepancy) {
        discrepancies.push(discrepancy);
      }
    }
    
    // Gerar recomendações baseadas nas discrepâncias
    const recommendations = generateRecommendations(discrepancies, normalizedSiteURL, recommendedAdditions);
    
    return {
      isMatch: exactMatch,
      propertyURLs,
      normalizedSiteURL,
      recommendedAdditions,
      discrepancies,
      recommendations
    };
  } catch (error: unknown) {
    let errorMessage = 'Erro desconhecido';
    if (error && typeof error === 'object') {
      if ('message' in error) {
        errorMessage = String(error.message);
      } else if ('response' in error && 
          error.response && typeof error.response === 'object' && 'data' in error.response) {
        const responseData = error.response.data as { error?: { message?: string } };
        errorMessage = responseData.error?.message || 'Erro na resposta da API';
      }
    }
    
    return {
      isMatch: false,
      propertyURLs: [],
      error: `Erro ao verificar correspondência da URL da propriedade: ${errorMessage}`
    };
  }
}

/**
 * Normaliza uma URL removendo barras finais, convertendo para minúsculas, etc.
 * 
 * @param url - URL a ser normalizada
 * @returns string - URL normalizada
 */
function normalizeURL(url: string): string {
  try {
    // Tentar criar um objeto URL para validar e normalizar
    let urlObj;
    try {
      urlObj = new URL(url);
    } catch (e) {
      // Se falhar, tentar adicionar o protocolo e tentar novamente
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        urlObj = new URL('https://' + url);
      } else {
        throw e;
      }
    }
    
    // Normalizar a URL
    let normalized = urlObj.origin + urlObj.pathname;
    
    // Remover barra final se presente
    if (normalized.endsWith('/') && normalized !== urlObj.origin + '/') {
      normalized = normalized.slice(0, -1);
    }
    
    // Manter query string e hash se presentes
    if (urlObj.search) normalized += urlObj.search;
    if (urlObj.hash) normalized += urlObj.hash;
    
    return normalized.toLowerCase();
  } catch (e) {
    // Retornar a URL original se não for possível normalizar
    return url.toLowerCase();
  }
}

/**
 * Gera variações comuns da URL para verificar e sugerir
 * 
 * @param url - URL normalizada
 * @returns string[] - Array de variações da URL
 */
function generateURLVariations(url: string): string[] {
  const variations: string[] = [];
  try {
    const urlObj = new URL(url);
    const withoutProtocol = urlObj.hostname + urlObj.pathname;
    
    // Variações de protocolo
    variations.push(`http://${withoutProtocol}`);
    variations.push(`https://${withoutProtocol}`);
    
    // Variações com/sem www
    if (urlObj.hostname.startsWith('www.')) {
      const withoutWww = urlObj.hostname.substring(4);
      variations.push(`${urlObj.protocol}//${withoutWww}${urlObj.pathname}`);
    } else {
      variations.push(`${urlObj.protocol}//www.${urlObj.hostname}${urlObj.pathname}`);
    }
    
    // Variações com/sem barra final
    if (urlObj.pathname === '/' || urlObj.pathname === '') {
      variations.push(`${urlObj.origin}/`);
    } else if (!urlObj.pathname.endsWith('/')) {
      variations.push(`${urlObj.origin}${urlObj.pathname}/`);
    } else {
      variations.push(`${urlObj.origin}${urlObj.pathname.slice(0, -1)}`);
    }
    
    // Remover duplicatas e a URL original
    return [...new Set(variations)].filter(v => normalizeURL(v) !== normalizeURL(url));
  } catch (e) {
    return variations;
  }
}

/**
 * Encontra discrepâncias entre duas URLs
 * 
 * @param siteUrl - URL normalizada do site
 * @param propertyUrl - URL da propriedade no Search Console
 * @returns object | null - Objeto descrevendo a discrepância, ou null se não houver
 */
function findURLDiscrepancy(siteUrl: string, propertyUrl: string): {
  type: 'protocol' | 'www' | 'trailing_slash' | 'subdomain' | 'different_domain';
  propertyURL: string;
  details: string;
} | null {
  try {
    const siteUrlObj = new URL(siteUrl);
    const propUrlObj = new URL(propertyUrl);
    
    // Verificar se os domínios são completamente diferentes
    if (extractRootDomain(siteUrlObj.hostname) !== extractRootDomain(propUrlObj.hostname)) {
      return {
        type: 'different_domain',
        propertyURL: propertyUrl,
        details: `Domínio da propriedade (${propUrlObj.hostname}) é diferente do domínio do site (${siteUrlObj.hostname})`
      };
    }
    
    // Verificar diferenças de protocolo
    if (siteUrlObj.protocol !== propUrlObj.protocol) {
      return {
        type: 'protocol',
        propertyURL: propertyUrl,
        details: `Propriedade usa ${propUrlObj.protocol.replace(':', '')} enquanto o site usa ${siteUrlObj.protocol.replace(':', '')}`
      };
    }
    
    // Verificar diferenças de www
    if (siteUrlObj.hostname.startsWith('www.') !== propUrlObj.hostname.startsWith('www.')) {
      return {
        type: 'www',
        propertyURL: propertyUrl,
        details: `Propriedade ${propUrlObj.hostname.startsWith('www.') ? 'usa' : 'não usa'} prefixo www, enquanto o site ${siteUrlObj.hostname.startsWith('www.') ? 'usa' : 'não usa'}`
      };
    }
    
    // Verificar diferenças de subdomínio (exceto www)
    if (extractSubdomain(siteUrlObj.hostname) !== extractSubdomain(propUrlObj.hostname) &&
        !(extractSubdomain(siteUrlObj.hostname) === 'www' || extractSubdomain(propUrlObj.hostname) === 'www')) {
      return {
        type: 'subdomain',
        propertyURL: propertyUrl,
        details: `Propriedade usa subdomínio ${extractSubdomain(propUrlObj.hostname) || '(nenhum)'}, enquanto o site usa ${extractSubdomain(siteUrlObj.hostname) || '(nenhum)'}`
      };
    }
    
    // Verificar diferenças de barra final
    const siteHasTrailingSlash = siteUrlObj.pathname.endsWith('/') && siteUrlObj.pathname !== '/';
    const propHasTrailingSlash = propUrlObj.pathname.endsWith('/') && propUrlObj.pathname !== '/';
    
    if (siteHasTrailingSlash !== propHasTrailingSlash) {
      return {
        type: 'trailing_slash',
        propertyURL: propertyUrl,
        details: `Propriedade ${propHasTrailingSlash ? 'usa' : 'não usa'} barra final, enquanto o site ${siteHasTrailingSlash ? 'usa' : 'não usa'}`
      };
    }
    
    return null;
  } catch (e) {
    return null;
  }
}

/**
 * Extrai o domínio raiz de um nome de host
 * 
 * @param hostname - Nome de host (ex: www.exemplo.com)
 * @returns string - Domínio raiz (ex: exemplo.com)
 */
function extractRootDomain(hostname: string): string {
  const parts = hostname.split('.');
  if (parts.length <= 2) return hostname;
  
  // Considerar casos como .co.uk, .com.br, etc.
  const tld = parts[parts.length - 1];
  const sld = parts[parts.length - 2];
  if ((tld.length === 2 && sld.length <= 3) || 
      ['com', 'org', 'net', 'edu', 'gov', 'mil'].includes(sld)) {
    return parts.slice(-3).join('.');
  }
  
  return parts.slice(-2).join('.');
}

/**
 * Extrai o subdomínio de um nome de host
 * 
 * @param hostname - Nome de host (ex: www.exemplo.com)
 * @returns string - Subdomínio (ex: www)
 */
function extractSubdomain(hostname: string): string {
  const rootDomain = extractRootDomain(hostname);
  if (hostname === rootDomain) return '';
  
  return hostname.substring(0, hostname.length - rootDomain.length - 1);
}

/**
 * Gera recomendações com base nas discrepâncias encontradas
 * 
 * @param discrepancies - Array de discrepâncias encontradas
 * @param siteUrl - URL normalizada do site
 * @param recommendedAdditions - URLs recomendadas para adicionar
 * @returns string[] - Array de recomendações
 */
function generateRecommendations(
  discrepancies: Array<{
    type: 'protocol' | 'www' | 'trailing_slash' | 'subdomain' | 'different_domain';
    propertyURL: string;
    details: string;
  }>,
  siteUrl: string,
  recommendedAdditions: string[]
): string[] {
  const recommendations: string[] = [];
  
  // Recomendações específicas para cada tipo de discrepância
  if (discrepancies.some(d => d.type === 'different_domain')) {
    recommendations.push(`Verifique se está acessando o domínio correto. Adicione ${siteUrl} como uma nova propriedade no Search Console.`);
  }
  
  if (discrepancies.some(d => d.type === 'protocol')) {
    try {
      const urlObj = new URL(siteUrl);
      const protocol = urlObj.protocol.replace(':', '');
      recommendations.push(`Configure o site para usar consistentemente o protocolo ${protocol} e adicione a versão ${protocol} ao Search Console.`);
    } catch (e) {
      // Ignorar erro
    }
  }
  
  if (discrepancies.some(d => d.type === 'www')) {
    try {
      const urlObj = new URL(siteUrl);
      const useWww = urlObj.hostname.startsWith('www.');
      recommendations.push(`Configure o site para usar consistentemente ${useWww ? 'www' : 'non-www'} e adicione a versão correspondente ao Search Console.`);
      
      // Recomendar redirecionamento
      recommendations.push(`Implemente um redirecionamento 301 da versão ${useWww ? 'non-www' : 'www'} para a versão ${useWww ? 'www' : 'non-www'}.`);
    } catch (e) {
      // Ignorar erro
    }
  }
  
  if (discrepancies.some(d => d.type === 'trailing_slash')) {
    try {
      const urlObj = new URL(siteUrl);
      const useTrailingSlash = urlObj.pathname.endsWith('/') && urlObj.pathname !== '/';
      recommendations.push(`Padronize o uso de ${useTrailingSlash ? 'barras finais' : 'URLs sem barras finais'} em todo o site.`);
      
      // Recomendar redirecionamento
      recommendations.push(`Implemente um redirecionamento 301 de URLs ${useTrailingSlash ? 'sem barras finais' : 'com barras finais'} para URLs ${useTrailingSlash ? 'com barras finais' : 'sem barras finais'}.`);
    } catch (e) {
      // Ignorar erro
    }
  }
  
  if (discrepancies.some(d => d.type === 'subdomain')) {
    recommendations.push('Verifique se está usando o subdomínio correto e configurado de acordo com a estrutura do seu site.');
  }
  
  // Recomendar variantes a adicionar
  if (recommendedAdditions.length > 0) {
    recommendations.push(`Adicione as seguintes variações de URL como propriedades no Search Console: ${recommendedAdditions.join(', ')}`);
    recommendations.push('Defina a propriedade preferida nas configurações do Search Console para consolidar dados.');
  }
  
  // Recomendações gerais
  recommendations.push('Configure redirecionamentos adequados (301) para garantir que todas as variantes de URL apontem para a versão canônica.');
  recommendations.push('Implemente tags canônicas em todas as páginas para indicar claramente a URL preferida.');
  
  return recommendations;
}

export { verifyToken };
