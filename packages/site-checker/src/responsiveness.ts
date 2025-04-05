import { isURL } from "./utils.js";

export interface AmpCanonicalCheckResult {
    foundCanonical: boolean;
    canonicalURL?: string;
    isValid: boolean;
    error?: string;
}

export interface AmpHtmlLinkCheckResult {
    foundAmpHtml: boolean;
    ampHtmlURL?: string;
    isValid: boolean;
    error?: string;
}

export interface MetaViewportCheckResult {
    foundViewport: boolean;
    viewportContent?: string;
    isValid: boolean;
    error?: string;
}

export interface MobileOptimizationCheckResult {
    isMobileOptimized: boolean;
    metaViewportStatus: MetaViewportCheckResult | null;
    ampHtmlStatus: AmpHtmlLinkCheckResult | null;
    error?: string;
}

/**
 * Verifies that an AMP page contains a canonical link pointing to a non-AMP URL.
 * @param input - HTML content or URL of the AMP page.
 * @returns Promise<AmpCanonicalCheckResult> - The result of the check
 */
export async function checkAmpCanonicalReponsiveness(input: string): Promise<AmpCanonicalCheckResult> {
    try {
        let content: string;
        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return {
                    foundCanonical: false,
                    isValid: false,
                    error: "HTTP Error: " + response.status + " " + response.statusText
                };
            }
            content = await response.text();
        } else {
            content = input;
        }

        // Search for canonical tag
        const canonicalTagRegex = /<link\s+[^>]*rel=["']canonical["'][^>]*>/i;
        const canonicalTagMatch = content.match(canonicalTagRegex);

        if (!canonicalTagMatch) {
            return {
                foundCanonical: false,
                isValid: false,
                error: "Canonical tag not found"
            };
        }

        // Extract href attribute value
        const hrefRegex = /href=["']([^"']+)["']/i;
        const hrefMatch = canonicalTagMatch[0].match(hrefRegex);
        if (!hrefMatch || !hrefMatch[1]) {
            return {
                foundCanonical: true,
                isValid: false,
                error: "Canonical tag found but href attribute is missing"
            };
        }

        const canonicalURL = hrefMatch[1];
        // Check if canonical URL contains '/amp'. It should not for a valid setup.
        const isValid = canonicalURL.toLowerCase().indexOf('/amp') === -1;
        
        return {
            foundCanonical: true,
            canonicalURL,
            isValid
        };
    } catch (error) {
        return {
            foundCanonical: false,
            isValid: false,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}

/**
 * Checks if the main page contains an AMP HTML link tag (<link rel="amphtml">) that points to the AMP version of the page.
 * The function accepts either an HTML content or a URL as input. If the input is a URL, it first fetches the content.
 * It then extracts the href attribute and validates if it contains "/amp".
 * @param input - HTML content or URL of the main page
 * @returns Promise<AmpHtmlLinkCheckResult> - The result of the check
 */
export async function checkAmpHtmlLinkPresence(input: string): Promise<AmpHtmlLinkCheckResult> {
    try {
        let content: string;
        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return {
                    foundAmpHtml: false,
                    isValid: false,
                    error: "HTTP Error: " + response.status + " " + response.statusText
                };
            }
            content = await response.text();
        } else {
            content = input;
        }

        // Search for the amphtml link tag
        const ampHtmlRegex = /<link\s+[^>]*rel=["']amphtml["'][^>]*>/i;
        const ampHtmlMatch = content.match(ampHtmlRegex);
        if (!ampHtmlMatch) {
            return {
                foundAmpHtml: false,
                isValid: false,
                error: "AMP HTML link tag not found"
            };
        }

        // Extract href attribute value
        const hrefRegex = /href=["']([^"']+)["']/i;
        const hrefMatch = ampHtmlMatch[0].match(hrefRegex);
        if (!hrefMatch || !hrefMatch[1]) {
            return {
                foundAmpHtml: true,
                isValid: false,
                error: "AMP HTML link tag found but href attribute is missing"
            };
        }

        const ampHtmlURL = hrefMatch[1];
        // Validate that the URL contains '/amp' (case-insensitive)
        const isValid = ampHtmlURL.toLowerCase().includes("/amp");
        
        return {
            foundAmpHtml: true,
            ampHtmlURL,
            isValid
        };
    } catch (error) {
        return {
            foundAmpHtml: false,
            isValid: false,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}

/**
 * Checks if the page contains a meta viewport tag in its HTML source code.
 * The function accepts either HTML content or a URL as input. If the input is a URL, it first fetches the content.
 * It then verifies the presence of <meta name="viewport"> tag and extracts its content attribute if present.
 * @param input - HTML content or URL of the page
 * @returns Promise<MetaViewportCheckResult> - The result of the check
 */
export async function checkMetaViewportPresence(input: string): Promise<MetaViewportCheckResult> {
    try {
        let content: string;
        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return {
                    foundViewport: false,
                    isValid: false,
                    error: "HTTP Error: " + response.status + " " + response.statusText
                };
            }
            content = await response.text();
        } else {
            content = input;
        }

        // Search for meta viewport tag
        const metaViewportRegex = /<meta\s+[^>]*name=["']viewport["'][^>]*>/i;
        const metaViewportMatch = content.match(metaViewportRegex);

        if (!metaViewportMatch) {
            return {
                foundViewport: false,
                isValid: false,
                error: "Viewport meta tag not found"
            };
        }

        // Extract content attribute
        const contentAttrRegex = /content=["']([^"']+)["']/i;
        const contentAttrMatch = metaViewportMatch[0].match(contentAttrRegex);

        if (!contentAttrMatch || !contentAttrMatch[1]) {
            return {
                foundViewport: true,
                isValid: false,
                error: "Viewport meta tag found but content attribute is missing"
            };
        }

        const viewportContent = contentAttrMatch[1];
        const isValid = viewportContent.trim().length > 0;
        
        return {
            foundViewport: true,
            viewportContent,
            isValid
        };
    } catch (error) {
        return {
            foundViewport: false,
            isValid: false,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}

/**
 * Checks if the site is optimized for mobile devices by verifying the presence of a valid meta viewport tag.
 * If the meta viewport tag is missing or invalid, it also checks for a valid AMP HTML link tag.
 * The function accepts either HTML content or a URL as input.
 * @param input - HTML content or URL of the page
 * @returns Promise<MobileOptimizationCheckResult> - The result of the mobile optimization check
 */
export async function checkMobileOptimization(input: string): Promise<MobileOptimizationCheckResult> {
    try {
        const metaResult = await checkMetaViewportPresence(input);
        let optimized = false;
        let ampResult: AmpHtmlLinkCheckResult | null = null;

        if (metaResult.foundViewport && metaResult.isValid) {
            optimized = true;
        } else {
            ampResult = await checkAmpHtmlLinkPresence(input);
            if (ampResult.foundAmpHtml && ampResult.isValid) {
                optimized = true;
            }
        }

        return {
            isMobileOptimized: optimized,
            metaViewportStatus: metaResult,
            ampHtmlStatus: ampResult
        };
    } catch (error) {
        return {
            isMobileOptimized: false,
            metaViewportStatus: null,
            ampHtmlStatus: null,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}
