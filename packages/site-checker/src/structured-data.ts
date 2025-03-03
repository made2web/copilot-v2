import { cleanDomainName } from "./utils.js";

export interface StructuredDataCheckResult {
  hasWebsiteSchema?: boolean;
  hasLocalBusinessSchema?: boolean;
  hasOrganizationSchema?: boolean;
  hasFAQPageSchema?: boolean;
  hasProductSchema?: boolean;
  hasArticleSchema?: boolean;
  hasCollectionPageSchema?: boolean;
  error?: string;
}

export async function checkStructuredDataWebsite(domain: string): Promise<StructuredDataCheckResult> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const response = await fetch(`https://${cleanDomain}`);
    
    if (!response.ok) {
      return {
        hasWebsiteSchema: false,
        error: `Failed to fetch page: ${response.status}`
      };
    }

    const html = await response.text();
    const jsonLdRegex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi;
    const matches = html.match(jsonLdRegex) || [];

    const hasWebsiteSchema = matches.some(scriptTag => {
      try {
        const jsonContent = scriptTag.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi, '$1');
        const schema = JSON.parse(jsonContent);
        return schema["@type"] === "Website";
      } catch {
        return false;
      }
    });

    return { hasWebsiteSchema };
  } catch (error) {
    return {
      hasWebsiteSchema: false,
      error: error instanceof Error ? error.message : "Unknown error checking structured data"
    };
  }
}

export async function checkStructuredDataLocalBusiness(domain: string): Promise<StructuredDataCheckResult> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const response = await fetch(`https://${cleanDomain}`);
    
    if (!response.ok) {
      return {
        hasLocalBusinessSchema: false,
        error: `Failed to fetch page: ${response.status}`
      };
    }

    const html = await response.text();
    const jsonLdRegex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi;
    const matches = html.match(jsonLdRegex) || [];

    const hasLocalBusinessSchema = matches.some(scriptTag => {
      try {
        const jsonContent = scriptTag.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi, '$1');
        const schema = JSON.parse(jsonContent);
        return schema["@type"] === "LocalBusiness";
      } catch {
        return false;
      }
    });

    return { hasLocalBusinessSchema };
  } catch (error) {
    return {
      hasLocalBusinessSchema: false,
      error: error instanceof Error ? error.message : "Unknown error checking structured data"
    };
  }
}

export async function checkStructuredDataOrganization(domain: string): Promise<StructuredDataCheckResult> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const response = await fetch(`https://${cleanDomain}`);
    
    if (!response.ok) {
      return {
        hasOrganizationSchema: false,
        error: `Failed to fetch page: ${response.status}`
      };
    }

    const html = await response.text();
    const jsonLdRegex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi;
    const matches = html.match(jsonLdRegex) || [];

    const hasOrganizationSchema = matches.some(scriptTag => {
      try {
        const jsonContent = scriptTag.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi, '$1');
        const schema = JSON.parse(jsonContent);
        return schema["@type"] === "Organization";
      } catch {
        return false;
      }
    });

    return { hasOrganizationSchema };
  } catch (error) {
    return {
      hasOrganizationSchema: false,
      error: error instanceof Error ? error.message : "Unknown error checking structured data"
    };
  }
}

export async function checkStructuredDataFAQPage(domain: string): Promise<StructuredDataCheckResult> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const response = await fetch(`https://${cleanDomain}`);
    
    if (!response.ok) {
      return {
        hasFAQPageSchema: false,
        error: `Failed to fetch page: ${response.status}`
      };
    }

    const html = await response.text();
    const jsonLdRegex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi;
    const matches = html.match(jsonLdRegex) || [];

    const hasFAQPageSchema = matches.some(scriptTag => {
      try {
        const jsonContent = scriptTag.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi, '$1');
        const schema = JSON.parse(jsonContent);
        return schema["@type"] === "FAQPage";
      } catch {
        return false;
      }
    });

    return { hasFAQPageSchema };
  } catch (error) {
    return {
      hasFAQPageSchema: false,
      error: error instanceof Error ? error.message : "Unknown error checking structured data"
    };
  }
}

export async function checkStructuredDataProduct(domain: string): Promise<StructuredDataCheckResult> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const response = await fetch(`https://${cleanDomain}`);
    
    if (!response.ok) {
      return {
        hasProductSchema: false,
        error: `Failed to fetch page: ${response.status}`
      };
    }

    const html = await response.text();
    const jsonLdRegex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi;
    const matches = html.match(jsonLdRegex) || [];

    const hasProductSchema = matches.some(scriptTag => {
      try {
        const jsonContent = scriptTag.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi, '$1');
        const schema = JSON.parse(jsonContent);
        return schema["@type"] === "Product";
      } catch {
        return false;
      }
    });

    return { hasProductSchema };
  } catch (error) {
    return {
      hasProductSchema: false,
      error: error instanceof Error ? error.message : "Unknown error checking structured data"
    };
  }
}

export async function checkStructuredDataArticle(domain: string): Promise<StructuredDataCheckResult> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const response = await fetch(`https://${cleanDomain}`);
    
    if (!response.ok) {
      return {
        hasArticleSchema: false,
        error: `Failed to fetch page: ${response.status}`
      };
    }

    const html = await response.text();
    const jsonLdRegex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi;
    const matches = html.match(jsonLdRegex) || [];

    const hasArticleSchema = matches.some(scriptTag => {
      try {
        const jsonContent = scriptTag.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi, '$1');
        const schema = JSON.parse(jsonContent);
        return schema["@type"] === "Article" || schema["@type"] === "BlogPosting";
      } catch {
        return false;
      }
    });

    return { hasArticleSchema };
  } catch (error) {
    return {
      hasArticleSchema: false,
      error: error instanceof Error ? error.message : "Unknown error checking structured data"
    };
  }
}

export async function checkStructuredDataCollectionPage(domain: string): Promise<StructuredDataCheckResult> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const response = await fetch(`https://${cleanDomain}`);
    
    if (!response.ok) {
      return {
        hasCollectionPageSchema: false,
        error: `Failed to fetch page: ${response.status}`
      };
    }

    const html = await response.text();
    const jsonLdRegex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi;
    const matches = html.match(jsonLdRegex) || [];

    const hasCollectionPageSchema = matches.some(scriptTag => {
      try {
        const jsonContent = scriptTag.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi, '$1');
        const schema = JSON.parse(jsonContent);
        return schema["@type"] === "CollectionPage" || schema["@type"] === "ItemList";
      } catch {
        return false;
      }
    });

    return { hasCollectionPageSchema };
  } catch (error) {
    return {
      hasCollectionPageSchema: false,
      error: error instanceof Error ? error.message : "Unknown error checking structured data"
    };
  }
}