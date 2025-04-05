import { cleanDomainName, isURL } from "./utils.js";

// Interfaces for the new functions
export interface RobotsBlockingIndexedUrlsResult {
    isBlockingIndexedUrls: boolean;
    disallowDirectives: string[];
    error?: string;
}

export interface RobotsBlockingJsFilesResult {
    isBlockingJs: boolean;
    jsDirectives: string[];
    error?: string;
}

export interface RobotsBlockingSpecifiedPathResult {
    isBlockingPath: boolean;
    matchedDirective?: string;
    error?: string;
}

export interface RobotsSitemapMentionResult {
    mentionsSitemap: boolean;
    sitemaps: string[];
    error?: string;
}

// New interface for checking the existence of robots.txt
export interface RobotsTxtExistsResult {
    exists: boolean;
    error?: string;
}

/**
 * Checks if the robots.txt file is blocking URLs that should be indexed by verifying the Disallow directives for the wildcard user-agent.
 * If a rule 'Disallow: /' is found under 'User-agent: *', it indicates that the entire site is blocked.
 * 
 * @param input - HTML content of the robots.txt file or a URL pointing to the robots.txt file
 * @returns Promise<RobotsBlockingIndexedUrlsResult> - The result, including whether the site is blocked and the Disallow directives found
 */
