import { beforeEach, describe, expect, it, vi } from "vitest";
import { checkPageHasBreadcrumb, checkBreadcrumbsClickable, checkLastBreadcrumbClickable } from "../navigation-paths";
import { cleanDomainName } from "../utils";

describe("Navigation Paths Test Functions", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("checkPageHasBreadcrumb (121)", () => {
    it("should return hasBreadcrumb true when breadcrumb is present", async () => {
      const mockHtml = "<html><body><nav class=\"breadcrumb\"><ul><li>Home</li><li>Page</li></ul></nav></body></html>";
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await checkPageHasBreadcrumb("made2web.com");
      expect(result.hasBreadcrumb).toBe(true);
    });

    it("should return hasBreadcrumb false when breadcrumb is not present", async () => {
      const mockHtml = "<html><body><nav><ul><li>Home</li><li>Page</li></ul></nav></body></html>";
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await checkPageHasBreadcrumb("made2web.com");
      expect(result.hasBreadcrumb).toBe(false);
    });
  });

  describe("checkBreadcrumbsClickable (122)", () => {
    it("should return areBreadcrumbsClickable true when breadcrumbs have clickable links", async () => {
      const mockHtml = `<html><body><nav class=\"breadcrumb\"><ul><li><a href=\"/\">Home</a></li><li><a href=\"/page\">Page</a></li></ul></nav></body></html>`;
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await checkBreadcrumbsClickable("made2web.com");
      expect(result.areBreadcrumbsClickable).toBe(true);
    });

    it("should return areBreadcrumbsClickable false when breadcrumbs do not have clickable links", async () => {
      const mockHtml = `<html><body><nav class=\"breadcrumb\"><ul><li>Home</li><li>Page</li></ul></nav></body></html>`;
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await checkBreadcrumbsClickable("made2web.com");
      expect(result.areBreadcrumbsClickable).toBe(false);
    });
  });

  describe("checkLastBreadcrumbClickable (123)", () => {
    it("should return isLastBreadcrumbClickable true when last breadcrumb is clickable", async () => {
      const mockHtml = `<html><body><nav class=\"breadcrumb\"><ul><li><a href=\"/\">Home</a></li><li><a href=\"/page\">Page</a></li></ul></nav></body></html>`;
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await checkLastBreadcrumbClickable("made2web.com");
      expect(result.isLastBreadcrumbClickable).toBe(true);
    });
  });
});