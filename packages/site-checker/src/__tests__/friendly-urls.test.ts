import { beforeEach, describe, expect, it, vi } from 'vitest';
import { hasUppercaseUrls, hasNoUppercaseUrls, checkUrlsHaveUnderscores, hasSpecialCharsUrls, hasNoSpecialCharsUrls, checkCategoryUrlStructure, checkBlogPostUrlStructure, hasMoreThanTwoHierarchyLevelsUrls, hasDateInPostUrls, hasDuplicatedUrlsTrailingSlash } from '../friendly-urls';
import { cleanDomainName } from '../utils';

describe('Friendly URLs Test Functions', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('hasUppercaseUrls (107)', () => {
    it('should return true when URLs contain uppercase letters', async () => {
      const mockHtml = '<a href="https://made2web.com/Page">Link</a>';
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await hasUppercaseUrls('made2web.com');
      expect(result).toBe(true);
    });

    it('should return false when no URLs contain uppercase letters', async () => {
      const mockHtml = '<a href="https://made2web.com/page">Link</a>';
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await hasUppercaseUrls('made2web.com');
      expect(result).toBe(false);
    });
  });

  describe("checkUrlsHaveUnderscores (104)", () => {
    it("should return hasUnderscores true when URLs with underscores are present", async () => {
      const mockHtml = `
        <html>
          <body>
            <a href="https://made2web.com/about_us">About Us</a>
            <a href="https://made2web.com/contact">Contact</a>
          </body>
        </html>
      `;
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await checkUrlsHaveUnderscores("made2web.com");
      expect(result.hasUnderscores).toBe(true);
    });

    it("should return hasUnderscores false when no URLs with underscores are present", async () => {
      const mockHtml = `
        <html>
          <body>
            <a href="https://made2web.com/about-us">About Us</a>
            <a href="https://made2web.com/contact">Contact</a>
          </body>
        </html>
      `;
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await checkUrlsHaveUnderscores("made2web.com");
      expect(result.hasUnderscores).toBe(false);
    });
  });

  describe('hasSpecialCharsUrls (105)', () => {
    it('should return true when URLs contain special characters', async () => {
      const mockHtml = '<a href="https://made2web.com/about@us">About Us</a>';
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await hasSpecialCharsUrls('made2web.com');
      expect(result).toBe(true);
    });

    it('should return false when no URLs contain special characters', async () => {
      const mockHtml = '<a href="https://made2web.com/about-us">About Us</a>';
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await hasSpecialCharsUrls('made2web.com');
      expect(result).toBe(false);
    });
  });

  describe('Category URL Structure (112)', () => {
    it('should return true when category URLs follow /category/ hierarchy', async () => {
      const mockHtml = '<a href="https://made2web.com/category/books"></a>';
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await checkCategoryUrlStructure('made2web.com');
      expect(result).toBe(true);
    });

    it('should return false when category URLs do not follow /category/ hierarchy', async () => {
      const mockHtml = '<a href="https://made2web.com/product/category/123"></a>';
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await checkCategoryUrlStructure('made2web.com');
      expect(result).toBe(false);
    });
  });

  describe('Blog Post URL Structure (110)', () => {
    it('should return true when blog post URLs follow /blog/ hierarchy', async () => {
      const mockHtml = '<a href="https://made2web.com/blog/my-post"></a>';
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await checkBlogPostUrlStructure('made2web.com');
      expect(result).toBe(true);
    });

    it('should return false when blog post URLs do not follow /blog/ hierarchy', async () => {
      const mockHtml = '<a href="https://made2web.com/news/blog/my-post"></a>';
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await checkBlogPostUrlStructure('made2web.com');
      expect(result).toBe(false);
    });
  });

  describe('hasMoreThanTwoHierarchyLevelsUrls (109)', () => {
    it('should return true when URLs have more than two levels of hierarchy', async () => {
      const mockHtml = '<a href="https://made2web.com/level1/level2/level3">Link</a>';
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await hasMoreThanTwoHierarchyLevelsUrls('made2web.com');
      expect(result).toBe(true);
    });

    it('should return false when URLs do not have more than two levels of hierarchy', async () => {
      const mockHtml = '<a href="https://made2web.com/level1/level2">Link</a>';
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await hasMoreThanTwoHierarchyLevelsUrls('made2web.com');
      expect(result).toBe(false);
    });
  });

  describe('hasDateInPostUrls (111)', () => {
    it('should return true when post URLs contain dates', async () => {
      const mockHtml = '<a href="https://made2web.com/2023/10/27/my-post">Link</a>';
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await hasDateInPostUrls('made2web.com');
      expect(result).toBe(true);
    });

    it('should return false when post URLs do not contain dates', async () => {
      const mockHtml = '<a href="https://made2web.com/my-post">Link</a>';
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await hasDateInPostUrls('made2web.com');
      expect(result).toBe(false);
    });
  });

  describe('hasDuplicatedUrlsTrailingSlash (113)', () => {
    it('should return true when duplicate URLs with and without trailing slash are present', async () => {
      const mockHtml = `
        <html>
          <body>
            <a href="https://made2web.com/about"></a>
            <a href="https://made2web.com/about/"></a>
          </body>
        </html>
      `;
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await hasDuplicatedUrlsTrailingSlash('made2web.com');
      expect(result).toBe(true);
    });

    it('should return false when no duplicate URLs with and without trailing slash are present', async () => {
      const mockHtml = `
        <html>
          <body>
            <a href="https://made2web.com/about-us"></a>
            <a href="https://made2web.com/contact"></a>
          </body>
        </html>
      `;
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await hasDuplicatedUrlsTrailingSlash('made2web.com');
      expect(result).toBe(false);
    });
  });
});