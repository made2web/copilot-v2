import { beforeEach, describe, expect, it, vi } from "vitest";
import { checkMetaViewport, checkAmpHtmlLink, checkCanonicalForAmpPages } from "../responsiveness";

describe("Responsiveness Test Functions", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("checkMetaViewport (62)", () => {
    it("should return hasMetaViewport true when meta viewport is present", async () => {
      const mockHtml = '<head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>';
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await checkMetaViewport("made2web.com");
      expect(result.hasMetaViewport).toBe(true);
    });

    it("should return hasMetaViewport false when meta viewport is not present", async () => {
      const mockHtml = '<head><title>Example</title></head>';
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await checkMetaViewport("made2web.com");
      expect(result.hasMetaViewport).toBe(false);
    });
  });

  describe("checkMetaViewport (63)", () => {
    it("should verify the site is optimized for mobile devices", async () => {
      const mockHtml = '<head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>';
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await checkMetaViewport("made2web.com");
      expect(result.hasMetaViewport).toBe(true);
    });
    it("should verify the site is not optimized for mobile devices", async () => {
      const mockHtml = '<head><meta initial-scale=1.0"></head>';
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await checkMetaViewport("made2web.com");
      expect(result.hasMetaViewport).toBe(false);
    });
  });

  describe("checkAmpHtmlLink (65)", () => {
    it("should return true when rel=amphtml link points to /amp URL", async () => {
      const mockHtml = '<head><link rel="amphtml" href="https://made2web.com/amp"></head>';
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await checkAmpHtmlLink("made2web.com");
      expect(result.hasAmpHtmlLink).toBe(true);
    });

    it("should return false when rel=amphtml link is missing", async () => {
      const mockHtml = '<head><title>Example</title></head>';
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await checkAmpHtmlLink("made2web.com");
      expect(result.hasAmpHtmlLink).toBe(false);
    });

    it("should return false when rel=amphtml link does not point to /amp", async () => {
      const mockHtml = '<head><link rel="amphtml" href="https://made2web.com/amp-version"></head>';
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await checkAmpHtmlLink("made2web.com");
      expect(result.hasAmpHtmlLink).toBe(false);
    });
  });

  describe("checkCanonicalForAmpPages (64)", () => {
    it("should return true when canonical points to non-AMP URL", async () => {
      const mockHtml = '<head><link rel="canonical" href="https://made2web.com/"></head>';
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await checkCanonicalForAmpPages("made2web.com");
      expect(result.hasCorrectCanonical).toBe(true);
    });

    it("should return false when canonical points to AMP URL", async () => {
      const mockHtml = '<head><link rel="canonical" href="https://made2web.com/amp"></head>';
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await checkCanonicalForAmpPages("made2web.com");
      expect(result.hasCorrectCanonical).toBe(false);
    });

    it("should return false when canonical is missing", async () => {
      const mockHtml = '<head><title>AMP Page</title></head>';
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await checkCanonicalForAmpPages("made2web.com");
      expect(result.hasCorrectCanonical).toBe(false);
    });
  });
});