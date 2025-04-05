import { isURL, cleanDomainName } from "./utils.js";

export interface SocialLinksResult {
    socialLinks: string[];
    error?: string;
}

export interface SocialLinksFormatResult {
    invalidSocialLinks: string[];
    error?: string;
}

export interface MenuLinksCheckResult {
    missingLinks: string[];
    return_key: string;
    error?: string;
}

export interface FooterLinksCheckResult {
    missingLinks: string[];
    return_key: string;
    error?: string;
}

// Nova interface para o novo problema
export interface FooterSlugsCheckResult {
    linksWithoutSlug: string[];
    return_key: string;
    error?: string;
}

/**
 * Extracts social media links from the footer of the provided HTML content or URL.
 * It retrieves the HTML if a URL is provided and parses the footer element to extract links to common social platforms.
 *
 * @param input - HTML content or a URL
 * @returns Promise<SocialLinksResult> - Contains an array of social media links found in the footer
 */
export async function extractFooterSocialLinks(input: string): Promise<SocialLinksResult> {
    try {
        let content: string;
        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return { socialLinks: [], error: "HTTP Error: " + response.status + " " + response.statusText };
            }
            content = await response.text();
        } else {
            content = input;
        }

        // Extract the <footer> element using regex
        const footerMatch = content.match(/<footer[^>]*>([\s\S]*?)<\/footer>/i);
        if (!footerMatch) {
            return { socialLinks: [] };
        }
        const footerContent = footerMatch[1];

        // Extract all anchor tags from the footer
        const anchorRegex = /<a\s+[^>]*href="([^"]+)"[^>]*>/gi;
        let match;
        const links: string[] = [];
        const socialKeywords = ["facebook.com", "twitter.com", "instagram.com", "linkedin.com", "youtube.com"];

        while ((match = anchorRegex.exec(footerContent)) !== null) {
            const url = match[1];
            if (socialKeywords.some(keyword => url.toLowerCase().indexOf(keyword) !== -1)) {
                links.push(url);
            }
        }

        return { socialLinks: links };
    } catch (error) {
        return { socialLinks: [], error: error instanceof Error ? error.message : "Erro desconhecido" };
    }
}

/**
 * Validates the formatting of social media links in the footer of the provided HTML content or URL.
 * The function extracts social links and then filters out the ones that do not use HTTPS and include "www." in their URL.
 *
 * @param input - HTML content or a URL
 * @returns Promise<SocialLinksFormatResult> - Contains an array of invalid social media links that do not meet the required format
 */
export async function validateSocialLinksFormat(input: string): Promise<SocialLinksFormatResult> {
    try {
        let content: string;
        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return { invalidSocialLinks: [], error: "HTTP Error: " + response.status + " " + response.statusText };
            }
            content = await response.text();
        } else {
            content = input;
        }

        // Extract the <footer> element using regex
        const footerMatch = content.match(/<footer[^>]*>([\s\S]*?)<\/footer>/i);
        if (!footerMatch) {
            return { invalidSocialLinks: [] };
        }
        const footerContent = footerMatch[1];

        // Extract all anchor tags from the footer
        const anchorRegex = /<a\s+[^>]*href="([^"]+)"[^>]*>/gi;
        let match;
        const invalidLinks: string[] = [];
        const socialKeywords = ["facebook.com", "twitter.com", "instagram.com", "linkedin.com", "youtube.com"];

        while ((match = anchorRegex.exec(footerContent)) !== null) {
            const url = match[1];
            if (socialKeywords.some(keyword => url.toLowerCase().indexOf(keyword) !== -1)) {
                // A valid social link must start with "https://" and include "www." in the URL
                if (!(url.startsWith("https://") && url.includes("www."))) {
                    invalidLinks.push(url);
                }
            }
        }

        return { invalidSocialLinks: invalidLinks };
    } catch (error) {
        return { invalidSocialLinks: [], error: error instanceof Error ? error.message : "Erro desconhecido" };
    }
}

/**
 * Verifies if the main menu of the provided HTML content or URL contains all the required URLs.
 * The function retrieves the HTML content if a URL is provided, extracts all the links within the <nav> element,
 * and compares them against a list of required URLs. It returns the list of URLs that are missing in the menu.
 *
 * @param input - HTML content or a URL containing the menu
 * @param requiredLinks - Array of URLs that should be present in the menu
 * @returns Promise<MenuLinksCheckResult> - Contains an array of missing URLs under the key 'missingLinks' and a return_key
 */
