import { beforeEach, describe, expect, it, vi } from "vitest";
import { checkImagesAlt } from "../images";

describe("Images Test Functions", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("checkImagesAlt (141)", () => {
    it("should return hasImagesWithoutAlt true when there are images without alt text", async () => {
      const mockHtml = `
        <html>
          <body>
            <img src="image1.jpg" alt="Image 1">
            <img src="image2.jpg">
            <img src="image3.jpg" alt="">
          </body>
        </html>
      `;
      
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });
      
      const result = await checkImagesAlt("made2web.com");
      
      expect(result.hasImagesWithoutAlt).toBe(true);
    });

    it("should return hasImagesWithoutAlt false when all images have alt text", async () => {
      const mockHtml = `
        <html>
          <body>
            <img src="image1.jpg" alt="Image 1">
            <img src="image2.jpg" alt="Image 2">
          </body>
        </html>
      `;
      
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });
      
      const result = await checkImagesAlt("made2web.com");
      
      expect(result.hasImagesWithoutAlt).toBe(false);
    });
  });
});