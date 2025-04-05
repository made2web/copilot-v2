import { cleanDomainName, isURL } from "./utils.js";

export interface SitemapXmlCheckResult {
    exists: boolean;
    error?: string;
}

export async function checkSitemapXmlExistence(input: string): Promise<SitemapXmlCheckResult> {
    try {
        let domain = "";
        if (isURL(input)) {
            domain = cleanDomainName(input);
        } else {
            domain = input;
        }
        const url = "https://" + domain + "/sitemap.xml";
        const response = await fetch(url);
        if (response.ok) {
            return { exists: true };
        } else {
            return { exists: false, error: "HTTP Error: " + response.status + " " + response.statusText };
        }
    } catch (error) {
        return { exists: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

export interface SitemapUrlsCountResult {
    urlCount: number;
    isWithinLimit: boolean;
    error?: string;
    return_key: string;
}

/**
 * Checks if a sitemap XML contains up to 50,000 URLs.
 * The function accepts either a URL (to fetch the content) or the raw XML content.
 * @param input - The sitemap XML content or a URL to the sitemap
 * @returns Promise<SitemapUrlsCountResult> - The result of the check including urlCount and isWithinLimit flag
 */
export async function checkSitemapUrlsCount(input: string): Promise<SitemapUrlsCountResult> {
    try {
        let content: string;
        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return {
                    urlCount: 0,
                    isWithinLimit: false,
                    error: `HTTP Error: ${response.status} ${response.statusText}`,
                    return_key: "sitemapUrlCount"
                };
            }
            content = await response.text();
        } else {
            content = input;
        }

        // Count the number of <url> tags in the sitemap XML
        const matches = content.match(/<url\b/g);
        const urlCount = matches ? matches.length : 0;
        const isWithinLimit = urlCount <= 50000;

        return {
            urlCount,
            isWithinLimit,
            return_key: "sitemapUrlCount"
        };
    } catch (error) {
        return {
            urlCount: 0,
            isWithinLimit: false,
            error: error instanceof Error ? error.message : "Unknown error",
            return_key: "sitemapUrlCount"
        };
    }
}

export interface SitemapHttpsCheckResult {
    allLinksHTTPS: boolean;
    totalLinks: number;
    nonHttpsCount: number;
    error?: string;
    return_key: string;
}

/**
 * Checks if all <loc> URLs within a sitemap XML use HTTPS.
 * The function accepts either a URL (to fetch the content) or raw XML content.
 * @param input - The sitemap XML content or a URL to the sitemap
 * @returns Promise<SitemapHttpsCheckResult> - The result of the check including total and non-HTTPS counts
 */
export async function checkSitemapHttpsLinks(input: string): Promise<SitemapHttpsCheckResult> {
    try {
        let content: string;
        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return {
                    allLinksHTTPS: false,
                    totalLinks: 0,
                    nonHttpsCount: 0,
                    error: `HTTP Error: ${response.status} ${response.statusText}`,
                    return_key: "sitemapHttpsLinks"
                };
            }
            content = await response.text();
        } else {
            content = input;
        }
        const regex = /<loc>(.*?)<\/loc>/g;
        let match;
        let totalLinks = 0;
        let nonHttpsCount = 0;
        while ((match = regex.exec(content)) !== null) {
            totalLinks++;
            const url = match[1].trim();
            if (!url.startsWith("https://")) {
                nonHttpsCount++;
            }
        }
        const allLinksHTTPS = nonHttpsCount === 0;
        return {
            allLinksHTTPS,
            totalLinks,
            nonHttpsCount,
            return_key: "sitemapHttpsLinks"
        };
    } catch (error) {
        return {
            allLinksHTTPS: false,
            totalLinks: 0,
            nonHttpsCount: 0,
            error: error instanceof Error ? error.message : "Unknown error",
            return_key: "sitemapHttpsLinks"
        };
    }
}

export interface SitemapIndexableUrlsResult {
    totalUrls: number;
    nonIndexableCount: number;
    nonIndexableUrls: string[];
    return_key: string;
    error?: string;
}

/**
 * Checks if the URLs listed in a sitemap XML are indexable.
 * For each URL found in the sitemap (<loc> tags), the function fetches the page and looks for a meta robots tag
 * that contains "noindex". If found, the URL is considered non-indexable.
 * The function accepts either a URL (to fetch the sitemap content) or the raw XML content.
 * @param input - The sitemap XML content or a URL to the sitemap
 * @returns Promise<SitemapIndexableUrlsResult> - The result containing total URLs,
 * the count of non-indexable URLs and the list of such URLs
 */
