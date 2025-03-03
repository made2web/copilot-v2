import { beforeEach, describe, expect, it, vi } from "vitest";
import { checkAuthorMention, checkInternalLinks } from "../authority";

describe("Authority Test Functions", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("checkAuthorMention (149)", () => {
    it("should return isAuthorMentioned true when rel=author is present", async () => {
      const mockHtml = `<a href=\"/author/made2web\" rel=\"author\">Made2Web</a>`;
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await checkAuthorMention("made2web.com");
      expect(result.isAuthorMentioned).toBe(true);
    });

    it("should return isAuthorMentioned false when rel=author is not present", async () => {
      const mockHtml = `<a href=\"/about\">About Us</a>`;
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await checkAuthorMention("made2web.com");
      expect(result.isAuthorMentioned).toBe(false);
    });
  });

  describe("checkInternalLinks (148)", () => {
    it("should return hasMinimumInternalLinks true when there are at least 3 internal links", async () => {
      const mockHtml = `
        <a href=\"https://made2web.com/page1\">Page 1</a>
        <a href=\"https://made2web.com/page2\">Page 2</a>
        <a href=\"https://made2web.com/page3\">Page 3</a>
      `;
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await checkInternalLinks("made2web.com");
      expect(result.hasMinimumInternalLinks).toBe(true);
    });

    it("should return hasMinimumInternalLinks false when there are fewer than 3 internal links", async () => {
      const mockHtml = `
        <a href=\"https://made2web.com/page1\">Page 1</a>
        <a href=\"https://external.com/page2\">External Page</a>
      `;
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await checkInternalLinks("made2web.com");
      expect(result.hasMinimumInternalLinks).toBe(false);
    });
  });
});