export async function checkRobotsBlockingIndexedUrls(input: string): Promise<RobotsBlockingIndexedUrlsResult> {
    try {
        let content: string;

        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return {
                    isBlockingIndexedUrls: false,
                    disallowDirectives: [],
                    error: `HTTP Error: ${response.status} ${response.statusText}`
                };
            }
            content = await response.text();
        } else {
            content = input;
        }

        // Split the content into lines and process
        const lines = content.split("\n").map(line => line.trim());
        let isBlocking = false;
        let disallowDirectives: string[] = [];
        let currentUserAgentIsWildcard = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line === "" || line.startsWith("#")) {
                continue;
            }
            // Check for user-agent definition
            if (/^User-agent:\s*\*/i.test(line)) {
                currentUserAgentIsWildcard = true;
                continue;
            } else if (/^User-agent:/i.test(line)) {
                // When encountering a new user-agent that is not wildcard, disable the flag
                currentUserAgentIsWildcard = false;
                continue;
            }
            // Process Disallow directives if within the wildcard user-agent block
            if (currentUserAgentIsWildcard && /^Disallow:/i.test(line)) {
                const parts = line.split(":");
                if (parts.length > 1) {
                    const directive = parts[1].trim();
                    disallowDirectives.push(directive);
                    if (directive === "/") {
                        isBlocking = true;
                    }
                }
            }
        }

        return {
            isBlockingIndexedUrls: isBlocking,
            disallowDirectives
        };
    } catch (error) {
        return {
            isBlockingIndexedUrls: false,
            disallowDirectives: [],
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}

/**
 * Checks if the robots.txt file is blocking JavaScript files. This function parses the content under the
 * "User-agent: *" block and evaluates the Disallow directives to determine if any rule blocks JS files
 * (e.g., directives containing '.js' or pointing to JS directories).
 * 
 * @param input - The robots.txt content or a URL pointing to the robots.txt file
 * @returns Promise<RobotsBlockingJsFilesResult> - The result including whether JS files are blocked and the matching directives
 */
export async function checkRobotsBlockingJsFiles(input: string): Promise<RobotsBlockingJsFilesResult> {
    try {
        let content: string;

        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return {
                    isBlockingJs: false,
                    jsDirectives: [],
                    error: `HTTP Error: ${response.status} ${response.statusText}`
                };
            }
            content = await response.text();
        } else {
            content = input;
        }

        const lines = content.split("\n").map(line => line.trim());
        let currentUserAgentIsWildcard = false;
        let jsDirectives: string[] = [];
        let isBlockingJs = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line === "" || line.startsWith("#")) {
                continue;
            }
            if (/^User-agent:\s*\*/i.test(line)) {
                currentUserAgentIsWildcard = true;
                continue;
            } else if (/^User-agent:/i.test(line)) {
                currentUserAgentIsWildcard = false;
                continue;
            }
            if (currentUserAgentIsWildcard && /^Disallow:/i.test(line)) {
                const parts = line.split(":");
                if (parts.length > 1) {
                    const directive = parts[1].trim();
                    // Check if the directive blocks JS files by matching patterns like '/js/', starting with '/js', or containing '.js'
                    if (directive === "/" || directive.toLowerCase().includes(".js") || directive.toLowerCase().startsWith("/js") || directive.toLowerCase().includes("/js/")) {
                        jsDirectives.push(directive);
                        isBlockingJs = true;
                    }
                }
            }
        }

        return {
            isBlockingJs,
            jsDirectives
        };
    } catch (error) {
        return {
            isBlockingJs: false,
            jsDirectives: [],
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}

/**
 * Checks if the robots.txt file is blocking a specific path that is recommended to be blocked.
 * The function parses the content under the "User-agent: *" block and evaluates the Disallow directives
 * to determine if any rule exactly matches the specified path.
 * 
 * @param input - The robots.txt content or a URL pointing to the robots.txt file
 * @param path - The specific path to check (e.g., "/admin")
 * @returns Promise<RobotsBlockingSpecifiedPathResult> - The result including whether the specified path is blocked
 */
export async function checkRobotsBlockingSpecifiedPath(input: string, path: string): Promise<RobotsBlockingSpecifiedPathResult> {
    try {
        let content: string;

        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return {
                    isBlockingPath: false,
                    error: `HTTP Error: ${response.status} ${response.statusText}`
                };
            }
            content = await response.text();
        } else {
            content = input;
        }

        const lines = content.split("\n").map(line => line.trim());
        let currentUserAgentIsWildcard = false;
        let isBlockingPath = false;
        let matchedDirective: string | undefined = undefined;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line === "" || line.startsWith("#")) {
                continue;
            }
            if (/^User-agent:\s*\*/i.test(line)) {
                currentUserAgentIsWildcard = true;
                continue;
            } else if (/^User-agent:/i.test(line)) {
                currentUserAgentIsWildcard = false;
                continue;
            }
            if (currentUserAgentIsWildcard && /^Disallow:/i.test(line)) {
                const parts = line.split(":");
                if (parts.length > 1) {
                    const directive = parts[1].trim();
                    if (directive === path) {
                        isBlockingPath = true;
                        matchedDirective = directive;
                        break;
                    }
                }
            }
        }

        return {
            isBlockingPath,
            matchedDirective
        };
    } catch (error) {
        return {
            isBlockingPath: false,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}

/**
 * Checks if the robots.txt file mentions a sitemap.xml by detecting lines starting with "Sitemap:".
 * This function retrieves the content from a URL if needed, and then searches for any Sitemap directives.
 * 
 * @param input - The robots.txt content or a URL pointing to the robots.txt file
 * @returns Promise<RobotsSitemapMentionResult> - The result including whether the sitemap is mentioned and the found sitemap URLs
 */
export async function checkRobotsMentionsSitemap(input: string): Promise<RobotsSitemapMentionResult> {
    try {
        let content: string;
        
        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return {
                    mentionsSitemap: false,
                    sitemaps: [],
                    error: "HTTP Error: " + response.status + " " + response.statusText
                };
            }
            content = await response.text();
        } else {
            content = input;
        }
        
        const lines = content.split("\n").map(line => line.trim());
        const sitemapRegex = /^Sitemap:\s*(.+)$/i;
        const sitemaps: string[] = [];

        for (const line of lines) {
            const match = sitemapRegex.exec(line);
            if (match && match[1]) {
                sitemaps.push(match[1].trim());
            }
        }

        return {
            mentionsSitemap: sitemaps.length > 0,
            sitemaps: sitemaps
        };
    } catch (error) {
        return {
            mentionsSitemap: false,
            sitemaps: [],
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}

/**
 * Checks if the robots.txt file exists on a given domain.
 * The function performs an HTTP request to the robots.txt file of the domain and verifies if the response
 * status is 200, indicating that the file exists.
 * 
 * @param input - A URL or domain (e.g., "example.com" or "https://example.com") to be checked
 * @returns Promise<RobotsTxtExistsResult> - The result including whether the robots.txt file exists
 */
export async function checkRobotsTxtExists(input: string): Promise<RobotsTxtExistsResult> {
    try {
        let url: string;
        if (isURL(input)) {
            if (input.toLowerCase().endsWith("/robots.txt")) {
                url = input;
            } else {
                url = "https://" + cleanDomainName(input) + "/robots.txt";
            }
        } else {
            url = "https://" + cleanDomainName(input) + "/robots.txt";
        }
        const response = await fetch(url);
        return { exists: response.ok && response.status === 200 };
    } catch (error) {
        return { exists: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}
