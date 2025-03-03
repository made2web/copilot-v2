import { beforeEach, describe, expect, it, vi } from "vitest";
import { checkMultipleMetaDescriptions, checkEmptyMetaDescriptions, checkShortMetaDescriptions, checkLongMetaDescriptions } from "../meta-description";

describe("Meta Description Test Functions", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("checkMultipleMetaDescriptions (133)", () => {
    it("should return hasMultipleMetaDescriptions true when multiple meta descriptions are present", async () => {
      const mockHtml = `<!DOCTYPE html><html><head><meta name="description" content="Description one"><meta name="description" content="Description two"></head><body></body></html>`;
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await checkMultipleMetaDescriptions("made2web.com");
      expect(result.hasMultipleMetaDescriptions).toBe(true);
    });

    it("should return hasMultipleMetaDescriptions false when only one meta description is present", async () => {
      const mockHtml = `<!DOCTYPE html><html><head><meta name="description" content="Only one description"></head><body></body></html>`;
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await checkMultipleMetaDescriptions("made2web.com");
      expect(result.hasMultipleMetaDescriptions).toBe(false);
    });
  });

  describe("checkEmptyMetaDescriptions (134)", () => {
    it("should return hasEmptyMetaDescriptions true when there are empty meta descriptions", async () => {
      const mockHtml = `<!DOCTYPE html><html><head><meta name="description" content=""><meta name="description" content="Valid description"></head><body></body></html>`;
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await checkEmptyMetaDescriptions("made2web.com");
      expect(result.hasEmptyMetaDescriptions).toBe(true);
    });

    it("should return hasEmptyMetaDescriptions false when all meta descriptions are non-empty", async () => {
      const mockHtml = `<!DOCTYPE html><html><head><meta name="description" content="Description one"><meta name="description" content="Description two"></head><body></body></html>`;
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await checkEmptyMetaDescriptions("made2web.com");
      expect(result.hasEmptyMetaDescriptions).toBe(false);
    });
  });

  describe("checkShortMetaDescriptions (136)", () => {
    it("should return hasShortMetaDescriptions true when there are meta descriptions below 70 characters", async () => {
      const mockHtml = `<!DOCTYPE html><html><head><meta name="description" content="Short"><meta name="description" content="Another description"></head><body></body></html>`;
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await checkShortMetaDescriptions("made2web.com");
      expect(result.hasShortMetaDescriptions).toBe(true);
    });

    it("should return hasShortMetaDescriptions false when no meta descriptions are below 70 characters", async () => {
      const mockHtml = `<!DOCTYPE html><html><head><meta name="description" content="This is a sufficiently long meta description that exceeds the seventy characters limit."></head><body></body></html>`;
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await checkShortMetaDescriptions("made2web.com");
      expect(result.hasShortMetaDescriptions).toBe(false);
    });
  });

  describe("checkLongMetaDescriptions (137)", () => {
    it("should return hasLongMetaDescriptions true when meta descriptions exceed 155 characters", async () => {
      const longDescription = "a".repeat(156);
      const mockHtml = `<!DOCTYPE html><html><head><meta name="description" content="${longDescription}"></head><body></body></html>`;
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await checkLongMetaDescriptions("made2web.com");
      expect(result.hasLongMetaDescriptions).toBe(true);
    });

    it("should return hasLongMetaDescriptions false when no meta descriptions exceed 155 characters", async () => {
      const mockHtml = `<!DOCTYPE html><html><head><meta name="description" content="This is a valid meta description that is within the character limit."></head><body></body></html>`;
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await checkLongMetaDescriptions("made2web.com");
      expect(result.hasLongMetaDescriptions).toBe(false);
    });
  });
});