import { cleanDomainName, isURL } from "./utils.js";

export interface Error404CheckResult {
    exists: boolean;
    error?: string;
}

interface ContentWordCountCheckResult {
    hasLessThan200Words: boolean;
    wordCount: number;
    error?: string;
}

export interface IndexationCheckResult {
    isIndexed: boolean;
    resultSummary: string;
    error?: string;
}

export interface HomepageRankingCheckResult {
    isRankedFirst: boolean;
    resultSummary: string;
    error?: string;
}

export interface FaviconAppearanceCheckResult {
    isFaviconPresent: boolean;
    resultSummary: string;
    error?: string;
}

/**
 * Verifies if the homepage of the domain has less than 200 words of content
 * @param input - HTML or domain to be checked (e.g., "example.com")
 * @returns Promise<ContentWordCountCheckResult> - The result of the check
 */
export async function checkPageContentWordCount(input: string): Promise<ContentWordCountCheckResult> {
    try {
        let content: string;
        
        if (isURL(input)) {
            const response = await fetch(input);

            if (!response.ok) {
                return {
                    hasLessThan200Words: false,
                    wordCount: 0,
                    error: "HTTP Error: " + response.status + " " + response.statusText
                };
            }
            content = await response.text();
        } else {
            content = input;
        }

        const wordCount = content
            .replace(/<[^>]+>/g, ' ')
            .replace(/&#?[a-z0-9]+;/gi, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .split(/\s+/)
            .filter(word => word.length > 0).length;

        return {
            hasLessThan200Words: wordCount < 200,
            wordCount
        };

    } catch (error) {
        return {
            hasLessThan200Words: false,
            wordCount: 0,
            error: error instanceof Error ? error.message : "Erro desconhecido"
        };
    }
}

/**
 * Verifies if the homepage paragraphs are well divided, with a maximum of 3 lines per paragraph
 * @param domain - The domain to be checked (e.g., "example.com")
 * @returns Promise<Error404CheckResult> - The result of the check
 */
export async function check404PageStatus(domain: string): Promise<Error404CheckResult> {
    try {
        const cleanDomain = cleanDomainName(domain);
        const response = await fetch(`https://${cleanDomain}/404`);
        return { exists: response.status === 404 };
    } catch (error) {
        return {
            exists: false,
            error: error instanceof Error ? error.message : "Unknown error while checking 404 page status",
        };
    }
}

/**
 * Checks if the site appears in Google's SERP by performing a search query using the "site:" operator.
 * @param input - URL of the site to be checked (e.g., "https://example.com")
 * @returns Promise<IndexationCheckResult> - The result indicating if the site is indexed.
 */
export async function checkSiteSERPAppearance(input: string): Promise<IndexationCheckResult> {
    try {
        let domain: string;
        if (isURL(input)) {
            domain = cleanDomainName(input);
        } else {
            domain = input;
        }
        const queryUrl = "https://www.google.com/search?q=site:" + encodeURIComponent(domain);
        const response = await fetch(queryUrl);
        const text = await response.text();
        // Check if Google indicates no results found
        const notIndexed = text.includes("did not match any documents") || text.toLowerCase().includes("nenhum resultado encontrado");
        return {
            isIndexed: !notIndexed,
            resultSummary: notIndexed ? "Site not indexed in Google SERP." : "Site appears to be indexed in Google SERP."
        };
    } catch (error) {
        return {
            isIndexed: false,
            resultSummary: "",
            error: error instanceof Error ? error.message : "Unknown error while checking Google SERP appearance"
        };
    }
}

/**
 * Checks if the homepage of the brand is ranked first when the brand is searched in Google.
 * The function uses the domain name as the search query and then parses the returned HTML to identify
 * if the first result URL corresponds to the homepage URL.
 * 
 * @param input - URL of the brand's homepage or brand name
 * @returns Promise<HomepageRankingCheckResult> - The result indicating if the homepage is ranked first.
 */
export async function checkHomepageRanking(input: string): Promise<HomepageRankingCheckResult> {
    try {
        let domain: string;
        if (isURL(input)) {
            domain = cleanDomainName(input);
        } else {
            domain = input;
        }
        const queryUrl = "https://www.google.com/search?q=" + encodeURIComponent(domain);
        const response = await fetch(queryUrl);
        const text = await response.text();
        
        // Use regex to capture all href links from the search result
        const regex = /<a href=\"(https:\/\/[^\"]+)\"/g;
        let match;
        let firstDomainLink: string | null = null;
        
        // Loop through matches and pick the first link that contains the domain name
        while ((match = regex.exec(text)) !== null) {
            if (match[1].includes(domain)) {
                firstDomainLink = match[1];
                break;
            }
        }

        // Normalize homepage URL (with and without trailing slash)
        const homepageUrl = "https://" + domain;
        const normalize = (url: string) => url.replace(/\/+$/, "");
        
        const isRankedFirst = firstDomainLink ? normalize(firstDomainLink) === normalize(homepageUrl) : false;
        
        return {
            isRankedFirst: isRankedFirst,
            resultSummary: isRankedFirst ? "Homepage is ranked first for the brand search." : "Homepage is not ranked first for the brand search."
        };
    } catch (error) {
        return {
            isRankedFirst: false,
            resultSummary: "",
            error: error instanceof Error ? error.message : "Erro desconhecido"
        };
    }
}

/**
 * Checks if the favicon is present in the HTML content of the page.
 * The function accepts either a URL or HTML content. If a URL is provided, it fetches the content first.
 * It then searches for a <link> tag with a rel attribute containing "icon" or "shortcut icon".
 * 
 * @param input - URL of the site or HTML content
 * @returns Promise<FaviconAppearanceCheckResult> - The result indicating if the favicon is present.
 */
export async function checkFaviconAppearance(input: string): Promise<FaviconAppearanceCheckResult> {
    try {
        let content: string;
        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return {
                    isFaviconPresent: false,
                    resultSummary: "HTTP Error: " + response.status + " " + response.statusText
                };
            }
            content = await response.text();
        } else {
            content = input;
        }
        
        // Check for <link rel="icon" ...> or <link rel="shortcut icon" ...>
        const regex = /<link[^>]+rel=[\"'](?:shortcut\s+icon|icon)[\"'][^>]*>/i;
        const isPresent = regex.test(content);
        
        return {
            isFaviconPresent: isPresent,
            resultSummary: isPresent ? "Favicon is present." : "Favicon is not present."
        };
    } catch (error) {
        return {
            isFaviconPresent: false,
            resultSummary: "",
            error: error instanceof Error ? error.message : "Unknown error while checking favicon appearance"
        };
    }
}

