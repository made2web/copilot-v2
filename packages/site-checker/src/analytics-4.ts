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

export interface Analytics4CheckResult {
    isInstalled: boolean;
    issues?: string[];
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
 * Checks if the Google Analytics 4 (GA4) code is installed correctly
 * It verifies the presence of the GA4 script tag and the gtag configuration call using the provided gaCode.
 * @param input - HTML content or a URL from which the HTML will be fetched
 * @param gaCode - The GA4 tag identifier (e.g., "G-XXXXXX")
 * @returns Promise<Analytics4CheckResult> - The result indicating if GA4 is installed and any issues found
 */
export async function checkAnalytics4Installation(input: string, gaCode: string): Promise<Analytics4CheckResult> {
    try {
        let content: string;
        
        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return {
                    isInstalled: false,
                    issues: ["HTTP Error: " + response.status + " " + response.statusText]
                };
            }
            content = await response.text();
        } else {
            content = input;
        }
        
        let issues: string[] = [];
        
        // Verify the presence of the GA4 script tag
        const scriptRegex = new RegExp("<script\\s+async\\s+src=[\"']https://www\\.googletagmanager\\.com/gtag/js\\?id=" + gaCode + "[\"']", "i");
        if (!scriptRegex.test(content)) {
            issues.push("Missing GA4 script tag with provided code");
        }
        
        // Verify the presence of the gtag config invocation
        const configRegex = new RegExp("gtag\\(\\s*[\"']config[\"']\\s*,\\s*[\"']" + gaCode + "[\"']", "i");
        if (!configRegex.test(content)) {
            issues.push("Missing gtag config invocation with provided code");
        }
        
        return {
            isInstalled: issues.length === 0,
            issues
        };
        
    } catch (error) {
        return {
            isInstalled: false,
            error: error instanceof Error ? error.message : "Unknown error during GA4 installation check"
        };
    }
}
