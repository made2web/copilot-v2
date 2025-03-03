import { cleanDomainName } from "./utils.js";

interface WWWCheckResult {
  worksWithWWW: boolean;
  worksWithoutWWW: boolean;
  error?: string;
}

interface ProtocolCheckResult {
  httpWorks: boolean;
  httpsWorks: boolean;
  error?: string;
}

/**
 * Checks if the site works with and without WWW
 * @param domain - The domain to check (e.g., "example.com")
 * @returns Promise<WWWCheckResult> - The result of the checks
 */
export async function checkSiteWorksWithAndWithoutWWW(domain: string): Promise<WWWCheckResult> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const urls = [`https://www.${cleanDomain}/`, `https://${cleanDomain}/`];
    const results = await Promise.all(urls.map(async (url) => {
      const response = await fetch(url);
      return response.ok;
    }));
    return {
      worksWithWWW: results[0],
      worksWithoutWWW: results[1],
    };
  } catch (error) {
    return {
      worksWithWWW: false,
      worksWithoutWWW: false,
      error: error instanceof Error ? error.message : "Unknown error while checking redirects",
    };
  }
}

/**
 * Checks if the site works with HTTP and HTTPS protocols
 * @param domain - The domain to check (e.g., "example.com")
 * @returns Promise<ProtocolCheckResult> - The result of the checks
 */
export async function checkSiteWorksWithHTTPAndHTTPS(domain: string): Promise<ProtocolCheckResult> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const urls = [`http://${cleanDomain}/`, `https://${cleanDomain}/`];
    
    const results = await Promise.all(urls.map(async (url) => {
      const response = await fetch(url);
      return response.ok;
    }));

    return {
      httpWorks: results[0],
      httpsWorks: results[1]
    };
  } catch (error) {
    return {
      httpWorks: false,
      httpsWorks: false,
      error: error instanceof Error ? error.message : "Unknown error while checking protocols"
    };
  }
}