/**
 * Checks if the given URL belongs to a test environment subdomain that should not be indexed.
 * The function checks for common patterns in the subdomain such as "test", "staging", "dev", "qa", or "demo".
 * 
 * @param input - URL of the site to be checked (e.g., "https://staging.example.com")
 * @returns Promise<TestSubdomainIndexationCheckResult> - The result indicating if the subdomain is a test environment.
 */
export interface TestSubdomainIndexationCheckResult {
    isTestSubdomain: boolean;
    recommendation: string;
    error?: string;
}

export async function checkTestSubdomainIndexation(input: string): Promise<TestSubdomainIndexationCheckResult> {
    try {
        if (!isURL(input)) {
            return {
                isTestSubdomain: false,
                recommendation: "Input provided is not a valid URL."
            };
        }
        const urlObj = new URL(input);
        const hostname = urlObj.hostname.toLowerCase();
        const testPatterns = ["test", "staging", "dev", "qa", "demo"];
        let isTest = false;
        for (const pattern of testPatterns) {
            if (hostname.split(".")[0] === pattern || hostname.includes(`-${pattern}.`) || hostname.includes(pattern + ".")) {
                isTest = true;
                break;
            }
        }
        const recommendation = isTest ? "Test environment subdomain should not be indexed." : "Subdomain seems to be production-ready.";
        return {
            isTestSubdomain: isTest,
            recommendation: recommendation
        };
    } catch (error) {
        return {
            isTestSubdomain: false,
            recommendation: "",
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}
