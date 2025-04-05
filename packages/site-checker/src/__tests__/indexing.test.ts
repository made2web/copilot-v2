import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { checkSiteSERPAppearance, checkHomepageRanking, checkFaviconAppearance, checkTestSubdomainIndexation } from "../indexing";

function createFakeResponse(body: string, init?: ResponseInit): Response {
    return new Response(body, init);
}

describe("checkSiteSERPAppearance (3)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return isIndexed true when site appears in SERP", async () => {
        const htmlContent = "<html><body>Some search results content without no index message.</body></html>";
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse(htmlContent, { status: 200 })) as Promise<Response>
        );
        const result = await checkSiteSERPAppearance("https://example.com");
        expect(result.isIndexed).toBe(true);
        expect(result.resultSummary).toBe("Site appears to be indexed in Google SERP.");
        fetchMock.mockRestore();
    });

    it("should return isIndexed false when site is not indexed", async () => {
        const htmlContent = "<html><body>Your search - site:example.com - did not match any documents.</body></html>";
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse(htmlContent, { status: 200 })) as Promise<Response>
        );
        const result = await checkSiteSERPAppearance("https://example.com");
        expect(result.isIndexed).toBe(false);
        expect(result.resultSummary).toBe("Site not indexed in Google SERP.");
        fetchMock.mockRestore();
    });

    it("should handle fetch error gracefully", async () => {
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.reject(new Error("Network error"))
        );
        const result = await checkSiteSERPAppearance("https://example.com");
        expect(result.isIndexed).toBe(false);
        expect(result.error).toBe("Network error");
        fetchMock.mockRestore();
    });
});

describe("checkHomepageRanking (4)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return isRankedFirst true when homepage is the first link in search results", async () => {
        const htmlContent = '<html><body>' +
            '<a href=\"https://example.com\">Home</a>' +
            '<a href=\"https://example.com/about\">About</a>' +
            '</body></html>';
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse(htmlContent, { status: 200 })) as Promise<Response>
        );
        const result = await checkHomepageRanking("https://example.com");
        expect(result.isRankedFirst).toBe(true);
        expect(result.resultSummary).toBe("Homepage is ranked first for the brand search.");
        fetchMock.mockRestore();
    });

    it("should return isRankedFirst false when homepage is not the first domain link in search results", async () => {
        const htmlContent = '<html><body>' +
            '<a href=\"https://notexample.com\">Other</a>' +
            '<a href=\"https://example.com\">Home</a>' +
            '</body></html>';
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse(htmlContent, { status: 200 })) as Promise<Response>
        );
        const result = await checkHomepageRanking("https://example.com");
        expect(result.isRankedFirst).toBe(false);
        expect(result.resultSummary).toBe("Homepage is not ranked first for the brand search.");
        fetchMock.mockRestore();
    });

    it("should handle fetch error gracefully in homepage ranking check", async () => {
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.reject(new Error("Network error"))
        );
        const result = await checkHomepageRanking("https://example.com");
        expect(result.isRankedFirst).toBe(false);
        expect(result.error).toBe("Network error");
        fetchMock.mockRestore();
    });
});

describe("checkFaviconAppearance (6)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return isFaviconPresent true when favicon tag is present in HTML content", async () => {
        const htmlContent = "<html><head><link rel=\"icon\" href=\"/favicon.ico\"></head><body>Content</body></html>";
        const result = await checkFaviconAppearance(htmlContent);
        expect(result.isFaviconPresent).toBe(true);
        expect(result.resultSummary).toBe("Favicon is present.");
    });

    it("should return isFaviconPresent false when favicon tag is missing in HTML content", async () => {
        const htmlContent = "<html><head></head><body>Content</body></html>";
        const result = await checkFaviconAppearance(htmlContent);
        expect(result.isFaviconPresent).toBe(false);
        expect(result.resultSummary).toBe("Favicon is not present.");
    });

    it("should return isFaviconPresent true for URL input when favicon tag is present", async () => {
        const htmlContent = "<html><head><link rel=\"shortcut icon\" href=\"/favicon.ico\"></head><body>Content</body></html>";
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse(htmlContent, { status: 200 })) as Promise<Response>
        );
        const result = await checkFaviconAppearance("https://example.com");
        expect(result.isFaviconPresent).toBe(true);
        expect(result.resultSummary).toBe("Favicon is present.");
        fetchMock.mockRestore();
    });

    it("should handle fetch error gracefully for URL input in favicon check", async () => {
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.reject(new Error("Network error"))
        );
        const result = await checkFaviconAppearance("https://example.com");
        expect(result.isFaviconPresent).toBe(false);
        expect(result.error).toBe("Network error");
        fetchMock.mockRestore();
    });
});

describe("checkTestSubdomainIndexation (5)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });
    
    it("should return isTestSubdomain true for test environment subdomain", async () => {
        const result = await checkTestSubdomainIndexation("https://staging.example.com");
        expect(result.isTestSubdomain).toBe(true);
        expect(result.recommendation).toBe("Test environment subdomain should not be indexed.");
    });
    
    it("should return isTestSubdomain false for production domain", async () => {
        const result = await checkTestSubdomainIndexation("https://example.com");
        expect(result.isTestSubdomain).toBe(false);
        expect(result.recommendation).toBe("Subdomain seems to be production-ready.");
    });
    
    it("should return error for invalid URL input", async () => {
        const result = await checkTestSubdomainIndexation("not-a-url");
        expect(result.isTestSubdomain).toBe(false);
        expect(result.recommendation).toBe("Input provided is not a valid URL.");
    });
});
