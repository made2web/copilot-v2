import { cleanDomainName } from "./utils.js";

interface H1CheckResult {
  hasH1: boolean;
  error?: string;
}

interface MultipleH1CheckResult {
  multipleH1s: boolean;
  error?: string;
}

interface H2CheckResult {
  hasH2: boolean;
  error?: string;
}

interface MultipleH2CheckResult {
  multipleH2s: boolean;
  error?: string;
}

interface H4CheckResult {
  hasH4: boolean;
  error?: string;
}

interface H5CheckResult {
  hasH5: boolean;
  error?: string;
}

interface HeadingHierarchyCheckResult {
  isHierarchyCorrect: boolean;
  error?: string;
}

/**
 * Verifica se todas as páginas do domínio têm pelo menos um H1
 * @param domain - O domínio a ser verificado (ex: "example.com")
 * @returns Promise<H1CheckResult> - Resultado da verificação
 */
export async function checkPagesHaveH1(domain: string): Promise<H1CheckResult> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const response = await fetch(`https://${cleanDomain}/`);
    if (!response.ok) {
      return {
        hasH1: false,
        error: `Falha ao buscar a página: ${response.status}`,
      };
    }
    const html = await response.text();
    const hasH1 = /<h1[^>]*>.*<\/h1>/i.test(html);
    return { hasH1 };
  } catch (error) {
    return {
      hasH1: false,
      error:
        error instanceof Error ? error.message : "Erro desconhecido ao verificar H1",
    };
  }
}

/**
 * Verifica se todas as páginas do domínio têm mais de um H1
 * @param domain - O domínio a ser verificado (ex: "example.com")
 * @returns Promise<MultipleH1CheckResult> - Resultado da verificação
 */
export async function checkPagesHaveMultipleH1s(domain: string): Promise<MultipleH1CheckResult> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const response = await fetch(`https://${cleanDomain}/`);
    if (!response.ok) {
      return {
        multipleH1s: false,
        error: `Falha ao buscar a página: ${response.status}`,
      };
    }
    const html = await response.text();
    const h1Matches = html.match(/<h1[^>]*>.*?<\/h1>/gi);
    const multipleH1s = h1Matches !== null && h1Matches.length > 1;
    return { multipleH1s };
  } catch (error) {
    return {
      multipleH1s: false,
      error:
        error instanceof Error ? error.message : "Erro desconhecido ao verificar múltiplos H1",
    };
  }
}

/**
 * Verifica se todas as páginas do domínio têm pelo menos um H2
 * @param domain - O domínio a ser verificado (ex: "example.com")
 * @returns Promise<H2CheckResult> - Resultado da verificação
 */
export async function checkPagesHaveH2(domain: string): Promise<H2CheckResult> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const response = await fetch(`https://${cleanDomain}/`);
    if (!response.ok) {
      return {
        hasH2: false,
        error: `Falha ao buscar a página: ${response.status}`,
      };
    }
    const html = await response.text();
    const hasH2 = /<h2[^>]*>.*<\/h2>/i.test(html);
    return { hasH2 };
  } catch (error) {
    return {
      hasH2: false,
      error:
        error instanceof Error ? error.message : "Erro desconhecido ao verificar H2",
    };
  }
}

/**
 * Verifica se todas as páginas do domínio têm mais de um H2
 * @param domain - O domínio a ser verificado (ex: "example.com")
 * @returns Promise<MultipleH2CheckResult> - Resultado da verificação
 */
export async function checkPagesHaveMultipleH2s(domain: string): Promise<MultipleH2CheckResult> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const response = await fetch(`https://${cleanDomain}/`);
    if (!response.ok) {
      return {
        multipleH2s: false,
        error: `Falha ao buscar a página: ${response.status}`,
      };
    }
    const html = await response.text();
    const h2Matches = html.match(/<h2[^>]*>.*?<\/h2>/gi);
    const multipleH2s = h2Matches !== null && h2Matches.length > 1;
    return { multipleH2s };
  } catch (error) {
    return {
      multipleH2s: false,
      error:
        error instanceof Error ? error.message : "Erro desconhecido ao verificar múltiplos H2",
    };
  }
}

/**
 * Verifica se todas as páginas do domínio têm pelo menos um H4 no rodapé
 * @param domain - O domínio a ser verificado (ex: "example.com")
 * @returns Promise<H4CheckResult> - Resultado da verificação
 */
export async function checkPagesFooterHasH4(domain: string): Promise<H4CheckResult> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const response = await fetch(`https://${cleanDomain}/`);
    if (!response.ok) {
      return {
        hasH4: false,
        error: `Failed to fetch page: ${response.status}`,
      };
    }
    const html = await response.text();
    const hasH4 = /<footer[^>]*>[\s\S]*?<h4[^>]*>.*?<\/h4>/i.test(html);
    return { hasH4 };
  } catch (error) {
    return {
      hasH4: false,
      error:
        error instanceof Error ? error.message : "Unknown error while checking Footer H4",
    };
  }
}

/**
 * Verifica se as páginas do domínio não têm H5 no rodapé
 * @param domain - O domínio a ser verificado (ex: "example.com")
 * @returns Promise<H5CheckResult> - Resultado da verificação
 */
export async function checkPagesFooterNotH5(domain: string): Promise<H5CheckResult> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const response = await fetch(`https://${cleanDomain}/`);
    if (!response.ok) {
      return {
        hasH5: false,
        error: `Failed to fetch page: ${response.status}`,
      };
    }
    const html = await response.text();
    const hasH5 = /<footer[^>]*>[\s\S]*?<h5[^>]*>.*?<\/h5>/i.test(html);
    return { hasH5 };
  } catch (error) {
    return {
      hasH5: false,
      error:
        error instanceof Error ? error.message : "Unknown error while checking Footer H5",
    };
  }
}

/**
 * Verifica se a hierarquia de heading tags está correta
 * @param domain - O domínio a ser verificado (ex: "example.com")
 * @returns Promise<HeadingHierarchyCheckResult> - Resultado da verificação
 */
export async function checkHeadingHierarchy(domain: string): Promise<HeadingHierarchyCheckResult> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const response = await fetch(`https://${cleanDomain}/`);
    if (!response.ok) {
      return {
        isHierarchyCorrect: false,
        error: `Failed to fetch page: ${response.status}`,
      };
    }
    const html = await response.text();
    const headingRegex = /<(h[1-6])[^>]*>(.*?)<\/\1>/gi;
    let match;
    let previousLevel = 0;
    while ((match = headingRegex.exec(html)) !== null) {
      const currentLevel = parseInt(match[1].substring(1), 10);
      if (previousLevel !== 0 && currentLevel > previousLevel + 1) {
        return {
          isHierarchyCorrect: false,
          error: `Heading level skipped from H${previousLevel} to H${currentLevel}`,
        };
      }
      previousLevel = currentLevel;
    }
    return { isHierarchyCorrect: true };
  } catch (error) {
    return {
      isHierarchyCorrect: false,
      error:
        error instanceof Error ? error.message : "Unknown error while checking heading hierarchy",
    };
  }
}