export async function checkMenuLinks(input: string, requiredLinks: string[]): Promise<MenuLinksCheckResult> {
    try {
        let content: string;
        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return { missingLinks: requiredLinks, return_key: "missingLinks", error: "HTTP Error: " + response.status + " " + response.statusText };
            }
            content = await response.text();
        } else {
            content = input;
        }

        // Extract the <nav> element using regex
        const navMatch = content.match(/<nav[^>]*>([\s\S]*?)<\/nav>/i);
        if (!navMatch) {
            // If no <nav> found, assume none of the required links are present
            return { missingLinks: requiredLinks, return_key: "missingLinks" };
        }
        const navContent = navMatch[1];

        // Extract all anchor tags from the nav
        const anchorRegex = /<a\s+[^>]*href="([^"]+)"[^>]*>/gi;
        let match;
        const menuLinks: string[] = [];
        while ((match = anchorRegex.exec(navContent)) !== null) {
            menuLinks.push(match[1]);
        }

        // Compare requiredLinks to menuLinks and collect missing ones
        const missingLinks = requiredLinks.filter(url => {
            // Normalize both sides to lower case for comparison
            return !menuLinks.some(menuUrl => menuUrl.toLowerCase() === url.toLowerCase());
        });

        return { missingLinks, return_key: "missingLinks" };
    } catch (error) {
        return { missingLinks: requiredLinks, return_key: "missingLinks", error: error instanceof Error ? error.message : "Erro desconhecido" };
    }
}

/**
 * Verifies if the footer of the provided HTML content or URL contains all the required URLs.
 * The function retrieves the HTML content if a URL is provided, extracts all the links within the <footer> element,
 * and compares them against a list of required URLs. It returns the list of URLs that are missing in the footer.
 *
 * @param requiredLinks - Array of URLs that should be present in the footer
 * @param input - HTML content or a URL containing the footer
 * @returns Promise<FooterLinksCheckResult> - Contains an array of missing URLs under the key 'missingLinks' and a return_key
 */
export async function checkFooterLinks(requiredLinks: string[], input: string): Promise<FooterLinksCheckResult> {
    try {
        let content: string;
        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return { missingLinks: requiredLinks, return_key: "missingFooterLinks", error: "HTTP Error: " + response.status + " " + response.statusText };
            }
            content = await response.text();
        } else {
            content = input;
        }

        // Extract the <footer> element using regex
        const footerMatch = content.match(/<footer[^>]*>([\s\S]*?)<\/footer>/i);
        if (!footerMatch) {
            // If no footer is found, assume none of the required links are present
            return { missingLinks: requiredLinks, return_key: "missingFooterLinks" };
        }
        const footerContent = footerMatch[1];

        // Extract all anchor tags from the footer
        const anchorRegex = /<a\s+[^>]*href="([^"]+)"[^>]*>/gi;
        let match;
        const footerLinks: string[] = [];
        while ((match = anchorRegex.exec(footerContent)) !== null) {
            footerLinks.push(match[1]);
        }

        // Compare requiredLinks with the links found in the footer
        const missingLinks = requiredLinks.filter(url => {
            return !footerLinks.some(footerUrl => footerUrl.toLowerCase() === url.toLowerCase());
        });

        return { missingLinks, return_key: "missingFooterLinks" };
    } catch (error) {
        return { missingLinks: requiredLinks, return_key: "missingFooterLinks", error: error instanceof Error ? error.message : "Erro desconhecido" };
    }
}

/**
 * Verifies if the links inside the footer contain at least one of the specified slugs.
 * The function receives a list of slugs and an HTML or URL as input. It first retrieves the HTML content if a URL is provided,
 * then searches for the <footer> tag and extracts all anchor tags. For each link in the footer, it checks if it contains
 * any of the provided slugs (case-insensitive). Links that do not contain any of the slugs are returned in the result.
 *
 * @param slugs - Array of slugs that should be present in at least one of the footer links
 * @param input - HTML content or a URL containing the footer
 * @returns Promise<FooterSlugsCheckResult> - Contains an array of links that do not include any of the specified slugs under the key 'linksWithoutSlug'
 */
export async function checkFooterLinksForSlugs(slugs: string[], input: string): Promise<FooterSlugsCheckResult> {
    try {
        let content: string;
        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return { linksWithoutSlug: [], return_key: "missingFooterSlugs", error: "HTTP Error: " + response.status + " " + response.statusText };
            }
            content = await response.text();
        } else {
            content = input;
        }

        // Extract the <footer> element
        const footerMatch = content.match(/<footer[^>]*>([\s\S]*?)<\/footer>/i);
        if (!footerMatch) {
            // If no footer is found, there are no links to check
            return { linksWithoutSlug: [], return_key: "missingFooterSlugs" };
        }
        const footerContent = footerMatch[1];

        // Extract all anchor tags from the footer
        const anchorRegex = /<a\s+[^>]*href="([^"]+)"[^>]*>/gi;
        let match;
        const footerLinks: string[] = [];
        while ((match = anchorRegex.exec(footerContent)) !== null) {
            footerLinks.push(match[1]);
        }

        // Identify links that do not contain any of the provided slugs
        const linksWithoutSlug = footerLinks.filter(link => {
            const lowerLink = link.toLowerCase();
            return !slugs.some(slug => lowerLink.indexOf(slug.toLowerCase()) !== -1);
        });

        return { linksWithoutSlug, return_key: "missingFooterSlugs" };
    } catch (error) {
        return { linksWithoutSlug: [], return_key: "missingFooterSlugs", error: error instanceof Error ? error.message : "Erro desconhecido" };
    }
}
