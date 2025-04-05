import { isURL } from "./utils.js";

export interface MetaRobotsCheckResult {
    metaNoindexFound: boolean;
    error?: string;
}

export interface MetaRobotsExistsResult {
    metaTagFound: boolean;
    error?: string;
}

export interface UniqueMetaRobotsResult {
    unique: boolean;
    count: number;
    error?: string;
}

export interface PaginationFollowCheckResult {
    follow: boolean;
    error?: string;
}

export interface ThankYouNoindexResult {
    thankYouNoindex: boolean;
    error?: string;
}

export interface PageIndexFollowResult {
    index: boolean;
    follow: boolean;
    error?: string;
}

/**
 * Checks if the HTML content or page at the provided URL contains a meta robots tag with the "noindex" directive.
 * @param input - HTML content or a URL string
 * @returns Promise<MetaRobotsCheckResult> - The result of the check
 */
export async function checkMetaRobots(input: string): Promise<MetaRobotsCheckResult> {
    try {
        let content: string;

        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return { metaNoindexFound: false, error: "HTTP Error: " + response.status + " " + response.statusText };
            }
            content = await response.text();
        } else {
            content = input;
        }

        // Look for meta robots tag using a regex
        const metaTagRegex = /<meta\s+[^>]*name=["']robots["'][^>]*>/gi;
        let tagMatch;
        let metaNoindexFound = false;
        while ((tagMatch = metaTagRegex.exec(content)) !== null) {
            const contentAttrMatch = /content=["']([^"']+)["']/i.exec(tagMatch[0]);
            if (contentAttrMatch && contentAttrMatch[1].toLowerCase().indexOf("noindex") !== -1) {
                metaNoindexFound = true;
                break;
            }
        }

        return { metaNoindexFound };
    } catch (error) {
        return {
            metaNoindexFound: false,
            error: error instanceof Error ? error.message : "Erro desconhecido"
        };
    }
}

/**
 * Checks if the HTML content or page at the provided URL contains any meta robots tag.
 * @param input - HTML content or a URL string
 * @returns Promise<MetaRobotsExistsResult> - The result of the check
 */
export async function checkIfMetaRobotsExists(input: string): Promise<MetaRobotsExistsResult> {
    try {
        let content: string;

        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return { metaTagFound: false, error: "HTTP Error: " + response.status + " " + response.statusText };
            }
            content = await response.text();
        } else {
            content = input;
        }

        // Use regex to check for any meta tag with name="robots"
        const metaTagRegex = /<meta\s+[^>]*name=["']robots["'][^>]*>/i;
        const metaTagFound = metaTagRegex.test(content);

        return { metaTagFound };
    } catch (error) {
        return {
            metaTagFound: false,
            error: error instanceof Error ? error.message : "Erro desconhecido"
        };
    }
}

/**
 * Checks if the meta robots tag in the given HTML content or URL is unique (i.e., appears exactly once).
 * @param input - HTML content or a URL string
 * @returns Promise<UniqueMetaRobotsResult> - The result with a flag indicating uniqueness and the count of meta robots tags
 */
export async function checkUniqueMetaRobots(input: string): Promise<UniqueMetaRobotsResult> {
    try {
        let content: string;

        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return { unique: false, count: 0, error: "HTTP Error: " + response.status + " " + response.statusText };
            }
            content = await response.text();
        } else {
            content = input;
        }

        const metaTagRegex = /<meta\s+[^>]*name=["']robots["'][^>]*>/gi;
        const matches = content.match(metaTagRegex) || [];
        const count = matches.length;

        return { unique: count === 1, count };
    } catch (error) {
        return {
            unique: false,
            count: 0,
            error: error instanceof Error ? error.message : "Erro desconhecido"
        };
    }
}

/**
 * Checks if the pagination page is configured as follow by examining the meta robots tag for a "nofollow" directive.
 * If a meta robots tag containing "nofollow" is found, the function returns false; otherwise it returns true, assuming follow by default.
 * @param input - HTML content or a URL string
 * @returns Promise<PaginationFollowCheckResult> - The result with a flag indicating if the page is follow
 */
