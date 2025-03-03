import { cleanDomainName } from "./utils.js";

interface CanonicalCheckResult {
  hasCanonical: boolean;
  error?: string;
}

export async function checkPagesHaveCanonicalLink(domain: string): Promise<CanonicalCheckResult> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const response = await fetch(`https://${cleanDomain}/`);
    if (!response.ok) {
      return {
        hasCanonical: false,
        error: `Failed to fetch page: ${response.status}`,
      };
    }
    const html = await response.text();
    const hasCanonical = /<link\s+rel=["']canonical["'][^>]*>/i.test(html);
    return { hasCanonical };
  } catch (error) {
    return {
      hasCanonical: false,
      error:
        error instanceof Error ? error.message : "Unknown error while checking canonical link",
    };
  }
}

export async function checkCanonicalPointsToSelf(domain: string): Promise<CanonicalCheckResult> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const response = await fetch(`https://${cleanDomain}/`);
    if (!response.ok) {
      return {
        hasCanonical: false,
        error: `Failed to fetch page: ${response.status}`,
      };
    }
    const html = await response.text();
    const match = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
    if (match && match[1]) {
      const canonicalUrl = match[1];
      const expectedUrl = `https://${cleanDomain}/`;
      const isSelf = canonicalUrl === expectedUrl;
      return { hasCanonical: isSelf };
    }
    return { hasCanonical: false };
  } catch (error) {
    return {
      hasCanonical: false,
      error:
        error instanceof Error ? error.message : "Unknown error while checking canonical link",
    };
  }
}

export async function checkCanonicalHasParameters(domain: string, parameters: string[]): Promise<CanonicalCheckResult> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const response = await fetch(`https://${cleanDomain}/`);
    if (!response.ok) {
      return {
        hasCanonical: false,
        error: `Failed to fetch page: ${response.status}`,
      };
    }
    const html = await response.text();
    const match = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
    if (match && match[1]) {
      const canonicalUrl = new URL(match[1]);
      const hasAllParameters = parameters.every(param => canonicalUrl.searchParams.has(param));
      return { hasCanonical: hasAllParameters };
    }
    return { hasCanonical: false };
  } catch (error) {
    return {
      hasCanonical: false,
      error:
        error instanceof Error ? error.message : "Unknown error while checking canonical link parameters",
    };
  }
}

export async function checkPaginationCanonicalPointsToSelf(domain: string, path: string): Promise<CanonicalCheckResult> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const url = `https://${cleanDomain}${path}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      return {
        hasCanonical: false,
        error: `Failed to fetch paginated page: ${response.status}`
      };
    }

    const html = await response.text();
    const match = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
    
    if (match && match[1]) {
      const canonicalUrl = match[1];
      const isSelf = canonicalUrl === url;
      return { hasCanonical: isSelf };
    }
    
    return { hasCanonical: false };
  } catch (error) {
    return {
      hasCanonical: false,
      error: error instanceof Error ? error.message : "Unknown error while checking pagination canonical"
    };
  }
}

export async function checkAMPCanonicalPointsToNonAMP(domain: string, ampPath: string): Promise<CanonicalCheckResult> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const ampUrl = `https://${cleanDomain}${ampPath}`;
    const response = await fetch(ampUrl);
    
    if (!response.ok) {
      return {
        hasCanonical: false,
        error: `Failed to fetch AMP page: ${response.status}`
      };
    }

    const html = await response.text();
    const match = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
    
    if (match && match[1]) {
      const canonicalUrl = new URL(match[1]);
      const expectedNonAMPUrl = new URL(ampUrl);
      expectedNonAMPUrl.pathname = expectedNonAMPUrl.pathname.replace(/\/amp(\/|$)/, '/');
      
      const isCorrect = canonicalUrl.href === expectedNonAMPUrl.href;
      return { hasCanonical: isCorrect };
    }
    
    return { hasCanonical: false };
  } catch (error) {
    return {
      hasCanonical: false,
      error: error instanceof Error ? error.message : "Unknown error while checking AMP canonical"
    };
  }
}