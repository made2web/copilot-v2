import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

export interface SearchResultsCheckResult {
  url: string;
  searchTerm: string;
  resultsFound: boolean;
  resultsMatchQuery: boolean;
  resultCount?: number;
  aiAnalysis?: string;
  error?: string;
}

/**
 * Interface para os resultados da verificação de breadcrumbs
 */
export interface BreadcrumbsCheckResult {
  url: string;
  hasBreadcrumbs: boolean;
  isComplete: boolean;
  breadcrumbPath: string[];
  breadcrumbSelector?: string;
  startsWithHome: boolean;
  hasMultipleLevels: boolean;
  screenshotPath?: string;
  error?: string;
}

/**
 * Interface para os resultados da verificação de profundidade de página
 */
export interface PageDepthCheckResult {
  url: string;
  homeUrl: string;
  depth: number;
  path: string[];
  isDeep: boolean;
  maxRecommendedDepth: number;
  inSitemap?: boolean;
  status: 'success' | 'warning' | 'error';
  screenshotPath?: string;
  error?: string;
}

/**
 * Verifica se os breadcrumbs de uma página web estão com o caminho completo (home - categoria...)
 * @param url URL da página a ser analisada
 * @param options Opções adicionais para configurar a verificação
 * @returns Resultado da verificação dos breadcrumbs
 */
export async function checkBreadcrumbsCompleteness(
  url: string,
  options: {
    breadcrumbSelectors?: string[];
    takeScreenshot?: boolean;
    timeout?: number;
  } = {}
): Promise<BreadcrumbsCheckResult> {
  // Valores padrão para as opções
  const breadcrumbSelectors = options.breadcrumbSelectors || [
    '.breadcrumb',
    '.breadcrumbs',
    'nav[aria-label="breadcrumb"]',
    '[data-testid="breadcrumb"]',
    '.navigation-breadcrumb',
    '.pathway',
    '.breadcrumb-trail',
    'ol.breadcrumb',
    'ul.breadcrumb'
  ];
  const timeout = options.timeout || 30000;

  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1366, height: 768 }
  });

  try {
    const result: BreadcrumbsCheckResult = {
      url,
      hasBreadcrumbs: false,
      isComplete: false,
      breadcrumbPath: [],
      startsWithHome: false,
      hasMultipleLevels: false
    };

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout });

    // Procurar pelo elemento de breadcrumb usando seletores comuns
    let breadcrumbSelector = '';
    for (const selector of breadcrumbSelectors) {
      const elementExists = await page.evaluate((sel) => {
        return document.querySelector(sel) !== null;
      }, selector);

      if (elementExists) {
        breadcrumbSelector = selector;
        break;
      }
    }

    if (!breadcrumbSelector) {
      result.error = 'Não foi possível encontrar o elemento de breadcrumb na página';
      return result;
    }

    result.hasBreadcrumbs = true;
    result.breadcrumbSelector = breadcrumbSelector;

    // Extrair informações dos breadcrumbs
    const breadcrumbInfo = await page.evaluate((selector) => {
      const breadcrumb = document.querySelector(selector);
      if (!breadcrumb) return { items: [], html: '' };

      // Tentar encontrar os links dentro do breadcrumb
      const links = breadcrumb.querySelectorAll('a');
      const items = Array.from(links).map(link => link.textContent?.trim() || '');

      // Se não encontrar links, tentar encontrar itens (li, span, etc.)
      if (items.length === 0) {
        const listItems = breadcrumb.querySelectorAll('li, span.item, .breadcrumb-item');
        items.push(...Array.from(listItems).map(item => item.textContent?.trim() || '').filter(text => text !== '/' && text !== '>' && text !== ''));
      }

      return {
        items,
        html: breadcrumb.outerHTML
      };
    }, breadcrumbSelector);

    // Capturar screenshot se solicitado
    if (options.takeScreenshot) {
      const screenshotDir = path.join(__dirname, '..', 'src/screenshots');
      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
      }
      
      const timestamp = Date.now();
      const screenshotPath = path.join(screenshotDir, `breadcrumb-check-${timestamp}.png`);
      
      // Destacar o breadcrumb na screenshot
      await page.evaluate((selector) => {
        const breadcrumb = document.querySelector(selector);
        if (breadcrumb) {
          const originalStyle = breadcrumb.getAttribute('style') || '';
          breadcrumb.setAttribute('style', `${originalStyle}; border: 3px solid orange !important; background-color: rgba(255,165,0,0.2) !important;`);
        }
      }, breadcrumbSelector);
      
      await page.screenshot({ path: screenshotPath, fullPage: false });
      result.screenshotPath = screenshotPath;
    }

    // Filtrar itens vazios ou separadores
    result.breadcrumbPath = breadcrumbInfo.items.filter(item => item.trim() !== '' && !['/', '>', '»', '-', '|'].includes(item.trim()));

    // Verificar se os breadcrumbs estão completos
    if (result.breadcrumbPath.length > 0) {
      // Verificar se começa com "Home" ou similar
      const firstItem = result.breadcrumbPath[0].toLowerCase();
      result.startsWithHome = firstItem === 'home' || 
                             firstItem === 'início' || 
                             firstItem === 'inicio' ||
                             firstItem.includes('home') ||
                             firstItem.includes('página inicial');

      // Verificar se tem múltiplos níveis
      result.hasMultipleLevels = result.breadcrumbPath.length > 1;

      // Um breadcrumb completo deve começar com home/início e ter múltiplos níveis
      result.isComplete = result.startsWithHome && result.hasMultipleLevels;
    }

    return result;
  } catch (error) {
    console.error('Erro ao verificar breadcrumbs:', error);
    return {
      url,
      hasBreadcrumbs: false,
      isComplete: false,
      breadcrumbPath: [],
      startsWithHome: false,
      hasMultipleLevels: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  } finally {
    await browser.close();
  }
}

