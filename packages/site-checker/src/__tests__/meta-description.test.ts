import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { checkEmptyMetaDescription, checkLongMetaDescription, checkShortMetaDescription, checkDuplicateMetaDescriptions, checkMetaDescriptionForKeyword, checkBrandInMetaDescriptions } from "../meta-description";

// Helper function to create a fake Response object
function createFakeResponse(body: string, init?: ResponseInit): Response {
    return new Response(body, init);
}

describe("checkEmptyMetaDescription (134)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return emptyCount 1 and hasEmpty true when meta description content is empty", async () => {
        const htmlContent = "<html><head><meta name=\"description\" content=\"\"></head><body><p>Test</p></body></html>";
        const result = await checkEmptyMetaDescription(htmlContent);
        expect(result.emptyCount).toBe(1);
        expect(result.hasEmpty).toBe(true);
    });

    it("should return emptyCount 0 and hasEmpty false when meta description content is not empty", async () => {
        const htmlContent = "<html><head><meta name=\"description\" content=\"A valid description\"></head><body><p>Test</p></body></html>";
        const result = await checkEmptyMetaDescription(htmlContent);
        expect(result.emptyCount).toBe(0);
        expect(result.hasEmpty).toBe(false);
    });

    it("should correctly count multiple meta descriptions with one empty", async () => {
        const htmlContent = "<html><head><meta name=\"description\" content=\"Valid description\"><meta name=\"description\" content=\"\"></head><body><p>Test</p></body></html>";
        const result = await checkEmptyMetaDescription(htmlContent);
        expect(result.emptyCount).toBe(1);
        expect(result.hasEmpty).toBe(true);
    });

    it("should fetch content from URL and detect empty meta description", async () => {
        const htmlContent = "<html><head><meta name=\"description\" content=\"\"></head><body><p>Test</p></body></html>";
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse(htmlContent))
        );
        const result = await checkEmptyMetaDescription("https://example.com");
        expect(fetchMock).toHaveBeenCalled();
        expect(result.emptyCount).toBe(1);
        expect(result.hasEmpty).toBe(true);
    });

    it("should return an error when fetch fails", async () => {
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse("", { status: 500, statusText: "Internal Server Error" }))
        );
        const result = await checkEmptyMetaDescription("https://example.com");
        expect(fetchMock).toHaveBeenCalled();
        expect(result.error).toContain("HTTP Error: 500 Internal Server Error");
        expect(result.emptyCount).toBe(0);
        expect(result.hasEmpty).toBe(false);
    });
});

describe("checkLongMetaDescription (137)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });
    
    it("should return longCount 0 when meta description is under the limit", async () => {
        const htmlContent = "<html><head><meta name=\"description\" content=\"Short description\"></head><body><p>Test</p></body></html>";
        const result = await checkLongMetaDescription(htmlContent, 155);
        expect(result.longCount).toBe(0);
        expect(result.metaDescriptions[0].isLong).toBe(false);
    });
    
    it("should return longCount 1 when meta description exceeds the limit", async () => {
        const longText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
        const htmlContent = "<html><head><meta name=\"description\" content=\"" + longText + "\"></head><body><p>Test</p></body></html>";
        const result = await checkLongMetaDescription(htmlContent, 50);
        expect(result.longCount).toBe(1);
        expect(result.metaDescriptions[0].isLong).toBe(true);
    });
    
    it("should correctly handle multiple meta descriptions", async () => {
        const shortDesc = "Short desc";
        const longDesc = "This is a very long meta description that definitely exceeds the fifty characters limit imposed.";
        const htmlContent = "<html><head><meta name=\"description\" content=\"" + shortDesc + "\"><meta name=\"description\" content=\"" + longDesc + "\"></head><body><p>Test</p></body></html>";
        const result = await checkLongMetaDescription(htmlContent, 50);
        expect(result.longCount).toBe(1);
        expect(result.metaDescriptions[0].isLong).toBe(false);
        expect(result.metaDescriptions[1].isLong).toBe(true);
    });
    
    it("should fetch content from URL and check for long meta descriptions", async () => {
        const longText = "This is a very long meta description that exceeds the default character limit of meta descriptions in SEO practices.";
        const htmlContent = "<html><head><meta name=\"description\" content=\"" + longText + "\"></head><body><p>Test</p></body></html>";
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse(htmlContent))
        );
        const result = await checkLongMetaDescription("https://example.com", 100);
        expect(fetchMock).toHaveBeenCalled();
        expect(result.longCount).toBe(1);
    });
    
    it("should return an error when fetch fails", async () => {
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse("", { status: 404, statusText: "Not Found" }))
        );
        const result = await checkLongMetaDescription("https://example.com", 155);
        expect(fetchMock).toHaveBeenCalled();
        expect(result.error).toContain("HTTP Error: 404 Not Found");
        expect(result.longCount).toBe(0);
    });
});

