import puppeteer from 'puppeteer';
import { isURL } from './utils.js';
import { analyzeImageWithOpenAI, captureUrlScreenshot } from './utils-ai';
import path from 'path';
import fs from 'fs';

export interface LanguageUrlChangeResult {
  urlChangesWithLanguage: boolean;
  detectedMethod?: 'subdomain' | 'subdirectory' | 'parameter' | 'domain' | 'unknown';
  initialUrl: string;
  detectedLanguageSwitchers: {
    selector: string;
    text?: string;
    resultingUrl?: string;
    clickSuccessful?: boolean;
  }[];
  screenshotPath?: string;
  aiAnalysis?: string;
  error?: string;
}

export interface LanguageUrlChangeOptions {
  useAI?: boolean;
  takeScreenshots?: boolean;
  timeout?: number;
  verbose?: boolean;
}

/**
 * Verifica se a URL de um site muda ao trocar o idioma
 * 
 * @param input - URL do site a ser verificado
 * @param options - Opções de configuração adicionais
 * @returns Promise<LanguageUrlChangeResult> - Resultados da verificação
 */
export async function checkLanguageUrlChange(
  input: string,
  options?: LanguageUrlChangeOptions
): Promise<LanguageUrlChangeResult> {
  // Valores padrão para as opções
  const defaultOptions = { 
    useAI: true, 
    takeScreenshots: true,
    timeout: 30000,
    verbose: false
  };
  
  // Combinar opções padrão com as fornecidas
  const opts = { ...defaultOptions, ...options };
  
  try {
    // Verificar se o input é uma URL válida
    if (!isURL(input)) {
      return {
        urlChangesWithLanguage: false,
        initialUrl: input,
        detectedLanguageSwitchers: [],
        error: "Invalid URL provided"
      };
    }

    // Inicializar o navegador
    const browser = await puppeteer.launch({ 
      headless: true,
      defaultViewport: { width: 1366, height: 768 }
    });

    // Preparar objeto de resultado
    const result: LanguageUrlChangeResult = {
      urlChangesWithLanguage: false,
      initialUrl: input,
      detectedLanguageSwitchers: []
    };

    try {
      const page = await browser.newPage();
      
      // Configurar timeout
      page.setDefaultNavigationTimeout(opts.timeout);
      
      // Navegar para a URL
      await page.goto(input, { waitUntil: 'networkidle2' });
      result.initialUrl = page.url(); // Usa URL final (após redirecionamentos)

      // 1. Verificar hreflang em tags link (abordagem mais confiável)
      const hreflangUrls = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('link[rel="alternate"][hreflang]'));
        return links.map(link => ({
          lang: link.getAttribute('hreflang'),
          url: link.getAttribute('href')
        }));
      });

      // 2. Procurar por seletores de idioma na página
      const languageSwitchers = await findLanguageSwitchers(page);
      
      // Se não encontrou seletores óbvios e a opção de IA está ativada
      if (languageSwitchers.length === 0 && opts.useAI && opts.takeScreenshots) {
        // Capturar screenshot para análise com IA
        const screenshotDir = path.join(__dirname, 'screenshots');
        if (!fs.existsSync(screenshotDir)) {
          fs.mkdirSync(screenshotDir, { recursive: true });
        }
        
        const timestamp = Date.now();
        const screenshotPath = path.join(screenshotDir, `language-detection-${timestamp}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: false });
        result.screenshotPath = screenshotPath;
        
        // Analisar screenshot com IA para identificar seletores de idioma
        const aiPrompt = `Esta é uma captura de tela de um site. Identifique elementos na página que parecem ser seletores de idioma (language switchers). Descreva onde estão localizados (ex: topo direito, rodapé) e como são (ex: bandeiras, dropdown, links com códigos como 'EN', 'ES', etc). Se não houver seletores visíveis, indique isso.`;
        
        const aiResponse = await analyzeImageWithOpenAI({
          imagePath: screenshotPath,
          prompt: aiPrompt
        });
        
        result.aiAnalysis = aiResponse.analysis;
        
        // Tentar extrair informações úteis da análise de IA para refinar nossa busca
        // Esta seria uma implementação mais avançada que poderia ser feita posteriormente
      }
      
      // 3. Se encontramos seletores de hreflang, verificamos se as URLs são diferentes
      if (hreflangUrls.length > 0) {
        const differentUrls = hreflangUrls.some(item => {
          try {
            if (!item.url) return false;
            
            // Resolver URLs relativas
            const hrefUrl = new URL(item.url, result.initialUrl);
            const initialUrlObj = new URL(result.initialUrl);
            
            // Verificar se a URL é diferente
            return hrefUrl.toString() !== initialUrlObj.toString();
          } catch (e) {
            return false;
          }
        });
        
        if (differentUrls) {
          result.urlChangesWithLanguage = true;
          result.detectedMethod = 'unknown'; // Detectamos pelas tags, não pela navegação
        }
      }
      
      // 4. Testar cliques nos seletores de idioma encontrados
      const testedSwitchers = await testLanguageSwitchers(page, languageSwitchers, result.initialUrl);
      result.detectedLanguageSwitchers = testedSwitchers;
      
      // 5. Verificar se algum clique resultou em mudança de URL
      const successfulSwitch = testedSwitchers.find(
        s => s.clickSuccessful && s.resultingUrl && s.resultingUrl !== result.initialUrl
      );
      
      if (successfulSwitch) {
        result.urlChangesWithLanguage = true;
        
        // Determinar o método de internacionalização usado
        if (successfulSwitch.resultingUrl) {
          result.detectedMethod = detectInternationalizationMethod(result.initialUrl, successfulSwitch.resultingUrl);
        }
      }
      
      await browser.close();
      return result;
      
    } catch (error) {
      // Fechar o navegador em caso de erro
      await browser.close();
      throw error;
    }
  } catch (error) {
    // Capturar qualquer erro na função principal
    return {
      urlChangesWithLanguage: false,
      initialUrl: input,
      detectedLanguageSwitchers: [],
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Encontra possíveis seletores de idioma na página
 */
async function findLanguageSwitchers(page: any): Promise<Array<{selector: string, text?: string}>> {
  return await page.evaluate(() => {
    const candidates: Array<{selector: string, text?: string}> = [];
    
    // Função auxiliar para gerar um seletor para um elemento
    function generateSelector(element: Element): string {
      // Priorizar ID
      if (element.id) {
        return `#${element.id}`;
      }
      
      // Usar classes
      if (element.classList && element.classList.length) {
        return `.${Array.from(element.classList).join('.')}`;
      }
      
      // Usar tag com atributos
      let selector = element.tagName.toLowerCase();
      
      // Adicionar outros atributos se disponíveis
      if (element.hasAttribute('role')) {
        selector += `[role="${element.getAttribute('role')}"]`;
      }
      
      // Se for um link, adicionar parte da href
      if (element.tagName.toLowerCase() === 'a' && element.hasAttribute('href')) {
        const href = element.getAttribute('href');
        if (href && href.length < 30) {
          selector += `[href="${href}"]`;
        }
      }
      
      return selector;
    }
    
    // 1. Palavras-chave comuns em várias línguas para identificar seletores de idioma
    const languageKeywords = [
      'language', 'lang', 'idioma', 'língua', 'idiomas', 'sprache',
      'langue', 'linguas', 'linguagem', 'locales', 'region',
      'en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'zh',
      'english', 'español', 'português', 'deutsch', 'français'
    ];
    
    // 2. Procurar por elementos com atributos relacionados a idioma
    const langElements = document.querySelectorAll('[lang], [data-lang], [data-language], [data-locale], [hreflang]');
    langElements.forEach(el => {
      candidates.push({
        selector: generateSelector(el),
        text: el.textContent?.trim()
      });
    });
    
    // 3. Procurar por elementos com classes ou IDs relacionados a idioma
    const langKeywordsPattern = new RegExp(`(${languageKeywords.join('|')})`, 'i');
    
    document.querySelectorAll('*').forEach(el => {
      // Verificar id e classes
      const idAndClass = `${el.id} ${el.className}`.toLowerCase();
      
      if (langKeywordsPattern.test(idAndClass)) {
        candidates.push({
          selector: generateSelector(el),
          text: el.textContent?.trim()
        });
      }
    });
    
    // 4. Procurar por links com códigos de idioma de 2 letras
    document.querySelectorAll('a').forEach(link => {
      const href = link.getAttribute('href');
      if (href) {
        // Links típicos de idioma: /en/, /es/, /pt/, ?lang=en, etc.
        if (href.match(/\/[a-z]{2}(-[a-z]{2})?\/?$/) || 
            href.match(/\?(?:[^&]*&)*lang=([a-z]{2})/) ||
            href.match(/\/language\/[a-z]{2}/) ||
            href.match(/\/locale\/[a-z]{2}/)) {
          candidates.push({
            selector: generateSelector(link),
            text: link.textContent?.trim()
          });
        }
      }
      
      // Verificar conteúdo do link - muitas vezes são apenas códigos de idioma
      const text = link.textContent?.trim();
      if (text && text.match(/^[A-Z]{2}$/) && text.length === 2) {
        candidates.push({
          selector: generateSelector(link),
          text: text
        });
      }
    });
    
    // 5. Procurar por elementos com bandeiras (frequentemente usados para indicar idiomas)
    document.querySelectorAll('img').forEach(img => {
      const src = img.getAttribute('src') || '';
      const alt = img.getAttribute('alt') || '';
      
      if (src.match(/flag|lingua|idioma|language/) || 
          alt.match(/flag|language|idioma/i)) {
        // Adicionar o pai do elemento se for um link ou botão
        const parent = img.parentElement;
        if (parent && (parent.tagName.toLowerCase() === 'a' || parent.tagName.toLowerCase() === 'button')) {
          candidates.push({
            selector: generateSelector(parent),
            text: parent.textContent?.trim()
          });
        } else {
          candidates.push({
            selector: generateSelector(img),
            text: alt
          });
        }
      }
    });
    
    // 6. Procurar por elementos que contenham códigos de idioma ou nomes de idiomas
    document.querySelectorAll('a, button, span, div').forEach(el => {
      const text = el.textContent?.trim();
      
      // Códigos de idioma isolados ou com separadores
      if (text && (
          text.match(/^[A-Z]{2}$/) || // Código de idioma: EN, ES, FR
          text.match(/^[A-Z]{2}[\s\/\|\-][A-Z]{2}$/) || // Exemplo: EN | ES
          languageKeywords.some(keyword => 
            text.toLowerCase() === keyword.toLowerCase() || 
            text.toLowerCase().includes(keyword.toLowerCase())
          )
      )) {
        candidates.push({
          selector: generateSelector(el),
          text: text
        });
      }
    });
    
    // 7. Procurar por elementos com globo/ícone mundial (frequentemente usado para idiomas)
    document.querySelectorAll('*').forEach(el => {
      const classAndId = `${el.className} ${el.id}`.toLowerCase();
      if (classAndId.match(/globe|world|earth|internacional|language-icon|idioma-icon/)) {
        candidates.push({
          selector: generateSelector(el),
          text: el.textContent?.trim()
        });
      }
    });
    
    // Remover duplicatas baseado no seletor
    const uniqueCandidates: Array<{selector: string, text?: string}> = [];
    const selectors = new Set();
    
    for (const candidate of candidates) {
      if (!selectors.has(candidate.selector)) {
        selectors.add(candidate.selector);
        uniqueCandidates.push(candidate);
      }
    }
    
    return uniqueCandidates;
  });
}

