import { cleanDomainName, isURL } from "./utils.js";

export interface MetaDescriptionCheckResult {
    descriptionCount: number;
    hasMultiple: boolean;
    error?: string;
}

export interface EmptyMetaDescriptionCheckResult {
    emptyCount: number;
    hasEmpty: boolean;
    error?: string;
}

export interface LongMetaDescriptionCheckResult {
    longCount: number;
    metaDescriptions: Array<{ content: string; isLong: boolean }>;
    limit: number;
    error?: string;
}

// Nova interface para meta descriptions curtas
export interface ShortMetaDescriptionCheckResult {
    shortCount: number;
    metaDescriptions: Array<{ content: string; isShort: boolean }>;
    limit: number;
    error?: string;
}

// Nova interface para resultado de meta descriptions duplicadas
export interface DuplicateMetaDescriptionCheckResult {
    duplicates: Array<{ description: string; urls: string[] }>;
    totalPages: number;
    error?: string;
}

// Nova interface para checar a palavra-chave na meta description
export interface KeywordMetaDescriptionCheckResult {
    containsKeyword: boolean;
    metaDescription: string;
    keyword: string;
    error?: string;
}

// Nova interface para checar a presença da marca na meta description
export interface BrandMetaDescriptionCheckResult {
    notIncludedUrls: string[];
    totalPages: number;
    keyword: string;
    error?: string;
}

/**
 * Verifies if a page contains more than one meta description tag.
 * The function accepts an HTML string or a URL. If a URL is provided, the content will be fetched first.
 * @param input - HTML content or a URL
 * @returns Promise<MetaDescriptionCheckResult> - The result of the meta description check
 */
export async function checkMetaDescriptionCount(input: string): Promise<MetaDescriptionCheckResult> {
    try {
        let content: string;
        
        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return {
                    descriptionCount: 0,
                    hasMultiple: false,
                    error: "HTTP Error: " + response.status + " " + response.statusText
                };
            }
            content = await response.text();
        } else {
            content = input;
        }
        
        // Regex to match meta tags with name="description" attribute
        const regex = /<meta\s+[^>]*name\s*=\s*["']description["'][^>]*>/gi;
        const matches = content.match(regex) || [];
        const descriptionCount = matches.length;
        const hasMultiple = descriptionCount > 1;
        
        return { descriptionCount, hasMultiple };
    } catch (error) {
        return {
            descriptionCount: 0,
            hasMultiple: false,
            error: error instanceof Error ? error.message : "Erro desconhecido"
        };
    }
}

/**
 * Checks if the meta description tags on a page have empty content.
 * The function accepts an HTML string or a URL. If a URL is provided, the content will be fetched first.
 * It returns the number of meta description tags with empty content and a boolean flag if any are empty.
 * @param input - HTML content or a URL
 * @returns Promise<EmptyMetaDescriptionCheckResult> - The result of the empty meta description check
 */
export async function checkEmptyMetaDescription(input: string): Promise<EmptyMetaDescriptionCheckResult> {
    try {
        let content: string;
        
        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return {
                    emptyCount: 0,
                    hasEmpty: false,
                    error: "HTTP Error: " + response.status + " " + response.statusText
                };
            }
            content = await response.text();
        } else {
            content = input;
        }
        
        // Regex to match meta tags with name="description" attribute
        const metaRegex = /<meta\s+[^>]*name\s*=\s*["']description["'][^>]*>/gi;
        const metaTags = content.match(metaRegex) || [];
        let emptyCount = 0;

        // Regex to extract the content attribute value
        const contentRegex = /content\s*=\s*["']([^"']*)["']/i;
        
        metaTags.forEach(tag => {
            const match = tag.match(contentRegex);
            if (match) {
                const value = match[1].trim();
                if (value === "") {
                    emptyCount++;
                }
            } else {
                // If no content attribute found, consider it as empty
                emptyCount++;
            }
        });
        
        return {
            emptyCount,
            hasEmpty: emptyCount > 0
        };
    } catch (error) {
        return {
            emptyCount: 0,
            hasEmpty: false,
            error: error instanceof Error ? error.message : "Erro desconhecido"
        };
    }
}

/**
 * Checks if any meta description tags exceed the specified character limit.
 * The function accepts an HTML string or a URL. If a URL is provided, the content will be fetched first.
 * It returns the count of meta descriptions that exceed the limit along with their details.
 * @param input - HTML content or a URL
 * @param limit - Maximum allowed characters for a meta description (default is 155)
 * @returns Promise<LongMetaDescriptionCheckResult> - The result of the long meta description check
 */
