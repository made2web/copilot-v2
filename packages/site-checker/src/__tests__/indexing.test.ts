import { beforeEach, describe, expect, it, vi } from "vitest";
import { checkBrandRanking, checkDomainIndexing, checkFavicon, checkRobotsForSitemap, getIndexedTestSubdomains } from "../indexing";
import * as serperDev from "../libs/serper-dev";

describe("Indexing Test Functions", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("checkDomainIndexing (3)", () => {
    it("deve retornar isIndexed true quando encontrar resultados", async () => {
      const mockSearchResult = {
        organic: [
          {
            title: "Made2Web",
            link: "https://www.made2web.com",
            snippet: "Descrição da página",
            position: 1,
          },
        ],
      };
      vi.spyOn(serperDev, "searchSerper").mockResolvedValueOnce(
        mockSearchResult,
      );

      const result = await checkDomainIndexing("made2web.com");
      expect(result).toEqual({
        isIndexed: true,
        totalResults: 1,
      });
    });

    it("deve retornar isIndexed false quando não encontrar resultados", async () => {
      const mockSearchResult = {
        organic: [],
      };
      vi.spyOn(serperDev, "searchSerper").mockResolvedValueOnce(
        mockSearchResult,
      );

      const result = await checkDomainIndexing("site-nao-existe.com");
      expect(result).toEqual({
        isIndexed: false,
        totalResults: 0,
      });
    });
  });

  describe("checkBrandRanking (4)", () => {
    it("deve identificar quando o site está em primeiro lugar", async () => {
      const mockSearchResult = {
        organic: [
          {
            title: "Made2Web Digital",
            link: "https://made2web.com",
            snippet: "Site da Made2Web",
            position: 1,
          },
        ],
      };
      vi.spyOn(serperDev, "searchSerper").mockResolvedValueOnce(
        mockSearchResult,
      );

      const result = await checkBrandRanking(
        "made2web.com",
        "Made2Web Digital",
      );
      expect(result).toEqual({
        isRankingFirst: true,
        position: 1,
        topResult: {
          link: "https://made2web.com",
        },
      });
    });
  });

  describe("checkFavicon (6)", () => {
    it("should return isFaviconPresent true when favicon is present", async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({ ok: true });

      const result = await checkFavicon("made2web.com");
      expect(result.isFaviconPresent).toBe(true);
    });

    it("should return isFaviconPresent false when favicon is not present", async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({ ok: false });

      const result = await checkFavicon("made2web.com");
      expect(result.isFaviconPresent).toBe(false);
    });
  });

  describe("checkRobotsForSitemap (11)", () => {
    it("should return mentionsSitemap true when robots.txt mentions sitemap.xml", async () => {
      const mockRobotsContent = "User-agent: *\nDisallow: /\nSitemap: https://made2web.com/sitemap.xml";
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockRobotsContent),
      });

      const result = await checkRobotsForSitemap("made2web.com");
      expect(result).toEqual({
        mentionsSitemap: true,
      });
    });

    it("should return mentionsSitemap false when robots.txt does not mention sitemap.xml", async () => {
      const mockRobotsContent = "User-agent: *\nDisallow: /";
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockRobotsContent),
      });

      const result = await checkRobotsForSitemap("made2web.com");
      expect(result).toEqual({
        mentionsSitemap: false,
      });
    });
  });

  describe("getIndexedTestSubdomains (5)", () => {
    it("should return indexed test subdomains", async () => {
      vi.spyOn(serperDev, "searchSerper").mockImplementation(async ({ q }) => {
        const testSubdomains = ['test', 'staging', 'dev'];
        if (q === `site:test.made2web.com`) {
          return {
            organic: [
              {
                title: "Test Subdomain",
                link: "https://test.made2web.com",
                snippet: "",
                position: 1,
              },
            ],
          };
        }
        if (q === `site:staging.made2web.com`) {
          return { organic: [] };
        }
        if (q === `site:dev.made2web.com`) {
          return { organic: [] };
        }
        return { organic: [] };
      });
      const result = await getIndexedTestSubdomains("made2web.com");
      expect(result).toEqual(["test.made2web.com"]);
    });
  });
});