import { cleanDomainName } from "./utils.js";

interface BreadcrumbCheckResult {
  hasBreadcrumb: boolean;
  error?: string;
}

interface BreadcrumbClickableCheckResult {
  areBreadcrumbsClickable: boolean;
  error?: string;
}

/**
 * Checks if the page has a breadcrumb navigation
 * @param domain - The domain to be checked (e.g., "made2web.com")
 * @returns Promise<BreadcrumbCheckResult> - The result of the check
 */
export async function checkPageHasBreadcrumb(domain: string): Promise<BreadcrumbCheckResult> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const response = await fetch(`https://${cleanDomain}/`);
    if (!response.ok) {
      return {
        hasBreadcrumb: false,
        error: `Failed to fetch page: ${response.status}`,
      };
    }
    const html = await response.text();
    const hasBreadcrumb = /<nav[^>]*class="[^"\n]*\bbreadcrumb\b[^"\n]*"[^>]*>.*<\/nav>/i.test(html);
    return { hasBreadcrumb };
  } catch (error) {
    return {
      hasBreadcrumb: false,
      error: error instanceof Error ? error.message : "Unknown error while checking breadcrumb",
    };
  }
}

/**
 * Checks if the breadcrumbs are clickable
 * @param domain - The domain to be checked (e.g., "made2web.com")
 * @returns Promise<BreadcrumbClickableCheckResult> - The result of the check
 */
export async function checkBreadcrumbsClickable(domain: string): Promise<BreadcrumbClickableCheckResult> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const response = await fetch(`https://${cleanDomain}/`);
    if (!response.ok) {
      return {
        areBreadcrumbsClickable: false,
        error: `Failed to fetch page: ${response.status}`,
      };
    }
    const html = await response.text();
    const breadcrumbLinks = html.match(/<nav[^>]*class="[^"\n]*\bbreadcrumb\b[^"\n]*"[^>]*>.*?<\/nav>/i);
    if (!breadcrumbLinks) {
      return {
        areBreadcrumbsClickable: false,
        error: 'Breadcrumb navigation not found',
      };
    }
    // Check if links inside breadcrumb have href attributes
    const hasClickableLinks = /<a\s+[^>]*href=["'][^"']+["'][^>]*>/.test(breadcrumbLinks[0]);
    return { areBreadcrumbsClickable: hasClickableLinks };
  } catch (error) {
    return {
      areBreadcrumbsClickable: false,
      error: error instanceof Error ? error.message : "Unknown error while checking breadcrumb links",
    };
  }
}

/**
 * Checks if the last breadcrumb is clickable
 * @param domain - The domain to be checked (e.g., "made2web.com")
 * @returns Promise<{ isLastBreadcrumbClickable: boolean; error?: string }> - The result of the check
 */
export async function checkLastBreadcrumbClickable(domain: string): Promise<{ isLastBreadcrumbClickable: boolean; error?: string }> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const response = await fetch(`https://${cleanDomain}/`);
    if (!response.ok) {
      return {
        isLastBreadcrumbClickable: false,
        error: `Failed to fetch page: ${response.status}`,
      };
    }
    const html = await response.text();
    const breadcrumbLinks = html.match(/<nav[^>]*class="[^"\n]*\bbreadcrumb\b[^"\n]*"[^>]*>.*?<\/nav>/i);
    if (!breadcrumbLinks) {
      return {
        isLastBreadcrumbClickable: false,
        error: 'Breadcrumb navigation not found',
      };
    }
    // Parse the breadcrumb HTML to find last breadcrumb
    const breadcrumbItems = breadcrumbLinks[0].match(/<li>(.*?)<\/li>/g);
    if (!breadcrumbItems || breadcrumbItems.length === 0) {
      return {
        isLastBreadcrumbClickable: false,
        error: 'No breadcrumb items found',
      };
    }
    const lastBreadcrumb = breadcrumbItems[breadcrumbItems.length - 1];
    // Check if the last breadcrumb has a clickable link
    const isClickable = /<a\s+[^>]*href=["'][^"']+["'][^>]*>/.test(lastBreadcrumb);
    return { isLastBreadcrumbClickable: isClickable };
  } catch (error) {
    return {
      isLastBreadcrumbClickable: false,
      error: error instanceof Error ? error.message : "Unknown error while checking last breadcrumb",
    };
  }
}