import { isURL, cleanDomainName } from "./utils.js";

export interface HeadingTagsCheckResult {
    hasH1: boolean;
    h1Count: number;
    error?: string;
}

export async function checkPageHasH1(input: string): Promise<HeadingTagsCheckResult> {
    try {
        let content: string;
        
        if (isURL(input)) {
            const response = await fetch(input);
            
            if (!response.ok) {
                return {
                    hasH1: false,
                    h1Count: 0,
                    error: "HTTP Error: " + response.status + " " + response.statusText
                };
            }
            content = await response.text();
        } else {
            content = input;
        }

        const h1Regex = /<h1\b[^>]*>(.*?)<\/h1>/gi;
        const matches = content.match(h1Regex);
        const h1Count = matches ? matches.length : 0;
        
        return {
            hasH1: h1Count > 0,
            h1Count
        };
    } catch (error) {
        return {
            hasH1: false,
            h1Count: 0,
            error: error instanceof Error ? error.message : "Erro desconhecido"
        };
    }
}

export interface HeadingTagsH2CheckResult {
    hasH2: boolean;
    h2Count: number;
    error?: string;
}

export async function checkPageHasH2(input: string): Promise<HeadingTagsH2CheckResult> {
    try {
        let content: string;
        
        if (isURL(input)) {
            const response = await fetch(input);
            
            if (!response.ok) {
                return {
                    hasH2: false,
                    h2Count: 0,
                    error: "HTTP Error: " + response.status + " " + response.statusText
                };
            }
            content = await response.text();
        } else {
            content = input;
        }

        const h2Regex = /<h2\b[^>]*>(.*?)<\/h2>/gi;
        const matches = content.match(h2Regex);
        const h2Count = matches ? matches.length : 0;

        return {
            hasH2: h2Count > 0,
            h2Count
        };
    } catch (error) {
        return {
            hasH2: false,
            h2Count: 0,
            error: error instanceof Error ? error.message : "Erro desconhecido"
        };
    }
}

// Nova interface e função para verificar se existem múltiplas tags H1 na página
export interface MultipleH1CheckResult {
    hasMultipleH1: boolean;
    h1Count: number;
    error?: string;
}

export async function checkMultipleH1Tags(input: string): Promise<MultipleH1CheckResult> {
    try {
        let content: string;
        
        if (isURL(input)) {
            const response = await fetch(input);
            
            if (!response.ok) {
                return {
                    hasMultipleH1: false,
                    h1Count: 0,
                    error: "HTTP Error: " + response.status + " " + response.statusText
                };
            }
            content = await response.text();
        } else {
            content = input;
        }

        const h1Regex = /<h1\b[^>]*>[\s\S]*?<\/h1>/gi;
        const matches = content.match(h1Regex);
        const h1Count = matches ? matches.length : 0;
        
        return {
            hasMultipleH1: h1Count > 1,
            h1Count
        };
    } catch (error) {
        return {
            hasMultipleH1: false,
            h1Count: 0,
            error: error instanceof Error ? error.message : "Erro desconhecido"
        };
    }
}

// Nova interface e função para verificar se as heading tags do rodapé estão em H4
export interface FooterHeadingTagsCheckResult {
    allH4: boolean;
    nonH4Count: number;
    error?: string;
}

export async function checkFooterHeadingTagsAreH4(input: string): Promise<FooterHeadingTagsCheckResult> {
    try {
        let content: string;
        
        if (isURL(input)) {
            const response = await fetch(input);
            
            if (!response.ok) {
                return {
                    allH4: false,
                    nonH4Count: 0,
                    error: "HTTP Error: " + response.status + " " + response.statusText
                };
            }
            content = await response.text();
        } else {
            content = input;
        }

        const footerMatch = content.match(/<footer\b[^>]*>([\s\S]*?)<\/footer>/i);
        if (!footerMatch) {
            return {
                allH4: false,
                nonH4Count: 0,
                error: "Footer element not found"
            };
        }
        const footerContent = footerMatch[1];
        const headingRegex = /<h([1-6])\b[^>]*>/gi;
        let match;
        let nonH4Count = 0;

        while ((match = headingRegex.exec(footerContent)) !== null) {
            if (match[1] !== "4") {
                nonH4Count++;
            }
        }

        return {
            allH4: nonH4Count === 0,
            nonH4Count
        };
    } catch (error) {
        return {
            allH4: false,
            nonH4Count: 0,
            error: error instanceof Error ? error.message : "Erro desconhecido"
        };
    }
}

