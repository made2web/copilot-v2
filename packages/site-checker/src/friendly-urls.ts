import { cleanDomainName } from './utils.js';

export async function hasUppercaseUrls(domain: string): Promise<boolean> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const response = await fetch(`https://${cleanDomain}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${cleanDomain}: ${response.status}`);
    }
    const html = await response.text();
    const regex = /<a\s+(?:[^>]*?\s+)?href=("|')(.*?)\1/g;
    let match;
    while ((match = regex.exec(html)) !== null) {
      const url = match[2];
      if (/[A-Z]/.test(url)) {
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Error checking uppercase URLs:', error);
    return false;
  }
}

export async function hasNoUppercaseUrls(domain: string): Promise<boolean> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const response = await fetch(`https://${cleanDomain}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${cleanDomain}: ${response.status}`);
    }
    const html = await response.text();
    const regex = /<a\s+(?:[^>]*?\s+)?href=("|')(.*?)\1/g;
    let match;
    while ((match = regex.exec(html)) !== null) {
      const url = match[2];
      if (/[A-Z]/.test(url)) {
        return false;
      }
    }
    return true;
  } catch (error) {
    console.error('Error checking no uppercase URLs:', error);
    return false;
  }
}

export async function checkUrlsHaveUnderscores(domain: string): Promise<{ hasUnderscores: boolean; error?: string }> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const response = await fetch(`https://${cleanDomain}/`);
    if (!response.ok) {
      return { hasUnderscores: false, error: `Failed to fetch page: ${response.status}` };
    }
    const html = await response.text();
    const urlRegex = /href=["']([^"']+)["']/gi;
    let match;
    while ((match = urlRegex.exec(html)) !== null) {
      const url = match[1];
      if (url.includes('_')) {
        return { hasUnderscores: true };
      }
    }
    return { hasUnderscores: false };
  } catch (error) {
    return {
      hasUnderscores: false,
      error: error instanceof Error ? error.message : "Unknown error while checking URLs",
    };
  }
}

export async function hasSpecialCharsUrls(domain: string): Promise<boolean> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const response = await fetch(`https://${cleanDomain}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${cleanDomain}: ${response.status}`);
    }
    const html = await response.text();
    const regex = /<a\s+(?:[^>]*?\s+)?href=("|')(.*?)\1/g;
    let match;
    while ((match = regex.exec(html)) !== null) {
      const url = match[2];
      if (/[^a-zA-Z0-9-_/.:?]/.test(url)) {
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Error checking special characters in URLs:', error);
    return false;
  }
}

export async function hasNoSpecialCharsUrls(domain: string): Promise<boolean> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const response = await fetch(`https://${cleanDomain}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${cleanDomain}: ${response.status}`);
    }
    const html = await response.text();
    const regex = /<a\s+(?:[^>]*?\s+)?href=("|')(.*?)\1/g;
    let match;
    while ((match = regex.exec(html)) !== null) {
      const url = match[2];
      if (/[^a-zA-Z0-9-_/.:?]/.test(url)) {
        return false;
      }
    }
    return true;
  } catch (error) {
    console.error('Error checking no special characters in URLs:', error);
    return false;
  }
}

export async function checkCategoryUrlStructure(domain: string): Promise<boolean> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const response = await fetch(`https://${cleanDomain}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${cleanDomain}: ${response.status}`);
    }
    const html = await response.text();
    const regex = /<a\s+(?:[^>]*?\s+)?href=("|')(.*?)\1/g;
    let match;
    
    while ((match = regex.exec(html)) !== null) {
      const url = match[2];
      const urlObj = new URL(url, `https://${cleanDomain}`);
      const path = urlObj.pathname.toLowerCase();
      
      if (path.includes('category') && !path.startsWith('/category/')) {
        return false;
      }
    }
    return true;
  } catch (error) {
    console.error('Error checking category URL structure:', error);
    return false;
  }
}

export async function checkBlogPostUrlStructure(domain: string): Promise<boolean> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const response = await fetch(`https://${cleanDomain}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${cleanDomain}: ${response.status}`);
    }
    const html = await response.text();
    const regex = /<a\s+(?:[^>]*?\s+)?href=("|')(.*?)\1/g;
    let match;
    
    while ((match = regex.exec(html)) !== null) {
      const url = match[2];
      const urlObj = new URL(url, `https://${cleanDomain}`);
      const path = urlObj.pathname.toLowerCase();
      
      if (path.includes('blog') && !path.startsWith('/blog/')) {
        return false;
      }
    }
    return true;
  } catch (error) {
    console.error('Error checking blog post URL structure:', error);
    return false;
  }
}

export async function hasMoreThanTwoHierarchyLevelsUrls(domain: string): Promise<boolean> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const response = await fetch(`https://${cleanDomain}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${cleanDomain}: ${response.status}`);
    }
    const html = await response.text();
    const regex = /<a\s+(?:[^>]*?\s+)?href=("|')(.*?)\1/g;
    let match;
    while ((match = regex.exec(html)) !== null) {
      const url = match[2];
      const urlObj = new URL(url, `https://${cleanDomain}`);
      const pathSegments = urlObj.pathname.split('/').filter(segment => segment.length > 0);
      if (pathSegments.length > 2) {
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Error checking URL hierarchy levels:', error);
    return false;
  }
}

export async function hasDateInPostUrls(domain: string): Promise<boolean> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const response = await fetch(`https://${cleanDomain}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${cleanDomain}: ${response.status}`);
    }
    const html = await response.text();
    const regex = /<a\s+(?:[^>]*?\s+)?href=("|')(.*?)\1/g;
    let match;
    while ((match = regex.exec(html)) !== null) {
      const url = match[2];
      const urlObj = new URL(url, `https://${cleanDomain}`);
      const pathSegments = urlObj.pathname.split('/').filter(segment => segment.length > 0);
      if (pathSegments.length >= 3) {
        const [year, month, day] = pathSegments;
        if (/^\d{4}$/.test(year) && /^\d{2}$/.test(month) && /^\d{2}$/.test(day)) {
          return true;
        }
      }
    }
    return false;
  } catch (error) {
    console.error('Error checking dates in post URLs:', error);
    return false;
  }
}

export async function hasDuplicatedUrlsTrailingSlash(domain: string): Promise<boolean> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const response = await fetch(`https://${cleanDomain}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${cleanDomain}: ${response.status}`);
    }
    const html = await response.text();
    const regex = /<a\s+(?:[^>]*?\s+)?href=("|')(.*?)\1/g;
    const urlsSet = new Set<string>();
    const duplicates = new Set<string>();
    let match;
    while ((match = regex.exec(html)) !== null) {
      let url = match[2].replace(/\/$/, '');
      if (urlsSet.has(url)) {
        duplicates.add(url);
      } else {
        urlsSet.add(url);
      }
    }
    return duplicates.size > 0;
  } catch (error) {
    console.error('Error checking duplicated URLs with trailing slash:', error);
    return false;
  }
}