export async function checkSitemapIndexableUrls(input: string): Promise<SitemapIndexableUrlsResult> {
    try {
        let content: string;
        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return {
                    totalUrls: 0,
                    nonIndexableCount: 0,
                    nonIndexableUrls: [],
                    error: `HTTP Error: ${response.status} ${response.statusText}`,
                    return_key: "sitemapIndexableUrls"
                };
            }
            content = await response.text();
        } else {
            content = input;
        }

        // Extract URLs from <loc> tags
        const locRegex = /<loc>(.*?)<\/loc>/g;
        let match;
        const urls: string[] = [];
        while ((match = locRegex.exec(content)) !== null) {
            urls.push(match[1].trim());
        }
        
        const nonIndexableUrls: string[] = [];
        
        // Check each URL if it contains a meta robots noindex tag
        await Promise.all(urls.map(async (url) => {
            try {
                const res = await fetch(url);
                if (!res.ok) {
                    // Consider URL non-indexable if the fetch fails
                    nonIndexableUrls.push(url);
                    return;
                }
                const html = await res.text();
                // Look for a meta tag with name="robots" and content containing "noindex"
                const metaNoindexRegex = /<meta[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex[^"']*["'][^>]*>/i;
                if (metaNoindexRegex.test(html)) {
                    nonIndexableUrls.push(url);
                }
            } catch (error) {
                // If an error occurs fetching the page, treat it as non-indexable
                nonIndexableUrls.push(url);
            }
        }));

        return {
            totalUrls: urls.length,
            nonIndexableCount: nonIndexableUrls.length,
            nonIndexableUrls,
            return_key: "sitemapIndexableUrls"
        };
    } catch (error) {
        return {
            totalUrls: 0,
            nonIndexableCount: 0,
            nonIndexableUrls: [],
            error: error instanceof Error ? error.message : "Unknown error",
            return_key: "sitemapIndexableUrls"
        };
    }
}

export interface SitemapImportantUrlsResult {
    totalImportantUrls: number;
    missingUrls: string[];
    return_key: string;
}

/**
 * Checks if all important URLs are present in the sitemap XML
 * The function accepts either a URL (to fetch the sitemap content) or the raw XML content, and a list of important URLs
 *
 * @param input - The sitemap XML content or a URL to the sitemap
 * @param importantUrls - An array of important URLs that must be present in the sitemap
 * @returns Promise<SitemapImportantUrlsResult> - The result containing the total important URLs and the list of missing URLs
 */
export async function checkImportantUrlsInSitemap(input: string, importantUrls: string[]): Promise<SitemapImportantUrlsResult> {
    try {
        let sitemapContent: string;
        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return {
                    totalImportantUrls: importantUrls.length,
                    missingUrls: importantUrls,
                    return_key: "sitemapImportantUrls"
                };
            }
            sitemapContent = await response.text();
        } else {
            sitemapContent = input;
        }
        // Extract URLs from <loc> tags in the sitemap
        const locRegex = /<loc>(.*?)<\/loc>/g;
        const foundUrls: string[] = [];
        let match;
        while ((match = locRegex.exec(sitemapContent)) !== null) {
            foundUrls.push(match[1].trim());
        }
        // Identify missing URLs by comparing importantUrls with foundUrls
        const missingUrls = importantUrls.filter(url => foundUrls.indexOf(url) === -1);
        return {
            totalImportantUrls: importantUrls.length,
            missingUrls,
            return_key: "sitemapImportantUrls"
        };
    } catch (error) {
        return {
            totalImportantUrls: importantUrls.length,
            missingUrls: importantUrls,
            return_key: "sitemapImportantUrls"
        };
    }
}

export interface SitemapBrokenUrlsResult {
    totalUrls: number;
    brokenCount: number;
    brokenUrls: string[];
    return_key: string;
    error?: string;
}

/**
 * Checks for broken URLs (HTTP 404) in the sitemap XML.
 * The function accepts either a URL (to fetch the sitemap content) or the raw XML content.
 * It parses the sitemap, extracts all URLs from the <loc> tags and makes an HTTP request
 * to each to determine if any return a 404 status code, indicating a broken link.
 * @param input - The sitemap XML content or a URL to the sitemap
 * @returns Promise<SitemapBrokenUrlsResult> - The result containing total URLs, broken URL count and a list of broken URLs
 */
