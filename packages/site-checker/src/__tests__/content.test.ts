import { beforeEach, describe, expect, it, vi } from "vitest";
import { checkPageContentWordCount, checkParagraphLineCount } from "../content";
import { cleanDomainName } from "../utils";

describe("Content Word Count Test Function", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("checkAuthorMention (143)", () => {
    it("should return hasLessThan200Words true when content has less than 200 words", async () => {
      const mockHtml = `<html><body>${"word ".repeat(199)}</body></html>`;
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await checkPageContentWordCount("made2web.com");
      expect(result.hasLessThan200Words).toBe(true);
    });

    it("should return hasLessThan200Words false when content has 200 or more words", async () => {
      const mockHtml = `<html><body>${"word ".repeat(200)}</body></html>`;
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await checkPageContentWordCount("made2web.com");
      expect(result.hasLessThan200Words).toBe(false);
    });
  });
});

describe("Paragraph Line Count Test Function", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("checkParagraphLineCount (144)", () => {
    it("should return paragraphsExceedingLimit 0 when all paragraphs have at most 3 lines", async () => {
      const mockHtml = `<html><body><p>${"a".repeat(299)}</p><p>${"b".repeat(250)}</p></body></html>`;
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await checkParagraphLineCount("made2web.com");
      expect(result.paragraphsExceedingLimit).toBe(0);
    });

    it("should return paragraphsExceedingLimit greater than 0 when some paragraphs exceed 3 lines", async () => {
      const mockHtml = `<html><body><p>${"a".repeat(301)}</p><p>${"b".repeat(250)}</p><p>${"c".repeat(350)}</p></body></html>`;
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await checkParagraphLineCount("made2web.com");
      expect(result.paragraphsExceedingLimit).toBe(2);
    });
  });
});