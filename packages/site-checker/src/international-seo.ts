import { cleanDomainName, isURL } from "./utils.js";

export interface InternationalSEOCheckResult {
    isUnique: boolean;
    languages: { [language: string]: string };
    error?: string;
}

/**
 * Verifica se existe uma URL única para cada linguagem da página, analisando as tags <link rel="alternate" hreflang="..." href="...">.
 * Se o input for uma URL, faz o fetch do conteúdo HTML antes de realizar a verificação.
 * 
 * @param input - Conteúdo HTML ou URL para verificação
 * @returns Promise<InternationalSEOCheckResult> - Resultado da verificação
 */
export async function checkUniqueLanguageUrls(input: string): Promise<InternationalSEOCheckResult> {
    try {
        let content: string;

        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return {
                    isUnique: false,
                    languages: {},
                    error: "HTTP Error: " + response.status + " " + response.statusText
                };
            }
            content = await response.text();
        } else {
            content = input;
        }

        // Extrai todas as tags <link ...>
        const linkTags = content.match(/<link\b[^>]*>/gi) || [];
        const languageMap: { [language: string]: string } = {};
        let isUnique = true;

        // Para cada tag, verifica se possui rel="alternate" e os atributos hreflang e href
        linkTags.forEach(tag => {
            if (/rel\s*=\s*["']alternate["']/i.test(tag)) {
                const hreflangMatch = tag.match(/hreflang\s*=\s*["']([^"']+)["']/i);
                const hrefMatch = tag.match(/href\s*=\s*["']([^"']+)["']/i);
                if (hreflangMatch && hrefMatch) {
                    const language = hreflangMatch[1].toLowerCase();
                    const href = hrefMatch[1];
                    if (languageMap[language]) {
                        // Já existe uma URL para essa linguagem
                        isUnique = false;
                    } else {
                        languageMap[language] = href;
                    }
                }
            }
        });

        return {
            isUnique,
            languages: languageMap
        };

    } catch (error) {
        return {
            isUnique: false,
            languages: {},
            error: error instanceof Error ? error.message : "Erro desconhecido"
        };
    }
}

export interface HreflangCheckResult {
    hasHreflang: boolean;
    languages: string[];
    error?: string;
}

/**
 * Verifica se a página possui menção de tags hreflang para idiomas alternativos.
 * Se o input for uma URL, faz o fetch do conteúdo HTML antes de realizar a verificação.
 * Procura por tags do tipo: <link rel="alternate" hreflang="..." href="...">
 * 
 * @param input - Conteúdo HTML ou URL para verificação
 * @returns Promise<HreflangCheckResult> - Resultado da verificação contendo se há menção e quais idiomas foram encontrados
 */
export async function checkHreflangMentions(input: string): Promise<HreflangCheckResult> {
    try {
        let content: string;

        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return {
                    hasHreflang: false,
                    languages: [],
                    error: "HTTP Error: " + response.status + " " + response.statusText
                };
            }
            content = await response.text();
        } else {
            content = input;
        }

        // Expressão regular para encontrar tags <link rel="alternate" hreflang="..." href="...">
        const regex = /<link\b[^>]*rel\s*=\s*["']alternate["'][^>]*hreflang\s*=\s*["']([^"']+)["'][^>]*>/gi;
        const languages: string[] = [];
        let match;
        while ((match = regex.exec(content)) !== null) {
            languages.push(match[1].toLowerCase());
        }

        return {
            hasHreflang: languages.length > 0,
            languages
        };

    } catch (error) {
        return {
            hasHreflang: false,
            languages: [],
            error: error instanceof Error ? error.message : "Erro desconhecido"
        };
    }
}

export interface HreflangXDefaultCheckResult {
    hasXDefault: boolean;
    href?: string;
    error?: string;
}

/**
 * Verifica se a página possui uma tag <link rel="alternate" hreflang="x-default" href="...">.
 * Se o input for uma URL, faz o fetch do conteúdo HTML antes de realizar a verificação.
 * 
 * @param input - Conteúdo HTML ou URL para verificação
 * @returns Promise<HreflangXDefaultCheckResult> - Resultado da verificação indicando se a tag x-default está definida e seu href
 */
export async function checkHreflangXDefault(input: string): Promise<HreflangXDefaultCheckResult> {
    try {
        let content: string;

        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return {
                    hasXDefault: false,
                    error: "HTTP Error: " + response.status + " " + response.statusText
                };
            }
            content = await response.text();
        } else {
            content = input;
        }

        // Regex para encontrar a tag com hreflang="x-default"
        const regex = /<link\b[^>]*rel\s*=\s*["']alternate["'][^>]*hreflang\s*=\s*["']x-default["'][^>]*href\s*=\s*["']([^"']+)["'][^>]*>/i;
        const match = regex.exec(content);

        if (match && match[1]) {
            return {
                hasXDefault: true,
                href: match[1]
            };
        } else {
            return {
                hasXDefault: false
            };
        }
    } catch (error) {
        return {
            hasXDefault: false,
            error: error instanceof Error ? error.message : "Erro desconhecido"
        };
    }
}

export interface LanguageDirectiveCheckResult {
    isMatching: boolean;
    currentLanguage?: string;
    error?: string;
}

/**
 * Verifica se a diretiva de linguagem da página (atributo lang da tag <html>) corresponde ao idioma selecionado.
 * Se o input for uma URL, faz o fetch do conteúdo HTML antes de realizar a verificação.
 * 
 * @param input - Conteúdo HTML ou URL para verificação
 * @param expectedLanguage - O idioma esperado (ex: "en", "pt")
 * @returns Promise<LanguageDirectiveCheckResult> - Resultado da verificação
 */
export async function checkLanguageDirective(input: string, expectedLanguage: string): Promise<LanguageDirectiveCheckResult> {
    try {
        let content: string;
        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return {
                    isMatching: false,
                    error: "HTTP Error: " + response.status + " " + response.statusText
                };
            }
            content = await response.text();
        } else {
            content = input;
        }
        const regex = /<html\b[^>]*\blang\s*=\s*["']([^"']+)["']/i;
        const match = regex.exec(content);
        if (match && match[1]) {
            const currentLanguage = match[1].toLowerCase();
            const isMatching = currentLanguage === expectedLanguage.toLowerCase();
            return {
                isMatching,
                currentLanguage
            };
        } else {
            return {
                isMatching: false,
                error: "Lang attribute not found in HTML."
            };
        }
    } catch (error) {
        return {
            isMatching: false,
            error: error instanceof Error ? error.message : "Erro desconhecido"
        };
    }
}
