import { isURL } from "./utils.js";

export interface CanonicalParametersCheckResult {
    canonicalLink?: string;
    hasInvalidParameters?: boolean;
    invalidParameters?: string[];
    error?: string;
}

export interface CanonicalSelfReferenceCheckResult {
    isSelfReference: boolean;
    canonicalLink?: string;
    error?: string;
}

export interface AmpCanonicalCheckResult {
    hasCanonical: boolean;
    isCanonicalNonAmp: boolean;
    canonicalLink?: string;
    error?: string;
    return_key: string;
}

// Nova interface para verificação da existência do canonical
export interface CanonicalExistenceCheckResult {
    exists: boolean;
    canonicalLink?: string;
    error?: string;
    return_key: string;
}

// Nova interface para verificação das paginações
export interface PaginationCanonicalCheckResult {
    isSelfReference: boolean;
    canonicalLink?: string;
    error?: string;
    return_key: string;
}

/**
 * Checks if a pagination page has a canonical tag pointing to itself.
 * Pagination pages should not be self-referencing; they are expected to point to a central or main URL.
 * The function fetches the content if a URL is provided, extracts the canonical link and compares it with the input URL.
 * 
 * @param input - A URL string representing the pagination page to be checked
 * @returns Promise<PaginationCanonicalCheckResult> - The result containing a flag indicating whether the canonical tag is self referencing, the canonical link if found and/or an error message
 */
