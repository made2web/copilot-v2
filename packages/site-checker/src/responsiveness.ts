import { cleanDomainName } from "./utils";

export interface MetaViewportCheckResult {
  hasMetaViewport: boolean;
  error?: string;
}

export interface AmpHtmlCheckResult {
  hasAmpHtmlLink: boolean;
  error?: string;
}

export interface CanonicalCheckResult {
  hasCorrectCanonical: boolean;
  error?: string;
}

/**
 * Checks if the site has a meta viewport tag in its source code
 * @param domain - The domain to check (e.g., "example.com")
 * @returns Promise<MetaViewportCheckResult> - The result of the check
 */
export async function checkMetaViewport(domain: string): Promise<MetaViewportCheckResult> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const response = await fetch(`https://${cleanDomain}`, { method: 'GET' });
    if (!response.ok) {
      return { hasMetaViewport: false, error: `Failed to fetch homepage: ${response.status}` };
    }
    const html = await response.text();
    const hasViewport = /<meta\s+name=["']viewport["']\s+content=["'].*["']\s*\/?>/i.test(html);
    return { hasMetaViewport: hasViewport };
  } catch (error) {
    console.error("Error checking meta viewport:", error);
    return { hasMetaViewport: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Checks if the homepage contains a valid AMP HTML link pointing to /amp URL
 * @param domain - The domain to check (e.g., "example.com")
 * @returns Promise<AmpHtmlCheckResult> - The result of the check
 */
export async function checkAmpHtmlLink(domain: string): Promise<AmpHtmlCheckResult> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const response = await fetch(`https://${cleanDomain}`, { method: 'GET' });
    if (!response.ok) {
      return { hasAmpHtmlLink: false, error: `Failed to fetch homepage: ${response.status}` };
    }
    const html = await response.text();
    const ampHtmlRegex = /<link\s+rel=["']amphtml["']\s+href=["'][^"']*\/amp["']\s*\/?>/i;
    const hasAmpHtml = ampHtmlRegex.test(html);
    return { hasAmpHtmlLink: hasAmpHtml };
  } catch (error) {
    console.error("Error checking AMP HTML link:", error);
    return { hasAmpHtmlLink: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Checks if AMP pages have canonical pointing to non-AMP URL
 * @param domain - The domain to check (e.g., "example.com")
 * @returns Promise<CanonicalCheckResult> - The result of the check
 */
export async function checkCanonicalForAmpPages(domain: string): Promise<CanonicalCheckResult> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const ampUrl = `https://${cleanDomain}/amp`;
    const response = await fetch(ampUrl, { method: 'GET' });
    if (!response.ok) {
      return { hasCorrectCanonical: false, error: `Failed to fetch AMP page: ${response.status}` };
    }
    const html = await response.text();
    const canonicalRegex = /<link\s+rel=["']canonical["']\s+href=["']([^"']*)["']\s*\/?>/i;
    const match = html.match(canonicalRegex);
    if (!match) {
      return { hasCorrectCanonical: false };
    }
    const canonicalHref = match[1];
    const expectedCanonical = `https://${cleanDomain}/`;
    return { hasCorrectCanonical: canonicalHref === expectedCanonical };
  } catch (error) {
    console.error("Error checking canonical for AMP page:", error);
    return { hasCorrectCanonical: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}