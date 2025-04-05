import { cleanDomainName, isURL } from "./utils.js";

export interface FriendlyUrlsCheckResult {
    hasUnderscores: boolean;
    urlsWithUnderscores: string[];
    totalUrls: number;
    error?: string;
}

export interface UppercaseUrlsCheckResult {
    hasUppercase: boolean;
    urlsWithUppercase: string[];
    totalUrls: number;
    error?: string;
}

export interface CategoryUrlHierarchyCheckResult {
    isCategoryUrlValid: boolean;
    testedUrl: string;
    error?: string;
}

export interface UrlHierarchyDepthCheckResult {
    hasMoreThanTwoLevels: boolean;
    testedUrl: string;
    levelsCount: number;
    error?: string;
}

export interface SpecialCharacterUrlsCheckResult {
    hasSpecialCharacters: boolean;
    urlsWithSpecialCharacters: string[];
    totalUrls: number;
    error?: string;
}

// New interface for blog URL hierarchy check
export interface BlogUrlHierarchyCheckResult {
    isBlogUrlValid: boolean;
    testedUrl: string;
    error?: string;
}

// New interface for trailing slash duplicates check
export interface TrailingSlashUrlsCheckResult {
    duplicateGroups: { normalized: string; variants: string[] }[];
    totalUrls: number;
    hasDuplicates: boolean;
    error?: string;
}

// New interface for post URL date check
export interface PostUrlDateCheckResult {
    hasDate: boolean;
    testedUrl: string;
    error?: string;
}

// New interface for URL keyword presence check
export interface UrlKeywordPresenceCheckResult {
    containsKeyword: boolean;
    testedUrl: string;
    error?: string;
}

/**
 * Checks if the provided blog post URL contains a date in its path.
 * The function accepts a URL string. It validates the URL and then uses a regular expression
 * to determine if the pathname includes a date pattern in the format /YYYY/MM/ or /YYYY/MM/DD.
 *
 * @param input - URL to be checked.
 * @returns Promise<PostUrlDateCheckResult> - The result of the check, including whether a date was found in the URL.
 */