// Nova interface e função para verificar a hierarquia de heading tags
export interface HeadingTagsHierarchyCheckResult {
    isValidHierarchy: boolean;
    errors: string[];
    headings: number[];
}

export async function checkHeadingTagsHierarchy(input: string): Promise<HeadingTagsHierarchyCheckResult> {
    try {
        let content: string;

        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return {
                    isValidHierarchy: false,
                    errors: ["HTTP Error: " + response.status + " " + response.statusText],
                    headings: []
                };
            }
            content = await response.text();
        } else {
            content = input;
        }

        const regex = /<h([1-6])\b[^>]*>/gi;
        const headings: number[] = [];
        let match: RegExpExecArray | null;
        while ((match = regex.exec(content)) !== null) {
            headings.push(parseInt(match[1]));
        }

        const errors: string[] = [];
        if (headings.length === 0) {
            errors.push("No heading tags found.");
        } else {
            if (headings[0] !== 1) {
                errors.push("First heading is not H1.");
            }
            for (let i = 1; i < headings.length; i++) {
                if (headings[i] > headings[i - 1] + 1) {
                    errors.push("Heading level jump from H" + headings[i - 1] + " to H" + headings[i] + " at position " + (i + 1) + ".");
                }
            }
        }

        return {
            isValidHierarchy: errors.length === 0,
            errors,
            headings
        };
    } catch (error) {
        return {
            isValidHierarchy: false,
            errors: [error instanceof Error ? error.message : "Erro desconhecido"],
            headings: []
        };
    }
}

// Nova interface e função para verificar se a palavra-chave principal está presente na tag H1
export interface PrimaryKeywordH1CheckResult {
    hasKeyword: boolean;
    h1Texts: string[];
    error?: string;
}

export async function checkH1KeywordPresence(input: string, keyword: string): Promise<PrimaryKeywordH1CheckResult> {
    try {
        let content: string;

        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return {
                    hasKeyword: false,
                    h1Texts: [],
                    error: "HTTP Error: " + response.status + " " + response.statusText
                };
            }
            content = await response.text();
        } else {
            content = input;
        }

        const h1Regex = /<h1\b[^>]*>(.*?)<\/h1>/gi;
        let match;
        const h1Texts: string[] = [];
        while ((match = h1Regex.exec(content)) !== null) {
            let text = match[1].replace(/<[^>]+>/g, "").trim();
            h1Texts.push(text);
        }
        const hasKeyword = h1Texts.some(text => text.toLowerCase().includes(keyword.toLowerCase()));
        return {
            hasKeyword,
            h1Texts
        };
    } catch (error) {
        return {
            hasKeyword: false,
            h1Texts: [],
            error: error instanceof Error ? error.message : "Erro desconhecido"
        };
    }
}

// Nova interface e função para verificar se a palavra-chave principal está presente em alguma tag H2
export interface PrimaryKeywordH2CheckResult {
    hasKeyword: boolean;
    h2Texts: string[];
    error?: string;
}

export async function checkH2KeywordPresence(input: string, keyword: string): Promise<PrimaryKeywordH2CheckResult> {
    try {
        let content: string;
        
        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return {
                    hasKeyword: false,
                    h2Texts: [],
                    error: "HTTP Error: " + response.status + " " + response.statusText
                };
            }
            content = await response.text();
        } else {
            content = input;
        }
        
        const h2Regex = /<h2\b[^>]*>(.*?)<\/h2>/gi;
        let match;
        const h2Texts: string[] = [];
        while ((match = h2Regex.exec(content)) !== null) {
            let text = match[1].replace(/<[^>]+>/g, "").trim();
            h2Texts.push(text);
        }
        const hasKeyword = h2Texts.some(text => text.toLowerCase().includes(keyword.toLowerCase()));
        return {
            hasKeyword,
            h2Texts
        };
    } catch (error) {
        return {
            hasKeyword: false,
            h2Texts: [],
            error: error instanceof Error ? error.message : "Erro desconhecido"
        };
    }
}