export async function checkBrokenSitemapUrls(input: string): Promise<SitemapBrokenUrlsResult> {
    try {
        let sitemapContent: string;
        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return {
                    totalUrls: 0,
                    brokenCount: 0,
                    brokenUrls: [],
                    error: `HTTP Error: ${response.status} ${response.statusText}`,
                    return_key: "sitemapBrokenUrls"
                };
            }
            sitemapContent = await response.text();
        } else {
            sitemapContent = input;
        }
        
        // Extract URLs from <loc> tags
        const locRegex = /<loc>(.*?)<\/loc>/g;
        const urls: string[] = [];
        let match;
        while ((match = locRegex.exec(sitemapContent)) !== null) {
            urls.push(match[1].trim());
        }

        const brokenUrls: string[] = [];
        
        await Promise.all(urls.map(async (url) => {
            try {
                const res = await fetch(url);
                if (res.status === 404) {
                    brokenUrls.push(url);
                }
            } catch (error) {
                // In case of fetch error, consider the URL as broken
                brokenUrls.push(url);
            }
        }));
        
        return {
            totalUrls: urls.length,
            brokenCount: brokenUrls.length,
            brokenUrls,
            return_key: "sitemapBrokenUrls"
        };
    } catch (error) {
        return {
            totalUrls: 0,
            brokenCount: 0,
            brokenUrls: [],
            error: error instanceof Error ? error.message : "Unknown error",
            return_key: "sitemapBrokenUrls"
        };
    }
}

// New function for detecting redirection (3xx) statuses

export interface SitemapRedirectsResult {
    totalUrls: number;
    redirectCount: number;
    redirectUrls: { url: string; status: number }[];
    return_key: string;
    error?: string;
}

/**
 * Checks for redirection (HTTP 3xx) statuses among a list of URLs.
 * The function accepts either a list of URLs as a second parameter, or if not provided,
 * it treats the first argument as a domain or sitemap XML content (or URL to sitemap.xml),
 * extracts the URLs, and then performs HTTP requests with redirection manually handled.
 * It returns an object containing the total number of URLs, a count of those that redirect, and a list with their status codes.
 * 
 * Note: This function uses fetch with redirect set to "manual" so that redirection responses are not automatically followed.
 *
 * @param input - Either a domain, a URL to a sitemap.xml, or the raw sitemap XML content
 * @param urlsList - Optional array of URLs to check. If provided, the function will use this list instead of extracting from sitemap.
 * @returns Promise<SitemapRedirectsResult> - The result containing redirection details
 */
export async function checkSitemapRedirects(input: string, urlsList?: string[]): Promise<SitemapRedirectsResult> {
    try {
        let urls: string[] = [];
        if (urlsList && urlsList.length > 0) {
            urls = urlsList;
        } else {
            let sitemapContent: string;
            if (isURL(input)) {
                if (input.includes("sitemap.xml")) {
                    const response = await fetch(input);
                    if (!response.ok) {
                        return {
                            totalUrls: 0,
                            redirectCount: 0,
                            redirectUrls: [],
                            error: `HTTP Error: ${response.status} ${response.statusText}`,
                            return_key: "sitemapRedirectStatus"
                        };
                    }
                    sitemapContent = await response.text();
                } else {
                    let domain = cleanDomainName(input);
                    const sitemapUrl = "https://" + domain + "/sitemap.xml";
                    const response = await fetch(sitemapUrl);
                    if (!response.ok) {
                        return {
                            totalUrls: 0,
                            redirectCount: 0,
                            redirectUrls: [],
                            error: `HTTP Error: ${response.status} ${response.statusText}`,
                            return_key: "sitemapRedirectStatus"
                        };
                    }
                    sitemapContent = await response.text();
                }
            } else {
                sitemapContent = input;
            }
            const locRegex = /<loc>(.*?)<\/loc>/g;
            let match;
            while ((match = locRegex.exec(sitemapContent)) !== null) {
                urls.push(match[1].trim());
            }
        }
        
        const redirectUrls: { url: string; status: number }[] = [];
        
        await Promise.all(urls.map(async (url) => {
            try {
                const response = await fetch(url, { redirect: "manual" });
                if (response.status >= 300 && response.status < 400) {
                    redirectUrls.push({ url, status: response.status });
                }
            } catch (error) {
                // Ignore individual URL errors
            }
        }));
        
        return {
            totalUrls: urls.length,
            redirectCount: redirectUrls.length,
            redirectUrls,
            return_key: "sitemapRedirectStatus"
        };
    } catch (error) {
        return {
            totalUrls: 0,
            redirectCount: 0,
            redirectUrls: [],
            error: error instanceof Error ? error.message : "Unknown error",
            return_key: "sitemapRedirectStatus"
        };
    }
}