export async function checkPostUrlDatePresence(input: string): Promise<PostUrlDateCheckResult> {
    try {
        if (!isURL(input)) {
            return { hasDate: false, testedUrl: input, error: "Input is not a valid URL" };
        }
        const urlObj = new URL(input);
        const path = urlObj.pathname;
        // Regex matches /YYYY/MM/ optionally /DD, ensuring either a trailing slash or end of string
        const dateRegex = /\/(\d{4})\/(\d{2})(?:\/(\d{1,2}))?(?:\/|$)/;
        const match = path.match(dateRegex);
        const hasDate = match !== null;
        return { hasDate, testedUrl: input };
    } catch (error) {
        return { hasDate: false, testedUrl: input, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

/**
 * Checks if a page contains URLs with words separated by underscores.
 * The function accepts either a URL or raw HTML content. If a URL is provided, the function fetches
 * its content and then extracts all URLs found in href attributes. It then verifies whether any URL
 * contains underscores in its path, which can indicate non-friendly URL structure.
 *
 * @param input - HTML content or URL to be checked.
 * @returns Promise<FriendlyUrlsCheckResult> - The result of the check, including the total number of URLs
 * inspected and a list of URLs with underscores.
 */
export async function checkFriendlyUrls(input: string): Promise<FriendlyUrlsCheckResult> {
    try {
        let content: string = input;
        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return {
                    hasUnderscores: false,
                    urlsWithUnderscores: [],
                    totalUrls: 0,
                    error: "HTTP Error: " + response.status + " " + response.statusText
                };
            }
            content = await response.text();
        }

        // Regex to extract href values within double quotes
        const hrefRegex = /href\s*=\s*"(.*?)"/gi;
        let match;
        const urls: string[] = [];

        while ((match = hrefRegex.exec(content)) !== null) {
            urls.push(match[1]);
        }

        // If no href found and input is a URL, consider the input itself
        if (urls.length === 0 && isURL(input)) {
            urls.push(input);
        }

        const urlsWithUnderscores = urls.filter(url => url.indexOf('_') !== -1);

        return {
            hasUnderscores: urlsWithUnderscores.length > 0,
            urlsWithUnderscores,
            totalUrls: urls.length
        };
    } catch (error) {
        return {
            hasUnderscores: false,
            urlsWithUnderscores: [],
            totalUrls: 0,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}

/**
 * Checks if a page contains URLs with uppercase letters.
 * The function accepts either a URL or raw HTML content. If a URL is provided, the function fetches
 * its content and then extracts all URLs found in href attributes. It then verifies whether any URL
 * contains uppercase letters, which can indicate a non-friendly URL structure.
 *
 * @param input - HTML content or URL to be checked.
 * @returns Promise<UppercaseUrlsCheckResult> - The result of the check, including the total number of URLs
 * inspected and a list of URLs with uppercase letters.
 */
export async function checkUppercaseUrls(input: string): Promise<UppercaseUrlsCheckResult> {
    try {
        let content: string = input;
        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return {
                    hasUppercase: false,
                    urlsWithUppercase: [],
                    totalUrls: 0,
                    error: "HTTP Error: " + response.status + " " + response.statusText
                };
            }
            content = await response.text();
        }

        // Regex to extract href values within double quotes
        const hrefRegex = /href\s*=\s*"(.*?)"/gi;
        let match;
        const urls: string[] = [];

        while ((match = hrefRegex.exec(content)) !== null) {
            urls.push(match[1]);
        }

        // If no href found and input is a URL, consider the input itself
        if (urls.length === 0 && isURL(input)) {
            urls.push(input);
        }

        const urlsWithUppercase = urls.filter(url => /[A-Z]/.test(url));

        return {
            hasUppercase: urlsWithUppercase.length > 0,
            urlsWithUppercase,
            totalUrls: urls.length
        };
    } catch (error) {
        return {
            hasUppercase: false,
            urlsWithUppercase: [],
            totalUrls: 0,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}

/**
 * Checks if the provided category URL has the correct hierarchy, which should include '/category/' in its path.
 * The function accepts a URL string and validates that the pathname starts with '/category/' (case insensitive).
 *
 * @param input - URL to be checked.
 * @returns Promise<CategoryUrlHierarchyCheckResult> - The result of the check, including whether the URL structure is valid.
 */
export async function checkCategoryUrlHierarchy(input: string): Promise<CategoryUrlHierarchyCheckResult> {
    try {
        if (!isURL(input)) {
            return { isCategoryUrlValid: false, testedUrl: input, error: "Input is not a valid URL" };
        }
        const urlObj = new URL(input);
        const isValid = urlObj.pathname.toLowerCase().startsWith("/category/");
        return { isCategoryUrlValid: isValid, testedUrl: input };
    } catch (error) {
        return {
            isCategoryUrlValid: false,
            testedUrl: input,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}

/**
 * Checks if the provided URL has more than 2 levels of hierarchy.
 * It accepts a URL string, validates it, and calculates the number of non-empty segments in the pathname.
 *
 * @param input - URL to be checked.
 * @returns Promise<UrlHierarchyDepthCheckResult> - The result of the check, including the level count.
 */
export async function checkUrlHierarchyDepth(input: string): Promise<UrlHierarchyDepthCheckResult> {
    try {
        if (!isURL(input)) {
            return { hasMoreThanTwoLevels: false, testedUrl: input, levelsCount: 0, error: "Input is not a valid URL" };
        }
        const urlObj = new URL(input);
        const segments = urlObj.pathname.split("/").filter(segment => segment.length > 0);
        const levelsCount = segments.length;
        return { hasMoreThanTwoLevels: levelsCount > 2, testedUrl: input, levelsCount };
    } catch (error) {
        return { hasMoreThanTwoLevels: false, testedUrl: input, levelsCount: 0, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

/**
 * Checks if a page contains URLs with special characters that might affect URL friendliness.
 * The function accepts either a URL or raw HTML content. If a URL is provided, the function fetches its content
 * and then extracts all URLs found in href attributes. It then verifies whether any URL contains characters
 * outside the allowed set: alphanumeric characters and the following symbols - . _ ~ : / ? # [ ] @ ! $ & ' ( ) * + , ; = %
 * These special characters may indicate potential issues with URL encoding or readability.
 *
 * @param input - HTML content or URL to be checked.
 * @returns Promise<SpecialCharacterUrlsCheckResult> - The result of the check, including the total number of URLs
 * inspected and a list of URLs with special characters.
 */
export async function checkSpecialCharacterUrls(input: string): Promise<SpecialCharacterUrlsCheckResult> {
    try {
        let content: string = input;
        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return {
                    hasSpecialCharacters: false,
                    urlsWithSpecialCharacters: [],
                    totalUrls: 0,
                    error: "HTTP Error: " + response.status + " " + response.statusText
                };
            }
            content = await response.text();
        }

        // Regex to extract href values within double quotes
        const hrefRegex = /href\s*=\s*"(.*?)"/gi;
        let match;
        const urls: string[] = [];

        while ((match = hrefRegex.exec(content)) !== null) {
            urls.push(match[1]);
        }

        // If no href found and input is a URL, consider the input itself
        if (urls.length === 0 && isURL(input)) {
            urls.push(input);
        }

        // Allowed characters: alphanumeric and - . _ ~ : / ? # [ ] @ ! $ & ' ( ) * + , ; = %
        const allowedRegex = /^[A-Za-z0-9\-._~:\/\?#\[\]@!$&'()*+,;=%]+$/;
        const urlsWithSpecialCharacters = urls.filter(url => !allowedRegex.test(url));

        return {
            hasSpecialCharacters: urlsWithSpecialCharacters.length > 0,
            urlsWithSpecialCharacters,
            totalUrls: urls.length
        };
    } catch (error) {
        return {
            hasSpecialCharacters: false,
            urlsWithSpecialCharacters: [],
            totalUrls: 0,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}

/**
 * Checks for duplicate URLs that only differ by a trailing slash. It accepts either a URL or raw HTML content.
 * If a URL is provided, the function fetches its content and extracts all URLs from href attributes.
 * It then normalizes the URLs by removing a trailing slash (if present) and checks for duplicates.
 *
 * @param input - HTML content or URL to be checked.
 * @returns Promise<TrailingSlashUrlsCheckResult> - The result of the check, including duplicate groups and total URLs inspected.
 */
export async function checkTrailingSlashDuplicates(input: string): Promise<TrailingSlashUrlsCheckResult> {
    try {
        let content: string = input;
        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return {
                    duplicateGroups: [],
                    totalUrls: 0,
                    hasDuplicates: false,
                    error: "HTTP Error: " + response.status + " " + response.statusText
                };
            }
            content = await response.text();
        }

        // Regex to extract href values within double quotes
        const hrefRegex = /href\s*=\s*"(.*?)"/gi;
        let match;
        const urls: string[] = [];

        while ((match = hrefRegex.exec(content)) !== null) {
            urls.push(match[1]);
        }

        // If no hrefs found and input is a URL, consider the input itself
        if (urls.length === 0 && isURL(input)) {
            urls.push(input);
        }

        const normalizedMap = new Map<string, string[]>();
        for (const url of urls) {
            // Normalize by removing a trailing slash if it exists
            const normalized = url.endsWith("/") ? url.slice(0, -1) : url;
            if (normalizedMap.has(normalized)) {
                normalizedMap.get(normalized)!.push(url);
            } else {
                normalizedMap.set(normalized, [url]);
            }
        }

        const duplicateGroups = Array.from(normalizedMap.entries())
            .filter(([_, variants]) => variants.length > 1)
            .map(([normalized, variants]) => ({ normalized, variants }));

        return {
            duplicateGroups,
            totalUrls: urls.length,
            hasDuplicates: duplicateGroups.length > 0
        };
    } catch (error) {
        return {
            duplicateGroups: [],
            totalUrls: 0,
            hasDuplicates: false,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}

/**
 * Checks if the provided blog post URL contains the "/blog/" hierarchy in its path.
 * The function accepts a URL string. It validates that the input is a valid URL and then checks
 * if the pathname includes "/blog/" (case insensitive).
 *
 * @param input - URL to be checked.
 * @returns Promise<BlogUrlHierarchyCheckResult> - The result of the check, including whether the URL contains "/blog/".
 */
export async function checkBlogUrlHierarchy(input: string): Promise<BlogUrlHierarchyCheckResult> {
    try {
        if (!isURL(input)) {
            return { isBlogUrlValid: false, testedUrl: input, error: "Input is not a valid URL" };
        }
        const urlObj = new URL(input);
        const isValid = urlObj.pathname.toLowerCase().includes("/blog/");
        return { isBlogUrlValid: isValid, testedUrl: input };
    } catch (error) {
        return {
            isBlogUrlValid: false,
            testedUrl: input,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}

/**
 * Verifies if the homepage of the domain has less than 200 words of content
 * @param input - HTML or domain to be checked (e.g., "example.com")
 * @returns Promise<ContentWordCountCheckResult> - The result of the check
 */
export async function checkPageContentWordCount(input: string): Promise<ContentWordCountCheckResult> {
    try {
        let content: string;
        
        if (isURL(input)) {
            const response = await fetch(input);

            if (!response.ok) {
                return {
                    hasLessThan200Words: false,
                    wordCount: 0,
                    error: `HTTP Error: ${response.status} ${response.statusText}`
                };
            }
            content = await response.text();
        } else {
            content = input;
        }

        const wordCount = content
            .replace(/<[^>]+>/g, ' ')
            .replace(/&#?[a-z0-9]+;/gi, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .split(/\s+/)
            .filter(word => word.length > 0).length;

        return {
            hasLessThan200Words: wordCount < 200,
            wordCount
        };

    } catch (error) {
        return {
            hasLessThan200Words: false,
            wordCount: 0,
            error: error instanceof Error ? error.message : "Erro desconhecido"
        };
    }
}

/**
 * Verifies if the homepage paragraphs are well divided, with a maximum of 3 lines per paragraph
 * @param domain - The domain to be checked (e.g., "example.com")
 * @returns Promise<Error404CheckResult> - The result of the check
 */
export async function check404PageStatus(domain: string): Promise<Error404CheckResult> {
    try {
        const cleanDomain = cleanDomainName(domain);
        const response = await fetch(`https://${cleanDomain}/404`);
        return { exists: response.status === 404 };
    } catch (error) {
        return {
            exists: false,
            error: error instanceof Error ? error.message : "Unknown error while checking 404 page status",
        };
    }
}

/**
 * Checks if the provided URL contains the specified keyword.
 * The function accepts a URL string and a keyword. It validates the URL and then checks
 * if the entire URL (including its pathname) contains the keyword in a case-insensitive manner.
 *
 * @param input - URL to be checked.
 * @param keyword - The keyword to search for in the URL.
 * @returns Promise<UrlKeywordPresenceCheckResult> - The result of the check, indicating if the keyword is present.
 */
export async function checkUrlKeywordPresence(input: string, keyword: string): Promise<UrlKeywordPresenceCheckResult> {
    try {
        if (!isURL(input)) {
            return { containsKeyword: false, testedUrl: input, error: "Input is not a valid URL" };
        }
        const urlObj = new URL(input);
        const lowerUrl = urlObj.href.toLowerCase();
        const lowerKeyword = keyword.toLowerCase();
        const containsKeyword = lowerUrl.indexOf(lowerKeyword) !== -1;
        return { containsKeyword, testedUrl: input };
    } catch (error) {
        return { containsKeyword: false, testedUrl: input, error: error instanceof Error ? error.message : "Unknown error" };
    }
}
