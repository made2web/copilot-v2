import { cleanDomainName, isURL } from "./utils.js";

export interface StructuredDataWebsiteResult {
    hasStructuredDataWebsite: boolean;
    error?: string;
}

export interface StructuredDataArticleResult {
    hasStructuredDataArticle: boolean;
    error?: string;
}

export interface StructuredDataOrganizationResult {
    hasStructuredDataOrganization: boolean;
    error?: string;
}

export interface StructuredDataProductResult {
    hasStructuredDataProduct: boolean;
    error?: string;
}

export interface StructuredDataLocalBusinessResult {
    hasStructuredDataLocalBusiness: boolean;
    error?: string;
}

export interface StructuredDataCollectionResult {
    hasStructuredDataCollection: boolean;
    error?: string;
}

export interface StructuredDataFAQPageResult {
    hasStructuredDataFAQPage: boolean;
    error?: string;
}

/**
 * Checks if the provided HTML content or URL contains structured data for a Website.
 * It searches for <script type="application/ld+json"> blocks and verifies if any of them
 * includes an object with "@type" equal to "WebSite".
 * @param input - HTML content or URL to be checked
 * @returns Promise<StructuredDataWebsiteResult> - The result of the check
 */
export async function checkStructuredDataWebsite(input: string): Promise<StructuredDataWebsiteResult> {
    try {
        let content: string;
        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return {
                    hasStructuredDataWebsite: false,
                    error: `HTTP Error: ${response.status} ${response.statusText}`
                };
            }
            content = await response.text();
        } else {
            content = input;
        }

        // Regex to capture JSON-LD script blocks
        const regex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
        let match;
        while ((match = regex.exec(content)) !== null) {
            let jsonText = match[1].trim();
            if (!jsonText) continue;
            try {
                const data = JSON.parse(jsonText);
                // data can be an object or an array of objects
                if (Array.isArray(data)) {
                    for (const item of data) {
                        if (item && item["@type"] && String(item["@type"]).toLowerCase() === "website") {
                            return { hasStructuredDataWebsite: true };
                        }
                    }
                } else if (data && data["@type"] && String(data["@type"]).toLowerCase() === "website") {
                    return { hasStructuredDataWebsite: true };
                }
            } catch (e) {
                // If JSON parsing fails, ignore this block
                continue;
            }
        }

        return { hasStructuredDataWebsite: false };
    } catch (error) {
        return {
            hasStructuredDataWebsite: false,
            error: error instanceof Error ? error.message : "Erro desconhecido"
        };
    }
}

/**
 * Checks if the provided HTML content or URL contains structured data for an Article or BlogPosting.
 * It searches for <script type="application/ld+json"> blocks and verifies if any of them
 * includes an object with "@type" equal to "Article" or "BlogPosting" (case insensitive).
 * @param input - HTML content or URL to be checked
 * @returns Promise<StructuredDataArticleResult> - The result of the check
 */
export async function checkStructuredDataArticle(input: string): Promise<StructuredDataArticleResult> {
    try {
        let content: string;
        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return {
                    hasStructuredDataArticle: false,
                    error: `HTTP Error: ${response.status} ${response.statusText}`
                };
            }
            content = await response.text();
        } else {
            content = input;
        }

        // Regex to capture JSON-LD script blocks
        const regex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
        let match;
        while ((match = regex.exec(content)) !== null) {
            let jsonText = match[1].trim();
            if (!jsonText) continue;
            try {
                const data = JSON.parse(jsonText);
                // data can be an object or an array of objects
                if (Array.isArray(data)) {
                    for (const item of data) {
                        if (item && item["@type"]) {
                            const type = String(item["@type"]).toLowerCase();
                            if (type === "article" || type === "blogposting") {
                                return { hasStructuredDataArticle: true };
                            }
                        }
                    }
                } else if (data && data["@type"]) {
                    const type = String(data["@type"]).toLowerCase();
                    if (type === "article" || type === "blogposting") {
                        return { hasStructuredDataArticle: true };
                    }
                }
            } catch (e) {
                // If JSON parsing fails, ignore this block
                continue;
            }
        }

        return { hasStructuredDataArticle: false };
    } catch (error) {
        return {
            hasStructuredDataArticle: false,
            error: error instanceof Error ? error.message : "Erro desconhecido"
        };
    }
}

