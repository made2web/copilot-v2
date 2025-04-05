import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { 
    checkFriendlyUrls, 
    checkUppercaseUrls, 
    checkCategoryUrlHierarchy, 
    checkUrlHierarchyDepth, 
    checkSpecialCharacterUrls,
    checkBlogUrlHierarchy,
    checkTrailingSlashDuplicates,
    checkPostUrlDatePresence,
    checkUrlKeywordPresence
} from "../friendly-urls";

// Helper to create a fake Response
function createFakeResponse(body: string, init?: ResponseInit): Response {
    return new Response(body, init);
}

describe("checkFriendlyUrls (104)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should detect URLs with underscores in HTML content", async () => {
        const htmlContent = "<html>\n<head><title>Test</title></head>\n<body>\n<a href=\"https://example.com/this_is_a_test\">Link 1</a>\n<a href=\"https://example.com/another-test\">Link 2</a>\n</body>\n</html>";
        const result = await checkFriendlyUrls(htmlContent);
        expect(result.totalUrls).toBe(2);
        expect(result.hasUnderscores).toBe(true);
        expect(result.urlsWithUnderscores).toEqual(["https://example.com/this_is_a_test"]);
    });

    it("should fetch content when a URL is provided and detect underscores", async () => {
        const url = "https://example.com/page";
        const fakeHtml = "<html>\n<body>\n<a href=\"https://example.com/clean-url\">Clean</a>\n<a href=\"https://example.com/underscore_url\">Not Friendly</a>\n</body>\n</html>";
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse(fakeHtml))
        );
        const result = await checkFriendlyUrls(url);
        expect(result.totalUrls).toBe(2);
        expect(result.hasUnderscores).toBe(true);
        expect(result.urlsWithUnderscores).toEqual(["https://example.com/underscore_url"]);
        expect(fetchMock).toHaveBeenCalledWith(url);
    });

    it("should handle content with no anchors gracefully", async () => {
        const textContent = "This is some plain text without links.";
        const result = await checkFriendlyUrls(textContent);
        expect(result.totalUrls).toBe(0);
        expect(result.hasUnderscores).toBe(false);
        expect(result.urlsWithUnderscores).toEqual([]);
    });

    it("should return error when fetch fails", async () => {
        const url = "https://nonexistentdomain.com/page";
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(new Response(null, { status: 404, statusText: "Not Found" }))
        );
        const result = await checkFriendlyUrls(url);
        expect(result.error).toContain("HTTP Error: 404 Not Found");
        expect(result.totalUrls).toBe(0);
        expect(result.hasUnderscores).toBe(false);
        expect(fetchMock).toHaveBeenCalledWith(url);
    });
});

describe("checkUppercaseUrls (107)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should detect URLs with uppercase letters in HTML content", async () => {
        const htmlContent = "<html>\n<head><title>Test</title></head>\n<body>\n<a href=\"https://example.com/ThisIsATest\">Link 1</a>\n<a href=\"https://example.com/clean-url\">Link 2</a>\n</body>\n</html>";
        const result = await checkUppercaseUrls(htmlContent);
        expect(result.totalUrls).toBe(2);
        expect(result.hasUppercase).toBe(true);
        expect(result.urlsWithUppercase).toEqual(["https://example.com/ThisIsATest"]);
    });

    it("should fetch content when a URL is provided and detect uppercase letters", async () => {
        const url = "https://example.com/page";
        const fakeHtml = "<html>\n<body>\n<a href=\"https://example.com/UPPERCASE\">Upper</a>\n<a href=\"https://example.com/clean-url\">Clean</a>\n</body>\n</html>";
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse(fakeHtml))
        );
        const result = await checkUppercaseUrls(url);
        expect(result.totalUrls).toBe(2);
        expect(result.hasUppercase).toBe(true);
        expect(result.urlsWithUppercase).toEqual(["https://example.com/UPPERCASE"]);
        expect(fetchMock).toHaveBeenCalledWith(url);
    });

    it("should handle content with no anchors gracefully", async () => {
        const textContent = "This is some plain text without any links.";
        const result = await checkUppercaseUrls(textContent);
        expect(result.totalUrls).toBe(0);
        expect(result.hasUppercase).toBe(false);
        expect(result.urlsWithUppercase).toEqual([]);
    });

    it("should return error when fetch fails", async () => {
        const url = "https://nonexistentdomain.com/page";
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(new Response(null, { status: 404, statusText: "Not Found" }))
        );
        const result = await checkUppercaseUrls(url);
        expect(result.error).toContain("HTTP Error: 404 Not Found");
        expect(result.totalUrls).toBe(0);
        expect(result.hasUppercase).toBe(false);
        expect(fetchMock).toHaveBeenCalledWith(url);
    });
});