describe("checkShortMetaDescription (136)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });
    
    it("should return shortCount 1 when meta description is shorter than 70 characters", async () => {
        const htmlContent = "<html><head><meta name=\"description\" content=\"Short desc\"></head><body><p>Test</p></body></html>";
        const result = await checkShortMetaDescription(htmlContent);
        expect(result.shortCount).toBe(1);
        expect(result.metaDescriptions[0].isShort).toBe(true);
    });
    
    it("should return shortCount 0 when meta description is exactly 70 characters or longer", async () => {
        const validDesc = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"; // 70 a's
        const htmlContent = "<html><head><meta name=\"description\" content=\"" + validDesc + "\"></head><body><p>Test</p></body></html>";
        const result = await checkShortMetaDescription(htmlContent);
        expect(result.shortCount).toBe(0);
        expect(result.metaDescriptions[0].isShort).toBe(false);
    });
    
    it("should correctly handle multiple meta descriptions with mixed lengths", async () => {
        const shortDesc = "Too short";
        const longDesc = "This meta description is sufficiently long to pass the minimum character limit check.";
        const htmlContent = "<html><head><meta name=\"description\" content=\"" + shortDesc + "\"><meta name=\"description\" content=\"" + longDesc + "\"></head><body><p>Test</p></body></html>";
        const result = await checkShortMetaDescription(htmlContent);
        expect(result.shortCount).toBe(1);
        expect(result.metaDescriptions[0].isShort).toBe(true);
        expect(result.metaDescriptions[1].isShort).toBe(false);
    });
    
    it("should fetch content from URL and detect short meta description", async () => {
        const htmlContent = "<html><head><meta name=\"description\" content=\"Short\"></head><body><p>Test</p></body></html>";
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse(htmlContent))
        );
        const result = await checkShortMetaDescription("https://example.com");
        expect(fetchMock).toHaveBeenCalled();
        expect(result.shortCount).toBe(1);
    });
    
    it("should return an error when fetch fails", async () => {
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse("", { status: 500, statusText: "Internal Server Error" }))
        );
        const result = await checkShortMetaDescription("https://example.com");
        expect(fetchMock).toHaveBeenCalled();
        expect(result.error).toContain("HTTP Error: 500 Internal Server Error");
        expect(result.shortCount).toBe(0);
    });
});