/**
 * Checks if the provided HTML content or URL contains structured data for an Organization.
 * It searches for <script type="application/ld+json"> blocks and verifies if any of them
 * includes an object with "@type" equal to "Organization" (case insensitive).
 * @param input - HTML content or URL to be checked
 * @returns Promise<StructuredDataOrganizationResult> - The result of the check
 */
export async function checkStructuredDataOrganization(input: string): Promise<StructuredDataOrganizationResult> {
    try {
        let content: string;
        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return {
                    hasStructuredDataOrganization: false,
                    error: `HTTP Error: ${response.status} ${response.statusText}`
                };
            }
            content = await response.text();
        } else {
            content = input;
        }

        // Regex to capture JSON-LD script blocks
        const regex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
        let match;
        while ((match = regex.exec(content)) !== null) {
            let jsonText = match[1].trim();
            if (!jsonText) continue;
            try {
                const data = JSON.parse(jsonText);
                // data can be an object or an array of objects
                if (Array.isArray(data)) {
                    for (const item of data) {
                        if (item && item["@type"] && String(item["@type"]).toLowerCase() === "organization") {
                            return { hasStructuredDataOrganization: true };
                        }
                    }
                } else if (data && data["@type"] && String(data["@type"]).toLowerCase() === "organization") {
                    return { hasStructuredDataOrganization: true };
                }
            } catch (e) {
                // If JSON parsing fails, ignore this block
                continue;
            }
        }

        return { hasStructuredDataOrganization: false };
    } catch (error) {
        return {
            hasStructuredDataOrganization: false,
            error: error instanceof Error ? error.message : "Erro desconhecido"
        };
    }
}

/**
 * Checks if the provided HTML content or URL contains structured data for a Product.
 * It searches for <script type="application/ld+json"> blocks and verifies if any of them
 * includes an object with "@type" equal to "Product" (case insensitive).
 * @param input - HTML content or URL to be checked
 * @returns Promise<StructuredDataProductResult> - The result of the check
 */
export async function checkStructuredDataProduct(input: string): Promise<StructuredDataProductResult> {
    try {
        let content: string;
        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return {
                    hasStructuredDataProduct: false,
                    error: `HTTP Error: ${response.status} ${response.statusText}`
                };
            }
            content = await response.text();
        } else {
            content = input;
        }
        
        // Regex to capture JSON-LD script blocks
        const regex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
        let match;
        while ((match = regex.exec(content)) !== null) {
            let jsonText = match[1].trim();
            if (!jsonText) continue;
            try {
                const data = JSON.parse(jsonText);
                // data can be an object or an array of objects
                if (Array.isArray(data)) {
                    for (const item of data) {
                        if (item && item["@type"] && String(item["@type"]).toLowerCase() === "product") {
                            return { hasStructuredDataProduct: true };
                        }
                    }
                } else if (data && data["@type"] && String(data["@type"]).toLowerCase() === "product") {
                    return { hasStructuredDataProduct: true };
                }
            } catch (e) {
                // Ignore invalid JSON block
                continue;
            }
        }
        
        return { hasStructuredDataProduct: false };
    } catch (error) {
        return {
            hasStructuredDataProduct: false,
            error: error instanceof Error ? error.message : "Erro desconhecido"
        };
    }
}

/**
 * Checks if the provided HTML content or URL contains structured data for a Local Business.
 * It searches for <script type="application/ld+json"> blocks and verifies if any of them
 * includes an object with "@type" equal to "LocalBusiness" (case insensitive).
 * @param input - HTML content or URL to be checked
 * @returns Promise<StructuredDataLocalBusinessResult> - The result of the check
 */
