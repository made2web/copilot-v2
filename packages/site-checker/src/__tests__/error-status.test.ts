import { beforeEach, describe, expect, it, vi } from "vitest";
import { check404PageExists, check404PageMetaRobots, check404PageStatus } from "../error-status";
import { cleanDomainName } from "../utils";

describe("Error Status Test Functions", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("check404PageExists (40)", () => {
    it("should return exists true when 404 page is present", async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        status: 404,
      });

      const result = await check404PageExists("made2web.com");
      expect(result.exists).toBe(true);
    });

    it("should return exists false when 404 page is not present", async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        status: 200,
      });

      const result = await check404PageExists("made2web.com");
      expect(result.exists).toBe(false);
    });

    it("should handle fetch errors", async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(new Error("Network error"));

      const result = await check404PageExists("made2web.com");
      expect(result.exists).toBe(false);
      expect(result.error).toBe("Network error");
    });
  });

  describe("check404PageMetaRobots (41)", () => {
    it("should return correct true when meta robots is noindex, nofollow", async () => {
      const htmlWithMeta = '<html><head><meta name="robots" content="noindex, nofollow"></head><body></body></html>';
      global.fetch = vi.fn().mockResolvedValueOnce({
        status: 404,
        text: vi.fn().mockResolvedValueOnce(htmlWithMeta),
      });

      const result = await check404PageMetaRobots("made2web.com");
      expect(result.correct).toBe(true);
    });

    it("should return correct false when meta robots is not noindex, nofollow", async () => {
      const htmlWithMeta = '<html><head><meta name="robots" content="index, follow"></head><body></body></html>';
      global.fetch = vi.fn().mockResolvedValueOnce({
        status: 404,
        text: vi.fn().mockResolvedValueOnce(htmlWithMeta),
      });

      const result = await check404PageMetaRobots("made2web.com");
      expect(result.correct).toBe(false);
    });

    it("should return false when page does not return 404", async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        status: 200,
        text: vi.fn().mockResolvedValueOnce('<html></html>'),
      });

      const result = await check404PageMetaRobots("made2web.com");
      expect(result.correct).toBe(false);
    });
  });

  describe("check404PageStatus (42)", () => {
    it("should return exists true when /404 page returns status 404", async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        status: 404,
      });

      const result = await check404PageStatus("made2web.com");
      expect(result.exists).toBe(true);
    });

    it("should return exists false when /404 page does not return status 404", async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        status: 200,
      });

      const result = await check404PageStatus("made2web.com");
      expect(result.exists).toBe(false);
    });
  });
});