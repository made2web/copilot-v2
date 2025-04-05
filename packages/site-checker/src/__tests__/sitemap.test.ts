import { afterEach, describe, expect, it, vi } from "vitest";
import { checkSitemapXmlExistence, checkSitemapUrlsCount, checkSitemapHttpsLinks, checkSitemapIndexableUrls, checkImportantUrlsInSitemap, checkBrokenSitemapUrls, checkSitemapRedirects, validateSitemapStructure, optimizeSitemapUrls } from "../sitemap";

function createFakeResponse(body: string, init?: ResponseInit): Response {
    return new Response(body, init);
}

describe("checkSitemapXmlExistence (18)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return exists true when sitemap.xml exists using domain string", async () => {
        const xmlContent = "<xml>Sitemap config</xml>";
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse(xmlContent, { status: 200, statusText: "OK" })) as Promise<Response>
        );
        const result = await checkSitemapXmlExistence("example.com");
        expect(result.exists).toBe(true);
        fetchMock.mockRestore();
    });

    it("should return exists false when sitemap.xml does not exist", async () => {
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse("", { status: 404, statusText: "Not Found" })) as Promise<Response>
        );
        const result = await checkSitemapXmlExistence("example.com");
        expect(result.exists).toBe(false);
        fetchMock.mockRestore();
    });

    it("should handle full URL input", async () => {
        const xmlContent = "<xml>Sitemap config</xml>";
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse(xmlContent, { status: 200, statusText: "OK" })) as Promise<Response>
        );
        const result = await checkSitemapXmlExistence("https://example.com");
        expect(result.exists).toBe(true);
        fetchMock.mockRestore();
    });

    it("should return exists false and error in case of exception", async () => {
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.reject(new Error("Network error"))
        );
        const result = await checkSitemapXmlExistence("example.com");
        expect(result.exists).toBe(false);
        expect(result.error).toBe("Network error");
        fetchMock.mockRestore();
    });
});

describe("checkSitemapUrlsCount (27)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return isWithinLimit true for sitemap with less than 50k URLs using URL input", async () => {
        // Create a fake sitemap with 3 <url> tags
        const sitemapXML = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset>\n  <url><loc>https://example.com/page1</loc></url>\n  <url><loc>https://example.com/page2</loc></url>\n  <url><loc>https://example.com/page3</loc></url>\n</urlset>";
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse(sitemapXML, { status: 200, statusText: "OK" })) as Promise<Response>
        );
        const result = await checkSitemapUrlsCount("https://example.com/sitemap.xml");
        expect(result.urlCount).toBe(3);
        expect(result.isWithinLimit).toBe(true);
        fetchMock.mockRestore();
    });

    it("should return isWithinLimit true when provided sitemap content with less than 50k URLs", async () => {
        // Directly pass content with 5 <url> tags
        const sitemapXML = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset>\n" +
            "<url><loc>https://example.com/page1</loc></url>\n".repeat(5) +
            "</urlset>";
        const result = await checkSitemapUrlsCount(sitemapXML);
        expect(result.urlCount).toBe(5);
        expect(result.isWithinLimit).toBe(true);
    });

    it("should return isWithinLimit false when sitemap content has more than 50k URLs", async () => {
        // Create a sitemap content with 50001 <url> tags
        const singleUrl = "<url><loc>https://example.com/page</loc></url>\n";
        const sitemapXML = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset>\n" + singleUrl.repeat(50001) + "</urlset>";
        const result = await checkSitemapUrlsCount(sitemapXML);
        expect(result.urlCount).toBe(50001);
        expect(result.isWithinLimit).toBe(false);
    });

    it("should return error when fetch fails for URL input", async () => {
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.reject(new Error("Fetch failed"))
        );
        const result = await checkSitemapUrlsCount("https://example.com/sitemap.xml");
        expect(result.urlCount).toBe(0);
        expect(result.isWithinLimit).toBe(false);
        expect(result.error).toBe("Fetch failed");
        fetchMock.mockRestore();
    });
});

