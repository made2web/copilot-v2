import { cleanDomainName } from "./utils.js";

interface ContentWordCountCheckResult {
  hasLessThan200Words: boolean;
  wordCount: number;
  error?: string;
}

interface ParagraphLineCountCheckResult {
  paragraphsExceedingLimit: number;
  totalParagraphs: number;
  error?: string;
}

/**
 * Verifies if the homepage of the domain has less than 200 words of content
 * @param domain - The domain to be checked (e.g., "example.com")
 * @returns Promise<ContentWordCountCheckResult> - The result of the check
 */
export async function checkPageContentWordCount(domain: string): Promise<ContentWordCountCheckResult> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const response = await fetch(`https://${cleanDomain}/`);
    if (!response.ok) {
      return {
        hasLessThan200Words: false,
        wordCount: 0,
        error: `Failed to fetch page: ${response.status}`,
      };
    }
    const html = await response.text();
    const textContent = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    const wordCount = textContent.split(" ").length;
    return {
      hasLessThan200Words: wordCount < 200,
      wordCount,
    };
  } catch (error) {
    return {
      hasLessThan200Words: false,
      wordCount: 0,
      error: error instanceof Error ? error.message : "Unknown error while checking content word count",
    };
  }
}

/**
 * Verifies if the homepage paragraphs are well divided, with a maximum of 3 lines per paragraph
 * @param domain - The domain to be checked (e.g., "example.com")
 * @returns Promise<ParagraphLineCountCheckResult> - The result of the check
 */
export async function checkParagraphLineCount(domain: string): Promise<ParagraphLineCountCheckResult> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const response = await fetch(`https://${cleanDomain}/`);
    if (!response.ok) {
      return {
        paragraphsExceedingLimit: 0,
        totalParagraphs: 0,
        error: `Failed to fetch page: ${response.status}`,
      };
    }
    const html = await response.text();
    const paragraphRegex = /<p[^>]*>(.*?)<\/p>/g;
    const paragraphs: string[] = [];
    let match;
    while ((match = paragraphRegex.exec(html)) !== null) {
      paragraphs.push(match[1].replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim());
    }
    const maxCharactersPerLine = 100; // Assumption for desktop
    let exceedingCount = 0;
    paragraphs.forEach(p => {
      const lines = Math.ceil(p.length / maxCharactersPerLine);
      if (lines > 3) {
        exceedingCount++;
      }
    });
    return {
      paragraphsExceedingLimit: exceedingCount,
      totalParagraphs: paragraphs.length,
    };
  } catch (error) {
    return {
      paragraphsExceedingLimit: 0,
      totalParagraphs: 0,
      error: error instanceof Error ? error.message : "Unknown error while checking paragraph line count",
    };
  }
}