export async function checkPaginationFollow(input: string): Promise<PaginationFollowCheckResult> {
    try {
        let content: string;

        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return { follow: false, error: "HTTP Error: " + response.status + " " + response.statusText };
            }
            content = await response.text();
        } else {
            content = input;
        }

        const metaTagRegex = /<meta\s+[^>]*name=["']robots["'][^>]*>/gi;
        let tagMatch;
        while ((tagMatch = metaTagRegex.exec(content)) !== null) {
            const contentAttrMatch = /content=["']([^"']+)["']/i.exec(tagMatch[0]);
            if (contentAttrMatch) {
                const directives = contentAttrMatch[1].toLowerCase();
                if (directives.indexOf("nofollow") !== -1) {
                    return { follow: false };
                }
            }
        }

        return { follow: true };
    } catch (error) {
        return {
            follow: false,
            error: error instanceof Error ? error.message : "Erro desconhecido"
        };
    }
}

/**
 * Checks if the reward/thank you page (typically a conversion confirmation page) contains the correct meta robots directive set as "noindex".
 * This is important to prevent these pages from being indexed.
 * @param input - HTML content or a URL string
 * @returns Promise<ThankYouNoindexResult> - The result indicating if the page is correctly set as noindex
 */
export async function checkThankYouPageNoindex(input: string): Promise<ThankYouNoindexResult> {
    try {
        let content: string;

        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return { thankYouNoindex: false, error: "HTTP Error: " + response.status + " " + response.statusText };
            }
            content = await response.text();
        } else {
            content = input;
        }

        // Find meta robots tag and check if it contains "noindex"
        const metaTagRegex = /<meta\s+[^>]*name=["']robots["'][^>]*>/gi;
        let tagMatch;
        let thankYouNoindex = false;
        while ((tagMatch = metaTagRegex.exec(content)) !== null) {
            const contentAttrMatch = /content=["']([^"']+)["']/i.exec(tagMatch[0]);
            if (contentAttrMatch && contentAttrMatch[1].toLowerCase().indexOf("noindex") !== -1) {
                thankYouNoindex = true;
                break;
            }
        }
        
        return { thankYouNoindex };
    } catch (error) {
        return {
            thankYouNoindex: false,
            error: error instanceof Error ? error.message : "Erro desconhecido"
        };
    }
}

/**
 * Checks if the page is configured to be indexed and if its links are set to be followed.
 * It determines the indexing by verifying that no meta robots tag contains "noindex" and
 * determines the follow status by verifying that no meta robots tag contains "nofollow".
 * If no meta robots tag is found, the page is assumed to be index and follow by default.
 * @param input - HTML content or a URL string
 * @returns Promise<PageIndexFollowResult> - The result indicating the index and follow status
 */
export async function checkPageIndexFollow(input: string): Promise<PageIndexFollowResult> {
    try {
        let content: string;

        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return { index: false, follow: false, error: "HTTP Error: " + response.status + " " + response.statusText };
            }
            content = await response.text();
        } else {
            content = input;
        }

        // Defaults
        let indexStatus = true;
        let followStatus = true;
        
        // Search for meta robots tags
        const metaTagRegex = /<meta\s+[^>]*name=["']robots["'][^>]*>/gi;
        let tagMatch;
        while ((tagMatch = metaTagRegex.exec(content)) !== null) {
            const contentAttrMatch = /content=["']([^"']+)["']/i.exec(tagMatch[0]);
            if (contentAttrMatch) {
                const directives = contentAttrMatch[1].toLowerCase();
                if (directives.indexOf("noindex") !== -1) {
                    indexStatus = false;
                }
                if (directives.indexOf("nofollow") !== -1) {
                    followStatus = false;
                }
            }
        }

        return { index: indexStatus, follow: followStatus };
    } catch (error) {
        return {
            index: false,
            follow: false,
            error: error instanceof Error ? error.message : "Erro desconhecido"
        };
    }
}