describe("checkSitemapHttpsLinks (19)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return allLinksHTTPS true when all URLs use HTTPS", async () => {
        const sitemapXML = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset>\n  <url><loc>https://example.com/page1</loc></url>\n  <url><loc>https://example.com/page2</loc></url>\n</urlset>";
        const result = await checkSitemapHttpsLinks(sitemapXML);
        expect(result.allLinksHTTPS).toBe(true);
        expect(result.totalLinks).toBe(2);
        expect(result.nonHttpsCount).toBe(0);
    });

    it("should return allLinksHTTPS false when some URLs do not use HTTPS", async () => {
        const sitemapXML = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset>\n  <url><loc>http://example.com/page1</loc></url>\n  <url><loc>https://example.com/page2</loc></url>\n</urlset>";
        const result = await checkSitemapHttpsLinks(sitemapXML);
        expect(result.allLinksHTTPS).toBe(false);
        expect(result.totalLinks).toBe(2);
        expect(result.nonHttpsCount).toBe(1);
    });

    it("should fetch sitemap content when input is a URL", async () => {
        const sitemapXML = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset>\n  <url><loc>https://example.com/page1</loc></url>\n  <url><loc>https://example.com/page2</loc></url>\n</urlset>";
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse(sitemapXML, { status: 200, statusText: "OK" })) as Promise<Response>
        );
        const result = await checkSitemapHttpsLinks("https://example.com/sitemap.xml");
        expect(result.allLinksHTTPS).toBe(true);
        expect(result.totalLinks).toBe(2);
        fetchMock.mockRestore();
    });

    it("should return error when fetch fails", async () => {
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
            Promise.reject(new Error("Fetch failed"))
        );
        const result = await checkSitemapHttpsLinks("https://example.com/sitemap.xml");
        expect(result.allLinksHTTPS).toBe(false);
        expect(result.totalLinks).toBe(0);
        expect(result.error).toBe("Fetch failed");
        fetchMock.mockRestore();
    });
});

describe("checkSitemapIndexableUrls (21)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should correctly identify non-indexable URLs from sitemap content", async () => {
        // Create a fake sitemap XML with 2 URLs
        const sitemapXML = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset>\n" +
            "<url><loc>https://example.com/page1</loc></url>\n" +
            "<url><loc>https://example.com/page2</loc></url>\n" +
            "</urlset>";
        
        // Prepare fetch mocks: first call fetch for sitemap, then for each URL
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((url: RequestInfo) => {
            if (typeof url === 'string') {
                if (url.includes('sitemap.xml')) {
                    return Promise.resolve(createFakeResponse(sitemapXML, { status: 200, statusText: "OK" })) as Promise<Response>;
                } else if (url === "https://example.com/page1") {
                    // Page1 is indexable (no meta robots noindex tag)
                    const page1HTML = "<html><head><meta name=\"robots\" content=\"index, follow\"></head><body>Content</body></html>";
                    return Promise.resolve(createFakeResponse(page1HTML, { status: 200, statusText: "OK" })) as Promise<Response>;
                } else if (url === "https://example.com/page2") {
                    // Page2 is non-indexable
                    const page2HTML = "<html><head><meta name=\"robots\" content=\"noindex, nofollow\"></head><body>Content</body></html>";
                    return Promise.resolve(createFakeResponse(page2HTML, { status: 200, statusText: "OK" })) as Promise<Response>;
                }
            }
            return Promise.reject(new Error("Unknown URL"));
        });
        
        const result = await checkSitemapIndexableUrls(sitemapXML);
        expect(result.totalUrls).toBe(2);
        expect(result.nonIndexableCount).toBe(1);
        expect(result.nonIndexableUrls).toContain("https://example.com/page2");
        fetchMock.mockRestore();
    });

    it("should treat fetch failures for individual URLs as non-indexable", async () => {
        // Sitemap with one URL
        const sitemapXML = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset>\n" +
            "<url><loc>https://example.com/page-fail</loc></url>\n" +
            "</urlset>";
        
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((url: RequestInfo) => {
            if (typeof url === 'string') {
                if (url.includes('sitemap.xml')) {
                    return Promise.resolve(createFakeResponse(sitemapXML, { status: 200, statusText: "OK" })) as Promise<Response>;
                } else if (url === "https://example.com/page-fail") {
                    return Promise.reject(new Error("Page fetch failed"));
                }
            }
            return Promise.reject(new Error("Unknown URL"));
        });
        
        const result = await checkSitemapIndexableUrls(sitemapXML);
        expect(result.totalUrls).toBe(1);
        expect(result.nonIndexableCount).toBe(1);
        expect(result.nonIndexableUrls).toContain("https://example.com/page-fail");
        fetchMock.mockRestore();
    });
});

