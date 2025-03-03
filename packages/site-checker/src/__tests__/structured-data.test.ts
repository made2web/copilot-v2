import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  checkStructuredDataWebsite,
  checkStructuredDataLocalBusiness,
  checkStructuredDataOrganization,
  checkStructuredDataFAQPage,
  checkStructuredDataProduct,
  checkStructuredDataArticle,
  checkStructuredDataCollectionPage
} from "../structured-data";

describe("Structured Data Test Functions", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("checkStructuredDataWebsite (114)", () => {
    it("should return true when valid Website schema is present", async () => {
      const mockHtml = `<script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "Website",
          "name": "Made2Web"
        }
      </script>`;

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml)
      });

      const result = await checkStructuredDataWebsite("made2web.com");
      expect(result.hasWebsiteSchema).toBe(true);
    });

    it("should return false when no valid Website schema exists", async () => {
      const mockHtml = `<script type="application/ld+json">
        {"@type": "Organization"}
      </script>`;

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml)
      });

      const result = await checkStructuredDataWebsite("made2web.com");
      expect(result.hasWebsiteSchema).toBe(false);
    });
  });

  describe("checkStructuredDataLocalBusiness (115)", () => {
    it("should return true when valid LocalBusiness schema is present", async () => {
      const mockHtml = `<script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "Made2Web Local"
        }
      </script>`;

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml)
      });

      const result = await checkStructuredDataLocalBusiness("made2web.com");
      expect(result.hasLocalBusinessSchema).toBe(true);
    });

    it("should return false when no valid LocalBusiness schema exists", async () => {
      const mockHtml = `<script type="application/ld+json">
        {"@type": "Organization"}
      </script>`;

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml)
      });

      const result = await checkStructuredDataLocalBusiness("made2web.com");
      expect(result.hasLocalBusinessSchema).toBe(false);
    });
  });

  describe("checkStructuredDataOrganization (116)", () => {
    it("should return true when valid Organization schema is present", async () => {
      const mockHtml = `<script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Made2Web Org"
        }
      </script>`;

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml)
      });

      const result = await checkStructuredDataOrganization("made2web.com");
      expect(result.hasOrganizationSchema).toBe(true);
    });

    it("should return false when no valid Organization schema exists", async () => {
      const mockHtml = `<script type="application/ld+json">
        {"@type": "Website"}
      </script>`;

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml)
      });

      const result = await checkStructuredDataOrganization("made2web.com");
      expect(result.hasOrganizationSchema).toBe(false);
    });
  });

  describe("checkStructuredDataFAQPage (117)", () => {
    it("should return true when valid FAQPage schema is present", async () => {
      const mockHtml = `<script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": []
        }
      </script>`;

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml)
      });

      const result = await checkStructuredDataFAQPage("made2web.com");
      expect(result.hasFAQPageSchema).toBe(true);
    });

    it("should return false when no valid FAQPage schema exists", async () => {
      const mockHtml = `<script type="application/ld+json">
        {"@type": "Article"}
      </script>`;

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml)
      });

      const result = await checkStructuredDataFAQPage("made2web.com");
      expect(result.hasFAQPageSchema).toBe(false);
    });
  });

  describe("checkStructuredDataProduct (119)", () => {
    it("should return true when valid Product schema is present", async () => {
      const mockHtml = `<script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "Product",
          "name": "Made2Web Product"
        }
      </script>`;

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml)
      });

      const result = await checkStructuredDataProduct("made2web.com");
      expect(result.hasProductSchema).toBe(true);
    });

    it("should return false when no valid Product schema exists", async () => {
      const mockHtml = `<script type="application/ld+json">
        {"@type": "Article"}
      </script>`;

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml)
      });

      const result = await checkStructuredDataProduct("made2web.com");
      expect(result.hasProductSchema).toBe(false);
    });
  });

  describe("checkStructuredDataArticle (118)", () => {
    it("should return true when valid Article schema is present", async () => {
      const mockHtml = `<script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": "Made2Web Article"
        }
      </script>`;

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml)
      });

      const result = await checkStructuredDataArticle("made2web.com");
      expect(result.hasArticleSchema).toBe(true);
    });

    it("should return false when no valid Article schema exists", async () => {
      const mockHtml = `<script type="application/ld+json">
        {"@type": "Website"}
      </script>`;

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml)
      });

      const result = await checkStructuredDataArticle("made2web.com");
      expect(result.hasArticleSchema).toBe(false);
    });
  });

  describe("checkStructuredDataCollectionPage (120)", () => {
    it("should return true when valid CollectionPage schema is present", async () => {
      const mockHtml = `<script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Made2Web Collection"
        }
      </script>`;

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml)
      });

      const result = await checkStructuredDataCollectionPage("made2web.com");
      expect(result.hasCollectionPageSchema).toBe(true);
    });

    it("should return false when no valid CollectionPage schema exists", async () => {
      const mockHtml = `<script type="application/ld+json">
        {"@type": "Article"}
      </script>`;

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml)
      });

      const result = await checkStructuredDataCollectionPage("made2web.com");
      expect(result.hasCollectionPageSchema).toBe(false);
    });
  });
});