export async function checkLongMetaDescription(input: string, limit: number = 155): Promise<LongMetaDescriptionCheckResult> {
    try {
        let content: string;
        
        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return {
                    longCount: 0,
                    metaDescriptions: [],
                    limit: limit,
                    error: "HTTP Error: " + response.status + " " + response.statusText
                };
            }
            content = await response.text();
        } else {
            content = input;
        }
        
        // Regex to match meta tags with name="description" attribute
        const regex = /<meta\s+[^>]*name\s*=\s*["']description["'][^>]*>/gi;
        const matches = content.match(regex) || [];
        const metaDescriptions = matches.map(tag => {
            // Regex to extract the content attribute value
            const contentRegex = /content\s*=\s*["']([^"']*)["']/i;
            const match = tag.match(contentRegex);
            let desc = "";
            if (match) {
                desc = match[1].trim();
            }
            return { content: desc, isLong: desc.length > limit };
        });
        
        const longCount = metaDescriptions.filter(md => md.isLong).length;
        
        return {
            longCount,
            metaDescriptions,
            limit
        };
    } catch (error) {
        return {
            longCount: 0,
            metaDescriptions: [],
            limit,
            error: error instanceof Error ? error.message : "Erro desconhecido"
        };
    }
}

/**
 * Checks if any meta description tags on a page are short, meaning they contain less than the specified number of characters (default 70).
 * The function accepts an HTML string or a URL. If a URL is provided, the content will be fetched first.
 * It returns the count of meta descriptions that are shorter than the minimum length along with their details.
 * @param input - HTML content or a URL
 * @param limit - Minimum required characters for a meta description (default is 70)
 * @returns Promise<ShortMetaDescriptionCheckResult> - The result of the short meta description check
 */
export async function checkShortMetaDescription(input: string, limit: number = 70): Promise<ShortMetaDescriptionCheckResult> {
    try {
        let content: string;
        
        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return {
                    shortCount: 0,
                    metaDescriptions: [],
                    limit: limit,
                    error: "HTTP Error: " + response.status + " " + response.statusText
                };
            }
            content = await response.text();
        } else {
            content = input;
        }

        // Regex to match meta tags with name="description" attribute
        const regex = /<meta\s+[^>]*name\s*=\s*["']description["'][^>]*>/gi;
        const matches = content.match(regex) || [];

        const metaDescriptions = matches.map(tag => {
            // Regex to extract the content attribute value
            const contentRegex = /content\s*=\s*["']([^"']*)["']/i;
            const match = tag.match(contentRegex);
            let desc = "";
            if (match) {
                desc = match[1].trim();
            }
            return { content: desc, isShort: desc.length < limit };
        });

        const shortCount = metaDescriptions.filter(md => md.isShort).length;

        return {
            shortCount,
            metaDescriptions,
            limit
        };
    } catch (error) {
        return {
            shortCount: 0,
            metaDescriptions: [],
            limit,
            error: error instanceof Error ? error.message : "Erro desconhecido"
        };
    }
}

/**
 * Checks for duplicate meta descriptions across multiple pages. The function accepts either a list of URLs or a domain name.
 * If a domain is provided, the function fetches the sitemap (assumed at /sitemap.xml) and extracts the URLs.
 * It then fetches each page, extracts the meta description and returns a list of meta descriptions that are duplicated along with the corresponding URLs.
 * @param input - A domain name or an array of URLs
 * @returns Promise<DuplicateMetaDescriptionCheckResult> - The result containing duplicate meta descriptions and their URLs
 */
export async function checkDuplicateMetaDescriptions(input: string | string[]): Promise<DuplicateMetaDescriptionCheckResult> {
    try {
        let urls: string[] = [];
        
        if (typeof input === "string") {
            // If input is a URL, assume it is the sitemap URL if it contains 'sitemap', otherwise construct sitemap URL from domain
            if (isURL(input)) {
                const sitemapUrl = input.toLowerCase().includes("sitemap") ? input : input.replace(/\/$/, "") + "/sitemap.xml";
                const response = await fetch(sitemapUrl);
                if (!response.ok) {
                    return {
                        duplicates: [],
                        totalPages: 0,
                        error: "HTTP Error: " + response.status + " " + response.statusText
                    };
                }
                const sitemapContent = await response.text();
                const locRegex = /<loc>([^<]+)<\/loc>/gi;
                let match;
                while ((match = locRegex.exec(sitemapContent)) !== null) {
                    urls.push(match[1].trim());
                }
            } else {
                // If input is not a URL, treat it as a domain name
                const sitemapUrl = "https://" + cleanDomainName(input) + "/sitemap.xml";
                const response = await fetch(sitemapUrl);
                if (!response.ok) {
                    return {
                        duplicates: [],
                        totalPages: 0,
                        error: "HTTP Error: " + response.status + " " + response.statusText
                    };
                }
                const sitemapContent = await response.text();
                const locRegex = /<loc>([^<]+)<\/loc>/gi;
                let match;
                while ((match = locRegex.exec(sitemapContent)) !== null) {
                    urls.push(match[1].trim());
                }
            }
        } else if (Array.isArray(input)) {
            urls = input;
        }
        
        let metaMap: { [key: string]: string[] } = {};
        for (const url of urls) {
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    continue;
                }
                const html = await response.text();
                const regex = /<meta\s+[^>]*name\s*=\s*["']description["'][^>]*>/gi;
                const matches = html.match(regex);
                if (matches) {
                    const contentRegex = /content\s*=\s*["']([^"']*)["']/i;
                    const m = matches[0].match(contentRegex);
                    if (m) {
                        const description = m[1].trim();
                        if (description) {
                            if (!metaMap[description]) {
                                metaMap[description] = [];
                            }
                            metaMap[description].push(url);
                        }
                    }
                }
            } catch (err) {
                // Ignore individual page errors
            }
        }
        
        let duplicates: Array<{ description: string; urls: string[] }> = [];
        for (const desc in metaMap) {
            if (metaMap[desc].length > 1) {
                duplicates.push({ description: desc, urls: metaMap[desc] });
            }
        }
        
        return {
            duplicates,
            totalPages: urls.length
        };
    } catch (error) {
        return {
            duplicates: [],
            totalPages: 0,
            error: error instanceof Error ? error.message : "Erro desconhecido"
        };
    }
}