describe("checkDuplicateMetaDescriptions (135)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });
    
    it("should return duplicates for a list of URLs with duplicate meta descriptions", async () => {
        const urls = [
            "https://example.com/page1",
            "https://example.com/page2",
            "https://example.com/page3"
        ];
        
        const pages: { [key: string]: string } = {
            "https://example.com/page1": "<html><head><meta name=\"description\" content=\"Duplicate Desc\"></head><body><p>Page1</p></body></html>",
            "https://example.com/page2": "<html><head><meta name=\"description\" content=\"Duplicate Desc\"></head><body><p>Page2</p></body></html>",
            "https://example.com/page3": "<html><head><meta name=\"description\" content=\"Unique Desc\"></head><body><p>Page3</p></body></html>"
        };
        
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((url: string) => {
            if (pages[url]) {
                return Promise.resolve(createFakeResponse(pages[url]));
            }
            return Promise.resolve(createFakeResponse("", { status: 404, statusText: "Not Found" }));
        });
        
        const result = await checkDuplicateMetaDescriptions(urls);
        expect(fetchMock).toHaveBeenCalledTimes(urls.length);
        expect(result.totalPages).toBe(3);
        expect(result.duplicates.length).toBe(1);
        expect(result.duplicates[0].description).toBe("Duplicate Desc");
        expect(result.duplicates[0].urls).toEqual([
            "https://example.com/page1",
            "https://example.com/page2"
        ]);
    });
    
    it("should return an empty duplicates array if no duplicates are found", async () => {
        const urls = [
            "https://example.com/page1",
            "https://example.com/page2"
        ];
        
        const pages: { [key: string]: string } = {
            "https://example.com/page1": "<html><head><meta name=\"description\" content=\"Desc One\"></head><body><p>Page1</p></body></html>",
            "https://example.com/page2": "<html><head><meta name=\"description\" content=\"Desc Two\"></head><body><p>Page2</p></body></html>"
        };
        
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((url: string) => {
            if (pages[url]) {
                return Promise.resolve(createFakeResponse(pages[url]));
            }
            return Promise.resolve(createFakeResponse("", { status: 404, statusText: "Not Found" }));
        });
        
        const result = await checkDuplicateMetaDescriptions(urls);
        expect(fetchMock).toHaveBeenCalledTimes(urls.length);
        expect(result.totalPages).toBe(2);
        expect(result.duplicates.length).toBe(0);
    });
    
    it("should fetch sitemap and return duplicates when input is a domain", async () => {
        const domain = "example.com";
        const sitemap = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n  <url><loc>https://example.com/page1</loc></url>\n  <url><loc>https://example.com/page2</loc></url>\n  <url><loc>https://example.com/page3</loc></url>\n</urlset>";
        
        const pages: { [key: string]: string } = {
            "https://example.com/page1": "<html><head><meta name=\"description\" content=\"Dup Desc\"></head><body><p>Page1</p></body></html>",
            "https://example.com/page2": "<html><head><meta name=\"description\" content=\"Dup Desc\"></head><body><p>Page2</p></body></html>",
            "https://example.com/page3": "<html><head><meta name=\"description\" content=\"Unique Desc\"></head><body><p>Page3</p></body></html>"
        };
        
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((url: string) => {
            if (url === "https://example.com/sitemap.xml") {
                return Promise.resolve(createFakeResponse(sitemap));
            } else if (pages[url]) {
                return Promise.resolve(createFakeResponse(pages[url]));
            } else {
                return Promise.resolve(createFakeResponse("", { status: 404, statusText: "Not Found" }));
            }
        });
        
        const result = await checkDuplicateMetaDescriptions(domain);
        expect(fetchMock).toHaveBeenCalled();
        expect(result.totalPages).toBe(3);
        expect(result.duplicates.length).toBe(1);
        expect(result.duplicates[0].description).toBe("Dup Desc");
        expect(result.duplicates[0].urls).toEqual([
            "https://example.com/page1",
            "https://example.com/page2"
        ]);
    });
    
    it("should return an error if sitemap fetch fails", async () => {
        const domain = "example.com";
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((url: string) => {
            return Promise.resolve(createFakeResponse("", { status: 500, statusText: "Internal Server Error" }));
        });
        
        const result = await checkDuplicateMetaDescriptions(domain);
        expect(fetchMock).toHaveBeenCalled();
        expect(result.error).toContain("HTTP Error: 500 Internal Server Error");
        expect(result.totalPages).toBe(0);
    });
});