/**
 * Testa os seletores de idioma encontrados para verificar se clicá-los muda a URL
 */
async function testLanguageSwitchers(
  page: any, 
  switchers: Array<{selector: string, text?: string}>,
  initialUrl: string
): Promise<Array<{selector: string, text?: string, resultingUrl?: string, clickSuccessful?: boolean}>> {
  const results = [];
  
  // Clone a página para cada teste para evitar efeitos colaterais
  for (const switcher of switchers) {
    try {
      // Criar uma nova página para cada teste
      const testPage = await page.browser().newPage();
      await testPage.goto(initialUrl, { waitUntil: 'networkidle2' });
      
      // Verificar se o seletor existe na página
      const elementExists = await testPage.evaluate((selector: string) => {
        return document.querySelector(selector) !== null;
      }, switcher.selector);
      
      if (!elementExists) {
        results.push({
          ...switcher,
          clickSuccessful: false,
          resultingUrl: initialUrl
        });
        await testPage.close();
        continue;
      }
      
      // Primeiro tentar rolar até o elemento para torná-lo visível
      await testPage.evaluate((selector: string) => {
        const element = document.querySelector(selector);
        if (element) {
          element.scrollIntoView({ behavior: 'auto', block: 'center' });
        }
      }, switcher.selector);
      
      // Esperar um momento para garantir que a rolagem foi concluída
      await testPage.waitForTimeout(500);
      
      // Configurar um listener para detectar mudanças de navegação
      let navigationOccurred = false;
      let newUrl = initialUrl;
      
      testPage.on('framenavigated', (frame: any) => {
        if (frame === testPage.mainFrame()) {
          navigationOccurred = true;
          newUrl = frame.url();
        }
      });
      
      // Tentar clicar no elemento
      const clickSuccess = await testPage.evaluate((selector: string) => {
        try {
          const element = document.querySelector(selector);
          if (!element) return false;
          
          // Simular um clique real
          const rect = element.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) return false;
          
          // Verificar se está visível
          const style = window.getComputedStyle(element);
          if (style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity) === 0) {
            return false;
          }
          
          // Clicar no elemento
          (element as HTMLElement).click();
          return true;
        } catch (e) {
          return false;
        }
      }, switcher.selector);
      
      // Esperar por possível navegação
      await testPage.waitForTimeout(2000);
      
      // Obter a URL final
      const currentUrl = testPage.url();
      
      results.push({
        ...switcher,
        clickSuccessful: clickSuccess,
        resultingUrl: navigationOccurred ? newUrl : currentUrl
      });
      
      // Fechar a página de teste
      await testPage.close();
      
    } catch (error) {
      results.push({
        ...switcher,
        clickSuccessful: false
      });
    }
  }
  
  return results;
}

