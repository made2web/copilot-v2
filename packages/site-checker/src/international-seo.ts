import { cleanDomainName } from "./utils.js";

interface LanguageUrlCheckResult {
  hasUniqueUrls: boolean;
  error?: string;
}

interface XDefaultCheckResult {
  hasXDefault: boolean;
  error?: string;
}

interface HreflangLanguagesCheckResult {
  hasHreflangForOtherLanguages: boolean;
  error?: string;
}

export async function checkUniqueUrlsPerLanguage(domain: string): Promise<LanguageUrlCheckResult> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const response = await fetch(`https://${cleanDomain}/`);
    
    if (!response.ok) {
      return {
        hasUniqueUrls: false,
        error: `Failed to fetch page: ${response.status}`
      };
    }

    const html = await response.text();
    const hreflangRegex = /<link[^>]+hreflang=["']([a-z-]+)["'][^>]+href=["']([^"']+)["']/gi;
    const langMap = new Map<string, string>();
    let matches;

    while ((matches = hreflangRegex.exec(html)) !== null) {
      const lang = matches[1].toLowerCase();
      const url = matches[2];

      if (langMap.has(lang)) {
        return {
          hasUniqueUrls: false,
          error: `Multiple URLs found for language: ${lang}`
        };
      }
      langMap.set(lang, url);
    }

    return {
      hasUniqueUrls: langMap.size > 0,
      ...(langMap.size === 0 && { error: 'No hreflang tags found' })
    };
  } catch (error) {
    return {
      hasUniqueUrls: false,
      error: error instanceof Error ? error.message : 'Unknown error checking language URLs'
    };
  }
}

export async function checkXDefaultHreflang(domain: string): Promise<XDefaultCheckResult> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const response = await fetch(`https://${cleanDomain}/`);

    if (!response.ok) {
      return {
        hasXDefault: false,
        error: `Failed to fetch page: ${response.status}`
      };
    }

    const html = await response.text();
    const hreflangRegex = /<link[^>]+hreflang=["']([^"']+)["'][^>]+/gi;
    let hasXDefault = false;

    let matches;
    while ((matches = hreflangRegex.exec(html)) !== null) {
      const lang = matches[1].toLowerCase();
      if (lang === 'x-default') {
        hasXDefault = true;
        break;
      }
    }

    return {
      hasXDefault,
      ...(!hasXDefault && { error: 'x-default hreflang not found' })
    };
  } catch (error) {
    return {
      hasXDefault: false,
      error: error instanceof Error ? error.message : 'Unknown error checking x-default hreflang'
    };
  }
}

export async function checkHreflangForOtherLanguages(domain: string): Promise<HreflangLanguagesCheckResult> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const response = await fetch(`https://${cleanDomain}/`);
    
    if (!response.ok) {
      return {
        hasHreflangForOtherLanguages: false,
        error: `Failed to fetch page: ${response.status}`
      };
    }

    const html = await response.text();
    const hreflangRegex = /<link[^>]+hreflang=["']([a-z-]+)["'][^>]+href=["']([^"']+)["']/gi;
    const languages = new Set<string>();
    let matches;

    while ((matches = hreflangRegex.exec(html)) !== null) {
      const lang = matches[1].toLowerCase();
      if (lang !== 'x-default') {
        languages.add(lang);
      }
    }

    return {
      hasHreflangForOtherLanguages: languages.size > 1,
      ...(languages.size <= 1 && { error: 'Insufficient hreflang tags for other languages' })
    };
  } catch (error) {
    return {
      hasHreflangForOtherLanguages: false,
      error: error instanceof Error ? error.message : 'Unknown error checking hreflang for other languages'
    };
  }
}