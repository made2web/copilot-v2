import { isURL } from "./utils.js";
import { JSDOM } from "jsdom";

export interface SubdomainCrosslinkingResult {
  subdomain: string;
  linkedInMenuAndFooter: boolean;
  linkedInMenu: boolean;
  linkedInFooter: boolean;
  error?: string;
}

/**
 * Verifica se os subdomínios estão linkados no menu e rodapé da página
 *
 * @param input - URL ou conteúdo HTML da página a ser analisada
 * @param subdomains - Array de subdomínios a serem verificados
 * @returns Promise<SubdomainCrosslinkingResult[]> - Resultados da verificação para cada subdomínio
 */
export async function checkSubdomainCrosslinking(
  input: string,
  subdomains: string[]
): Promise<SubdomainCrosslinkingResult[]> {
  try {
    let content: string;

    if (isURL(input)) {
      const response = await fetch(input);
      if (!response.ok) {
        return subdomains.map((subdomain) => ({
          subdomain,
          linkedInMenuAndFooter: false,
          linkedInMenu: false,
          linkedInFooter: false,
          error: `HTTP Error: ${response.status} ${response.statusText}`
        }));
      }
      content = await response.text();
    } else {
      content = input;
    }

    // Analisar o HTML usando JSDOM
    const dom = new JSDOM(content);
    const document = dom.window.document;

    // Encontrar elementos de menu
    const menuElements = findMenuElements(document);
    
    // Encontrar elementos de rodapé
    const footerElements = findFooterElements(document);

    // Verificar cada subdomínio nos elementos de menu e rodapé
    return subdomains.map(subdomain => {
      const linkedInMenu = checkLinkInElements(menuElements, subdomain);
      const linkedInFooter = checkLinkInElements(footerElements, subdomain);
      
      return {
        subdomain,
        linkedInMenuAndFooter: linkedInMenu && linkedInFooter,
        linkedInMenu,
        linkedInFooter
      };
    });
  } catch (error) {
    return subdomains.map(subdomain => ({
      subdomain,
      linkedInMenuAndFooter: false,
      linkedInMenu: false,
      linkedInFooter: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }));
  }
}

/**
 * Encontra elementos que provavelmente são menus na página
 */
function findMenuElements(document: Document): Element[] {
  const menuSelectors = [
    'nav', 
    'header nav', 
    '#main-nav', 
    '#primary-menu', 
    '.main-navigation', 
    '.primary-menu',
    '.menu',
    '#menu',
    '.navbar',
    '#navbar',
    'header .menu',
    '[role="navigation"]'
  ];

  const menuElements: Element[] = [];
  
  // Buscar por todos os possíveis seletores de menu
  for (const selector of menuSelectors) {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      elements.forEach(el => menuElements.push(el));
    }
  }

  // Se não encontrou por seletores específicos, buscar baseado em características
  if (menuElements.length === 0) {
    // Elementos com muitos links na parte superior são provavelmente menus
    const headerElements = document.querySelectorAll('header, div, nav, ul');
    
    for (const element of headerElements) {
      const links = element.querySelectorAll('a');
      
      // Se tem mais de 3 links, provavelmente é um menu
      if (links.length > 3) {
        menuElements.push(element);
      }
    }
  }

  return menuElements;
}

/**
 * Encontra elementos que provavelmente são rodapés na página
 */
function findFooterElements(document: Document): Element[] {
  const footerSelectors = [
    'footer',
    '#footer',
    '.footer',
    '.site-footer',
    '[role="contentinfo"]',
    '.bottom-bar'
  ];

  const footerElements: Element[] = [];
  
  // Buscar por todos os possíveis seletores de rodapé
  for (const selector of footerSelectors) {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      elements.forEach(el => footerElements.push(el));
    }
  }

  // Se não encontrou por seletores específicos, considerar os elementos da parte inferior da página
  if (footerElements.length === 0) {
    const allElements = Array.from(document.querySelectorAll('div, section'));
    
    // Filtrar elementos com links
    const elementsWithLinks = allElements.filter(el => 
      el.querySelectorAll('a').length > 0
    );
    
    // Se houver elementos com links, adicionar o último como rodapé
    if (elementsWithLinks.length > 0) {
      footerElements.push(elementsWithLinks[elementsWithLinks.length - 1]);
    }
  }

  return footerElements;
}

/**
 * Verifica se um subdomínio aparece como link em uma lista de elementos
 */
function checkLinkInElements(elements: Element[], subdomain: string): boolean {
  for (const element of elements) {
    const links = element.querySelectorAll('a');
    
    for (const link of links) {
      const href = link.getAttribute('href');
      
      if (href && href.includes(subdomain)) {
        return true;
      }
    }
  }
  
  return false;
}
