import { cleanDomainName, isURL } from "./utils.js";

export interface ImagesAltTextCheckResult {
    totalImages: number;
    imagesWithoutAlt: number;
    compliance: boolean;
    error?: string;
}

/**
 * Checks if the provided HTML content or URL has any <img> tags missing alt text or with empty alt attribute.
 * @param input - HTML content or URL
 * @returns Promise<ImagesAltTextCheckResult> - The result of the check
 */
export async function checkImagesAltTextCompliance(input: string): Promise<ImagesAltTextCheckResult> {
    try {
        let content: string;
        if (isURL(input)) {
            // Clean domain if necessary
            const cleanInput = cleanDomainName(input);
            const response = await fetch(input);
            if (!response.ok) {
                return {
                    totalImages: 0,
                    imagesWithoutAlt: 0,
                    compliance: false,
                    error: "HTTP Error: " + response.status + " " + response.statusText
                };
            }
            content = await response.text();
        } else {
            content = input;
        }

        // Find all <img> tags
        const imgRegex = /<img\s+[^>]*>/gi;
        const imgTags = content.match(imgRegex) || [];
        let missingAltCount = 0;
        
        // Check each img tag for alt attribute
        imgTags.forEach(tag => {
            // Regex to find alt attribute
            const altRegex = /alt\s*=\s*("|')(.*?)\1/i;
            const match = tag.match(altRegex);
            if (!match || (match && match[2].trim() === "")) {
                missingAltCount++;
            }
        });

        return {
            totalImages: imgTags.length,
            imagesWithoutAlt: missingAltCount,
            compliance: missingAltCount === 0
        };
    } catch (error) {
        return {
            totalImages: 0,
            imagesWithoutAlt: 0,
            compliance: false,
            error: error instanceof Error ? error.message : "Erro desconhecido"
        };
    }
}

// New interfaces for heavy images check
export interface HeavyImageResult {
    url: string;
    contentLength: number;
}

export interface HeavyImagesCheckResult {
    heavyImages: HeavyImageResult[];
    return_key: string;
    error?: string;
}

/**
 * Checks for heavy images (images with a content length greater than 100kb) in the provided HTML content or URL.
 * The function extracts image URLs from the HTML and sends a HEAD request to each image to check the 'Content-Length' header.
 * If the file size exceeds 100kb, the image URL and size are added to the result.
 * @param input - HTML content or URL
 * @returns Promise<HeavyImagesCheckResult> - The result with heavy images information
 */
export async function checkHeavyImages(input: string): Promise<HeavyImagesCheckResult> {
    try {
        let content: string;
        let baseUrl = "";
        if (isURL(input)) {
            // Clean domain if necessary
            const cleanInput = cleanDomainName(input);
            const response = await fetch(input);
            if (!response.ok) {
                return {
                    heavyImages: [],
                    return_key: "heavyImages",
                    error: "HTTP Error: " + response.status + " " + response.statusText
                };
            }
            content = await response.text();
            baseUrl = input;
        } else {
            content = input;
        }
        
        // Extract all <img> tags
        const imgRegex = /<img\s+[^>]*>/gi;
        const imgTags = content.match(imgRegex) || [];
        const heavyImages: HeavyImageResult[] = [];
        
        // Regex to extract the src attribute
        const srcRegex = /src\s*=\s*("|')(.*?)\1/i;
        
        for (const tag of imgTags) {
            const srcMatch = tag.match(srcRegex);
            if (srcMatch) {
                let imgUrl = srcMatch[2].trim();
                // If URL is relative and we have a base URL, convert to absolute URL
                if (!imgUrl.startsWith("http") && baseUrl) {
                    if (baseUrl.endsWith("/")) {
                        baseUrl = baseUrl.slice(0, -1);
                    }
                    if (!imgUrl.startsWith("/")) {
                        imgUrl = "/" + imgUrl;
                    }
                    imgUrl = baseUrl + imgUrl;
                }
                try {
                    const headResponse = await fetch(imgUrl, { method: "HEAD" });
                    if (!headResponse.ok) {
                        continue;
                    }
                    const contentLengthStr = headResponse.headers.get("Content-Length") || headResponse.headers.get("content-length");
                    if (contentLengthStr) {
                        const contentLength = parseInt(contentLengthStr, 10);
                        if (contentLength > 102400) { // 102400 bytes = 100kb
                            heavyImages.push({ url: imgUrl, contentLength });
                        }
                    }
                } catch (error) {
                    continue;
                }
            }
        }
        
        return {
            heavyImages,
            return_key: "heavyImages"
        };
    } catch (error) {
        return {
            heavyImages: [],
            return_key: "heavyImages",
            error: error instanceof Error ? error.message : "Erro desconhecido"
        };
    }
}

// New interfaces for checking WEBP extension
export interface WebpImagesCheckResult {
    nonWebpImages: string[];
    return_key: string;
    error?: string;
}

/**
 * Checks if the images in the provided HTML content or URL have the .webp extension in their "src" and "srcset" attributes.
 * It extracts all <img> tags, converts relative URLs to absolute if needed, and returns a list of image URLs that do not contain ".webp".
 * @param input - HTML content or URL
 * @returns Promise<WebpImagesCheckResult> - The result with non-webp image URLs
 */
export async function checkImagesWebpExtension(input: string): Promise<WebpImagesCheckResult> {
    try {
        let content: string;
        let baseUrl = "";
        if (isURL(input)) {
            const cleanInput = cleanDomainName(input);
            const response = await fetch(input);
            if (!response.ok) {
                return {
                    nonWebpImages: [],
                    return_key: "nonWebpImages",
                    error: "HTTP Error: " + response.status + " " + response.statusText
                };
            }
            content = await response.text();
            baseUrl = input;
        } else {
            content = input;
        }

        const imgRegex = /<img\s+[^>]*>/gi;
        const imgTags = content.match(imgRegex) || [];
        const nonWebpImages: string[] = [];
        
        const srcRegex = /src\s*=\s*("|')(.*?)\1/i;
        const srcsetRegex = /srcset\s*=\s*("|')(.*?)\1/i;
        
        // Helper function to convert relative URL to absolute
        function toAbsolute(url: string): string {
            if (!url.startsWith("http") && baseUrl) {
                let tmpBase = baseUrl;
                if (tmpBase.endsWith("/")) {
                    tmpBase = tmpBase.slice(0, -1);
                }
                if (!url.startsWith("/")) {
                    url = "/" + url;
                }
                return tmpBase + url;
            }
            return url;
        }
        
        // RegEx to determine if a URL contains .webp (optionally followed by query parameters)
        const webpRegex = /\.webp(\?|$)/i;
        
        for (const tag of imgTags) {
            // Check src attribute
            const srcMatch = tag.match(srcRegex);
            if (srcMatch) {
                let imgUrl = srcMatch[2].trim();
                imgUrl = toAbsolute(imgUrl);
                if (!webpRegex.test(imgUrl)) {
                    nonWebpImages.push(imgUrl);
                }
            }
            // Check srcset attribute
            const srcsetMatch = tag.match(srcsetRegex);
            if (srcsetMatch) {
                const srcsetContent = srcsetMatch[2];
                // Split multiple sources by comma
                const sources = srcsetContent.split(",");
                for (let srcEntry of sources) {
                    // Remove descriptor if any
                    srcEntry = srcEntry.trim().split(" ")[0];
                    srcEntry = toAbsolute(srcEntry);
                    if (!webpRegex.test(srcEntry)) {
                        nonWebpImages.push(srcEntry);
                    }
                }
            }
        }

        return {
            nonWebpImages,
            return_key: "nonWebpImages"
        };
    } catch (error) {
        return {
            nonWebpImages: [],
            return_key: "nonWebpImages",
            error: error instanceof Error ? error.message : "Erro desconhecido"
        };
    }
}