describe("checkMetaDescriptionForKeyword (139)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });
    
    it("should return true when the meta description contains the keyword", async () => {
        const keyword = "example";
        const htmlContent = "<html><head><meta name=\"description\" content=\"This is an example meta description for testing.\"></head><body><p>Test</p></body></html>";
        const result = await checkMetaDescriptionForKeyword(htmlContent, keyword);
        expect(result.containsKeyword).toBe(true);
        expect(result.metaDescription).toContain("example");
    });
    
    it("should return false when the meta description does not contain the keyword", async () => {
        const keyword = "missing";
        const htmlContent = "<html><head><meta name=\"description\" content=\"This is an example meta description for testing.\"></head><body><p>Test</p></body></html>";
        const result = await checkMetaDescriptionForKeyword(htmlContent, keyword);
        expect(result.containsKeyword).toBe(false);
    });
    
    it("should fetch content when input is a URL and check for keyword", async () => {
        const keyword = "test";
        const htmlContent = "<html><head><meta name=\"description\" content=\"Testing keyword in meta description.\"></head><body><p>Test</p></body></html>";
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse(htmlContent))
        );
        const result = await checkMetaDescriptionForKeyword("https://example.com", keyword);
        expect(fetchMock).toHaveBeenCalled();
        expect(result.containsKeyword).toBe(true);
    });
    
    it("should return an error when no meta description is found", async () => {
        const keyword = "test";
        const htmlContent = "<html><head></head><body><p>Test</p></body></html>";
        const result = await checkMetaDescriptionForKeyword(htmlContent, keyword);
        expect(result.error).toContain("No meta description found");
    });
    
    it("should return an error when fetch fails", async () => {
        const keyword = "test";
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse("", { status: 500, statusText: "Internal Server Error" }))
        );
        const result = await checkMetaDescriptionForKeyword("https://example.com", keyword);
        expect(fetchMock).toHaveBeenCalled();
        expect(result.error).toContain("HTTP Error: 500 Internal Server Error");
    });
});

describe("checkBrandInMetaDescriptions (138)", () => {  // excelNr: 138
    afterEach(() => {
        vi.restoreAllMocks();
    });
    
    it("should return an empty list when the meta description contains the brand keyword", async () => {
        const keyword = "BrandName";
        const htmlContent = "<html><head><meta name=\"description\" content=\"Learn more about BrandName and its products.\"></head><body></body></html>";
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
            Promise.resolve(createFakeResponse(htmlContent))
        );
        const result = await checkBrandInMetaDescriptions("https://example.com/page1", keyword);
        expect(fetchMock).toHaveBeenCalled();
        expect(result.totalPages).toBe(1);
        expect(result.notIncludedUrls).toEqual([]);
        expect(result.keyword).toBe(keyword);
    });
    
    it("should include the URL when the meta description does not contain the brand keyword", async () => {
        const keyword = "BrandName";
        const htmlContent = "<html><head><meta name=\"description\" content=\"Learn more about our services.\"></head><body></body></html>";
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
            Promise.resolve(createFakeResponse(htmlContent))
        );
        const url = "https://example.com/page2";
        const result = await checkBrandInMetaDescriptions(url, keyword);
        expect(fetchMock).toHaveBeenCalled();
        expect(result.totalPages).toBe(1);
        expect(result.notIncludedUrls).toEqual([url]);
        expect(result.keyword).toBe(keyword);
    });
    
    it("should correctly process multiple URLs with mixed meta descriptions", async () => {
        const keyword = "BrandName";
        const pages: { [key: string]: string } = {
            "https://example.com/page1": "<html><head><meta name=\"description\" content=\"BrandName is leading the market.\"></head><body></body></html>",
            "https://example.com/page2": "<html><head><meta name=\"description\" content=\"Our services are top notch.\"></head><body></body></html>",
            "https://example.com/page3": "<html><head><meta name=\"description\" content=\"Discover more about BrandName innovations.\"></head><body></body></html>"
        };
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((url: string) => {
            if (pages[url]) {
                return Promise.resolve(createFakeResponse(pages[url]));
            }
            return Promise.resolve(createFakeResponse("", { status: 404, statusText: "Not Found" }));
        });
        const urls = Object.keys(pages);
        const result = await checkBrandInMetaDescriptions(urls, keyword);
        expect(fetchMock).toHaveBeenCalledTimes(urls.length);
        expect(result.totalPages).toBe(urls.length);
        // Only page2 does not include the brand keyword
        expect(result.notIncludedUrls).toEqual(["https://example.com/page2"]);
        expect(result.keyword).toBe(keyword);
    });
    
    it("should handle fetch errors by including the URL in the result", async () => {
        const keyword = "BrandName";
        const url = "https://example.com/page4";
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
            Promise.resolve(createFakeResponse("", { status: 500, statusText: "Internal Server Error" }))
        );
        const result = await checkBrandInMetaDescriptions(url, keyword);
        expect(fetchMock).toHaveBeenCalled();
        expect(result.totalPages).toBe(1);
        expect(result.notIncludedUrls).toEqual([url]);
        expect(result.keyword).toBe(keyword);
    });
});
