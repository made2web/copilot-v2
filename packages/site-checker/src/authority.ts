import { isURL } from "./utils.js";

export interface AuthorRelTagResult {
    found: boolean;
    error?: string;
}

export interface InternalLinkCheckResult {
    hasMinInternalLinks: boolean;
    internalLinkCount: number;
    error?: string;
}

/**
 * Checks if the provided HTML content or URL contains a rel="author" attribute.
 *
 * @param input - HTML content or URL to be checked.
 * @returns Promise<AuthorRelTagResult> - The result of the check.
 */
export async function checkAuthorRelTag(input: string): Promise<AuthorRelTagResult> {
    try {
        let content: string;

        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return {
                    found: false,
                    error: "HTTP Error: " + response.status + " " + response.statusText
                };
            }
            content = await response.text();
        } else {
            content = input;
        }

        // Check if the HTML contains the rel="author" attribute
        const found = /rel\s*=\s*["']author["']/i.test(content);
        return { found: found };
    } catch (error) {
        return {
            found: false,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}

/**
 * Checks if the provided HTML content or URL contains at least 3 internal linkages.
 * An internal link is considered as:
 *   - A link starting with a forward slash (e.g., "/about")
 *   - Or an absolute URL whose hostname matches the hostname of the provided URL input
 *
 * @param input - HTML content or URL to be checked.
 * @returns Promise<InternalLinkCheckResult> - The result of the check
 */
export async function checkInternalLinkCount(input: string): Promise<InternalLinkCheckResult> {
    try {
        let content: string;
        let baseHost: string | null = null;

        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return {
                    hasMinInternalLinks: false,
                    internalLinkCount: 0,
                    error: "HTTP Error: " + response.status + " " + response.statusText
                };
            }
            content = await response.text();
            try {
                baseHost = new URL(input).hostname;
            } catch (_) {
                baseHost = null;
            }
        } else {
            content = input;
        }

        // Use regex to find all <a> tags with an href attribute
        const anchorRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>/gi;
        let match;
        let internalCount = 0;

        while ((match = anchorRegex.exec(content)) !== null) {
            const href = match[1];
            if (href.startsWith("/")) {
                internalCount++;
            } else if (href.startsWith("http://") || href.startsWith("https://")) {
                if (baseHost) {
                    try {
                        const linkHost = new URL(href).hostname;
                        if (linkHost === baseHost) {
                            internalCount++;
                        }
                    } catch (_) {}
                }
            }
        }

        return {
            hasMinInternalLinks: internalCount >= 3,
            internalLinkCount: internalCount
        };
    } catch (error) {
        return {
            hasMinInternalLinks: false,
            internalLinkCount: 0,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}
