import { isURL } from "./utils.js";
import { cleanDomainName } from "./utils.js";

export interface Error404MetaResult {
    metaTagPresent: boolean;
    error?: string;
}

export interface Error404PageExistsResult {
    exists: boolean;
    error?: string;
}

export interface Verify404PageStatusResult {
    is404: boolean;
    error?: string;
}

/**
 * Checks if the 404 page has a meta robots tag with "noindex, nofollow".
 * @param input - HTML content or URL to the 404 page.
 * @returns Promise<Error404MetaResult> with metaTagPresent boolean indicating if both noindex and nofollow are present.
 */
export async function check404NoindexNofollow(input: string): Promise<Error404MetaResult> {
    try {
        let content: string;
        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return {
                    metaTagPresent: false,
                    error: "HTTP Error: " + response.status + " " + response.statusText
                };
            }
            content = await response.text();
        } else {
            content = input;
        }
        
        // Regex to find a meta tag with name="robots" and capture the content attribute
        const regex = /<meta\s+[^>]*name=["']robots["'][^>]*content=["']([^"']+)["'][^>]*>/i;
        const match = content.match(regex);
        if (match && match[1]) {
            const contentValue = match[1].toLowerCase();
            const noindexPresent = contentValue.indexOf("noindex") !== -1;
            const nofollowPresent = contentValue.indexOf("nofollow") !== -1;
            return { metaTagPresent: noindexPresent && nofollowPresent };
        }
        return { metaTagPresent: false };
    } catch (error) {
        return {
            metaTagPresent: false,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}

/**
 * Checks if the provided URL returns a 404 status indicating a 404 page exists.
 * @param input - URL to be checked.
 * @returns Promise<Error404PageExistsResult> with exists boolean indicating if the status is 404.
 */
export async function check404PageExists(input: string): Promise<Error404PageExistsResult> {
    if (!isURL(input)) {
        return { exists: false, error: "Input is not a valid URL" };
    }
    try {
        const response = await fetch(input);
        return { exists: response.status === 404 };
    } catch (error) {
        return { exists: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

/**
 * Verifies if a 404 page returns with HTTP status 404.
 * This function uses the input URL and fetches its content to determine the status code
 * without analyzing HTML content details.
 * @param input - URL to check the 404 page status.
 * @returns Promise<Verify404PageStatusResult> containing is404 boolean and an optional error message
 */
export async function verify404PageStatus(input: string): Promise<Verify404PageStatusResult> {
    if (!isURL(input)) {
        return { is404: false, error: "Input is not a valid URL" };
    }
    try {
        const response = await fetch(input);
        return { is404: response.status === 404 };
    } catch (error) {
        return { is404: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

export interface InternalLinks4xxResult {
    links: string[];
    error?: string;
}

/**
 * Checks internal links from sitemap and returns only those with status 4xx.
 * If input is a list of URLs, it checks those.
 * If input is a domain or URL (and not a list), it fetches sitemap.xml from the domain.
 * @param input - A list of URLs or a domain URL.
 * @returns Promise<InternalLinks4xxResult> containing the list of internal URLs with 4xx status.
 */
export async function checkInternalLinks4xx(input: string | string[]): Promise<InternalLinks4xxResult> {
    let urls: string[] = [];
    try {
        if (Array.isArray(input)) {
            urls = input;
        } else {
            if (!isURL(input)) {
                input = "https://" + input;
            }
            let sitemapUrl = input;
            if (!input.endsWith("sitemap.xml")) {
                sitemapUrl = "https://" + cleanDomainName(input) + "/sitemap.xml";
            }
            const response = await fetch(sitemapUrl);
            if (!response.ok) {
                return { links: [], error: "Failed to fetch sitemap.xml: " + response.status + " " + response.statusText };
            }
            const sitemapContent = await response.text();
            const locRegex = /<loc>(.*?)<\/loc>/g;
            let match;
            while ((match = locRegex.exec(sitemapContent)) !== null) {
                urls.push(match[1]);
            }
        }
        const resultLinks: string[] = [];
        for (let url of urls) {
            try {
                const res = await fetch(url, { method: "HEAD" });
                if (res.status >= 400 && res.status < 500) {
                    resultLinks.push(url);
                }
            } catch (err) {
                resultLinks.push(url);
            }
        }
        return { links: resultLinks };
    } catch (error) {
        return { links: [], error: error instanceof Error ? error.message : "Unknown error" };
    }
}

export interface InternalLinks5xxResult {
    links: string[];
    error?: string;
}

/**
 * Checks internal links from sitemap and returns only those with status 5xx.
 * If input is a list of URLs, it checks those.
 * If input is a domain or URL (and not a list), it fetches sitemap.xml from the domain.
 * @param input - A list of URLs or a domain URL.
 * @returns Promise<InternalLinks5xxResult> containing the list of internal URLs with 5xx status.
 */
export async function checkInternalLinks5xx(input: string | string[]): Promise<InternalLinks5xxResult> {
    let urls: string[] = [];
    try {
        if (Array.isArray(input)) {
            urls = input;
        } else {
            if (!isURL(input)) {
                input = "https://" + input;
            }
            let sitemapUrl = input;
            if (!input.endsWith("sitemap.xml")) {
                sitemapUrl = "https://" + cleanDomainName(input) + "/sitemap.xml";
            }
            const response = await fetch(sitemapUrl);
            if (!response.ok) {
                return { links: [], error: "Failed to fetch sitemap.xml: " + response.status + " " + response.statusText };
            }
            const sitemapContent = await response.text();
            const locRegex = /<loc>(.*?)<\/loc>/g;
            let match;
            while ((match = locRegex.exec(sitemapContent)) !== null) {
                urls.push(match[1]);
            }
        }
        const resultLinks: string[] = [];
        for (let url of urls) {
            try {
                const res = await fetch(url, { method: "HEAD" });
                if (res.status >= 500 && res.status < 600) {
                    resultLinks.push(url);
                }
            } catch (err) {
                // Optionally, ignore fetch errors
            }
        }
        return { links: resultLinks };
    } catch (error) {
        return { links: [], error: error instanceof Error ? error.message : "Unknown error" };
    }
}
