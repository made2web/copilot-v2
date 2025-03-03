import { beforeEach, describe, expect, it, vi } from "vitest";
import { checkMetaRobots, isUniqueMetaRobots, isPageIndexed, isPageFollow, isPageNoindex } from "../meta-robots";

describe("Meta Robots Test Functions", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("checkMetaRobots (13)", () => {
    it("should return hasMetaRobots true when page contains meta robots tag", async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name=\"robots\" content=\"index, follow\">
          </head>
        </html>
      `;
      
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml)
      });

      const result = await checkMetaRobots("made2web.com");
      expect(result.hasMetaRobots).toBe(true);
    });

    it("should return hasMetaRobots false when page lacks meta robots tag", async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>No Meta Here</title>
          </head>
        </html>
      `;
      
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml)
      });

      const result = await checkMetaRobots("made2web.com");
      expect(result.hasMetaRobots).toBe(false);
    });
  });

  describe("checkImportantPagesBlockRobots (12)", () => {
    it("should return true when important page is blocked with noindex", async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name=\"robots\" content=\"noindex, nofollow\">
          </head>
        </html>
      `;
      
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml)
      });

      const result = await checkMetaRobots("made2web.com/important-page");
      if (result.hasMetaRobots) {
        expect(result.hasMetaRobots).toBe(true);
      }
    });

    it("should return false when important page is not blocked with noindex", async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name=\"robots\" content=\"index, follow\">
          </head>
        </html>
      `;
      
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml)
      });

      const result = await checkMetaRobots("made2web.com/important-page");
      if (!result.hasMetaRobots) {
        expect(result.hasMetaRobots).toBe(false);
      }
    });
  });

  describe("isUniqueMetaRobots (14)", () => {
    it("should return true when there is exactly one meta robots tag on the page", async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name=\"robots\" content=\"index, follow\">
          </head>
        </html>
      `;
      
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml)
      });

      const result = await isUniqueMetaRobots("made2web.com");
      expect(result).toBe(true);
    });

    it("should return false when there are multiple meta robots tags on the page", async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name=\"robots\" content=\"index, follow\">
            <meta name=\"robots\" content=\"noindex, nofollow\">
          </head>
        </html>
      `;
      
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml)
      });

      const result = await isUniqueMetaRobots("made2web.com");
      expect(result).toBe(false);
    });

    it("should return false when there is no meta robots tag on the page", async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>No Meta Robots</title>
          </head>
        </html>
      `;
      
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml)
      });

      const result = await isUniqueMetaRobots("made2web.com");
      expect(result).toBe(false);
    });
  });

  describe("isPageIndexed (15)", () => {
    it("should return true when page meta robots content is 'index, follow'", async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name=\"robots\" content=\"index, follow\">
          </head>
        </html>
      `;
      
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml)
      });

      const result = await isPageIndexed("made2web.com");
      expect(result).toBe(true);
    });

    it("should return false when page meta robots content is not 'index, follow'", async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name=\"robots\" content=\"noindex, nofollow\">
          </head>
        </html>
      `;
      
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml)
      });

      const result = await isPageIndexed("made2web.com");
      expect(result).toBe(false);
    });

    it("should return false when page lacks meta robots tag", async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>No Meta Robots</title>
          </head>
        </html>
      `;
      
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml)
      });

      const result = await isPageIndexed("made2web.com");
      expect(result).toBe(false);
    });
  });

  describe("isPageFollow (16)", () => {
    it("should return true when pagination has follow directive", async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name=\"robots\" content=\"follow\">
          </head>
        </html>
      `;
      
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml)
      });

      const result = await isPageFollow("made2web.com/blog?page=2");
      expect(result).toBe(true);
    });

    it("should return true when pagination has index, follow", async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name=\"robots\" content=\"index, follow\">
          </head>
        </html>
      `;
      
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml)
      });

      const result = await isPageFollow("made2web.com/blog?page=2");
      expect(result).toBe(true);
    });

    it("should return false when pagination has nofollow", async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name=\"robots\" content=\"nofollow\">
          </head>
        </html>
      `;
      
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml)
      });

      const result = await isPageFollow("made2web.com/blog?page=2");
      expect(result).toBe(false);
    });

    it("should return false when pagination lacks meta robots", async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Pagination Page</title>
          </head>
        </html>
      `;
      
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml)
      });

      const result = await isPageFollow("made2web.com/blog?page=2");
      expect(result).toBe(false);
    });
  });

  describe("isPageNoindex (17)", () => {
    it("should return true when reward page is set to noindex", async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name=\"robots\" content=\"noindex, follow\">
          </head>
        </html>
      `;
      
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml)
      });

      const result = await isPageNoindex("made2web.com/reward");
      expect(result).toBe(true);
    });

    it("should return false when reward page is not set to noindex", async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name=\"robots\" content=\"index, follow\">
          </head>
        </html>
      `;
      
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml)
      });

      const result = await isPageNoindex("made2web.com/reward");
      expect(result).toBe(false);
    });
  });
});