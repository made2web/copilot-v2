import { cleanDomainName } from "./utils.js";

interface LanguageDirectiveCheckResult {
  hasLanguageDirective: boolean;
  language: string | null;
  error?: string;
}

export async function checkLanguageDirective(domain: string): Promise<LanguageDirectiveCheckResult> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const response = await fetch(`https://${cleanDomain}/`);
    if (!response.ok) {
      return {
        hasLanguageDirective: false,
        language: null,
        error: `Failed to fetch page: ${response.status}`,
      };
    }
    const html = await response.text();
    const langMatch = html.match(/<html[^>]*\slang=["']([^"']+)["']/i);
    if (langMatch && langMatch[1]) {
      return {
        hasLanguageDirective: true,
        language: langMatch[1],
      };
    } else {
      return {
        hasLanguageDirective: false,
        language: null,
      };
    }
  } catch (error) {
    return {
      hasLanguageDirective: false,
      language: null,
      error: error instanceof Error ? error.message : "Unknown error while checking language directive",
    };
  }
}