import { cleanDomainName } from "./utils.js";

export interface ImagesAltCheckResult {
  hasImagesWithoutAlt: boolean;
  totalImages: number;
  imagesWithoutAlt?: string[];
  error?: string;
}

/**
 * Checks if there are images without alt text on the given domain.
 * @param domain - The domain to check (e.g., "example.com")
 * @returns Promise<ImagesAltCheckResult> - The result of the check
 */
export async function checkImagesAlt(domain: string): Promise<ImagesAltCheckResult> {
  try {
    const cleanDomain = cleanDomainName(domain);
    const pageUrl = `https://${cleanDomain}`;
    const response = await fetch(pageUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch page content: ${response.status}`);
    }
    
    const html = await response.text();
    const missingAltImages: string[] = [];
    const imgTags = html.match(/<img[^>]*>/g) || [];

    imgTags.forEach(imgTag => {
      const altMatch = imgTag.match(/alt\s*=\s*"([^"]*)"/i);
      if (!altMatch || !altMatch[1].trim()) {
        const srcMatch = imgTag.match(/src\s*=\s*"([^"]+)"/i);
        const src = srcMatch ? srcMatch[1] : "";
        missingAltImages.push(src);
      }
    });

    return {
      hasImagesWithoutAlt: missingAltImages.length > 0,
      totalImages: imgTags.length,
      imagesWithoutAlt: missingAltImages
    };
  } catch (error) {
    console.error("Error checking images for alt text:", error);
    return {
      hasImagesWithoutAlt: false,
      totalImages: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}