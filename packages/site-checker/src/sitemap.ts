import { cleanDomainName } from "./utils.js";
import { parseStringPromise } from "xml2js";

interface SitemapCheckResult {
  exists: boolean;
  sitemapUrl?: string;
  error?: string;
}

interface SitemapLinksCheckResult {
  allLinksHttps: boolean;
  nonHttpsLinks?: string[];
  error?: string;
}

interface SitemapUrlLimitCheckResult {
  withinLimit: boolean;
  urlCount: number;
  error?: string;
}

interface SitemapNonIndexableUrlsCheckResult {
  hasNonIndexableUrls: boolean;
  nonIndexableUrls?: string[];
  error?: string;
}

export async function checkSitemapExists(domain: string): Promise<SitemapCheckResult> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const sitemapUrl = `https://${cleanDomain}/sitemap.xml`;

    const response = await fetch(sitemapUrl, { method: 'HEAD' });

    return {
      exists: response.ok,
      sitemapUrl: response.ok ? sitemapUrl : undefined,
    };
  } catch (error) {
    console.error("Erro ao verificar sitemap.xml:", error);
    return {
      exists: false,
      error: error instanceof Error ? error.message : "Erro desconhecido ao verificar sitemap.xml",
    };
  }
}

export async function checkSitemapLinksAreHttps(domain: string): Promise<SitemapLinksCheckResult> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const sitemapUrl = `https://${cleanDomain}/sitemap.xml`;

    const response = await fetch(sitemapUrl);
    if (!response.ok) {
      return { allLinksHttps: false, error: `Failed to fetch sitemap.xml: ${response.status}` };
    }

    const xmlText = await response.text();
    const parsed = await parseStringPromise(xmlText);
    const urls: string[] = parsed.urlset.url.map((u: any) => u.loc[0]);

    const nonHttpsLinks = urls.filter(url => !url.startsWith('https://'));

    return {
      allLinksHttps: nonHttpsLinks.length === 0,
      nonHttpsLinks: nonHttpsLinks.length > 0 ? nonHttpsLinks : undefined,
    };
  } catch (error) {
    console.error("Error checking sitemap links:", error);
    return {
      allLinksHttps: false,
      error: error instanceof Error ? error.message : "Unknown error checking sitemap links",
    };
  }
}

export async function checkSitemapUrlLimit(domain: string, maxUrls: number = 50000): Promise<SitemapUrlLimitCheckResult> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const sitemapUrl = `https://${cleanDomain}/sitemap.xml`;

    const response = await fetch(sitemapUrl);
    if (!response.ok) {
      return { withinLimit: false, urlCount: 0, error: `Failed to fetch sitemap.xml: ${response.status}` };
    }

    const xmlText = await response.text();
    const parsed = await parseStringPromise(xmlText);
    const urls: string[] = parsed.urlset.url.map((u: any) => u.loc[0]);

    const urlCount = urls.length;
    const withinLimit = urlCount <= maxUrls;

    return {
      withinLimit,
      urlCount,
    };
  } catch (error) {
    return {
      withinLimit: false,
      urlCount: 0,
      error: error instanceof Error ? error.message : "Unknown error checking sitemap URL count",
    };
  }
}

export async function checkSitemapHasNonIndexableUrls(domain: string): Promise<SitemapNonIndexableUrlsCheckResult> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const sitemapUrl = `https://${cleanDomain}/sitemap.xml`;

    const response = await fetch(sitemapUrl);
    if (!response.ok) {
      return { hasNonIndexableUrls: false, error: `Failed to fetch sitemap.xml: ${response.status}` };
    }

    const xmlText = await response.text();
    const parsed = await parseStringPromise(xmlText);
    const urls: string[] = parsed.urlset.url.map((u: any) => u.loc[0]);

    const nonIndexableUrls: string[] = [];
    for (const url of urls) {
      const pageResponse = await fetch(url, { method: 'GET' });
      if (!pageResponse.ok) {
        continue;
      }
      const pageText = await pageResponse.text();
      if (pageText.includes('<meta name="robots" content="noindex"') || pageText.includes("<meta name='robots' content='noindex'")) {
        nonIndexableUrls.push(url);
      }
    }

    return {
      hasNonIndexableUrls: nonIndexableUrls.length > 0,
      nonIndexableUrls: nonIndexableUrls.length > 0 ? nonIndexableUrls : undefined,
    };
  } catch (error) {
    console.error("Error checking sitemap for non-indexable URLs:", error);
    return {
      hasNonIndexableUrls: false,
      error: error instanceof Error ? error.message : "Unknown error checking sitemap for non-indexable URLs",
    };
  }
}