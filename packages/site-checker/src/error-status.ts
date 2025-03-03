import { cleanDomainName } from "./utils";

export interface Error404CheckResult {
  exists: boolean;
  error?: string;
}

export interface MetaRobotsCheckResult {
  correct: boolean;
  error?: string;
}

export async function check404PageExists(domain: string): Promise<Error404CheckResult> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const response = await fetch(`https://${cleanDomain}/nonexistent-page-${Math.random().toString(36).substring(7)}`);
    return { exists: response.status === 404 };
  } catch (error) {
    return {
      exists: false,
      error: error instanceof Error ? error.message : "Unknown error while checking 404 page",
    };
  }
}

export async function check404PageMetaRobots(domain: string): Promise<MetaRobotsCheckResult> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const response = await fetch(`https://${cleanDomain}/nonexistent-page-${Math.random().toString(36).substring(7)}`);
    if (response.status !== 404) {
      return { correct: false, error: `Page did not return 404 status, returned ${response.status}` };
    }
    const html = await response.text();
    const metaRobotsMatch = /<meta\s+name=["']robots["']\s+content=["']noindex,\s*nofollow["']\s*\/?/i.test(html);
    return { correct: metaRobotsMatch };
  } catch (error) {
    return {
      correct: false,
      error: error instanceof Error ? error.message : "Unknown error while checking meta robots of 404 page",
    };
  }
}

export async function check404PageStatus(domain: string): Promise<Error404CheckResult> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const response = await fetch(`https://${cleanDomain}/404`);
    return { exists: response.status === 404 };
  } catch (error) {
    return {
      exists: false,
      error: error instanceof Error ? error.message : "Unknown error while checking 404 page status",
    };
  }
}