import { beforeEach, describe, expect, it, vi } from "vitest";
import { checkUniqueUrlsPerLanguage, checkXDefaultHreflang, checkHreflangForOtherLanguages } from "../international-seo";
import { cleanDomainName } from "../utils";

describe("International SEO Tests", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("checkUniqueUrlsPerLanguage (53)", () => {
    it("should return true when unique hreflang URLs exist", async () => {
      const mockHtml = `<html><head><link rel="alternate" hreflang="en" href="https://made2web.com/en" /><link rel="alternate" hreflang="es" href="https://made2web.com/es" /></head></html>`;
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml)
      });

      const result = await checkUniqueUrlsPerLanguage("made2web.com");
      expect(result.hasUniqueUrls).toBe(true);
    });

    it("should return false when duplicate hreflang exists", async () => {
      const mockHtml = `<html><head><link rel="alternate" hreflang="en" href="https://made2web.com/en" /><link rel="alternate" hreflang="en" href="https://made2web.com/en-us" /></head></html>`;
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml)
      });

      const result = await checkUniqueUrlsPerLanguage("made2web.com");
      expect(result.hasUniqueUrls).toBe(false);
    });

    it("should return false when no hreflang tags exist", async () => {
      const mockHtml = `<html><head></head></html>`;
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml)
      });

      const result = await checkUniqueUrlsPerLanguage("made2web.com");
      expect(result.hasUniqueUrls).toBe(false);
    });
  });

  describe("x-Default hreflang Check (57)", () => {
    it("should return true when x-default hreflang is present", async () => {
      const mockHtml = `<html><head><link rel="alternate" hreflang="x-default" href="https://made2web.com/" /><link rel="alternate" hreflang="en" href="https://made2web.com/en" /></head></html>`;
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml)
      });

      const result = await checkXDefaultHreflang("made2web.com");
      expect(result.hasXDefault).toBe(true);
    });

    it("should return false when x-default hreflang is missing", async () => {
      const mockHtml = `<html><head><link rel="alternate" hreflang="en" href="https://made2web.com/en" /></head></html>`;
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml)
      });

      const result = await checkXDefaultHreflang("made2web.com");
      expect(result.hasXDefault).toBe(false);
    });
  });

  describe("checkHreflangForOtherLanguages (55)", () => {
    it("should return true when hreflang tags for other languages exist", async () => {
      const mockHtml = `<html><head><link rel="alternate" hreflang="en" href="https://made2web.com/en" /><link rel="alternate" hreflang="es" href="https://made2web.com/es" /><link rel="alternate" hreflang="fr" href="https://made2web.com/fr" /></head></html>`;
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml)
      });

      const result = await checkHreflangForOtherLanguages("made2web.com");
      expect(result.hasHreflangForOtherLanguages).toBe(true);
    });

    it("should return false when hreflang tags for other languages are insufficient", async () => {
      const mockHtml = `<html><head><link rel="alternate" hreflang="en" href="https://made2web.com/en" /></head></html>`;
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml)
      });

      const result = await checkHreflangForOtherLanguages("made2web.com");
      expect(result.hasHreflangForOtherLanguages).toBe(false);
    });

    it("should return false when no hreflang tags for other languages exist", async () => {
      const mockHtml = `<html><head></head></html>`;
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml)
      });

      const result = await checkHreflangForOtherLanguages("made2web.com");
      expect(result.hasHreflangForOtherLanguages).toBe(false);
    });
  });
});