describe("checkCategoryUrlHierarchy (112)", () => {
    it("should validate a correct category URL", async () => {
        const url = "https://example.com/category/architecture";
        const result = await checkCategoryUrlHierarchy(url);
        expect(result.isCategoryUrlValid).toBe(true);
        expect(result.testedUrl).toBe(url);
    });

    it("should invalidate a URL with incorrect hierarchy", async () => {
        const url = "https://example.com/blog/architecture";
        const result = await checkCategoryUrlHierarchy(url);
        expect(result.isCategoryUrlValid).toBe(false);
        expect(result.testedUrl).toBe(url);
    });

    it("should validate category URL regardless of case sensitivity in the path", async () => {
        const url = "https://example.com/CATEGORY/design";
        const result = await checkCategoryUrlHierarchy(url);
        expect(result.isCategoryUrlValid).toBe(true);
        expect(result.testedUrl).toBe(url);
    });

    it("should return error for non-URL input", async () => {
        const input = "not a url";
        const result = await checkCategoryUrlHierarchy(input);
        expect(result.isCategoryUrlValid).toBe(false);
        expect(result.error).toBe("Input is not a valid URL");
    });
});

describe("checkUrlHierarchyDepth (109)", () => {
    it("should return 0 levels for homepage URL", async () => {
        const url = "https://example.com/";
        const result = await checkUrlHierarchyDepth(url);
        expect(result.levelsCount).toBe(0);
        expect(result.hasMoreThanTwoLevels).toBe(false);
        expect(result.testedUrl).toBe(url);
    });

    it("should return 1 level for URL with a single segment", async () => {
        const url = "https://example.com/about";
        const result = await checkUrlHierarchyDepth(url);
        expect(result.levelsCount).toBe(1);
        expect(result.hasMoreThanTwoLevels).toBe(false);
    });

    it("should return 2 levels for URL with two segments", async () => {
        const url = "https://example.com/services/web-design";
        const result = await checkUrlHierarchyDepth(url);
        expect(result.levelsCount).toBe(2);
        expect(result.hasMoreThanTwoLevels).toBe(false);
    });

    it("should return more than 2 levels for URL with three or more segments", async () => {
        const url = "https://example.com/department/team/project";
        const result = await checkUrlHierarchyDepth(url);
        expect(result.levelsCount).toBe(3);
        expect(result.hasMoreThanTwoLevels).toBe(true);
    });

    it("should return error for invalid URL input", async () => {
        const input = "not a url";
        const result = await checkUrlHierarchyDepth(input);
        expect(result.error).toBe("Input is not a valid URL");
        expect(result.levelsCount).toBe(0);
        expect(result.hasMoreThanTwoLevels).toBe(false);
    });
});

describe("checkSpecialCharacterUrls (105)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should detect URLs with special characters in HTML content", async () => {
        // One URL with a special character: the letter 'ç' is not in the allowed set
        const htmlContent = "<html>\n<body>\n<a href=\"https://example.com/normal-url\">Normal</a>\n<a href=\"https://example.com/ação\">Special</a>\n</body>\n</html>";
        const result = await checkSpecialCharacterUrls(htmlContent);
        expect(result.totalUrls).toBe(2);
        expect(result.hasSpecialCharacters).toBe(true);
        expect(result.urlsWithSpecialCharacters).toEqual(["https://example.com/ação"]);
    });

    it("should fetch content when a URL is provided and detect special characters", async () => {
        const url = "https://example.com/page";
        const fakeHtml = "<html>\n<body>\n<a href=\"https://example.com/clean-url\">Clean</a>\n<a href=\"https://example.com/spécial\">Special</a>\n</body>\n</html>";
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
            Promise.resolve(createFakeResponse(fakeHtml))
        );
        const result = await checkSpecialCharacterUrls(url);
        expect(result.totalUrls).toBe(2);
        expect(result.hasSpecialCharacters).toBe(true);
        expect(result.urlsWithSpecialCharacters).toEqual(["https://example.com/spécial"]);
        expect(fetchMock).toHaveBeenCalledWith(url);
    });

    it("should handle content with no anchors gracefully", async () => {
        const textContent = "This is some plain text without links.";
        const result = await checkSpecialCharacterUrls(textContent);
        expect(result.totalUrls).toBe(0);
        expect(result.hasSpecialCharacters).toBe(false);
        expect(result.urlsWithSpecialCharacters).toEqual([]);
    });

    it("should return error when fetch fails", async () => {
        const url = "https://nonexistentdomain.com/page";
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
            Promise.resolve(new Response(null, { status: 404, statusText: "Not Found" }))
        );
        const result = await checkSpecialCharacterUrls(url);
        expect(result.error).toContain("HTTP Error: 404 Not Found");
        expect(result.totalUrls).toBe(0);
        expect(result.hasSpecialCharacters).toBe(false);
        expect(fetchMock).toHaveBeenCalledWith(url);
    });
});

describe("checkBlogUrlHierarchy (110)", () => {
    it("should validate a URL with /blog/ in its path", async () => {
        const url = "https://example.com/blog/my-first-post";
        const result = await checkBlogUrlHierarchy(url);
        expect(result.isBlogUrlValid).toBe(true);
        expect(result.testedUrl).toBe(url);
    });

    it("should invalidate a URL without /blog/ in its path", async () => {
        const url = "https://example.com/posts/my-first-post";
        const result = await checkBlogUrlHierarchy(url);
        expect(result.isBlogUrlValid).toBe(false);
        expect(result.testedUrl).toBe(url);
    });

    it("should return error for non-URL input", async () => {
        const input = "not a url";
        const result = await checkBlogUrlHierarchy(input);
        expect(result.isBlogUrlValid).toBe(false);
        expect(result.error).toBe("Input is not a valid URL");
    });
});