// New function to validate the structure of a sitemap XML

export interface SitemapStructureValidationResult {
    valid: boolean;
    totalUrls: number;
    missingLocCount: number;
    errors: string[];
    return_key: string;
}

/**
 * Validates the structure of a sitemap XML file by checking required elements.
 * The function accepts either a URL to a sitemap.xml, raw XML content, or a list of URLs, and validates that the XML
 * contains a <urlset> tag and that each <url> element has a corresponding <loc> child tag. It identifies inconsistencies
 * and returns a report with error messages for missing elements.
 * @param input - The sitemap XML content, a URL to the sitemap, or a domain name
 * @returns Promise<SitemapStructureValidationResult> - The result containing validation status, total URLs, missing <loc> counts, and error messages.
 */
export async function validateSitemapStructure(input: string): Promise<SitemapStructureValidationResult> {
    try {
        let sitemapContent: string;
        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return {
                    valid: false,
                    totalUrls: 0,
                    missingLocCount: 0,
                    errors: [`HTTP Error: ${response.status} ${response.statusText}`],
                    return_key: "sitemapStructureValidation"
                };
            }
            sitemapContent = await response.text();
        } else {
            sitemapContent = input;
        }

        const errors: string[] = [];

        // Check if <urlset> tag exists
        if (!/<urlset[\s>]/.test(sitemapContent)) {
            errors.push("Missing <urlset> tag.");
        }

        // Extract <url> elements
        const urlMatches = sitemapContent.match(/<url\b[\s\S]*?<\/url>/g);
        const totalUrls = urlMatches ? urlMatches.length : 0;
        let missingLocCount = 0;

        if (urlMatches) {
            for (let urlBlock of urlMatches) {
                if (!/<loc>.*?<\/loc>/.test(urlBlock)) {
                    missingLocCount++;
                    errors.push("A <url> element is missing a <loc> tag.");
                }
            }
        }

        const valid = errors.length === 0;
        return {
            valid,
            totalUrls,
            missingLocCount,
            errors,
            return_key: "sitemapStructureValidation"
        };
    } catch (error) {
        return {
            valid: false,
            totalUrls: 0,
            missingLocCount: 0,
            errors: [error instanceof Error ? error.message : "Unknown error"],
            return_key: "sitemapStructureValidation"
        };
    }
}

// New Function: Optimize Sitemap by Removing Irrelevant URLs

export interface SitemapOptimizationResult {
    totalUrls: number;
    irrelevantUrls: string[];
    return_key: string;
}

/**
 * Optimizes the sitemap XML by identifying URLs that are irrelevant for search engine indexing.
 * The function accepts either the raw sitemap XML or a URL to the sitemap.xml file. It extracts the URLs
 * from the <loc> tags and filters out those containing keywords that indicate irrelevance (e.g., "admin", "login", "dashboard", "account", "internal").
 * This helps in generating a cleaner, optimized sitemap that only includes pages relevant for indexing.
 * @param input - The sitemap XML content or a URL to the sitemap
 * @returns Promise<SitemapOptimizationResult> - The result including the total URLs found and a list of irrelevant URLs
 */
export async function optimizeSitemapUrls(input: string): Promise<SitemapOptimizationResult> {
    try {
        let sitemapContent: string;
        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return {
                    totalUrls: 0,
                    irrelevantUrls: [],
                    return_key: "sitemapOptimization"
                };
            }
            sitemapContent = await response.text();
        } else {
            sitemapContent = input;
        }

        // Extract URLs from <loc> tags
        const locRegex = /<loc>(.*?)<\/loc>/g;
        let match;
        const urls: string[] = [];
        while ((match = locRegex.exec(sitemapContent)) !== null) {
            urls.push(match[1].trim());
        }

        const totalUrls = urls.length;
        // Define keywords indicating irrelevance
        const irrelevantKeywords = ["admin", "login", "dashboard", "account", "internal"];
        const irrelevantUrls = urls.filter(url => {
            return irrelevantKeywords.some(kw => url.toLowerCase().includes(kw));
        });

        return {
            totalUrls,
            irrelevantUrls,
            return_key: "sitemapOptimization"
        };
    } catch (error) {
        return {
            totalUrls: 0,
            irrelevantUrls: [],
            return_key: "sitemapOptimization"
        };
    }
}
