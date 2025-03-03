import { beforeEach, describe, expect, it, vi } from "vitest";
import { checkLanguageDirective } from "../language";
import { cleanDomainName } from "../utils";

describe("Language Directive Test Functions", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("checkLanguageDirective (45)", () => {
    it("should return language directive correctly when lang is present", async () => {
      const mockHtml = "<html lang=\"en\"><body></body></html>";
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await checkLanguageDirective("made2web.com");
      expect(result.hasLanguageDirective).toBe(true);
      expect(result.language).toBe("en");
    });

    it("should return hasLanguageDirective false when lang is not present", async () => {
      const mockHtml = "<html><body></body></html>";
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await checkLanguageDirective("made2web.com");
      expect(result.hasLanguageDirective).toBe(false);
      expect(result.language).toBeNull();
    });
  });

  describe("checkLanguageDirective (44)", () => {
    it("should have URL language matching content language", async () => {
      const mockHtml = "<html lang=\"en\"><body></body></html>";
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const domain = "en.made2web.com";
      const result = await checkLanguageDirective(domain);
      const urlLanguage = domain.split('.')[0];
      expect(result.language).toBe(urlLanguage);
    });
  });
});