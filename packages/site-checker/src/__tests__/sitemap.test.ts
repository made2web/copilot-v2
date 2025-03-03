import { beforeEach, describe, expect, it, vi } from "vitest";
import { checkSitemapExists, checkSitemapLinksAreHttps, checkSitemapUrlLimit, checkSitemapHasNonIndexableUrls } from "../sitemap";

describe("Sitemap Test Functions", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("checkSitemapExists (18)", () => {
    it("should return exists true when sitemap.xml is present", async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({ ok: true });

      const result = await checkSitemapExists("made2web.com");
      expect(result.exists).toBe(true);
      expect(result.sitemapUrl).toBe("https://made2web.com/sitemap.xml");
    });

    it("should return exists false when sitemap.xml is not present", async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({ ok: false });

      const result = await checkSitemapExists("made2web.com");
      expect(result.exists).toBe(false);
      expect(result.sitemapUrl).toBeUndefined();
    });
  });

  describe("checkSitemapLinksAreHttps (19)", () => {
    it("should return allLinksHttps true when all sitemap links are in HTTPS", async () => {
      const sitemapXml = `
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
          <url><loc>https://made2web.com/page1</loc></url>
          <url><loc>https://made2web.com/page2</loc></url>
        </urlset>
      `;
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: async () => sitemapXml,
      });

      const result = await checkSitemapLinksAreHttps("made2web.com");
      expect(result.allLinksHttps).toBe(true);
    });

    it("should return allLinksHttps false and list non-HTTPS links when some sitemap links are not in HTTPS", async () => {
      const sitemapXml = `
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
          <url><loc>http://made2web.com/page1</loc></url>
          <url><loc>https://made2web.com/page2</loc></url>
        </urlset>
      `;
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: async () => sitemapXml,
      });

      const result = await checkSitemapLinksAreHttps("made2web.com");
      expect(result.allLinksHttps).toBe(false);
      expect(result.nonHttpsLinks).toEqual(["http://made2web.com/page1"]);
    });
  });

  describe("checkSitemapUrlLimit (27)", () => {
    it("should return withinLimit true when sitemap has 50,000 URLs or fewer", async () => {
      const urls = Array(50000).fill("https://made2web.com/page");
      const sitemapXml = `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(url => `<url><loc>${url}1</loc></url>`).join("")}</urlset>`;
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: async () => sitemapXml,
      });

      const result = await checkSitemapUrlLimit("made2web.com");
      expect(result.withinLimit).toBe(true);
      expect(result.urlCount).toBe(50000);
    });

    it("should return withinLimit false when sitemap has more than 50,000 URLs", async () => {
      const urls = Array(50001).fill("https://made2web.com/page");
      const sitemapXml = `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(url => `<url><loc>${url}1</loc></url>`).join("")}</urlset>`;
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: async () => sitemapXml,
      });

      const result = await checkSitemapUrlLimit("made2web.com");
      expect(result.withinLimit).toBe(false);
      expect(result.urlCount).toBe(50001);
    });

    it("should return an error when sitemap.xml cannot be fetched", async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({ ok: false, status: 404 });

      const result = await checkSitemapUrlLimit("made2web.com");
      expect(result.withinLimit).toBe(false);
      expect(result.urlCount).toBe(0);
      expect(result.error).toBe("Failed to fetch sitemap.xml: 404");
    });
  });

  describe("checkSitemapHasNonIndexableUrls (21)", () => {
    it("should return true and list URLs with noindex", async () => {
      const sitemapXml = `
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
          <url><loc>https://made2web.com/page1</loc></url>
          <url><loc>https://made2web.com/page2</loc></url>
        </urlset>
      `;

      global.fetch = vi.fn()
        // Mock fetch for sitemap.xml
        .mockResolvedValueOnce({
          ok: true,
          text: async () => sitemapXml,
        })
        // Mock fetch for page1 (noindex)
        .mockResolvedValueOnce({
          ok: true,
          text: async () => '<meta name="robots" content="noindex">',
        })
        // Mock fetch for page2 (indexable)
        .mockResolvedValueOnce({
          ok: true,
          text: async () => '<meta name="robots" content="index">',
        });

      const result = await checkSitemapHasNonIndexableUrls("made2web.com");
      expect(result.hasNonIndexableUrls).toBe(true);
      expect(result.nonIndexableUrls).toEqual(["https://made2web.com/page1"]);
    });

    it("should return false when no URLs have noindex", async () => {
      const sitemapXml = `
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
          <url><loc>https://made2web.com/page1</loc></url>
          <url><loc>https://made2web.com/page2</loc></url>
        </urlset>
      `;

      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          text: async () => sitemapXml,
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => '<meta name="robots" content="index">',
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => '<meta name="robots" content="index, follow">',
        });

      const result = await checkSitemapHasNonIndexableUrls("made2web.com");
      expect(result.hasNonIndexableUrls).toBe(false);
      expect(result.nonIndexableUrls).toBeUndefined();
    });

    it("should return false and list error when sitemap.xml cannot be fetched", async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({ ok: false, status: 404 });

      const result = await checkSitemapHasNonIndexableUrls("made2web.com");
      expect(result.hasNonIndexableUrls).toBe(false);
      expect(result.error).toBe("Failed to fetch sitemap.xml: 404");
    });
  });
});