export async function checkStructuredDataLocalBusiness(input: string): Promise<StructuredDataLocalBusinessResult> {
    try {
        let content: string;
        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return {
                    hasStructuredDataLocalBusiness: false,
                    error: `HTTP Error: ${response.status} ${response.statusText}`
                };
            }
            content = await response.text();
        } else {
            content = input;
        }

        // Regex to capture JSON-LD script blocks
        const regex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
        let match;
        while ((match = regex.exec(content)) !== null) {
            let jsonText = match[1].trim();
            if (!jsonText) continue;
            try {
                const data = JSON.parse(jsonText);
                // data can be an object or an array of objects
                if (Array.isArray(data)) {
                    for (const item of data) {
                        if (item && item["@type"] && String(item["@type"]).toLowerCase() === "localbusiness") {
                            return { hasStructuredDataLocalBusiness: true };
                        }
                    }
                } else if (data && data["@type"] && String(data["@type"]).toLowerCase() === "localbusiness") {
                    return { hasStructuredDataLocalBusiness: true };
                }
            } catch (e) {
                // Ignore JSON parse errors
                continue;
            }
        }
        
        return { hasStructuredDataLocalBusiness: false };
    } catch (error) {
        return {
            hasStructuredDataLocalBusiness: false,
            error: error instanceof Error ? error.message : "Erro desconhecido"
        };
    }
}

/**
 * Checks if the provided HTML content or URL contains structured data for a Collection Page or ItemList.
 * It searches for <script type="application/ld+json"> blocks and verifies if any of them
 * includes an object with "@type" equal to "CollectionPage" or "ItemList" (case insensitive).
 * @param input - HTML content or URL to be checked
 * @returns Promise<StructuredDataCollectionResult> - The result of the check
 */
export async function checkStructuredDataCollection(input: string): Promise<StructuredDataCollectionResult> {
    try {
        let content: string;
        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return {
                    hasStructuredDataCollection: false,
                    error: `HTTP Error: ${response.status} ${response.statusText}`
                };
            }
            content = await response.text();
        } else {
            content = input;
        }

        // Regex to capture JSON-LD script blocks
        const regex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
        let match;
        while ((match = regex.exec(content)) !== null) {
            let jsonText = match[1].trim();
            if (!jsonText) continue;
            try {
                const data = JSON.parse(jsonText);
                if (Array.isArray(data)) {
                    for (const item of data) {
                        if (item && item["@type"]) {
                            const type = String(item["@type"]).toLowerCase();
                            if (type === "collectionpage" || type === "itemlist") {
                                return { hasStructuredDataCollection: true };
                            }
                        }
                    }
                } else if (data && data["@type"]) {
                    const type = String(data["@type"]).toLowerCase();
                    if (type === "collectionpage" || type === "itemlist") {
                        return { hasStructuredDataCollection: true };
                    }
                }
            } catch (e) {
                // Ignore invalid JSON blocks
                continue;
            }
        }
        return { hasStructuredDataCollection: false };
    } catch (error) {
        return {
            hasStructuredDataCollection: false,
            error: error instanceof Error ? error.message : "Erro desconhecido"
        };
    }
}

/**
 * Checks if the provided HTML content or URL contains structured data for a FAQ Page.
 * It searches for <script type="application/ld+json"> blocks and verifies if any of them
 * includes an object with "@type" equal to "FAQPage" (case insensitive).
 * @param input - HTML content or URL to be checked
 * @returns Promise<StructuredDataFAQPageResult> - The result of the check
 */
export async function checkStructuredDataFAQPage(input: string): Promise<StructuredDataFAQPageResult> {
    try {
        let content: string;
        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return {
                    hasStructuredDataFAQPage: false,
                    error: `HTTP Error: ${response.status} ${response.statusText}`
                };
            }
            content = await response.text();
        } else {
            content = input;
        }

        // Regex to capture JSON-LD script blocks
        const regex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
        let match;
        while ((match = regex.exec(content)) !== null) {
            let jsonText = match[1].trim();
            if (!jsonText) continue;
            try {
                const data = JSON.parse(jsonText);
                if (Array.isArray(data)) {
                    for (const item of data) {
                        if (item && item["@type"] && String(item["@type"]).toLowerCase() === "faqpage") {
                            return { hasStructuredDataFAQPage: true };
                        }
                    }
                } else if (data && data["@type"] && String(data["@type"]).toLowerCase() === "faqpage") {
                    return { hasStructuredDataFAQPage: true };
                }
            } catch (e) {
                // Ignore JSON parsing errors
                continue;
            }
        }
        return { hasStructuredDataFAQPage: false };
    } catch (error) {
        return {
            hasStructuredDataFAQPage: false,
            error: error instanceof Error ? error.message : "Erro desconhecido"
        };
    }
}
