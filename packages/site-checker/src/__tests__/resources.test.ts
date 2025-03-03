import { beforeEach, describe, expect, it, vi } from "vitest";
import { checkCacheActive, checkCacheInactive, checkGzipEnabled, checkGzipDisabled } from "../resources";
import * as utils from "../utils";

describe("Resources Test Functions", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("checkActiveCache (73)", () => {
    it("deve retornar isCacheActive true quando o cache está ativo", async () => {
      const mockHeaders = new Headers();
      mockHeaders.append("Cache-Control", "max-age=3600");
      global.fetch = vi.fn().mockResolvedValueOnce({
        headers: mockHeaders,
      });

      const result = await checkCacheActive("made2web.com");
      expect(result.isCacheActive).toBe(true);
    });

    it("deve retornar isCacheActive false quando o cache está ativo", async () => {
      const mockHeaders = new Headers();
      mockHeaders.append("Cache-Control", "max-age=3600");
      global.fetch = vi.fn().mockResolvedValueOnce({
        headers: mockHeaders,
      });

      const result = await checkCacheInactive("made2web.com");
      expect(result.isCacheActive).toBe(false);
    });
  });

  describe("checkGzipEnabled (74)", () => {
    it("should return isGzipEnabled true when gzip detected", async () => {
      const mockHeaders = new Headers();
      mockHeaders.append("Content-Encoding", "gzip");
      global.fetch = vi.fn().mockResolvedValueOnce({
        headers: mockHeaders,
      });

      const result = await checkGzipEnabled("made2web.com");
      expect(result.isGzipEnabled).toBe(true);
    });

    it("should return isGzipEnabled false when gzip not detected", async () => {
      const mockHeaders = new Headers();
      global.fetch = vi.fn().mockResolvedValueOnce({
        headers: mockHeaders,
      });

      const result = await checkGzipDisabled("made2web.com");
      expect(result.isGzipEnabled).toBe(true);
    });
  });
});