describe("checkTrailingSlashDuplicates (113)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should detect duplicate URLs differing only by trailing slash in HTML content", async () => {
        const htmlContent = "<html>\n<body>\n<a href=\"https://example.com/page/\">Link 1</a>\n<a href=\"https://example.com/page\">Link 2</a>\n<a href=\"https://example.com/about\">Link 3</a>\n</body>\n</html>";
        const result = await checkTrailingSlashDuplicates(htmlContent);
        expect(result.totalUrls).toBe(3);
        expect(result.hasDuplicates).toBe(true);
        expect(result.duplicateGroups).toEqual([
            { normalized: "https://example.com/page", variants: ["https://example.com/page/", "https://example.com/page"] }
        ]);
    });

    it("should return no duplicates when there are no trailing slash variations", async () => {
        const htmlContent = "<html>\n<body>\n<a href=\"https://example.com/contact\">Link 1</a>\n<a href=\"https://example.com/about\">Link 2</a>\n</body>\n</html>";
        const result = await checkTrailingSlashDuplicates(htmlContent);
        expect(result.totalUrls).toBe(2);
        expect(result.hasDuplicates).toBe(false);
        expect(result.duplicateGroups).toEqual([]);
    });

    it("should fetch content when a URL is provided and detect trailing slash duplicates", async () => {
        const url = "https://example.com/test-page";
        const fakeHtml = "<html>\n<body>\n<a href=\"https://example.com/test-page/\">Test</a>\n<a href=\"https://example.com/test-page\">Test</a>\n</body>\n</html>";
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
            Promise.resolve(createFakeResponse(fakeHtml))
        );
        const result = await checkTrailingSlashDuplicates(url);
        expect(result.totalUrls).toBe(2);
        expect(result.hasDuplicates).toBe(true);
        expect(result.duplicateGroups).toEqual([
            { normalized: "https://example.com/test-page", variants: ["https://example.com/test-page/", "https://example.com/test-page"] }
        ]);
        expect(fetchMock).toHaveBeenCalledWith(url);
    });

    it("should return error when fetch fails", async () => {
        const url = "https://nonexistentdomain.com/page";
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
            Promise.resolve(new Response(null, { status: 404, statusText: "Not Found" }))
        );
        const result = await checkTrailingSlashDuplicates(url);
        expect(result.error).toContain("HTTP Error: 404 Not Found");
        expect(result.totalUrls).toBe(0);
        expect(result.hasDuplicates).toBe(false);
        expect(fetchMock).toHaveBeenCalledWith(url);
    });
});

describe("checkPostUrlDatePresence (111)", () => {
    it("should return true for URL with date including day", async () => {
        const url = "https://example.com/2021/05/20/my-post";
        const result = await checkPostUrlDatePresence(url);
        expect(result.hasDate).toBe(true);
        expect(result.testedUrl).toBe(url);
    });

    it("should return true for URL with date without day", async () => {
        const url = "https://example.com/2021/05/my-post";
        const result = await checkPostUrlDatePresence(url);
        expect(result.hasDate).toBe(true);
        expect(result.testedUrl).toBe(url);
    });

    it("should return false for URL without date", async () => {
        const url = "https://example.com/blog/my-post";
        const result = await checkPostUrlDatePresence(url);
        expect(result.hasDate).toBe(false);
        expect(result.testedUrl).toBe(url);
    });

    it("should return error for non-URL input", async () => {
        const input = "not a url";
        const result = await checkPostUrlDatePresence(input);
        expect(result.hasDate).toBe(false);
        expect(result.error).toBe("Input is not a valid URL");
    });
});

describe("checkUrlKeywordPresence (108)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return true when the URL contains the keyword in the path", async () => {
        const url = "https://example.com/awesome-keyword-page";
        const keyword = "keyword";
        const result = await checkUrlKeywordPresence(url, keyword);
        expect(result.containsKeyword).toBe(true);
        expect(result.testedUrl).toBe(url);
    });

    it("should return true when the URL contains the keyword in the domain", async () => {
        const url = "https://keyword.example.com/page";
        const keyword = "keyword";
        const result = await checkUrlKeywordPresence(url, keyword);
        expect(result.containsKeyword).toBe(true);
        expect(result.testedUrl).toBe(url);
    });

    it("should return false when the URL does not contain the keyword", async () => {
        const url = "https://example.com/awesome-page";
        const keyword = "keyword";
        const result = await checkUrlKeywordPresence(url, keyword);
        expect(result.containsKeyword).toBe(false);
        expect(result.testedUrl).toBe(url);
    });

    it("should return error for non-URL input", async () => {
        const input = "not a url";
        const keyword = "keyword";
        const result = await checkUrlKeywordPresence(input, keyword);
        expect(result.containsKeyword).toBe(false);
        expect(result.error).toBe("Input is not a valid URL");
    });
});
