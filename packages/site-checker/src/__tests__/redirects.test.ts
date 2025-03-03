import { beforeEach, describe, expect, it, vi } from "vitest";
import { checkSiteWorksWithAndWithoutWWW, checkSiteWorksWithHTTPAndHTTPS } from "../redirects";
import { cleanDomainName } from "../utils";

describe("Redirects Test Functions", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("checkSiteWorksWithAndWithoutWWW (38)", () => {
    it("should return worksWithWWW true and worksWithoutWWW true when both URLs are accessible", async () => {
      global.fetch = vi.fn().mockImplementation((url: string) => {
        return Promise.resolve({
          ok: true,
          text: vi.fn().mockResolvedValueOnce("<html><body>OK</body></html>"),
        });
      });

      const result = await checkSiteWorksWithAndWithoutWWW("made2web.com");
      expect(result.worksWithWWW).toBe(true);
      expect(result.worksWithoutWWW).toBe(true);
    });

    it("should return worksWithWWW false when www version fails", async () => {
      global.fetch = vi.fn()
        .mockResolvedValueOnce({ ok: false, status: 404 })
        .mockResolvedValueOnce({ ok: true, text: vi.fn().mockResolvedValueOnce("<html><body>OK</body></html>") });

      const result = await checkSiteWorksWithAndWithoutWWW("made2web.com");
      expect(result.worksWithWWW).toBe(false);
    });

    it("should return worksWithoutWWW false when non-www version fails", async () => {
      global.fetch = vi.fn()
        .mockResolvedValueOnce({ ok: true, text: vi.fn().mockResolvedValueOnce("<html><body>OK</body></html>") })
        .mockResolvedValueOnce({ ok: false, status: 404 });

      const result = await checkSiteWorksWithAndWithoutWWW("made2web.com");
      expect(result.worksWithoutWWW).toBe(false);
    });

    it("should handle errors and return false for both", async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(new Error("Network error"));

      const result = await checkSiteWorksWithAndWithoutWWW("made2web.com");
      expect(result.worksWithWWW).toBe(false);
      expect(result.worksWithoutWWW).toBe(false);
    });
  });

  describe("checkSiteWorksWithHTTPAndHTTPS (37)", () => {
    it("should return true for both protocols when accessible", async () => {
      global.fetch = vi.fn().mockImplementation(() => ({
        ok: true,
        text: vi.fn().mockResolvedValue("<html><body>OK</body></html>")
      }));

      const result = await checkSiteWorksWithHTTPAndHTTPS("made2web.com");
      expect(result.httpWorks).toBe(true);
      expect(result.httpsWorks).toBe(true);
    });

    it("should return false for http when inaccessible", async () => {
      global.fetch = vi.fn()
        .mockResolvedValueOnce({ ok: false })
        .mockResolvedValueOnce({ ok: true });

      const result = await checkSiteWorksWithHTTPAndHTTPS("made2web.com");
      expect(result.httpWorks).toBe(false);
      expect(result.httpsWorks).toBe(true);
    });

    it("should return false for https when inaccessible", async () => {
      global.fetch = vi.fn()
        .mockResolvedValueOnce({ ok: true })
        .mockResolvedValueOnce({ ok: false });

      const result = await checkSiteWorksWithHTTPAndHTTPS("made2web.com");
      expect(result.httpWorks).toBe(true);
      expect(result.httpsWorks).toBe(false);
    });

    it("should handle network errors and return false for both", async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error("Connection failed"));

      const result = await checkSiteWorksWithHTTPAndHTTPS("made2web.com");
      expect(result.httpWorks).toBe(false);
      expect(result.httpsWorks).toBe(false);
    });
  });
});