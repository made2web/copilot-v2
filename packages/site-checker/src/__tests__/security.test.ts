import { beforeEach, describe, expect, it, vi } from "vitest";
import { checkHSTS, checkInternalHTTPLinks } from "../security";

describe("Security Test Functions", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("checkHSTS (81)", () => {
    it("should return hasHSTS true when HSTS header is present", async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        headers: new Headers({ 'Strict-Transport-Security': 'max-age=31536000' })
      });

      const result = await checkHSTS("made2web.com");
      expect(result.hasHSTS).toBe(true);
    });

    it("should return hasHSTS false when HSTS header is missing", async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        headers: new Headers({})
      });

      const result = await checkHSTS("made2web.com");
      expect(result.hasHSTS).toBe(false);
    });
  });

  describe("checkInternalHTTPLinks (80)", () => {
    it("should return hasHTTPLinks true when internal HTTP links are present", async () => {
      const mockHTML = '<a href="http://made2web.com/page1">Page 1</a>';
      global.fetch = vi.fn().mockResolvedValueOnce({
        text: vi.fn().mockResolvedValueOnce(mockHTML)
      });

      const result = await checkInternalHTTPLinks("made2web.com");
      expect(result.hasHTTPLinks).toBe(true);
    });

    it("should return hasHTTPLinks false when no internal HTTP links are present", async () => {
      const mockHTML = '<a href="https://made2web.com/page1">Page 1</a>';
      global.fetch = vi.fn().mockResolvedValueOnce({
        text: vi.fn().mockResolvedValueOnce(mockHTML)
      });

      const result = await checkInternalHTTPLinks("made2web.com");
      expect(result.hasHTTPLinks).toBe(false);
    });
  });
});