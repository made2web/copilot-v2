import { cleanDomainName, isURL } from "./utils.js";

export interface HTTPHTTPSCheckResult {
    httpAccessible: boolean;
    httpsAccessible: boolean;
    redirectedToHttps: boolean;
    error?: string;
}

export async function checkSiteProtocols(input: string): Promise<HTTPHTTPSCheckResult> {
    try {
        let domain: string = input;
        if (isURL(input)) {
            domain = cleanDomainName(input);
        }

        const httpUrl = "http://" + domain;
        const httpsUrl = "https://" + domain;

        let httpAccessible = false;
        let httpsAccessible = false;
        let redirectedToHttps = false;

        // Check HTTP using manual redirect mode to inspect potential redirection
        let httpResponse: Response | undefined;
        try {
            httpResponse = await fetch(httpUrl, { redirect: "manual" });
            // If we got any response, consider HTTP accessible
            if (httpResponse) {
                httpAccessible = true;
                const location = httpResponse.headers.get("location");
                if (httpResponse.status >= 300 && httpResponse.status < 400 && location && location.startsWith("https://")) {
                    redirectedToHttps = true;
                }
            }
        } catch (httpError) {
            // HTTP fetch failed
            httpAccessible = false;
        }

        // Check HTTPS normally
        let httpsResponse: Response | undefined;
        try {
            httpsResponse = await fetch(httpsUrl);
            if (httpsResponse && httpsResponse.ok) {
                httpsAccessible = true;
            }
        } catch (httpsError) {
            httpsAccessible = false;
        }

        return {
            httpAccessible,
            httpsAccessible,
            redirectedToHttps
        };
    } catch (error) {
        return {
            httpAccessible: false,
            httpsAccessible: false,
            redirectedToHttps: false,
            error: error instanceof Error ? error.message : "Erro desconhecido"
        };
    }
}

export interface WWWAvailabilityCheckResult {
    nonWwwAccessible: boolean;
    wwwAccessible: boolean;
    error?: string;
}

/**
 * Checks if a website is accessible both with and without the "www." prefix.
 * 
 * The function receives an input that can be a URL or a domain. Using `isURL` and `cleanDomainName`,
 * it extracts the base domain and tests the accessibility of both the non-www and www versions
 * using HTTPS. It returns the accessibility result for both versions.
 * 
 * @param input - URL or domain to be checked (e.g., "example.com" or "http://example.com")
 * @returns Promise<WWWAvailabilityCheckResult> - The result containing accessibility booleans for non-www and www
 */
export async function checkWWWAvailability(input: string): Promise<WWWAvailabilityCheckResult> {
    try {
        let domain: string = input;
        if (isURL(input)) {
            domain = cleanDomainName(input);
        }
        // Remove any existing "www." prefix to get the base domain
        const baseDomain = domain.replace(/^www\./, "");
        const nonWwwUrl = "https://" + baseDomain;
        const wwwUrl = "https://www." + baseDomain;

        let nonWwwAccessible = false;
        let wwwAccessible = false;

        try {
            const responseNonWww = await fetch(nonWwwUrl);
            nonWwwAccessible = responseNonWww.ok;
        } catch (err) {
            nonWwwAccessible = false;
        }

        try {
            const responseWww = await fetch(wwwUrl);
            wwwAccessible = responseWww.ok;
        } catch (err) {
            wwwAccessible = false;
        }

        return { nonWwwAccessible, wwwAccessible };
    } catch (error) {
        return {
            nonWwwAccessible: false,
            wwwAccessible: false,
            error: error instanceof Error ? error.message : "Erro desconhecido"
        };
    }
}

export interface URLs302CheckResult {
    urlsWith302: string[];
    error?: string;
}

/**
 * Receives a list of URLs or domains and checks each by performing an HTTP request to verify if the response
 * status is 302. If an input is not a valid URL, its domain is cleaned and prefixed with "https://". The function
 * returns an object containing a list of URLs that responded with status 302.
 * 
 * This function is useful for detecting permanent redirect scenarios that might affect site crawling and indexing.
 * 
 * @param inputs - Array of URLs or domains to be verified
 * @returns Promise<URLs302CheckResult> - The result containing the list of URLs with HTTP status 302
 */
