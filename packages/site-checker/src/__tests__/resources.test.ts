import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { checkSiteActiveCache, checkGzipCompression, checkLazyLoadImages, checkAssetsMinification } from "../resources";

function createFakeResponse(body: string, init?: ResponseInit): Response {
    return new Response(body, init);
}

describe("checkSiteActiveCache (73)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return active cache when cache-control header is present and valid", async () => {
        const fakeHeaders = new Headers();
        fakeHeaders.set("cache-control", "public, max-age=3600");
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
            Promise.resolve(createFakeResponse("<html></html>", { status: 200, headers: fakeHeaders }))
        );
        const result = await checkSiteActiveCache("https://example.com");
        expect(result.hasActiveCache).toBe(true);
        expect(result.cacheControlHeader).toBe("public, max-age=3600");
        fetchMock.mockRestore();
    });

    it("should return inactive cache when cache-control header contains no-cache or no-store", async () => {
        const fakeHeaders = new Headers();
        fakeHeaders.set("cache-control", "no-cache, no-store");
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
            Promise.resolve(createFakeResponse("<html></html>", { status: 200, headers: fakeHeaders }))
        );
        const result = await checkSiteActiveCache("https://example.com");
        expect(result.hasActiveCache).toBe(false);
        expect(result.cacheControlHeader).toBe("no-cache, no-store");
        fetchMock.mockRestore();
    });

    it("should return error when input is not a valid URL", async () => {
        const result = await checkSiteActiveCache("not-a-url");
        expect(result.hasActiveCache).toBe(false);
        expect(result.error).toBe("Input is not a valid URL. Please provide a valid URL.");
    });

    it("should return error for non-200 response", async () => {
        const fakeHeaders = new Headers();
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
            Promise.resolve(createFakeResponse("<html></html>", { status: 404, statusText: "Not Found", headers: fakeHeaders }))
        );
        const result = await checkSiteActiveCache("https://example.com");
        expect(result.hasActiveCache).toBe(false);
        expect(result.error).toBe("HTTP Error: 404 Not Found");
        fetchMock.mockRestore();
    });
});

describe("checkGzipCompression (74)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return true when content-encoding header contains gzip", async () => {
        const fakeHeaders = new Headers();
        fakeHeaders.set("content-encoding", "gzip");
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
            Promise.resolve(createFakeResponse("<html></html>", { status: 200, headers: fakeHeaders }))
        );
        const result = await checkGzipCompression("https://example.com");
        expect(result.hasGzipActivated).toBe(true);
        expect(result.contentEncoding).toBe("gzip");
        fetchMock.mockRestore();
    });

    it("should return false when content-encoding header does not contain gzip", async () => {
        const fakeHeaders = new Headers();
        fakeHeaders.set("content-encoding", "deflate");
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
            Promise.resolve(createFakeResponse("<html></html>", { status: 200, headers: fakeHeaders }))
        );
        const result = await checkGzipCompression("https://example.com");
        expect(result.hasGzipActivated).toBe(false);
        expect(result.contentEncoding).toBe("deflate");
        fetchMock.mockRestore();
    });

    it("should return error when input is not a valid URL", async () => {
        const result = await checkGzipCompression("not-a-url");
        expect(result.hasGzipActivated).toBe(false);
        expect(result.error).toBe("Input is not a valid URL. Please provide a valid URL.");
    });

    it("should return error for non-200 response", async () => {
        const fakeHeaders = new Headers();
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
            Promise.resolve(createFakeResponse("<html></html>", { status: 500, statusText: "Internal Server Error", headers: fakeHeaders }))
        );
        const result = await checkGzipCompression("https://example.com");
        expect(result.hasGzipActivated).toBe(false);
        expect(result.error).toBe("HTTP Error: 500 Internal Server Error");
        fetchMock.mockRestore();
    });
});