export async function checkPaginationCanonical(input: string): Promise<PaginationCanonicalCheckResult> {
    if (!isURL(input)) {
        return {
            isSelfReference: false,
            return_key: "paginationCanonical",
            error: "Input is not a valid URL"
        };
    }

    try {
        const response = await fetch(input);
        if (!response.ok) {
            return {
                isSelfReference: false,
                return_key: "paginationCanonical",
                error: "HTTP Error: " + response.status + " " + response.statusText
            };
        }
        const content = await response.text();

        // Regex para encontrar a tag <link> com rel="canonical" e capturar o valor do atributo href
        const regex = /<link\b(?=[^>]*\brel=["']canonical["'])(?=[^>]*\bhref=["']([^"']+)["'])[\s\S]*?>/i;
        const match = regex.exec(content);

        if (!(match && match[1])) {
            return {
                isSelfReference: false,
                return_key: "paginationCanonical",
                error: "Canonical tag not found"
            };
        }

        const canonicalLink = match[1];
        let normalizedInput: string;
        let normalizedCanonical: string;
        try {
            normalizedInput = new URL(input).href;
            normalizedCanonical = new URL(canonicalLink, normalizedInput).href;
        } catch (error) {
            return {
                isSelfReference: false,
                return_key: "paginationCanonical",
                error: "Invalid URL format encountered"
            };
        }

        const isSelfReference = normalizedInput === normalizedCanonical;
        return { isSelfReference, canonicalLink: normalizedCanonical, return_key: "paginationCanonical" };
    } catch (error) {
        return {
            isSelfReference: false,
            return_key: "paginationCanonical",
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}

// Demais funções existentes...

/**
 * Checks if the canonical tag exists in the provided page content (HTML) or URL.
 * It returns the canonical link if found.
 * 
 * @param input - HTML content or a URL in string format
 * @returns Promise<CanonicalExistenceCheckResult> - The result containing the existence flag, canonical link if found and/or an error message
 */
export async function checkCanonicalExistence(input: string): Promise<CanonicalExistenceCheckResult> {
    try {
        let content: string;

        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return {
                    exists: false,
                    return_key: "canonicalExistence",
                    error: "HTTP Error: " + response.status + " " + response.statusText
                };
            }
            content = await response.text();
        } else {
            content = input;
        }

        // Regex to find <link> tag with rel="canonical" and capture the href attribute value
        const regex = /<link\b(?=[^>]*\brel=["']canonical["'])(?=[^>]*\bhref=["']([^"']+)["'])[\s\S]*?>/i;
        const match = regex.exec(content);

        if (match && match[1]) {
            return {
                exists: true,
                canonicalLink: match[1],
                return_key: "canonicalExistence"
            };
        } else {
            return {
                exists: false,
                return_key: "canonicalExistence",
                error: "Canonical tag not found"
            };
        }
    } catch (error) {
        return {
            exists: false,
            return_key: "canonicalExistence",
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}

/**
 * Checks if the canonical tag in the provided page content (HTML) or URL contains disallowed parameters like IDs, UTMs, or AMP parameters.
 * A canonical tag should be free from such parameters to ensure proper indexing and consistency.
 *
 * @param input - HTML content or a URL in string format
 * @returns Promise<CanonicalParametersCheckResult> - The result containing the canonical link, a flag indicating if disallowed parameters were found, a list of the parameters and/or an error message
 */
export async function checkCanonicalTagParameters(input: string): Promise<CanonicalParametersCheckResult> {
    try {
        let content: string;
        
        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return { error: "HTTP Error: " + response.status + " " + response.statusText };
            }
            content = await response.text();
        } else {
            content = input;
        }

        // Regex to find <link> tag with rel="canonical" and capture the href attribute value
        const regex = /<link\b(?=[^>]*\brel=["']canonical["'])(?=[^>]*\bhref=["']([^"']+)["'])[\s\S]*?>/i;
        const match = regex.exec(content);

        if (!(match && match[1])) {
            return { error: "Canonical link not found" };
        }

        const canonicalLink = match[1];
        let hasInvalidParameters = false;
        const invalidParameters: string[] = [];
        
        try {
            const urlObj = new URL(canonicalLink);
            // List of disallowed parameters
            const disallowed = ["id", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "amp"];
            
            urlObj.searchParams.forEach((value, key) => {
                const lowerKey = key.toLowerCase();
                if (disallowed.includes(lowerKey)) {
                    hasInvalidParameters = true;
                    if (!invalidParameters.includes(lowerKey)) {
                        invalidParameters.push(lowerKey);
                    }
                }
            });
        } catch (error) {
            // In case canonicalLink is not a valid URL
            return { canonicalLink, error: "Invalid canonical URL format" };
        }

        return { canonicalLink, hasInvalidParameters, invalidParameters };
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Unknown error" };
    }
}

/**
 * Checks if the canonical tag in the page points to the same URL as the input URL.
 * The function expects a URL as input. It fetches the content if necessary, extracts the canonical link
 * and compares it with the input URL using URL normalization.
 *
 * @param input - A URL string representing the page to be checked
 * @returns Promise<CanonicalSelfReferenceCheckResult> - The result containing a boolean 'isSelfReference', the canonical link found and/or an error message
 */
export async function checkCanonicalSelfReference(input: string): Promise<CanonicalSelfReferenceCheckResult> {
    if (!isURL(input)) {
        return { isSelfReference: false, error: "Input is not a valid URL" };
    }

    try {
        const response = await fetch(input);
        if (!response.ok) {
            return { isSelfReference: false, error: "HTTP Error: " + response.status + " " + response.statusText };
        }
        const content = await response.text();

        // Regex to find <link> tag with rel="canonical" and capture the href attribute value
        const regex = /<link\b(?=[^>]*\brel=["']canonical["'])(?=[^>]*\bhref=["']([^"']+)["'])[\s\S]*?>/i;
        const match = regex.exec(content);

        if (!(match && match[1])) {
            return { isSelfReference: false, error: "Canonical link not found" };
        }

        const canonicalLink = match[1];
        let normalizedInput: string;
        let normalizedCanonical: string;
        
        try {
            normalizedInput = new URL(input).href;
            normalizedCanonical = new URL(canonicalLink, normalizedInput).href;
        } catch (error) {
            return { isSelfReference: false, error: "Invalid URL format encountered" };
        }

        const isSelfReference = normalizedInput === normalizedCanonical;
        return { isSelfReference, canonicalLink: normalizedCanonical };
    } catch (error) {
        return { isSelfReference: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

/**
 * Checks if an AMP page contains a canonical tag that points to the non-AMP version of the page.
 * The function accepts either a URL or HTML content. If a URL is provided, it fetches the content first.
 * It then extracts the canonical tag and, when possible, compares the canonical URL with the original AMP page URL.
 *
 * @param input - HTML content or a URL string representing the AMP page
 * @returns Promise<AmpCanonicalCheckResult> - The result containing flags about the presence and correctness of the canonical tag,
 * the canonical URL if found, and/or an error message
 */
export async function checkAmpPageCanonical(input: string): Promise<AmpCanonicalCheckResult> {
    try {
        let content: string;
        let normalizedInput: string | null = null;
        
        if (isURL(input)) {
            normalizedInput = new URL(input).href;
            const response = await fetch(input);
            if (!response.ok) {
                return {
                    hasCanonical: false,
                    isCanonicalNonAmp: false,
                    return_key: "ampCanonical",
                    error: "HTTP Error: " + response.status + " " + response.statusText
                };
            }
            content = await response.text();
        } else {
            content = input;
        }

        // Regex to find <link> tag with rel="canonical" and capture the href attribute value
        const regex = /<link\b(?=[^>]*\brel=["']canonical["'])(?=[^>]*\bhref=["']([^"']+)["'])[\s\S]*?>/i;
        const match = regex.exec(content);

        if (!(match && match[1])) {
            return {
                hasCanonical: false,
                isCanonicalNonAmp: false,
                return_key: "ampCanonical",
                error: "Canonical tag not found"
            };
        }

        const canonicalLink = match[1];
        let isCanonicalNonAmp = true;

        if (normalizedInput) {
            // Normalize canonical URL relative to the AMP URL
            let normalizedCanonical: string;
            try {
                normalizedCanonical = new URL(canonicalLink, normalizedInput).href;
            } catch (error) {
                return {
                    hasCanonical: true,
                    isCanonicalNonAmp: false,
                    canonicalLink,
                    return_key: "ampCanonical",
                    error: "Invalid canonical URL format"
                };
            }
            // Check if the canonical URL is different from the AMP URL
            if (normalizedInput === normalizedCanonical) {
                isCanonicalNonAmp = false;
            }
        }
        
        return {
            hasCanonical: true,
            isCanonicalNonAmp,
            canonicalLink,
            return_key: "ampCanonical"
        };
    } catch (error) {
        return {
            hasCanonical: false,
            isCanonicalNonAmp: false,
            return_key: "ampCanonical",
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}