export async function checkURLsFor302(inputs: string[]): Promise<URLs302CheckResult> {
    const urlsWith302: string[] = [];
    try {
        const requests = inputs.map(async (input) => {
            let url = input;
            if (!isURL(input)) {
                url = "https://" + cleanDomainName(input);
            }
            try {
                const response = await fetch(url, { redirect: "manual" });
                if (response.status === 302) {
                    urlsWith302.push(url);
                }
            } catch (error) {
                // If a fetch error occurs, ignore this URL
            }
        });
        await Promise.all(requests);
        return { urlsWith302 };
    } catch (error) {
        return {
            urlsWith302: [],
            error: error instanceof Error ? error.message : "Erro desconhecido"
        };
    }
}

// NEW FUNCTION
export interface JSRedirectCheckResult {
    redirectedURLs: string[];
    error?: string;
}

/**
 * Checks for common Javascript redirection patterns (such as window.location, location.replace, etc.) in the HTML content
 * of one or more URLs or raw HTML inputs. If the input is a URL, it fetches the HTML and then searches for the patterns;
 * if the input is raw HTML, it directly performs the check. It returns a list of URLs for which the patterns are detected.
 * 
 * @param input - A URL, raw HTML string, or an array of such strings to be checked
 * @returns Promise<JSRedirectCheckResult> - The result containing a list of URLs with detected JS redirection patterns
 */
export async function checkJavascriptRedirectPatterns(input: string | string[]): Promise<JSRedirectCheckResult> {
    const redirectedURLs: string[] = [];
    try {
        const inputs: string[] = Array.isArray(input) ? input : [input];
        const requests = inputs.map(async (item) => {
            let content = "";
            let url = "";
            if (isURL(item)) {
                try {
                    const response = await fetch(item);
                    if (!response.ok) return;
                    content = await response.text();
                    url = item;
                } catch (err) {
                    return;
                }
            } else {
                content = item;
            }
            const pattern = /window\.location|location\.replace|location\.href|document\.location/i;
            if (pattern.test(content)) {
                if (url) {
                    redirectedURLs.push(url);
                }
            }
        });
        await Promise.all(requests);
        return { redirectedURLs };
    } catch (error) {
        return {
            redirectedURLs,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}

// NEW FUNCTION
export interface Standard404RedirectCheckResult {
    standardRedirect: boolean;
    redirectURL?: string;
    error?: string;
}

/**
 * Checks if the website applies a standard redirection for 404 (not found) pages.
 * 
 * The function receives a domain name and tests a set of invalid URLs (e.g., non-existent pages) using manual
 * redirection. It verifies if all invalid URLs return a redirection to the same URL. A consistent redirection
 * pattern indicates that the site is using a standard approach for handling 404 errors.
 * 
 * @param domain - The domain name to be checked (e.g., "example.com")
 * @returns Promise<Standard404RedirectCheckResult> - The result with a flag indicating if a standard redirect is applied
 */
export async function check404StandardRedirect(domain: string): Promise<Standard404RedirectCheckResult> {
    try {
        const cleanDomain = cleanDomainName(domain);
        var testPaths = ["/nonexistentpage12345", "/thispagedoesnotexist"];
        var expectedRedirect = "";
        var requests = testPaths.map(function(p) {
            var url = "https://" + cleanDomain + p;
            return fetch(url, { redirect: "manual" }).then(function(response) {
                var loc = response.headers.get("location");
                if (response.status >= 300 && response.status < 400 && loc) {
                    return loc;
                } else {
                    return null;
                }
            }).catch(function(e) {
                return null;
            });
        });
        return Promise.all(requests).then(function(results) {
            var redirects = results.filter(function(item) { return item !== null; });
            if (redirects.length !== testPaths.length) {
                return { standardRedirect: false };
            }
            expectedRedirect = redirects[0];
            var consistent = redirects.every(function(r) { return r === expectedRedirect; });
            return { standardRedirect: consistent, redirectURL: consistent ? expectedRedirect : undefined };
        });
    } catch (error) {
        return { standardRedirect: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}
