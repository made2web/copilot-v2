import { cleanDomainName } from "./utils.js";

interface AuthorMentionResult {
  isAuthorMentioned: boolean;
  error?: string;
}

interface InternalLinksResult {
  hasMinimumInternalLinks: boolean;
  error?: string;
}

export async function checkAuthorMention(domain: string): Promise<AuthorMentionResult> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const postsUrl = `https://${cleanDomain}/posts`;
    const response = await fetch(postsUrl);
    if (!response.ok) {
      return {
        isAuthorMentioned: false,
        error: `Failed to fetch posts: ${response.status}`,
      };
    }
    const html = await response.text();
    const hasRelAuthor = /rel=["']author["']/i.test(html);
    return {
      isAuthorMentioned: hasRelAuthor,
    };
  } catch (error) {
    console.error("Error checking author mention:", error);
    return {
      isAuthorMentioned: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function checkInternalLinks(domain: string): Promise<InternalLinksResult> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const url = `https://${cleanDomain}`;
    const response = await fetch(url);
    if (!response.ok) {
      return {
        hasMinimumInternalLinks: false,
        error: `Failed to fetch page: ${response.status}`,
      };
    }
    const html = await response.text();
    const internalLinks = html.match(new RegExp(`href=["']https?://${cleanDomain}[^"']*["']`, 'g')) || [];
    return {
      hasMinimumInternalLinks: internalLinks.length >= 3,
    };
  } catch (error) {
    console.error("Error checking internal links:", error);
    return {
      hasMinimumInternalLinks: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}