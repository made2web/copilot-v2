import { isURL } from "./utils.js";

export interface ContentUnder200CheckResult {
    hasLessThan200Words: boolean;
    wordCount: number;
    error?: string;
    return_key: boolean;
}

export interface ParagraphLineCheckResult {
    paragraphsValid: boolean;
    invalidParagraphs: number;
    totalParagraphs: number;
    return_key: boolean;
    error?: string;
}

/**
 * Checks if the given HTML content or URL has less than 200 words.
 * If input is a URL, it fetches the content first.
 * @param input - HTML content or a URL to check.
 * @returns Promise<ContentUnder200CheckResult> - The result of the check
 */
export async function checkContentUnder200Words(input: string): Promise<ContentUnder200CheckResult> {
    try {
        let content: string;
        
        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return {
                    hasLessThan200Words: false,
                    wordCount: 0,
                    error: "HTTP Error: " + response.status + " " + response.statusText,
                    return_key: false
                };
            }
            content = await response.text();
        } else {
            content = input;
        }

        const cleanedContent = content
            .replace(/<[^>]+>/g, ' ')
            .replace(/&#?[a-z0-9]+;/gi, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        const wordCount = cleanedContent === "" ? 0 : cleanedContent.split(/\s+/).filter(word => word.length > 0).length;
        
        return {
            hasLessThan200Words: wordCount < 200,
            wordCount,
            return_key: wordCount < 200
        };
    } catch (error) {
        return {
            hasLessThan200Words: false,
            wordCount: 0,
            error: error instanceof Error ? error.message : "Erro desconhecido",
            return_key: false
        };
    }
}

/**
 * Checks if the paragraphs in the given HTML content or URL are well divided with a maximum of 3 lines per paragraph.
 * A paragraph is considered to have multiple lines if it contains <br> tags. The line count is determined by counting the number
 * of <br> tags and adding one. If any paragraph exceeds 3 lines, the check fails.
 * @param input - HTML content or a URL to check.
 * @returns Promise<ParagraphLineCheckResult> - The result of the paragraph line check
 */
export async function checkParagraphsMax3Lines(input: string): Promise<ParagraphLineCheckResult> {
    try {
        let content: string;

        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return {
                    paragraphsValid: false,
                    invalidParagraphs: 0,
                    totalParagraphs: 0,
                    return_key: false,
                    error: "HTTP Error: " + response.status + " " + response.statusText
                };
            }
            content = await response.text();
        } else {
            content = input;
        }

        // Regex to match all paragraph tags and capture their inner HTML
        const paragraphRegex = /<p\b[^>]*>(.*?)<\/p>/gims;
        let match: RegExpExecArray | null;
        let totalParagraphs = 0;
        let invalidParagraphs = 0;

        while ((match = paragraphRegex.exec(content)) !== null) {
            totalParagraphs++;
            const paragraphContent = match[1];
            // Count <br> tags. Each <br> contributes to an additional line
            const brMatches = paragraphContent.match(/<br\s*\/?>/gims);
            const lineCount = (brMatches ? brMatches.length : 0) + 1;
            if (lineCount > 3) {
                invalidParagraphs++;
            }
        }

        return {
            paragraphsValid: invalidParagraphs === 0,
            invalidParagraphs,
            totalParagraphs,
            return_key: invalidParagraphs === 0
        };
    } catch (error) {
        return {
            paragraphsValid: false,
            invalidParagraphs: 0,
            totalParagraphs: 0,
            return_key: false,
            error: error instanceof Error ? error.message : "Erro desconhecido"
        };
    }
}