describe("checkImportantUrlsInSitemap (20)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return no missing URLs when all important URLs are present", async () => {
        const sitemapXML = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset>\n" +
            "<url><loc>https://example.com/home</loc></url>\n" +
            "<url><loc>https://example.com/about</loc></url>\n" +
            "<url><loc>https://example.com/contact</loc></url>\n" +
            "</urlset>";
        const importantUrls = [
            "https://example.com/home",
            "https://example.com/about",
            "https://example.com/contact"
        ];
        const result = await checkImportantUrlsInSitemap(sitemapXML, importantUrls);
        expect(result.totalImportantUrls).toBe(3);
        expect(result.missingUrls.length).toBe(0);
    });

    it("should return missing URLs when some important URLs are not present", async () => {
        const sitemapXML = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset>\n" +
            "<url><loc>https://example.com/home</loc></url>\n" +
            "<url><loc>https://example.com/contact</loc></url>\n" +
            "</urlset>";
        const importantUrls = [
            "https://example.com/home",
            "https://example.com/about",
            "https://example.com/contact"
        ];
        const result = await checkImportantUrlsInSitemap(sitemapXML, importantUrls);
        expect(result.totalImportantUrls).toBe(3);
        expect(result.missingUrls).toContain("https://example.com/about");
    });

    it("should return all important URLs as missing when fetch fails", async () => {
        const importantUrls = [
            "https://example.com/home",
            "https://example.com/about"
        ];
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
            Promise.reject(new Error("Fetch failed"))
        );
        const result = await checkImportantUrlsInSitemap("https://example.com/sitemap.xml", importantUrls);
        expect(result.totalImportantUrls).toBe(2);
        expect(result.missingUrls).toEqual(importantUrls);
        fetchMock.mockRestore();
    });
});

describe("checkBrokenSitemapUrls (22)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should correctly identify broken URLs (404) from sitemap content", async () => {
        // Create a fake sitemap XML with 2 URLs, one returns 200, the other 404
        const sitemapXML = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset>\n" +
            "<url><loc>https://example.com/good</loc></url>\n" +
            "<url><loc>https://example.com/broken</loc></url>\n" +
            "</urlset>";
        
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((url: RequestInfo) => {
            if (typeof url === 'string') {
                if (url.includes('sitemap.xml')) {
                    return Promise.resolve(createFakeResponse(sitemapXML, { status: 200, statusText: "OK" })) as Promise<Response>;
                } else if (url === "https://example.com/good") {
                    return Promise.resolve(createFakeResponse("Good page content", { status: 200, statusText: "OK" })) as Promise<Response>;
                } else if (url === "https://example.com/broken") {
                    return Promise.resolve(createFakeResponse("Not Found", { status: 404, statusText: "Not Found" })) as Promise<Response>;
                }
            }
            return Promise.reject(new Error("Unknown URL"));
        });
        
        const result = await checkBrokenSitemapUrls(sitemapXML);
        expect(result.totalUrls).toBe(2);
        expect(result.brokenCount).toBe(1);
        expect(result.brokenUrls).toContain("https://example.com/broken");
        fetchMock.mockRestore();
    });

    it("should handle sitemap input as URL and identify broken URLs", async () => {
        // Fake sitemap XML accessed via URL
        const sitemapXML = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset>\n" +
            "<url><loc>https://example.com/ok</loc></url>\n" +
            "<url><loc>https://example.com/404</loc></url>\n" +
            "</urlset>";

        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((url: RequestInfo) => {
            if (typeof url === 'string') {
                if (url === "https://example.com/sitemap.xml") {
                    return Promise.resolve(createFakeResponse(sitemapXML, { status: 200, statusText: "OK" })) as Promise<Response>;
                } else if (url === "https://example.com/ok") {
                    return Promise.resolve(createFakeResponse("OK page", { status: 200, statusText: "OK" })) as Promise<Response>;
                } else if (url === "https://example.com/404") {
                    return Promise.resolve(createFakeResponse("Not Found", { status: 404, statusText: "Not Found" })) as Promise<Response>;
                }
            }
            return Promise.reject(new Error("Unknown URL"));
        });
        
        const result = await checkBrokenSitemapUrls("https://example.com/sitemap.xml");
        expect(result.totalUrls).toBe(2);
        expect(result.brokenCount).toBe(1);
        expect(result.brokenUrls).toContain("https://example.com/404");
        fetchMock.mockRestore();
    });
});

