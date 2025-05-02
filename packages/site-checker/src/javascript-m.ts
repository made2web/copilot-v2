import { analyzeImageWithOpenAI, checkMenuVisibilityWithoutJS, MenuVisibilityResult, checkRenderTime, RenderTimeResult, captureUrlScreenshot } from './utils-ai';

// Reexportar os tipos para serem usados nos testes
export type { MenuVisibilityResult, RenderTimeResult };

/**
 * Verifica se o menu de um site permanece visível quando o JavaScript está desabilitado
 * @param url URL do site a ser verificado
 * @param menuSelector Seletor CSS do menu (opcional, a função tentará detectar automaticamente)
 * @param options Opções adicionais para configurar o teste
 * @returns Resultado da verificação de visibilidade do menu
 */
export async function checkMenuVisibilityWithoutJavaScript(
  url: string,
  menuSelector?: string,
  options: {
    useAI?: boolean;
    takeScreenshots?: boolean;
    menuItemSelectors?: string[];
  } = {}
): Promise<MenuVisibilityResult> {
  try {
    // Usar a função especializada do utils-ai
    const result = await checkMenuVisibilityWithoutJS(url, menuSelector, options);
    
    // Se a opção de utilizar IA estiver ativada e tivermos screenshots, usar IA para verificar
    if (options.useAI && result.screenshotWithJS && result.screenshotWithoutJS) {
      try {
        const aiAnalysis = await analyzeImageWithOpenAI({
          imagePath: result.screenshotWithoutJS,
          prompt: `Analise esta captura de tela de um site com JavaScript desabilitado. 
            O menu principal do site está visível e utilizável? 
            Se possível, identifique o menu na imagem e indique se ele parece funcional.
            Por favor, responda detalhadamente, considerando a acessibilidade e usabilidade do menu.`
        });
        
        result.analysisWithAI = aiAnalysis.analysis;
      } catch (aiError) {
        console.error('Erro na análise com IA:', aiError);
        result.error = `Análise com IA: ${aiError instanceof Error ? aiError.message : 'Erro desconhecido'}`;
      }
    }

    return result;
  } catch (error) {
    return {
      url,
      isMenuVisibleWithJS: false,
      isMenuVisibleWithoutJS: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

/**
 * Verifica múltiplas URLs para determinar se seus menus permanecem visíveis sem JavaScript
 * @param urls Lista de URLs para verificar
 * @param commonMenuSelector Seletor CSS comum a ser usado em todas as URLs (opcional)
 * @param options Opções adicionais para configurar o teste
 * @returns Array com resultados para cada URL
 */
export async function checkMultipleUrlsMenuVisibility(
  urls: string[],
  commonMenuSelector?: string,
  options: {
    useAI?: boolean;
    takeScreenshots?: boolean;
    menuItemSelectors?: string[];
  } = {}
): Promise<MenuVisibilityResult[]> {
  const results: MenuVisibilityResult[] = [];
  
  for (const url of urls) {
    try {
      const result = await checkMenuVisibilityWithoutJavaScript(url, commonMenuSelector, options);
      results.push(result);
    } catch (error) {
      results.push({
        url,
        isMenuVisibleWithJS: false,
        isMenuVisibleWithoutJS: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
  
  return results;
}

/**
 * Verifica se o tempo de renderização de uma página web excede 5 segundos
 * @param url URL da página a ser verificada
 * @param options Opções adicionais para configurar o teste
 * @returns Resultado da verificação do tempo de renderização
 */
export async function checkRenderTimeExceeds5Seconds(
  url: string,
  options: {
    takeScreenshot?: boolean;
    renderThreshold?: number;
    timeout?: number;
  } = {}
): Promise<RenderTimeResult> {
  try {
    // Definir o limite padrão de 5 segundos se não for especificado
    const renderThreshold = options.renderThreshold || 5000;
    
    // Usar a função especializada do utils-ai
    const result = await checkRenderTime(url, {
      takeScreenshot: options.takeScreenshot,
      renderThreshold, 
      timeout: options.timeout
    });
    
    // Se houver um erro no resultado, considerar que o tempo excede o limite
    if (result.error) {
      return {
        ...result,
        renderTimeExceeds5Seconds: true
      };
    }
    
    return {
      ...result,
      // Garantir explicitamente que o resultado contém o indicador de excesso de tempo
      renderTimeExceeds5Seconds: result.renderTimeInMs > renderThreshold
    };
  } catch (error) {
    return {
      url,
      renderTimeExceeds5Seconds: true, // Consideramos excedido se houver erro
      renderTimeInMs: 0,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

/**
 * Verifica múltiplas URLs para determinar se seus tempos de renderização excedem 5 segundos
 * @param urls Lista de URLs para verificar
 * @param options Opções adicionais para configurar o teste
 * @returns Array com resultados para cada URL
 */
export async function checkMultipleUrlsRenderTime(
  urls: string[],
  options: {
    takeScreenshot?: boolean;
    renderThreshold?: number;
    timeout?: number;
  } = {}
): Promise<RenderTimeResult[]> {
  const results: RenderTimeResult[] = [];
  
  for (const url of urls) {
    try {
      const result = await checkRenderTimeExceeds5Seconds(url, options);
      results.push(result);
    } catch (error) {
      results.push({
        url,
        renderTimeExceeds5Seconds: true, // Consideramos excedido se houver erro
        renderTimeInMs: 0,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
  
  return results;
}

/**
 * Interface para resultados de compatibilidade de renderização com motores de busca
 */
export interface SearchEngineRenderingResult {
  url: string;
  isRenderedProperly: boolean;
  screenshotPath?: string;
  analysisWithAI?: string;
  error?: string;
}

/**
 * Verifica se a renderização de uma página é compatível com o Google
 * @param url URL da página a ser verificada
 * @param options Opções adicionais para configurar o teste
 * @returns Resultado da verificação de compatibilidade com o Google
 */
export async function checkGoogleRenderingCompatibility(
  url: string,
  options: {
    useAI?: boolean;
    takeScreenshot?: boolean;
    waitTime?: number;
  } = {}
): Promise<SearchEngineRenderingResult> {
  try {
    const puppeteer = await import('puppeteer');
    const browser = await puppeteer.default.launch({ 
      headless: true,
      defaultViewport: { width: 1366, height: 768 }
    });
    
    const page = await browser.newPage();
    
    // Configurar o user-agent do Google para simular o Googlebot
    await page.setUserAgent('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)');
    
    // Navegar para a URL
    await page.goto(url, { waitUntil: 'networkidle2' });
    
    // Esperar tempo adicional se necessário
    if (options.waitTime) {
      await new Promise(resolve => setTimeout(resolve, options.waitTime));
    } else {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    let screenshotPath: string | undefined;
    
    // Tirar screenshot se a opção estiver ativada
    if (options.takeScreenshot || options.useAI) {
      screenshotPath = await captureUrlScreenshot(url);
    }
    
    let analysisWithAI: string | undefined;
    let isRenderedProperly = true; // Padrão é considerar que está ok
    
    // Se a opção de usar IA estiver ativada e tivermos o screenshot, usar IA para verificar
    if (options.useAI && screenshotPath) {
      try {
        const aiAnalysis = await analyzeImageWithOpenAI({
          imagePath: screenshotPath,
          prompt: `Analise esta captura de tela de um site renderizado com o user-agent do Google.
            O conteúdo principal do site está completamente visível e utilizável?
            O site parece ter sido renderizado corretamente, com todos os elementos visuais importantes?
            Existem problemas de renderização, conteúdo bloqueado ou elementos faltando que poderiam impactar a indexação pelo Google?
            Por favor, responda detalhadamente sobre a adequação para indexação do Google.`
        });
        
        analysisWithAI = aiAnalysis.analysis;
        
        // Verificar na análise de IA se indica problemas de renderização
        isRenderedProperly = !aiAnalysis.analysis.toLowerCase().includes('problema') && 
                             !aiAnalysis.analysis.toLowerCase().includes('não está visível') &&
                             !aiAnalysis.analysis.toLowerCase().includes('não foi renderizado');
      } catch (aiError) {
        console.error('Erro na análise com IA:', aiError);
      }
    }
    
    await browser.close();
    
    return {
      url,
      isRenderedProperly,
      screenshotPath,
      analysisWithAI,
    };
  } catch (error) {
    return {
      url,
      isRenderedProperly: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

/**
 * Verifica se a renderização de uma página é compatível com o Bing
 * @param url URL da página a ser verificada
 * @param options Opções adicionais para configurar o teste
 * @returns Resultado da verificação de compatibilidade com o Bing
 */
export async function checkBingRenderingCompatibility(
  url: string,
  options: {
    useAI?: boolean;
    takeScreenshot?: boolean;
    waitTime?: number;
  } = {}
): Promise<SearchEngineRenderingResult> {
  try {
    const puppeteer = await import('puppeteer');
    const browser = await puppeteer.default.launch({ 
      headless: true,
      defaultViewport: { width: 1366, height: 768 }
    });
    
    const page = await browser.newPage();
    
    // Configurar o user-agent do Bing para simular o BingBot
    await page.setUserAgent('Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)');
    
    // Navegar para a URL
    await page.goto(url, { waitUntil: 'networkidle2' });
    
    // Esperar tempo adicional se necessário
    if (options.waitTime) {
      await new Promise(resolve => setTimeout(resolve, options.waitTime));
    } else {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    let screenshotPath: string | undefined;
    
    // Tirar screenshot se a opção estiver ativada
    if (options.takeScreenshot || options.useAI) {
      screenshotPath = await captureUrlScreenshot(url);
    }
    
    let analysisWithAI: string | undefined;
    let isRenderedProperly = true; // Padrão é considerar que está ok
    
    // Se a opção de usar IA estiver ativada e tivermos o screenshot, usar IA para verificar
    if (options.useAI && screenshotPath) {
      try {
        const aiAnalysis = await analyzeImageWithOpenAI({
          imagePath: screenshotPath,
          prompt: `Analise esta captura de tela de um site renderizado com o user-agent do Bing.
            O conteúdo principal do site está completamente visível e utilizável?
            O site parece ter sido renderizado corretamente, com todos os elementos visuais importantes?
            Existem problemas de renderização, conteúdo bloqueado ou elementos faltando que poderiam impactar a indexação pelo Bing?
            Por favor, responda detalhadamente sobre a adequação para indexação do Bing.`
        });
        
        analysisWithAI = aiAnalysis.analysis;
        
        // Verificar na análise de IA se indica problemas de renderização
        isRenderedProperly = !aiAnalysis.analysis.toLowerCase().includes('problema') && 
                             !aiAnalysis.analysis.toLowerCase().includes('não está visível') &&
                             !aiAnalysis.analysis.toLowerCase().includes('não foi renderizado');
      } catch (aiError) {
        console.error('Erro na análise com IA:', aiError);
      }
    }
    
    await browser.close();
    
    return {
      url,
      isRenderedProperly,
      screenshotPath,
      analysisWithAI,
    };
  } catch (error) {
    return {
      url,
      isRenderedProperly: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

/**
 * Interface para resultados da verificação de conteúdo com scroll infinito
 */
export interface InfiniteScrollCheckResult {
  url: string;
  hasInfiniteScroll: boolean;
  loadMoreButtonFound: boolean;
  contentLoaded: boolean;
  initialItemCount: number;
  finalItemCount: number;
  itemsAdded: number;
  urlChanges: {
    initialUrl: string;
    changedUrls: string[];
  };
  loadMoreSelector?: string;
  itemSelector?: string;
  screenshotPath?: string;
  error?: string;
}

/**
 * Checks if infinite scroll content on a webpage is properly crawlable
 * @param url URL of the website to check
 * @param options Additional options to configure the test
 * @returns Result of the infinite scroll check
 */
export async function checkInfiniteScrollContent(
  url: string,
  options: {
    loadMoreSelector?: string;
    itemSelector?: string;
    maxClicks?: number;
    waitTimeBetweenClicks?: number;
    takeScreenshot?: boolean;
    timeout?: number;
  } = {}
): Promise<InfiniteScrollCheckResult> {
  try {
    const puppeteer = await import('puppeteer');
    
    // Default options
    const maxClicks = options.maxClicks || 3;
    const waitTimeBetweenClicks = options.waitTimeBetweenClicks || 2000;
    const timeout = options.timeout || 30000;
    
    // Initialize result object
    const result: InfiniteScrollCheckResult = {
      url,
      hasInfiniteScroll: false,
      loadMoreButtonFound: false,
      contentLoaded: false,
      initialItemCount: 0,
      finalItemCount: 0,
      itemsAdded: 0,
      urlChanges: {
        initialUrl: url,
        changedUrls: []
      }
    };
    
    // Launch browser
    const browser = await puppeteer.default.launch({ 
      headless: true,
      defaultViewport: { width: 1366, height: 768 }
    });
    
    const page = await browser.newPage();
    
    // Set timeout
    page.setDefaultNavigationTimeout(timeout);
    
    // Navigate to the URL
    await page.goto(url, { waitUntil: 'networkidle2' });
    result.urlChanges.initialUrl = page.url(); // Use the final URL after any redirects
    
    // Wait a bit for any dynamic content to load
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));
    
    // Detect item selector if not provided
    const itemSelector = options.itemSelector || await detectContentItemSelector(page);
    result.itemSelector = itemSelector;
    
    // Count initial items
    if (itemSelector) {
      result.initialItemCount = await page.evaluate((selector) => {
        return document.querySelectorAll(selector).length;
      }, itemSelector);
    }
    
    // Detect "Load More" button if not provided
    const loadMoreSelector = options.loadMoreSelector || await detectLoadMoreSelector(page);
    result.loadMoreSelector = loadMoreSelector;
    
    // If Load More button is found, try clicking it
    if (loadMoreSelector) {
      result.loadMoreButtonFound = true;
      
      for (let i = 0; i < maxClicks; i++) {
        // Check if the selector exists on the page
        const buttonExists = await page.evaluate((selector) => {
          const element = document.querySelector(selector);
          if (!element) return false;
          
          // Check if it's visible
          const rect = element.getBoundingClientRect();
          const style = window.getComputedStyle(element);
          return rect.width > 0 && 
                 rect.height > 0 && 
                 style.display !== 'none' && 
                 style.visibility !== 'hidden' && 
                 parseFloat(style.opacity) > 0;
        }, loadMoreSelector);
        
        if (!buttonExists) break;
        
        // Store the current URL before clicking
        const currentUrl = page.url();
        
        // Try to scroll to the button to make it visible
        await page.evaluate((selector) => {
          const button = document.querySelector(selector);
          if (button) {
            button.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, loadMoreSelector);
        
        // Use evaluate with setTimeout instead of waitForTimeout
        await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 500)));
        
        // Click the Load More button
        try {
          await page.click(loadMoreSelector);
          
          // Wait for any potential navigation or content loading
          await page.evaluate((time) => new Promise(resolve => setTimeout(resolve, time)), waitTimeBetweenClicks);
          
          // Check if the URL changed
          const newUrl = page.url();
          if (newUrl !== currentUrl && !result.urlChanges.changedUrls.includes(newUrl)) {
            result.urlChanges.changedUrls.push(newUrl);
          }
          
          // Count items after clicking
          if (itemSelector) {
            const newCount = await page.evaluate((selector) => {
              return document.querySelectorAll(selector).length;
            }, itemSelector);
            
            // If content increased, mark as content loaded
            if (newCount > result.initialItemCount) {
              result.contentLoaded = true;
              result.finalItemCount = newCount;
            }
          }
        } catch (error) {
          console.warn(`Failed to click the Load More button on attempt ${i+1}:`, error);
          break;
        }
      }
      
      // Final item count check
      if (itemSelector) {
        result.finalItemCount = await page.evaluate((selector) => {
          return document.querySelectorAll(selector).length;
        }, itemSelector);
        
        result.itemsAdded = result.finalItemCount - result.initialItemCount;
      }
      
      // Determine if the page has infinite scroll
      result.hasInfiniteScroll = result.loadMoreButtonFound && result.contentLoaded;
    }
    
    // Take screenshot if requested
    if (options.takeScreenshot) {
      result.screenshotPath = await captureUrlScreenshot(url);
    }
    
    await browser.close();
    return result;
    
  } catch (error) {
    return {
      url,
      hasInfiniteScroll: false,
      loadMoreButtonFound: false,
      contentLoaded: false,
      initialItemCount: 0,
      finalItemCount: 0,
      itemsAdded: 0,
      urlChanges: {
        initialUrl: url,
        changedUrls: []
      },
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Detects selectors for "Load More" buttons or infinite scroll triggers
 * @param page Puppeteer page instance
 * @returns CSS selector for the load more button, or undefined if not found
 */
async function detectLoadMoreSelector(page: any): Promise<string | undefined> {
  return await page.evaluate(() => {
    // Common selectors for "Load More" buttons
    const commonLoadMoreSelectors = [
      // Button texts
      'button, a, div, span',
      // Common button classes
      '.load-more, .loadMore, .load_more',
      '#load-more, #loadMore, #load_more',
      '.more, .view-more, .show-more',
      '#more, #view-more, #show-more',
      // Pagination
      '.pagination a:last-child',
      '.pager a:last-child',
      '.next-page, .nextPage, .next_page',
      '#next-page, #nextPage, #next_page'
    ];
    
    // Common text patterns for load more buttons
    const loadMoreTextPatterns = [
      /load\s*more/i,
      /show\s*more/i,
      /view\s*more/i,
      /more\s*items/i,
      /more\s*results/i,
      /next\s*page/i,
      /próxim[ao]/i, // Portuguese
      /mais/i, // Portuguese
      /carregar\s*mais/i, // Portuguese
      /ver\s*mais/i // Portuguese
    ];
    
    // Helper function to check if element text matches load more patterns
    const matchesLoadMorePattern = (text: string) => {
      return loadMoreTextPatterns.some(pattern => pattern.test(text));
    };
    
    // Find elements that may be load more buttons
    let candidateSelector: string | undefined;
    
    // Try exact text matches first
    const exactTextMatch = Array.from(document.querySelectorAll('button, a, div, span'))
      .find(el => {
        const text = el.textContent?.trim() || '';
        return matchesLoadMorePattern(text);
      });
    
    if (exactTextMatch) {
      if (exactTextMatch.id) {
        return `#${exactTextMatch.id}`;
      } else if (exactTextMatch.classList && exactTextMatch.classList.length > 0) {
        return `.${Array.from(exactTextMatch.classList).join('.')}`;
      } else {
        // Generate a specific selector for this element
        const tag = exactTextMatch.tagName.toLowerCase();
        const text = exactTextMatch.textContent?.trim();
        return `${tag}:contains("${text}")`;
      }
    }
    
    // Try common selectors
    for (const selector of commonLoadMoreSelectors) {
      const elements = document.querySelectorAll(selector);
      for (const el of elements) {
        const text = el.textContent?.trim() || '';
        const hasMatchingText = matchesLoadMorePattern(text);
        
        // Check if visible
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        const isVisible = rect.width > 0 && 
                          rect.height > 0 && 
                          style.display !== 'none' && 
                          style.visibility !== 'hidden' && 
                          parseFloat(style.opacity) > 0;
        
        // Check position (load more buttons are typically at the bottom)
        const isNearBottom = rect.top > (window.innerHeight * 0.6);
        
        if ((hasMatchingText || selector.includes('load-more') || selector.includes('more')) && isVisible) {
          if (el.id) {
            candidateSelector = `#${el.id}`;
            break;
          } else if (el.classList && el.classList.length > 0) {
            candidateSelector = `.${Array.from(el.classList).join('.')}`;
            break;
          } else {
            candidateSelector = selector;
            break;
          }
        }
      }
      
      if (candidateSelector) break;
    }
    
    // If still not found, try looking for elements that look like buttons at the bottom
    if (!candidateSelector) {
      const possibleButtons = Array.from(document.querySelectorAll('button, a.btn, .button, [class*="button"], [class*="btn"]'));
      
      for (const button of possibleButtons) {
        const rect = button.getBoundingClientRect();
        const style = window.getComputedStyle(button);
        
        // Check if visible and near the bottom of the content
        const isVisible = rect.width > 0 && 
                          rect.height > 0 && 
                          style.display !== 'none' && 
                          style.visibility !== 'hidden' && 
                          parseFloat(style.opacity) > 0;
        
        const isNearBottom = rect.top > (window.innerHeight * 0.6);
        
        if (isVisible && isNearBottom) {
          if (button.id) {
            candidateSelector = `#${button.id}`;
            break;
          } else if (button.classList && button.classList.length > 0) {
            candidateSelector = `.${Array.from(button.classList).join('.')}`;
            break;
          } else {
            candidateSelector = button.tagName.toLowerCase();
            break;
          }
        }
      }
    }
    
    return candidateSelector;
  });
}

/**
 * Detects selectors for content items that would be loaded in an infinite scroll
 * @param page Puppeteer page instance
 * @returns CSS selector for content items, or undefined if not found
 */
async function detectContentItemSelector(page: any): Promise<string | undefined> {
  return page.evaluate(() => {
    // Common selectors for content items in lists
    const commonItemSelectors = [
      // Product listings
      '.product, .product-item, .product-card',
      // Article listings
      '.article, .post, .entry, .card',
      // Generic listings
      '.item, .list-item, .grid-item',
      // List and grid elements
      'ul li, ol li, .grid > div, .row > div'
    ];
    
    // Try to find repeating elements with similar structure
    const findRepeatingElements = () => {
      // Check common item selectors first
      for (const selector of commonItemSelectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length >= 3) {
          // Found at least 3 items with the same selector - likely a listing
          return selector;
        }
      }
      
      // If common selectors don't work, try to find repeating patterns
      const candidateParents = document.querySelectorAll('.grid, .list, .products, .articles, .posts, .items, ul, ol, .row, .container > div');
      
      for (const parent of candidateParents) {
        const children = parent.children;
        
        // Needs at least 3 children to be considered a list
        if (children.length >= 3) {
          // Check if children have similar structure
          const firstClassList = children[0].classList;
          const secondClassList = children[1].classList;
          
          // Compare first two children to see if they have the same class
          let sameClass = false;
          if (firstClassList.length > 0 && secondClassList.length > 0) {
            for (const cls of firstClassList) {
              if (secondClassList.contains(cls)) {
                if (cls !== 'row' && cls !== 'col' && !cls.includes('col-')) {
                  sameClass = true;
                  
                  // Generate selector for these items
                  if (parent.id) {
                    return `#${parent.id} > .${cls}`;
                  } else if (parent.classList.length > 0) {
                    const parentClass = Array.from(parent.classList)[0];
                    return `.${parentClass} > .${cls}`;
                  } else {
                    return `.${cls}`;
                  }
                }
              }
            }
          }
          
          // If no matching class found, use the parent as a reference
          if (!sameClass) {
            if (parent.id) {
              return `#${parent.id} > ${children[0].tagName.toLowerCase()}`;
            } else if (parent.classList.length > 0) {
              const parentClass = Array.from(parent.classList)[0];
              return `.${parentClass} > ${children[0].tagName.toLowerCase()}`;
            }
          }
        }
      }
      
      return undefined;
    };
    
    return findRepeatingElements();
  });
}
