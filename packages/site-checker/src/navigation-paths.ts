import { cleanDomainName, isURL } from "./utils.js";

export interface BreadcrumbCheckResult {
    exists: boolean;
    error?: string;
}

export interface BreadcrumbClickableCheckResult {
    clickable: boolean;
    error?: string;
}

export interface BreadcrumbsClickableResult {
    allClickable: boolean;
    error?: string;
}

/**
 * Checks if the page contains a breadcrumb navigation element.
 * It looks for patterns like <nav aria-label="breadcrumb"> or any element with a class containing "breadcrumb".
 * @param input - HTML content or a URL to the page
 * @returns Promise<BreadcrumbCheckResult> with the result
 */
export async function checkBreadcrumbPresence(input: string): Promise<BreadcrumbCheckResult> {
    try {
        let content: string;

        if (isURL(input)) {
            const response = await fetch(input);

            if (!response.ok) {
                return {
                    exists: false,
                    error: "HTTP Error: " + response.status + " " + response.statusText
                };
            }

            content = await response.text();
        } else {
            content = input;
        }

        // Regex to check for <nav> element with aria-label set to breadcrumb
        const navRegex = /<nav[^>]*aria-label=[\"']?breadcrumb[\"']?[^>]*>/i;
        // Regex to check for any element with a class attribute containing the word "breadcrumb"
        const classRegex = /class\s*=\s*[\"'][^\"']*\bbreadcrumb\b[^\"']*[\"']/i;

        const exists = navRegex.test(content) || classRegex.test(content);
        return { exists };
    } catch (error) {
        return {
            exists: false,
            error: error instanceof Error ? error.message : "Erro desconhecido"
        };
    }
}

/**
 * Checks if the last breadcrumb item in the navigation is clickable.
 * The function searches for a breadcrumb container (using <nav aria-label="breadcrumb"> or an element with class "breadcrumb")
 * and then attempts to locate the last breadcrumb item. If the last item contains an <a> tag, it is considered clickable.
 * @param input - HTML content or a URL to the page
 * @returns Promise<BreadcrumbClickableCheckResult> - The result of the check
 */
export async function checkLastBreadcrumbClickable(input: string): Promise<BreadcrumbClickableCheckResult> {
    try {
        let content: string;

        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return {
                    clickable: false,
                    error: "HTTP Error: " + response.status + " " + response.statusText
                };
            }
            content = await response.text();
        } else {
            content = input;
        }

        let breadcrumbContainerMatch = content.match(/<nav[^>]*aria-label=[\"']?breadcrumb[\"']?[^>]*>([\s\S]*?)<\/nav>/i);
        if (!breadcrumbContainerMatch) {
            // Fallback: search for any element with class containing 'breadcrumb'
            breadcrumbContainerMatch = content.match(/<[^>]+class=[\"'][^\"']*\bbreadcrumb\b[^\"']*[\"'][^>]*>([\s\S]*?)<\/[a-z]+>/i);
        }

        if (!breadcrumbContainerMatch) {
            return { clickable: false, error: "Breadcrumb container not found" };
        }

        const container = breadcrumbContainerMatch[1];

        // First attempt: check for list items (<li>) pattern
        const liMatches = container.match(/<li[\s\S]*?<\/li>/gi);
        if (liMatches && liMatches.length > 0) {
            const lastItem = liMatches[liMatches.length - 1];
            const isClickable = /<a\s+[^>]+>.*?<\/a>/i.test(lastItem);
            return { clickable: isClickable };
        } else {
            // Fallback: check if the container ends with an anchor tag
            const anchorAtEndRegex = /<a\s+[^>]+>.*?<\/a>\s*$/i;
            const isClickable = anchorAtEndRegex.test(container);
            return { clickable: isClickable };
        }
    } catch (error) {
        return {
            clickable: false,
            error: error instanceof Error ? error.message : "Erro desconhecido"
        };
    }
}

/**
 * Verifies if the homepage of the domain has less than 200 words of content
 * @param input - HTML or domain to be checked (e.g., "example.com")
 * @returns Promise<{ hasLessThan200Words: boolean; wordCount: number; error?: string; }> - The result of the check
 */
export async function checkPageContentWordCount(input: string): Promise<{
    hasLessThan200Words: boolean;
    wordCount: number;
    error?: string;
}> {
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
 * @returns Promise<{ exists: boolean; error?: string; }> - The result of the check
 */
export async function check404PageStatus(domain: string): Promise<{
    exists: boolean;
    error?: string;
}> {
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
 * Checks if all breadcrumbs in the navigation are clickable.
 * For breadcrumb containers structured with <li> elements, it verifies that every item except the last
 * contains a clickable link (<a> tag). In cases where no <li> elements are found, it falls back to checking
 * for the presence of at least one <a> tag in the container.
 * @param input - HTML content or a URL to the page
 * @returns Promise<BreadcrumbsClickableResult> - The result with the allClickable flag
 */
export async function checkAllBreadcrumbsClickable(input: string): Promise<BreadcrumbsClickableResult> {
    try {
        let content: string;

        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return { allClickable: false, error: "HTTP Error: " + response.status + " " + response.statusText };
            }
            content = await response.text();
        } else {
            content = input;
        }

        // Attempt to find breadcrumb container using <nav aria-label="breadcrumb"> or a div with class "breadcrumb"
        let containerMatch = content.match(/<nav[^>]*aria-label=[\"']?breadcrumb[\"']?[^>]*>([\s\S]*?)<\/nav>/i);
        if (!containerMatch) {
            containerMatch = content.match(/<div[^>]*class=[\"'][^\"']*breadcrumb[^\"']*[\"'][^>]*>([\s\S]*?)<\/div>/i);
        }

        if (!containerMatch) {
            return { allClickable: false, error: "Breadcrumb container not found" };
        }

        const container = containerMatch[1];

        // Check for <li> tags in the container
        const liMatches = container.match(/<li[\s\S]*?<\/li>/gi);
        if (liMatches && liMatches.length > 0) {
            // If only one breadcrumb item exists, assume it's the current page and acceptable
            if (liMatches.length === 1) {
                return { allClickable: true };
            }
            // For all items except the last, verify the presence of an <a> tag
            for (let i = 0; i < liMatches.length - 1; i++) {
                if (!/<a\s+[^>]+>.*?<\/a>/i.test(liMatches[i])) {
                    return { allClickable: false };
                }
            }
            return { allClickable: true };
        } else {
            // Fallback: if no <li> tags, check for <a> tags in the container
            const aMatches = container.match(/<a\s+[^>]+>.*?<\/a>/gi);
            if (aMatches && aMatches.length > 0) {
                return { allClickable: true };
            } else {
                return { allClickable: false };
            }
        }
    } catch (error) {
        return { allClickable: false, error: error instanceof Error ? error.message : "Erro desconhecido" };
    }
}
