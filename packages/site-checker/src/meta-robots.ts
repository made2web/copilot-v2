import { cleanDomainName } from "./utils";

interface MetaRobotsCheckResult {
  hasMetaRobots: boolean;
  error?: string;
}

export async function checkMetaRobots(domain: string): Promise<MetaRobotsCheckResult> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const response = await fetch(`https://${cleanDomain}`);

    if (!response.ok) {
      return {
        hasMetaRobots: false,
        error: `Failed to fetch page: ${response.status}`
      };
    }

    const html = await response.text();
    const hasMeta = /<meta\s+name=["']?robots["']?/i.test(html);

    return {
      hasMetaRobots: hasMeta
    };
  } catch (error) {
    return {
      hasMetaRobots: false,
      error: error instanceof Error ? error.message : "Unknown error checking meta robots"
    };
  }
}

export async function isUniqueMetaRobots(domain: string): Promise<boolean> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const response = await fetch(`https://${cleanDomain}`);

    if (!response.ok) {
      return false;
    }

    const html = await response.text();
    const regex = /<meta\s+name=["']?robots["']?[^>]*>/gi;
    const matches = html.match(regex);
    return matches !== null && matches.length === 1;
  } catch (error) {
    return false;
  }
}

export async function isPageIndexed(domain: string): Promise<boolean> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const response = await fetch(`https://${cleanDomain}`);

    if (!response.ok) {
      return false;
    }

    const html = await response.text();
    const match = html.match(/<meta\s+name=["']?robots["']?\s+content=["']index,\s*follow["']?/i);
    return match !== null;
  } catch (error) {
    return false;
  }
}

export async function isPageFollow(domain: string): Promise<boolean> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const response = await fetch(`https://${cleanDomain}`);

    if (!response.ok) {
      return false;
    }

    const html = await response.text();
    const metaMatch = html.match(/<meta\s+name=["']?robots["']?\s+content=["']([^"']*)["']/i);
    
    if (!metaMatch) return false;
    
    const directives = metaMatch[1].toLowerCase().split(',').map(d => d.trim());
    return directives.includes('follow');
  } catch (error) {
    return false;
  }
}

export async function isPageNoindex(domain: string): Promise<boolean> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const response = await fetch(`https://${cleanDomain}`);

    if (!response.ok) {
      return false;
    }

    const html = await response.text();
    const match = html.match(/<meta\s+name=["']?robots["']?\s+content=["']?[^"'>]*\bnoindex\b[^"'>]*["']?/i);
    return match !== null;
  } catch (error) {
    return false;
  }
}