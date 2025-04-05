import { cleanDomainName, isURL } from "./utils.js";

export interface TitleTagCheckResult {
    titleTagCount: number;
    multipleTitleTags: boolean;
    error?: string;
}

export interface TitleTagPresenceCheckResult {
    exists: boolean;
    empty: boolean;
    titleText?: string;
    error?: string;
}

export interface TitleTagLongCheckResult {
    isLong: boolean;
    titleText?: string;
    length?: number;
    error?: string;
}

export interface TitleTagShortCheckResult {
    isShort: boolean;
    titleText?: string;
    length?: number;
    error?: string;
}

export interface TitleTagKeywordCheckResult {
    containsKeyword: boolean;
    titleText?: string;
    error?: string;
}

/**
 * Checks if the given input (HTML content or URL) contains a <title> tag and if the title is empty.
 * If the input is a URL, it fetches the content first.
 * @param input - HTML content or URL
 * @returns Promise<TitleTagPresenceCheckResult> - Object containing existence and emptiness of the title tag
 */
export async function checkTitleTagPresence(input: string): Promise<TitleTagPresenceCheckResult> {
    try {
        let content: string;
        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return {
                    exists: false,
                    empty: true,
                    error: "HTTP Error: " + response.status + " " + response.statusText
                };
            }
            content = await response.text();
        } else {
            content = input;
        }

        // Use regex to capture the first <title> tag content
        const regex = /<title[^>]*>([\s\S]*?)<\/title>/i;
        const match = content.match(regex);
        if (!match) {
            return {
                exists: false,
                empty: true
            };
        }
        const titleContent = match[1] ? match[1].trim() : "";
        return {
            exists: true,
            empty: titleContent.length === 0,
            titleText: titleContent
        };
    } catch (error) {
        return {
            exists: false,
            empty: true,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}

/**
 * Checks if the given input (HTML content or URL) contains multiple <title> tags.
 * If the input is a URL, it fetches the content first.
 * @param input - HTML content or URL
 * @returns Promise<TitleTagCheckResult> - Object containing the count of <title> tags and a flag if there are multiple tags.
 */
export async function checkMultipleTitleTags(input: string): Promise<TitleTagCheckResult> {
    try {
        let content: string;
        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return {
                    titleTagCount: 0,
                    multipleTitleTags: false,
                    error: "HTTP Error: " + response.status + " " + response.statusText
                };
            }
            content = await response.text();
        } else {
            content = input;
        }

        // Regex to match all occurrences of <title> tag
        const matches = content.match(/<title[^>]*>[\s\S]*?<\/title>/gi);
        const count = matches ? matches.length : 0;
        return {
            titleTagCount: count,
            multipleTitleTags: count > 1
        };
    } catch (error) {
        return {
            titleTagCount: 0,
            multipleTitleTags: false,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}

/**
 * Checks if the <title> tag in the given input (HTML content or URL) exceeds 60 characters.
 * If the input is a URL, it fetches the content first.
 * @param input - HTML content or URL
 * @returns Promise<TitleTagLongCheckResult> - Object containing whether the title is long, the title text and its length.
 */
export async function checkTitleTagLong(input: string): Promise<TitleTagLongCheckResult> {
    try {
        let content: string;
        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return {
                    isLong: false,
                    error: "HTTP Error: " + response.status + " " + response.statusText
                };
            }
            content = await response.text();
        } else {
            content = input;
        }

        const regex = /<title[^>]*>([\s\S]*?)<\/title>/i;
        const match = content.match(regex);
        if (!match) {
            return {
                isLong: false,
                error: "No <title> tag found"
            };
        }
        const titleText = match[1] ? match[1].trim() : "";
        const length = titleText.length;
        return {
            isLong: length > 60,
            titleText,
            length
        };
    } catch (error) {
        return {
            isLong: false,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}

/**
 * Checks if the <title> tag in the given input (HTML content or URL) is too short (below 30 characters).
 * If the input is a URL, it fetches the content first.
 * @param input - HTML content or URL
 * @returns Promise<TitleTagShortCheckResult> - Object indicating if the title is short, along with the title text and its length.
 */
export async function checkTitleTagShort(input: string): Promise<TitleTagShortCheckResult> {
    try {
        let content: string;
        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return {
                    isShort: false,
                    error: "HTTP Error: " + response.status + " " + response.statusText
                };
            }
            content = await response.text();
        } else {
            content = input;
        }

        const regex = /<title[^>]*>([\s\S]*?)<\/title>/i;
        const match = content.match(regex);
        if (!match) {
            return {
                isShort: false,
                error: "No <title> tag found"
            };
        }
        const titleText = match[1] ? match[1].trim() : "";
        const length = titleText.length;
        return {
            isShort: length < 30,
            titleText,
            length
        };
    } catch (error) {
        return {
            isShort: false,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}

/**
 * Checks if the main keyword is present in the <title> tag of the given input (HTML content or URL).
 * The check is case-insensitive.
 * If the input is a URL, it fetches the content first.
 * @param input - HTML content or URL
 * @param keyword - The main keyword to search for
 * @returns Promise<TitleTagKeywordCheckResult> - Object indicating if the keyword is present in the title tag along with the title text.
 */
export async function checkTitleTagForKeyword(input: string, keyword: string): Promise<TitleTagKeywordCheckResult> {
    try {
        let content: string;
        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return {
                    containsKeyword: false,
                    error: "HTTP Error: " + response.status + " " + response.statusText
                };
            }
            content = await response.text();
        } else {
            content = input;
        }

        const regex = /<title[^>]*>([\s\S]*?)<\/title>/i;
        const match = content.match(regex);
        if (!match) {
            return {
                containsKeyword: false,
                error: "No <title> tag found"
            };
        }
        const titleText = match[1] ? match[1].trim() : "";
        const containsKeyword = titleText.toLowerCase().indexOf(keyword.toLowerCase()) >= 0;
        return {
            containsKeyword,
            titleText
        };
    } catch (error) {
        return {
            containsKeyword: false,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}

// New Function: checkDuplicateTitleAcrossPages

export interface DuplicateTitleCheckResult {
    duplicateTitles: Record<string, string[]>;
    error?: string;
}

/**
 * Checks across multiple pages for duplicate <title> tag values.
 * The function accepts either an array of URLs or a domain name.
 * If a domain is provided, it first fetches the homepage and extracts URLs from href attributes.
 * It then fetches each URL to extract the title and returns a mapping of duplicate titles to the corresponding URLs.
 * @param input - Either a list of URLs or a domain name
 * @returns Promise<DuplicateTitleCheckResult> - Object with a key 'duplicateTitles' mapping titles to arrays of URLs that share the title.
 */
export async function checkDuplicateTitleAcrossPages(input: string | string[]): Promise<DuplicateTitleCheckResult> {
    try {
        let urls: string[] = [];
        if (typeof input === "string") {
            if (isURL(input)) {
                urls = [input];
            } else {
                // Assume it's a domain name
                const cleanDomain = cleanDomainName(input);
                const homepageUrl = "https://" + cleanDomain;
                const response = await fetch(homepageUrl);
                if (!response.ok) {
                    return { duplicateTitles: {}, error: "HTTP Error: " + response.status + " " + response.statusText };
                }
                const homepageContent = await response.text();
                // Extract URLs from the homepage's href attributes
                const regex = /href=\"(https?:\/\/[^"]+)\"/gi;
                let match;
                while ((match = regex.exec(homepageContent)) !== null) {
                    urls.push(match[1]);
                }
            }
        } else {
            urls = input;
        }

        // Remove duplicate URLs if any
        urls = Array.from(new Set(urls));

        const titleMap: Record<string, string[]> = {};
        const promises = urls.map(async url => {
            const result = await checkTitleTagPresence(url);
            if (result.exists && result.titleText) {
                return { url, title: result.titleText };
            } else {
                return { url, title: "" };
            }
        });

        const results = await Promise.all(promises);
        results.forEach(({ url, title }) => {
            if (title) {
                if (!titleMap[title]) {
                    titleMap[title] = [];
                }
                titleMap[title].push(url);
            }
        });

        // Filter titles that appear in more than one URL
        const duplicates: Record<string, string[]> = {};
        for (const title in titleMap) {
            if (titleMap[title].length > 1) {
                duplicates[title] = titleMap[title];
            }
        }

        return { duplicateTitles: duplicates };
    } catch (error) {
        return { duplicateTitles: {}, error: error instanceof Error ? error.message : "Unknown error" };
    }
}