// NOVA FUNÇÃO: Verifica se existem H1 duplicados entre múltiplas páginas
export interface DuplicateH1CheckResult {
    duplicateFound: boolean;
    duplicateH1: string;
    urls: string[];
    error?: string;
}

/**
 * Recebe uma lista de URLs ou um domínio (string) para extrair URLs via sitemap.xml,
 * realiza requisições para cada página e extrai o conteúdo da tag H1. Em seguida, verifica se
 * existe algum valor de H1 que se repete em mais de uma página, retornando a lista de URLs correspondentes.
 *
 * A função trata tanto inputs que são URLs completas quanto nomes de domínio (para extração via sitemap.xml).
 *
 * @param input - string ou array de strings representando URLs ou um domínio
 * @returns Promise<DuplicateH1CheckResult> - Resultado contendo se foi encontrado H1 duplicado e as URLs correspondentes
 */
export async function checkDuplicateH1AcrossPages(input: string | string[]): Promise<DuplicateH1CheckResult> {
    try {
        let urls: string[] = [];

        // Se input é string, verificar se é uma URL ou um domínio
        if (typeof input === 'string') {
            if (isURL(input)) {
                urls = [input];
            } else {
                // Trata input como domínio e tenta extrair URLs do sitemap.xml
                const domain = cleanDomainName(input);
                const sitemapUrl = `https://${domain}/sitemap.xml`;
                const response = await fetch(sitemapUrl);
                if (!response.ok) {
                    return {
                        duplicateFound: false,
                        duplicateH1: "",
                        urls: [],
                        error: "HTTP Error while fetching sitemap: " + response.status + " " + response.statusText
                    };
                }
                const sitemapContent = await response.text();
                // Regex simples para extrair <loc> URLs </loc>
                const locRegex = /<loc>(.*?)<\/loc>/gi;
                let match;
                while ((match = locRegex.exec(sitemapContent)) !== null) {
                    urls.push(match[1].trim());
                }
                if (urls.length === 0) {
                    return {
                        duplicateFound: false,
                        duplicateH1: "",
                        urls: [],
                        error: "No URLs found in sitemap."
                    };
                }
            }
        } else {
            urls = input;
        }

        // Mapa para armazenar H1 (normalizado) e as URLs que o possuem
        const h1Map: Map<string, string[]> = new Map();

        // Para cada URL, buscar conteúdo e extrair H1 (primeiro h1 encontrado)
        await Promise.all(urls.map(async (url) => {
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    return;
                }
                const content = await response.text();
                const h1Regex = /<h1\b[^>]*>(.*?)<\/h1>/i;
                const match = h1Regex.exec(content);
                if (match) {
                    // Remove tags internas e normaliza o texto
                    let h1Text = match[1].replace(/<[^>]+>/g, "").trim();
                    h1Text = h1Text.toLowerCase();
                    if (h1Text) {
                        if (h1Map.has(h1Text)) {
                            h1Map.get(h1Text)?.push(url);
                        } else {
                            h1Map.set(h1Text, [url]);
                        }
                    }
                }
            } catch (e) {
                // Ignorar erros individuais
            }
        }));

        // Verifica se existe algum H1 que aparece em mais de uma URL
        for (const [h1, urlList] of h1Map.entries()) {
            if (urlList.length > 1) {
                return {
                    duplicateFound: true,
                    duplicateH1: h1,
                    urls: urlList
                };
            }
        }

        return {
            duplicateFound: false,
            duplicateH1: "",
            urls: []
        };
    } catch (error) {
        return {
            duplicateFound: false,
            duplicateH1: "",
            urls: [],
            error: error instanceof Error ? error.message : "Erro desconhecido"
        };
    }
}