describe("checkLazyLoadImages (77)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return correct counts when HTML content with mixed lazy images", async () => {
        const htmlContent = '<html><body><img src="image1.jpg" loading="lazy"><img src="image2.jpg"><img src="image3.jpg" loading="lazy"></body></html>';
        const result = await checkLazyLoadImages(htmlContent);
        expect(result.totalImages).toBe(3);
        expect(result.lazyLoadedImages).toBe(2);
        expect(result.allLazy).toBe(false);
    });

    it("should return allLazy true when all images have lazy loading", async () => {
        const htmlContent = '<html><body><img src="image1.jpg" loading="lazy"><img src="image2.jpg" loading="lazy"></body></html>';
        const result = await checkLazyLoadImages(htmlContent);
        expect(result.totalImages).toBe(2);
        expect(result.lazyLoadedImages).toBe(2);
        expect(result.allLazy).toBe(true);
    });

    it("should handle HTML with no images", async () => {
        const htmlContent = '<html><body><p>No images here!</p></body></html>';
        const result = await checkLazyLoadImages(htmlContent);
        expect(result.totalImages).toBe(0);
        expect(result.lazyLoadedImages).toBe(0);
        expect(result.allLazy).toBe(true);
    });

    it("should fetch content when input is a URL", async () => {
        const htmlContent = '<html><body><img src="image1.jpg" loading="lazy"></body></html>';
        const fakeHeaders = new Headers();
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
            Promise.resolve(new Response(htmlContent, { status: 200, headers: fakeHeaders }))
        );
        const result = await checkLazyLoadImages("https://example.com");
        expect(result.totalImages).toBe(1);
        expect(result.lazyLoadedImages).toBe(1);
        expect(result.allLazy).toBe(true);
        fetchMock.mockRestore();
    });
});

describe("checkAssetsMinification (75)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should analyze assets correctly when input is HTML content", async () => {
        const htmlContent = '<html><head>' +
            '<link rel="stylesheet" href="https://example.com/style.min.css">' +
            '</head><body>' +
            '<script src="https://example.com/app.js"></script>' +
            '</body></html>';
        
        // Create mocks for asset fetch requests
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((url: RequestInfo) => {
            if (typeof url === 'string') {
                if (url.includes('style.min.css')) {
                    // Return a minified CSS response (single line)
                    return Promise.resolve(createFakeResponse("body{margin:0;}", { status: 200 }));
                } else if (url.includes('app.js')) {
                    // Return a non-minified JS response (multiple lines)
                    return Promise.resolve(createFakeResponse("function test() {\n    console.log(\"hello\");\n}", { status: 200 }));
                } else if (url === "https://example.com") {
                    // For the HTML content fetch
                    return Promise.resolve(createFakeResponse(htmlContent, { status: 200 }));
                }
            }
            return Promise.resolve(createFakeResponse("", { status: 404 }));
        });

        const result = await checkAssetsMinification(htmlContent);
        expect(result.assets.length).toBe(2);
        const assetCss = result.assets.find(a => a.url.includes('style.min.css'));
        const assetJs = result.assets.find(a => a.url.includes('app.js'));
        expect(assetCss).toBeDefined();
        expect(assetCss?.hasMinSuffix).toBe(true);
        expect(assetCss?.aiAnalysis).toBe("minified");
        expect(assetJs).toBeDefined();
        expect(assetJs?.hasMinSuffix).toBe(false);
        expect(assetJs?.aiAnalysis).toBe("unminified");
        fetchMock.mockRestore();
    });

    it("should handle errors during asset fetch gracefully", async () => {
        const htmlContent = '<html><head>' +
            '<link rel="stylesheet" href="https://example.com/missing.css">' +
            '</head></html>';
        
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((url: RequestInfo) => {
            if (typeof url === 'string') {
                if (url.includes('missing.css')) {
                    return Promise.resolve(createFakeResponse("", { status: 404, statusText: "Not Found" }));
                } else if (url === "https://example.com") {
                    return Promise.resolve(createFakeResponse(htmlContent, { status: 200 }));
                }
            }
            return Promise.resolve(createFakeResponse("", { status: 404 }));
        });

        const result = await checkAssetsMinification(htmlContent);
        expect(result.assets.length).toBe(1);
        const asset = result.assets[0];
        expect(asset.error).toContain("HTTP Error: 404 Not Found");
        fetchMock.mockRestore();
    });
});