/**
 * Detecta o método de internacionalização utilizado
 */
function detectInternationalizationMethod(
  initialUrl: string, 
  newUrl: string
): 'subdomain' | 'subdirectory' | 'parameter' | 'domain' | 'unknown' {
  try {
    const initialUrlObj = new URL(initialUrl);
    const newUrlObj = new URL(newUrl);
    
    // Verificar se o domínio mudou completamente
    if (extractMainDomain(initialUrlObj.hostname) !== extractMainDomain(newUrlObj.hostname)) {
      return 'domain';
    }
    
    // Verificar se é um subdomínio diferente
    if (initialUrlObj.hostname !== newUrlObj.hostname) {
      return 'subdomain';
    }
    
    // Verificar se o caminho mudou (subdiretório)
    if (initialUrlObj.pathname !== newUrlObj.pathname) {
      // Verificar se a mudança parece com um código de idioma (/en/, /pt/, etc)
      const pathSegments = newUrlObj.pathname.split('/').filter(Boolean);
      if (pathSegments.length > 0 && pathSegments[0].match(/^[a-z]{2}(-[a-z]{2})?$/)) {
        return 'subdirectory';
      }
      
      // Outras mudanças de caminho podem ainda ser subdiretórios
      return 'subdirectory';
    }
    
    // Verificar se os parâmetros mudaram
    if (initialUrlObj.search !== newUrlObj.search) {
      // Verificar se há um parâmetro de idioma
      const params = new URLSearchParams(newUrlObj.search);
      for (const [key, value] of params.entries()) {
        if (key.match(/lang|locale|idioma|language/) && value.match(/^[a-z]{2}(-[a-z]{2})?$/)) {
          return 'parameter';
        }
      }
      
      // Outras mudanças de parâmetros
      return 'parameter';
    }
    
    return 'unknown';
  } catch (e) {
    return 'unknown';
  }
}

/**
 * Extrai o domínio principal de um hostname
 */
function extractMainDomain(hostname: string): string {
  // Remover subdomínios - pegar apenas os dois últimos níveis
  // exemplo: en.example.com -> example.com
  const parts = hostname.split('.');
  if (parts.length <= 2) return hostname;
  
  return parts.slice(-2).join('.');
}
