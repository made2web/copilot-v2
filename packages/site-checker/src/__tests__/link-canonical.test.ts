import { beforeEach, describe, expect, it, vi } from "vitest";
import { checkPagesHaveCanonicalLink, checkCanonicalPointsToSelf, checkCanonicalHasParameters, checkPaginationCanonicalPointsToSelf, checkAMPCanonicalPointsToNonAMP } from "../link-canonical";
import { cleanDomainName } from "../utils";

describe("Link Canonical Test Functions", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("checkPagesHaveCanonicalLink (28)", () => {
    it("should return hasCanonical true when canonical link is present", async () => {
      const mockHtml = '<html><head><link rel="canonical" href="https://made2web.com/"></head><body></body></html>';
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await checkPagesHaveCanonicalLink("made2web.com");
      expect(result.hasCanonical).toBe(true);
    });

    it("should return hasCanonical false when canonical link is not present", async () => {
      const mockHtml = "<html><head></head><body></body></html>";
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await checkPagesHaveCanonicalLink("made2web.com");
      expect(result.hasCanonical).toBe(false);
    });
  });

  describe("checkCanonicalPointsToSelf (29)", () => {
    it("should return hasCanonical true when canonical link points to itself", async () => {
      const mockHtml = '<html><head><link rel="canonical" href="https://made2web.com/"></head><body></body></html>';
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await checkCanonicalPointsToSelf("made2web.com");
      expect(result.hasCanonical).toBe(true);
    });

    it("should return hasCanonical false when canonical link does not point to itself", async () => {
      const mockHtml = '<html><head><link rel="canonical" href="https://example.com/"></head><body></body></html>';
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await checkCanonicalPointsToSelf("made2web.com");
      expect(result.hasCanonical).toBe(false);
    });

    it("should return hasCanonical false when canonical link is not present", async () => {
      const mockHtml = "<html><head></head><body></body></html>";
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await checkCanonicalPointsToSelf("made2web.com");
      expect(result.hasCanonical).toBe(false);
    });
  });

  describe("checkCanonicalHasParameters (30)", () => {
    it("should return hasCanonical true when all parameters are present in canonical URL", async () => {
      const mockHtml = '<html><head><link rel="canonical" href="https://made2web.com/?ids=123&utm=456&amp=true"></head><body></body></html>';
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await checkCanonicalHasParameters("made2web.com", ["ids", "utm", "amp"]);
      expect(result.hasCanonical).toBe(true);
    });

    it("should return hasCanonical false when some parameters are missing in canonical URL", async () => {
      const mockHtml = '<html><head><link rel="canonical" href="https://made2web.com/?ids=123"></head><body></body></html>';
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await checkCanonicalHasParameters("made2web.com", ["ids", "utm", "amp"]);
      expect(result.hasCanonical).toBe(false);
    });

    it("should return hasCanonical false when canonical link is not present", async () => {
      const mockHtml = "<html><head></head><body></body></html>";
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await checkCanonicalHasParameters("made2web.com", ["ids", "utm", "amp"]);
      expect(result.hasCanonical).toBe(false);
    });
  });

  describe("checkPaginationCanonicalPointsToSelf (31)", () => {
    it("should return hasCanonical true when pagination canonical points to itself", async () => {
      const mockHtml = '<html><head><link rel="canonical" href="https://made2web.com/page/2"></head><body></body></html>';
      global.fetch = vi.fn().mockImplementation((url) => {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(mockHtml)
        });
      });

      const result = await checkPaginationCanonicalPointsToSelf("made2web.com", "/page/2");
      expect(result.hasCanonical).toBe(true);
    });

    it("should return hasCanonical false when pagination canonical points to another page", async () => {
      const mockHtml = '<html><head><link rel="canonical" href="https://made2web.com/"></head><body></body></html>';
      global.fetch = vi.fn().mockImplementation((url) => {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(mockHtml)
        });
      });

      const result = await checkPaginationCanonicalPointsToSelf("made2web.com", "/page/2");
      expect(result.hasCanonical).toBe(false);
    });

    it("should return hasCanonical false when no canonical present in pagination page", async () => {
      const mockHtml = '<html><head></head><body></body></html>';
      global.fetch = vi.fn().mockImplementation((url) => {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(mockHtml)
        });
      });

      const result = await checkPaginationCanonicalPointsToSelf("made2web.com", "/page/2");
      expect(result.hasCanonical).toBe(false);
    });
  });

  describe("checkAMPCanonicalPointsToNonAMP (32)", () => {
    it("should return hasCanonical true when canonical points to non-AMP version", async () => {
      const mockHtml = '<html><head><link rel="canonical" href="https://made2web.com/test"></head><body></body></html>';
      global.fetch = vi.fn().mockImplementation((url) => {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(mockHtml)
        });
      });

      const result = await checkAMPCanonicalPointsToNonAMP("made2web.com", "/amp/test");
      expect(result.hasCanonical).toBe(true);
    });

    it("should return hasCanonical false when canonical points to AMP version", async () => {
      const mockHtml = '<html><head><link rel="canonical" href="https://made2web.com/amp/test"></head><body></body></html>';
      global.fetch = vi.fn().mockImplementation((url) => {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(mockHtml)
        });
      });

      const result = await checkAMPCanonicalPointsToNonAMP("made2web.com", "/amp/test");
      expect(result.hasCanonical).toBe(false);
    });

    it("should return hasCanonical false when canonical link is not present", async () => {
      const mockHtml = '<html><head></head><body></body></html>';
      global.fetch = vi.fn().mockImplementation((url) => {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(mockHtml)
        });
      });

      const result = await checkAMPCanonicalPointsToNonAMP("made2web.com", "/amp/test");
      expect(result.hasCanonical).toBe(false);
    });
  });
});