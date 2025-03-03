import { cleanDomainName } from "./utils.js";

interface HSTSCheckResult {
  hasHSTS: boolean;
  error?: string;
}

export async function checkHSTS(domain: string): Promise<HSTSCheckResult> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const response = await fetch(`https://${cleanDomain}`, { method: 'HEAD' });
    
    const hstsHeader = response.headers.get('Strict-Transport-Security');
    return {
      hasHSTS: !!hstsHeader
    };
  } catch (error) {
    return {
      hasHSTS: false,
      error: error instanceof Error ? error.message : 'Unknown error checking HSTS'
    };
  }
}

interface HTTPLinksCheckResult {
  hasHTTPLinks: boolean;
  error?: string;
}

export async function checkInternalHTTPLinks(domain: string): Promise<HTTPLinksCheckResult> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const response = await fetch(`https://${cleanDomain}`);
    const html = await response.text();
    const regex = new RegExp(`href=["']http://(?:www\.)?${cleanDomain}[^"']*`, 'g');
    const matches = html.match(regex);
    return {
      hasHTTPLinks: matches !== null && matches.length > 0
    };
  } catch (error) {
    return {
      hasHTTPLinks: false,
      error: error instanceof Error ? error.message : 'Unknown error checking internal HTTP links'
    };
  }
}