describe("checkSitemapRedirects (23)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return redirectUrls based on provided URLs list with redirection (3xx)", async () => {
        const urls = [
            "https://example.com/noredirect",
            "https://example.com/redirect"
        ];
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((url: RequestInfo) => {
            if (typeof url === 'string') {
                if (url === "https://example.com/redirect") {
                    return Promise.resolve(createFakeResponse("", { status: 301, statusText: "Moved Permanently" })) as Promise<Response>;
                } else if (url === "https://example.com/noredirect") {
                    return Promise.resolve(createFakeResponse("OK", { status: 200, statusText: "OK" })) as Promise<Response>;
                }
            }
            return Promise.reject(new Error("Unknown URL"));
        });
        const result = await checkSitemapRedirects("dummy input", urls);
        expect(result.totalUrls).toBe(2);
        expect(result.redirectCount).toBe(1);
        expect(result.redirectUrls[0].url).toBe("https://example.com/redirect");
        expect(result.redirectUrls[0].status).toBe(301);
        fetchMock.mockRestore();
    });

    it("should extract URLs from sitemap XML and identify redirections", async () => {
        const sitemapXML = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset>\n" +
            "<url><loc>https://example.com/redirect</loc></url>\n" +
            "<url><loc>https://example.com/ok</loc></url>\n" +
            "</urlset>";
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((url: RequestInfo) => {
            if (typeof url === 'string') {
                if (url.includes("sitemap.xml")) {
                    return Promise.resolve(createFakeResponse(sitemapXML, { status: 200, statusText: "OK" })) as Promise<Response>;
                } else if (url === "https://example.com/redirect") {
                    return Promise.resolve(createFakeResponse("", { status: 302, statusText: "Found" })) as Promise<Response>;
                } else if (url === "https://example.com/ok") {
                    return Promise.resolve(createFakeResponse("OK", { status: 200, statusText: "OK" })) as Promise<Response>;
                }
            }
            return Promise.reject(new Error("Unknown URL"));
        });
        const result = await checkSitemapRedirects("https://example.com/sitemap.xml");
        expect(result.totalUrls).toBe(2);
        expect(result.redirectCount).toBe(1);
        expect(result.redirectUrls[0].url).toBe("https://example.com/redirect");
        expect(result.redirectUrls[0].status).toBe(302);
        fetchMock.mockRestore();
    });
});

describe("validateSitemapStructure (26)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return valid true for a correct sitemap structure", async () => {
        const sitemapXML = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset>\n" +
            "<url><loc>https://example.com/page1</loc></url>\n" +
            "<url><loc>https://example.com/page2</loc></url>\n" +
            "</urlset>";
        const result = await validateSitemapStructure(sitemapXML);
        expect(result.valid).toBe(true);
        expect(result.totalUrls).toBe(2);
        expect(result.missingLocCount).toBe(0);
        expect(result.errors.length).toBe(0);
    });

    it("should detect missing <urlset> tag", async () => {
        const sitemapXML = "<data>Some content without urlset</data>";
        const result = await validateSitemapStructure(sitemapXML);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain("Missing <urlset> tag.");
    });

    it("should detect a <url> element missing <loc> tag", async () => {
        const sitemapXML = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset>\n" +
            "<url><loc>https://example.com/page1</loc></url>\n" +
            "<url><lastmod>2023-01-01</lastmod></url>\n" +
            "</urlset>";
        const result = await validateSitemapStructure(sitemapXML);
        expect(result.valid).toBe(false);
        expect(result.missingLocCount).toBe(1);
        expect(result.errors).toContain("A <url> element is missing a <loc> tag.");
    });
});

describe("optimizeSitemapUrls (24)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return a list of irrelevant URLs based on keywords from raw sitemap content", async () => {
        const sitemapXML = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset>\n" +
            "<url><loc>https://example.com/page1</loc></url>\n" +
            "<url><loc>https://example.com/admin/settings</loc></url>\n" +
            "<url><loc>https://example.com/login</loc></url>\n" +
            "<url><loc>https://example.com/contact</loc></url>\n" +
            "</urlset>";
        const result = await optimizeSitemapUrls(sitemapXML);
        expect(result.totalUrls).toBe(4);
        expect(result.irrelevantUrls).toContain("https://example.com/admin/settings");
        expect(result.irrelevantUrls).toContain("https://example.com/login");
    });

    it("should return empty irrelevantUrls when no URLs match irrelevant keywords", async () => {
        const sitemapXML = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset>\n" +
            "<url><loc>https://example.com/page1</loc></url>\n" +
            "<url><loc>https://example.com/about</loc></url>\n" +
            "</urlset>";
        const result = await optimizeSitemapUrls(sitemapXML);
        expect(result.totalUrls).toBe(2);
        expect(result.irrelevantUrls.length).toBe(0);
    });

    it("should fetch sitemap content from URL and then optimize", async () => {
        const sitemapXML = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset>\n" +
            "<url><loc>https://example.com/dashboard</loc></url>\n" +
            "<url><loc>https://example.com/page1</loc></url>\n" +
            "</urlset>";
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
            Promise.resolve(createFakeResponse(sitemapXML, { status: 200, statusText: "OK" })) as Promise<Response>
        );
        const result = await optimizeSitemapUrls("https://example.com/sitemap.xml");
        expect(result.totalUrls).toBe(2);
        expect(result.irrelevantUrls).toContain("https://example.com/dashboard");
        fetchMock.mockRestore();
    });
});
