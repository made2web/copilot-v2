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

export interface DuplicateContentCheckResult {
    variationsFound: boolean;
    details: string[];
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
                    error: `HTTP Error: ${response.status} ${response.statusText}`
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
 * Verifies if the content returned by multiple requests to the same URL with different header configurations (e.g., User-Agent) is consistent.
 * It performs multiple fetches using different header settings to identify if the HTML content varies.
 * @param input - URL or HTML content. If URL, the function performs multiple fetch requests
 * @returns Promise<DuplicateContentCheckResult> - The result containing variation details
 */
export async function checkDuplicateContentVariations(input: string): Promise<DuplicateContentCheckResult> {
    try {
        let results: string[] = [];
        if (isURL(input)) {
            const userAgents = [
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                "Googlebot/2.1 (+http://www.google.com/bot.html)",
                "curl/7.68.0"
            ];
            for (let i = 0; i < userAgents.length; i++) {
                const response = await fetch(input, { headers: { "User-Agent": userAgents[i] } });
                if (!response.ok) {
                    return {
                        variationsFound: false,
                        details: [],
                        error: `HTTP Error: ${response.status} ${response.statusText} with User-Agent: ${userAgents[i]}`
                    };
                }
                const content = await response.text();
                results.push(content);
            }
            // Compare results
            const reference = results[0];
            let variationsFound = false;
            let details: string[] = [];
            for (let i = 1; i < results.length; i++) {
                if (results[i] !== reference) {
                    variationsFound = true;
                    details.push("Content variation detected between response 1 and response " + (i + 1));
                } else {
                    details.push("Response " + (i + 1) + " matches the first response.");
                }
            }
            return { variationsFound, details };
        } else {
            // If input is not a URL, assume it's direct HTML content
            return { variationsFound: false, details: ["Input provided is direct content, no variations tested."] };
        }
    } catch (error) {
        return {
            variationsFound: false,
            details: [],
            error: error instanceof Error ? error.message : "Erro desconhecido"
        };
    }
}