/**
 * Checks if the main meta description contains a specific keyword.
 * The function accepts a keyword and an input (HTML content or URL).
 * If the input is a URL, it fetches the content first. Then, it extracts the meta description and
 * performs a case-insensitive check to see if the meta description contains the provided keyword.
 * @param input - HTML content or a URL
 * @param keyword - The keyword to search for in the meta description
 * @returns Promise<KeywordMetaDescriptionCheckResult> - An object containing the keyword, the meta description, and whether it contains the keyword
 */
export async function checkMetaDescriptionForKeyword(input: string, keyword: string): Promise<KeywordMetaDescriptionCheckResult> {
    try {
        let content: string;
        
        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return {
                    containsKeyword: false,
                    metaDescription: "",
                    keyword: keyword,
                    error: "HTTP Error: " + response.status + " " + response.statusText
                };
            }
            content = await response.text();
        } else {
            content = input;
        }
        
        // Extract the meta description using regex
        const metaRegex = /<meta\s+[^>]*name\s*=\s*["']description["'][^>]*>/i;
        const tagMatch = content.match(metaRegex);
        let metaDesc = "";
        if (tagMatch) {
            const contentRegex = /content\s*=\s*["']([^"']*)["']/i;
            const contentMatch = tagMatch[0].match(contentRegex);
            if (contentMatch) {
                metaDesc = contentMatch[1].trim();
            }
        } else {
            return {
                containsKeyword: false,
                metaDescription: "",
                keyword: keyword,
                error: "No meta description found"
            };
        }
        
        const contains = metaDesc.toLowerCase().indexOf(keyword.toLowerCase()) !== -1;
        
        return {
            containsKeyword: contains,
            metaDescription: metaDesc,
            keyword: keyword
        };
    } catch (error) {
        return {
            containsKeyword: false,
            metaDescription: "",
            keyword: keyword,
            error: error instanceof Error ? error.message : "Erro desconhecido"
        };
    }
}

/**
 * Checks if the meta description of the given pages contains the specified brand keyword.
 * The function accepts a list of URLs (or a single URL) and fetches the HTML content for each page.
 * It then extracts the meta description and performs a case-insensitive check to determine if the description
 * includes the provided brand keyword. The function returns a list of URLs where the keyword is absent.
 * 
 * @param input - A single URL or an array of URLs
 * @param keyword - The brand keyword to search for in the meta description
 * @returns Promise<BrandMetaDescriptionCheckResult> - The result containing the total pages checked and a list of URLs that do not include the brand keyword
 */
export async function checkBrandInMetaDescriptions(input: string | string[], keyword: string): Promise<BrandMetaDescriptionCheckResult> {
    try {
        const urls: string[] = typeof input === "string" ? [input] : input;
        const notIncludedUrls: string[] = [];
        
        for (const url of urls) {
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    // If the page is not reachable, consider it as not having the keyword
                    notIncludedUrls.push(url);
                    continue;
                }
                const content = await response.text();
                const metaRegex = /<meta\s+[^>]*name\s*=\s*["']description["'][^>]*>/i;
                const tagMatch = content.match(metaRegex);
                let metaDesc = "";
                if (tagMatch) {
                    const contentRegex = /content\s*=\s*["']([^"']*)["']/i;
                    const contentMatch = tagMatch[0].match(contentRegex);
                    if (contentMatch) {
                        metaDesc = contentMatch[1].trim();
                    }
                }
                // If the meta description does not include the keyword (or is empty), add the URL to the result
                if (metaDesc.toLowerCase().indexOf(keyword.toLowerCase()) === -1) {
                    notIncludedUrls.push(url);
                }
            } catch (innerError) {
                // On error fetching a single page, add its URL to the list
                notIncludedUrls.push(url);
            }
        }
        
        return {
            notIncludedUrls,
            totalPages: urls.length,
            keyword
        };
    } catch (error) {
        return {
            notIncludedUrls: [],
            totalPages: 0,
            keyword,
            error: error instanceof Error ? error.message : "Erro desconhecido"
        };
    }
}
