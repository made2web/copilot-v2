import { cleanDomainName, isURL } from "./utils.js";

export interface SiteCacheResult {
    hasActiveCache: boolean;
    cacheControlHeader?: string;
    error?: string;
}

/**
 * Checks if the site has an active cache based on HTTP cache headers.
 * If the input is a URL, it fetches the URL, reads the "cache-control" header, 
 * and determines if caching is active (i.e., the header exists and does not contain "no-cache" or "no-store").
 * @param input - URL to be checked
 * @returns Promise<SiteCacheResult> - Result of the cache check
 */
export async function checkSiteActiveCache(input: string): Promise<SiteCacheResult> {
    if (!isURL(input)) {
        return {
            hasActiveCache: false,
            error: "Input is not a valid URL. Please provide a valid URL."
        };
    }
    try {
        const response = await fetch(input);
        if (!response.ok) {
            return {
                hasActiveCache: false,
                error: "HTTP Error: " + response.status + " " + response.statusText
            };
        }
        const cacheControl = response.headers.get("cache-control") || "";
        let active = false;
        if (cacheControl) {
            // If cache-control header does not include no-cache or no-store, consider cache active.
            if (cacheControl.indexOf("no-cache") === -1 && cacheControl.indexOf("no-store") === -1) {
                active = true;
            }
        }
        return {
            hasActiveCache: active,
            cacheControlHeader: cacheControl
        };
    } catch (error) {
        return {
            hasActiveCache: false,
            error: error instanceof Error ? error.message : "Unknown error during cache check"
        };
    }
}

export interface GzipCompressionResult {
    hasGzipActivated: boolean;
    contentEncoding?: string;
    error?: string;
}

/**
 * Checks if GZIP compression is activated by verifying if the "content-encoding" header contains "gzip".
 * If the input is a URL, it fetches the URL, reads the "content-encoding" header, and determines if GZIP is active.
 * @param input - URL to be checked
 * @returns Promise<GzipCompressionResult> - Result of the GZIP compression check
 */
export async function checkGzipCompression(input: string): Promise<GzipCompressionResult> {
    if (!isURL(input)) {
        return {
            hasGzipActivated: false,
            error: "Input is not a valid URL. Please provide a valid URL."
        };
    }
    try {
        const response = await fetch(input);
        if (!response.ok) {
            return {
                hasGzipActivated: false,
                error: "HTTP Error: " + response.status + " " + response.statusText
            };
        }
        const contentEncoding = response.headers.get("content-encoding") || "";
        const gzipActive = contentEncoding.toLowerCase().includes("gzip");
        return {
            hasGzipActivated: gzipActive,
            contentEncoding: contentEncoding
        };
    } catch (error) {
        return {
            hasGzipActivated: false,
            error: error instanceof Error ? error.message : "Unknown error during gzip check"
        };
    }
}

export interface LazyLoadImagesResult {
    totalImages: number;
    lazyLoadedImages: number;
    allLazy: boolean;
    error?: string;
}

/**
 * Checks if the images in the given HTML content or URL have lazy loading enabled.
 * If the input is a URL, it fetches the HTML content; otherwise, it treats the input as HTML.
 * It returns the total number of image tags, the count of images with lazy loading enabled (loading="lazy"),
 * and a boolean indicating whether all images have lazy loading enabled.
 * 
 * @param input - URL or HTML content to be checked.
 * @returns Promise<LazyLoadImagesResult> - The result of the lazy load images check.
 */
export async function checkLazyLoadImages(input: string): Promise<LazyLoadImagesResult> {
    try {
        let html: string;
        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return {
                    totalImages: 0,
                    lazyLoadedImages: 0,
                    allLazy: false,
                    error: "HTTP Error: " + response.status + " " + response.statusText
                };
            }
            html = await response.text();
        } else {
            html = input;
        }
        // Use regex to find all <img ...> tags
        const imgRegex = /<img\b[^>]*>/gi;
        const images = html.match(imgRegex) || [];
        const totalImages = images.length;
        let lazyLoadedImages = 0;
        images.forEach((imgTag) => {
            // Check for loading attribute set to "lazy"
            if (/loading=[\"\']lazy[\"\']/i.test(imgTag)) {
                lazyLoadedImages++;
            }
        });
        return {
            totalImages,
            lazyLoadedImages,
            allLazy: totalImages > 0 ? lazyLoadedImages === totalImages : true
        };
    } catch (error) {
        return {
            totalImages: 0,
            lazyLoadedImages: 0,
            allLazy: false,
            error: error instanceof Error ? error.message : "Unknown error during lazy load check"
        };
    }
}

// New Interfaces for Assets Minification Check
export interface AssetMinificationInfo {
    url: string;
    hasMinSuffix: boolean;
    aiAnalysis: string;
    error?: string;
}

export interface AssetsMinificationResult {
    assets: AssetMinificationInfo[];
    error?: string;
}

/**
 * Checks for CSS and JS files within the HTML input and analyzes if they are minified.
 * The function parses the HTML (or fetches it if a URL is provided), extracts file links for CSS and JS,
 * then performs a request for each asset to retrieve its content and check for minification patterns.
 * The analysis is based on the file name suffix (.min) and a simple heuristic of the content format.
 * 
 * @param input - URL or HTML content to be analyzed.
 * @returns Promise<AssetsMinificationResult> - The result containing a list of assets with minification analysis.
 */
export async function checkAssetsMinification(input: string): Promise<AssetsMinificationResult> {
    let html: string;
    try {
        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return { assets: [], error: "HTTP Error: " + response.status + " " + response.statusText };
            }
            html = await response.text();
        } else {
            html = input;
        }
    } catch (error) {
        return {
            assets: [],
            error: error instanceof Error ? error.message : "Unknown error while fetching HTML content"
        };
    }

    const assetUrls: string[] = [];

    // Extract CSS files from <link> tags with href ending in .css
    const cssRegex = /<link[^>]+href=[\"\']([^\"\']+\.css)[\"\']/gi;
    let match: RegExpExecArray | null;
    while ((match = cssRegex.exec(html)) !== null) {
        assetUrls.push(match[1]);
    }

    // Extract JS files from <script> tags with src ending in .js
    const jsRegex = /<script[^>]+src=[\"\']([^\"\']+\.js)[\"\']/gi;
    while ((match = jsRegex.exec(html)) !== null) {
        assetUrls.push(match[1]);
    }

    const assets: AssetMinificationInfo[] = [];

    for (const assetUrl of assetUrls) {
        let hasMinSuffix = assetUrl.includes(".min.");
        let aiAnalysis = hasMinSuffix ? "minified" : "unminified";
        try {
            const response = await fetch(assetUrl);
            if (!response.ok) {
                assets.push({
                    url: assetUrl,
                    hasMinSuffix,
                    aiAnalysis,
                    error: "HTTP Error: " + response.status + " " + response.statusText
                });
                continue;
            }
            const content = await response.text();
            // Simple heuristic: if asset content is a single line, consider it as minified
            if (!hasMinSuffix) {
                const lines = content.split("\n");
                if (lines.length === 1) {
                    aiAnalysis = "minified";
                } else {
                    aiAnalysis = "unminified";
                }
            }
            assets.push({
                url: assetUrl,
                hasMinSuffix,
                aiAnalysis
            });
        } catch (error) {
            assets.push({
                url: assetUrl,
                hasMinSuffix,
                aiAnalysis,
                error: error instanceof Error ? error.message : "Unknown error during asset fetch"
            });
        }
    }

    return { assets };
}
