import { cleanDomainName } from "./utils.js";

export interface TitleTagCheckResult {
  hasMultipleTitles: boolean;
  titleCount?: number;
  error?: string;
}

export interface MissingOrEmptyTitleCheckResult {
  hasMissingOrEmptyTitles: boolean;
  missingTitlesCount?: number;
  emptyTitlesCount?: number;
  error?: string;
}

export interface ShortTitleCheckResult {
  hasShortTitles: boolean;
  shortTitlesCount?: number;
  error?: string;
}

export interface LongTitleCheckResult {
  hasLongTitles: boolean;
  longTitlesCount?: number;
  error?: string;
}

export async function checkMultipleTitleTags(domain: string): Promise<TitleTagCheckResult> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const url = `https://${cleanDomain}`;
    const response = await fetch(url);
    if (!response.ok) {
      return {
        hasMultipleTitles: false,
        error: `Failed to fetch the page: ${response.status}`,
      };
    }
    const html = await response.text();
    const titleTags = html.match(/<title>.*?<\/title>/gi);
    const titleCount = titleTags ? titleTags.length : 0;
    return {
      hasMultipleTitles: titleCount > 1,
      titleCount,
    };
  } catch (error) {
    console.error("Error checking multiple title tags:", error);
    return {
      hasMultipleTitles: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function checkMissingOrEmptyTitleTags(domain: string): Promise<MissingOrEmptyTitleCheckResult> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const url = `https://${cleanDomain}`;
    const response = await fetch(url);
    if (!response.ok) {
      return {
        hasMissingOrEmptyTitles: false,
        error: `Failed to fetch the page: ${response.status}`,
      };
    }
    const html = await response.text();
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    if (!titleMatch) {
      return {
        hasMissingOrEmptyTitles: true,
        missingTitlesCount: 1,
      };
    }
    const titleContent = titleMatch[1].trim();
    if (titleContent === "") {
      return {
        hasMissingOrEmptyTitles: true,
        emptyTitlesCount: 1,
      };
    }
    return {
      hasMissingOrEmptyTitles: false,
    };
  } catch (error) {
    console.error("Error checking missing or empty title tags:", error);
    return {
      hasMissingOrEmptyTitles: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function checkShortTitleTags(domain: string): Promise<ShortTitleCheckResult> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const url = `https://${cleanDomain}`;
    const response = await fetch(url);
    if (!response.ok) {
      return {
        hasShortTitles: false,
        error: `Failed to fetch the page: ${response.status}`,
      };
    }
    const html = await response.text();
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    if (!titleMatch) {
      return {
        hasShortTitles: false,
        error: "No title tag found",
      };
    }
    const titleContent = titleMatch[1].trim();
    return {
      hasShortTitles: titleContent.length < 30,
      shortTitlesCount: titleContent.length < 30 ? 1 : 0,
    };
  } catch (error) {
    console.error("Error checking short title tags:", error);
    return {
      hasShortTitles: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function checkLongTitleTags(domain: string): Promise<LongTitleCheckResult> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const url = `https://${cleanDomain}`;
    const response = await fetch(url);
    if (!response.ok) {
      return {
        hasLongTitles: false,
        error: `Failed to fetch the page: ${response.status}`,
      };
    }
    const html = await response.text();
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    if (!titleMatch) {
      return {
        hasLongTitles: false,
        error: "No title tag found",
      };
    }
    const titleContent = titleMatch[1].trim();
    return {
      hasLongTitles: titleContent.length > 60,
      longTitlesCount: titleContent.length > 60 ? 1 : 0,
    };
  } catch (error) {
    console.error("Error checking long title tags:", error);
    return {
      hasLongTitles: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}