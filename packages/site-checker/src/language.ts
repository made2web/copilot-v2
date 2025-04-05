import { isURL, cleanDomainName } from "./utils.js";

export interface ContentLanguageCheckResult {
  hasLanguageTag: boolean;
  languageDetected?: string;
  error?: string;
}

export interface LanguageDirectiveResult {
  correctDirective: boolean;
  declaredLanguage?: string;
  detectedLanguage?: string;
  error?: string;
}

/**
 * Checks if the provided HTML content (or content fetched from a URL) has a valid language declaration
 * by detecting the presence of a <html lang="..."> attribute.
 * @param input - The URL or HTML content to be checked
 * @returns Promise<ContentLanguageCheckResult> - Result of the language check
 */
export async function checkContentLanguage(input: string): Promise<ContentLanguageCheckResult> {
  try {
    let content: string;

    if (isURL(input)) {
      const response = await fetch(input);
      if (!response.ok) {
        return {
          hasLanguageTag: false,
          error: "HTTP Error: " + response.status + " " + response.statusText
        };
      }
      content = await response.text();
    } else {
      content = input;
    }

    const regex = /<html[^>]*lang\s*=\s*["']([^"']+)["']/i;
    const match = regex.exec(content);
    if (match && match[1]) {
      return { hasLanguageTag: true, languageDetected: match[1] };
    }
    return { hasLanguageTag: false };
  } catch (err) {
    return {
      hasLanguageTag: false,
      error: err instanceof Error ? err.message : "Unknown error"
    };
  }
}

/**
 * Checks if the language directive in the HTML content matches the language detected from the content.
 * The function first extracts the declared language from the <html lang="..."> attribute. It then strips the HTML
 * tags to obtain the plain text and performs a simple keyword-based analysis to detect the language of the content.
 * Currently, it supports English (en), Portuguese (pt) and French (fr) using a basic keyword frequency approach.
 * @param input - The URL or HTML content to be checked
 * @returns Promise<LanguageDirectiveResult> - The result containing whether the directive is correct or not
 */
export async function checkLanguageDirectiveConsistency(input: string): Promise<LanguageDirectiveResult> {
  try {
    let content: string;
    if (isURL(input)) {
      const response = await fetch(input);
      if (!response.ok) {
        return {
          correctDirective: false,
          error: "HTTP Error: " + response.status + " " + response.statusText
        };
      }
      content = await response.text();
    } else {
      content = input;
    }

    // Extract declared language from <html lang="...">
    const langRegex = /<html[^>]*\blang\s*=\s*["']([^"']+)["']/i;
    const langMatch = langRegex.exec(content);
    if (!langMatch || !langMatch[1]) {
      return { correctDirective: false, error: "No lang attribute found" };
    }
    const declaredLanguage = langMatch[1].toLowerCase();

    // Remove HTML tags to get plain text
    const plainText = content.replace(/<[^>]+>/g, ' ').toLowerCase();
    const words = plainText.split(/\W+/);

    // Simple keyword based counts
    const englishKeywords = ["the", "and", "of"];
    const portugueseKeywords = ["o", "a", "de"];
    const frenchKeywords = ["le", "la", "de"];

    let scoreEn = 0, scorePt = 0, scoreFr = 0;

    for (const word of words) {
      if (englishKeywords.includes(word)) scoreEn++;
      if (portugueseKeywords.includes(word)) scorePt++;
      if (frenchKeywords.includes(word)) scoreFr++;
    }

    // Determine detected language
    let detectedLanguage = 'en';
    if (scorePt >= scoreEn && scorePt >= scoreFr) {
      detectedLanguage = 'pt';
    } else if (scoreFr >= scoreEn && scoreFr >= scorePt) {
      detectedLanguage = 'fr';
    }

    const correctDirective = declaredLanguage === detectedLanguage;

    return {
      correctDirective,
      declaredLanguage,
      detectedLanguage
    };
  } catch (error) {
    return {
      correctDirective: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