/**
 * Verifica a profundidade de cliques (click depth) de uma página web a partir da página inicial
 * @param url URL da página a ser analisada
 * @param homeUrl URL da página inicial do site
 * @param options Opções adicionais para configurar a verificação
 * @returns Resultado da verificação de profundidade
 */
export async function checkPageDepth(
  url: string,
  homeUrl: string,
  options: {
    maxRecommendedDepth?: number;
    checkSitemap?: boolean;
    sitemapUrl?: string;
    takeScreenshot?: boolean;
    timeout?: number;
  } = {}
): Promise<PageDepthCheckResult> {
  // Valores padrão para as opções
  const maxRecommendedDepth = options.maxRecommendedDepth || 6;
  const timeout = options.timeout || 30000;

  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1366, height: 768 }
  });

  try {
    const result: PageDepthCheckResult = {
      url,
      homeUrl,
      depth: 0,
      path: [],
      isDeep: false,
      maxRecommendedDepth,
      status: 'success'
    };

    // Verificar se a URL é válida
    if (!url.startsWith('http')) {
      result.error = 'URL inválida: deve começar com http:// ou https://';
      result.status = 'error';
      return result;
    }

    // Verificar se são a mesma página
    if (url === homeUrl) {
      result.depth = 0;
      result.path = [homeUrl];
      return result;
    }

    const page = await browser.newPage();
    
    // Determinar a profundidade da página com base nos breadcrumbs
    await page.goto(url, { waitUntil: 'networkidle2', timeout });
    
    // Primeiro método: Usar os breadcrumbs para determinar a profundidade
    const breadcrumbCheck = await checkBreadcrumbsCompleteness(url);
    
    if (breadcrumbCheck.hasBreadcrumbs && breadcrumbCheck.breadcrumbPath.length > 0) {
      // Usar o comprimento dos breadcrumbs como indicador de profundidade
      result.depth = breadcrumbCheck.breadcrumbPath.length - 1; // -1 porque o primeiro item é a home
      result.path = breadcrumbCheck.breadcrumbPath;
    } else {
      // Segundo método: Usar a estrutura de URL para estimar a profundidade
      const urlPath = new URL(url).pathname;
      const segments = urlPath.split('/').filter(segment => segment.trim() !== '');
      result.depth = segments.length;
      
      // Criar um caminho com base nos segmentos da URL
      const pathElements = [new URL(homeUrl).hostname];
      for (const segment of segments) {
        pathElements.push(segment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
      }
      result.path = pathElements;
    }

    // Verificar se a página está no sitemap
    if (options.checkSitemap && options.sitemapUrl) {
      const sitemapPage = await browser.newPage();
      await sitemapPage.goto(options.sitemapUrl, { waitUntil: 'networkidle2', timeout });
      
      const inSitemap = await sitemapPage.evaluate((targetUrl) => {
        const content = document.body.textContent || '';
        return content.includes(targetUrl);
      }, url);
      
      result.inSitemap = inSitemap;
      await sitemapPage.close();
    }

    // Capturar screenshot se solicitado
    if (options.takeScreenshot) {
      const screenshotDir = path.join(__dirname, '..', 'src/screenshots');
      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
      }
      
      const timestamp = Date.now();
      const screenshotPath = path.join(screenshotDir, `page-depth-check-${timestamp}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: false });
      result.screenshotPath = screenshotPath;
    }

    // Verificar se a profundidade é maior que o recomendado
    result.isDeep = result.depth > maxRecommendedDepth;
    
    // Definir status com base na profundidade
    if (result.isDeep) {
      result.status = 'warning';
    }

    return result;
  } catch (error) {
    console.error('Erro ao verificar profundidade da página:', error);
    return {
      url,
      homeUrl,
      depth: -1,
      path: [],
      isDeep: false,
      maxRecommendedDepth,
      status: 'error',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  } finally {
    await browser.close();
  }
}
