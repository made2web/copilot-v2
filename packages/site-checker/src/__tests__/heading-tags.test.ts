import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  checkPagesHaveH1,
  checkPagesHaveMultipleH1s,
  checkPagesHaveH2,
  checkPagesHaveMultipleH2s,
  checkPagesFooterHasH4,
  checkHeadingHierarchy
} from "../heading-tags";
import { cleanDomainName } from "../utils";

describe("Heading Tags Test Functions", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("checkPagesHaveH1 (97)", () => {
    it("should return hasH1 true when H1 is present", async () => {
      const mockHtml = "<html><body><h1>Title</h1></body></html>";
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await checkPagesHaveH1("made2web.com");
      expect(result.hasH1).toBe(true);
    });

    it("should return hasH1 false when H1 is not present", async () => {
      const mockHtml = "<html><body><h2>Subtitle</h2></body></html>";
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await checkPagesHaveH1("made2web.com");
      expect(result.hasH1).toBe(false);
    });
  });

  describe("checkPagesHaveMultipleH1s (99)", () => {
    it("should return multipleH1s true when more than one H1 is present", async () => {
      const mockHtml = "<html><body><h1>Title</h1><h1>Another Title</h1></body></html>";
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await checkPagesHaveMultipleH1s("made2web.com");
      expect(result.multipleH1s).toBe(true);
    });

    it("should return multipleH1s false when one or no H1 is present", async () => {
      const mockHtml = "<html><body><h1>Title</h1></body></html>";
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await checkPagesHaveMultipleH1s("made2web.com");
      expect(result.multipleH1s).toBe(false);
    });
  });

  describe("checkPagesHaveH2 (102)", () => {
    it("should return hasH2 true when H2 is present", async () => {
      const mockHtml = "<html><body><h2>Subtitle</h2></body></html>";
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await checkPagesHaveH2("made2web.com");
      expect(result.hasH2).toBe(true);
    });

    it("should return hasH2 false when H2 is not present", async () => {
      const mockHtml = "<html><body><h1>Title</h1></body></html>";
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await checkPagesHaveH2("made2web.com");
      expect(result.hasH2).toBe(false);
    });
  });

  describe("checkPagesHaveMultipleH2s (101)", () => {
    it("should return multipleH2s true when more than one H2 is present", async () => {
      const mockHtml = "<html><body><h2>Subtitle</h2><h2>Another Subtitle</h2></body></html>";
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await checkPagesHaveMultipleH2s("made2web.com");
      expect(result.multipleH2s).toBe(true);
    });

    it("should return multipleH2s false when one or no H2 is present", async () => {
      const mockHtml = "<html><body><h2>Subtitle</h2></body></html>";
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await checkPagesHaveMultipleH2s("made2web.com");
      expect(result.multipleH2s).toBe(false);
    });
  });

  describe("checkPagesFooterHasH4 (103)", () => {
    it("should return hasH4 true when H4 is present in footer", async () => {
      const mockHtml = "<html><body><footer><h4>Footer Title</h4></footer></body></html>";
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await checkPagesFooterHasH4("made2web.com");
      expect(result.hasH4).toBe(true);
    });

    it("should return hasH4 false when H4 is not present in footer", async () => {
      const mockHtml = "<html><body><footer><h3>Footer Title</h3></footer></body></html>";
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await checkPagesFooterHasH4("made2web.com");
      expect(result.hasH4).toBe(false);
    });
  });

  describe("checkHeadingHierarchy (96)", () => {
    it("should return isHierarchyCorrect true when heading hierarchy is proper", async () => {
      const mockHtml = "<html><body><h1>Main Title</h1><h2>Sub Title</h2><h3>Sub Sub Title</h3></body></html>";
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await checkHeadingHierarchy("made2web.com");
      expect(result.isHierarchyCorrect).toBe(true);
    });

    it("should return isHierarchyCorrect false when heading hierarchy skips levels", async () => {
      const mockHtml = "<html><body><h1>Main Title</h1><h3>Sub Sub Title</h3></body></html>";
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await checkHeadingHierarchy("made2web.com");
      expect(result.isHierarchyCorrect).toBe(false);
    });
  });
});