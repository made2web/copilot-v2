import { cleanDomainName } from "./utils";

interface MetaDescriptionCheckResult {
  hasMultipleMetaDescriptions: boolean;
  count: number;
  error?: string;
}

export async function checkMultipleMetaDescriptions(domain: string): Promise<MetaDescriptionCheckResult> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const response = await fetch(`https://${cleanDomain}`, { method: 'GET' });
    if (!response.ok) {
      return {
        hasMultipleMetaDescriptions: false,
        count: 0,
        error: `Failed to fetch the page: ${response.status}`,
      };
    }
    const html = await response.text();
    const metaDescriptionMatches = html.match(/<meta\s+name=["']description["']\s+content=["'][^"']+["']\s*\/?/gi);
    const count = metaDescriptionMatches ? metaDescriptionMatches.length : 0;
    return {
      hasMultipleMetaDescriptions: count > 1,
      count,
    };
  } catch (error) {
    console.error("Error checking meta descriptions:", error);
    return {
      hasMultipleMetaDescriptions: false,
      count: 0,
      error: error instanceof Error ? error.message : "Unknown error checking meta descriptions",
    };
  }
}

interface EmptyMetaDescriptionCheckResult {
  hasEmptyMetaDescriptions: boolean;
  count: number;
  error?: string;
}

export async function checkEmptyMetaDescriptions(domain: string): Promise<EmptyMetaDescriptionCheckResult> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const response = await fetch(`https://${cleanDomain}`, { method: 'GET' });
    if (!response.ok) {
      return {
        hasEmptyMetaDescriptions: false,
        count: 0,
        error: `Failed to fetch the page: ${response.status}`,
      };
    }
    const html = await response.text();
    const metaDescriptionMatches = html.match(/<meta\s+name=["']description["']\s+content=["']\s*["']\s*\/?/gi);
    const count = metaDescriptionMatches ? metaDescriptionMatches.length : 0;
    return {
      hasEmptyMetaDescriptions: count > 0,
      count,
    };
  } catch (error) {
    console.error("Error checking meta descriptions:", error);
    return {
      hasEmptyMetaDescriptions: false,
      count: 0,
      error: error instanceof Error ? error.message : "Unknown error checking meta descriptions",
    };
  }
}

interface ShortMetaDescriptionCheckResult {
  hasShortMetaDescriptions: boolean;
  count: number;
  error?: string;
}

export async function checkShortMetaDescriptions(domain: string): Promise<ShortMetaDescriptionCheckResult> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const response = await fetch(`https://${cleanDomain}`, { method: 'GET' });
    if (!response.ok) {
      return {
        hasShortMetaDescriptions: false,
        count: 0,
        error: `Failed to fetch the page: ${response.status}`,
      };
    }
    const html = await response.text();
    const shortMetaDescriptions = html.match(/<meta\s+name=["']description["']\s+content=["'].{0,69}["']\s*\/?/gi);
    const count = shortMetaDescriptions ? shortMetaDescriptions.length : 0;
    return {
      hasShortMetaDescriptions: count > 0,
      count,
    };
  } catch (error) {
    console.error("Error checking short meta descriptions:", error);
    return {
      hasShortMetaDescriptions: false,
      count: 0,
      error: error instanceof Error ? error.message : "Unknown error checking meta descriptions",
    };
  }
}

interface LongMetaDescriptionCheckResult {
  hasLongMetaDescriptions: boolean;
  count: number;
  error?: string;
}

export async function checkLongMetaDescriptions(domain: string): Promise<LongMetaDescriptionCheckResult> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const response = await fetch(`https://${cleanDomain}`, { method: 'GET' });
    if (!response.ok) {
      return {
        hasLongMetaDescriptions: false,
        count: 0,
        error: `Failed to fetch the page: ${response.status}`,
      };
    }
    const html = await response.text();
    const longMetaDescriptions = html.match(/<meta\s+name=["']description["']\s+content=["'].{156,}["']\s*\/?/gi);
    const count = longMetaDescriptions ? longMetaDescriptions.length : 0;
    return {
      hasLongMetaDescriptions: count > 0,
      count,
    };
  } catch (error) {
    console.error("Error checking long meta descriptions:", error);
    return {
      hasLongMetaDescriptions: false,
      count: 0,
      error: error instanceof Error ? error.message : "Unknown error checking long meta descriptions",
    };
  }
}