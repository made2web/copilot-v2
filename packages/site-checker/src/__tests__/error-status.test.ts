import { afterEach, describe, expect, it, vi } from "vitest";
import { check404NoindexNofollow, check404PageExists, verify404PageStatus, checkInternalLinks4xx, checkInternalLinks5xx } from "../error-status";

// A simple fake response creator to simulate fetch responses
function createFakeResponse(body: string, init?: ResponseInit): Response {
    return new Response(body, init);
}

// Existing tests for check404NoindexNofollow

describe("check404NoindexNofollow (41)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return metaTagPresent true if the HTML contains meta robots tag with noindex and nofollow", async () => {
        const htmlContent = "<html><head><meta name=\"robots\" content=\"noindex, nofollow\"></head><body>Not found</body></html>";
        const result = await check404NoindexNofollow(htmlContent);
        expect(result.metaTagPresent).toBe(true);
    });

    it("should return metaTagPresent false if the HTML does not contain the required meta tag", async () => {
        const htmlContent = "<html><head><meta name=\"robots\" content=\"index, follow\"></head><body>Not found</body></html>";
        const result = await check404NoindexNofollow(htmlContent);
        expect(result.metaTagPresent).toBe(false);
    });

    it("should fetch content if input is a URL and return correct metaTagPresent status", async () => {
        const htmlContent = "<html><head><meta name=\"robots\" content=\"noindex, nofollow\"></head><body>Not found</body></html>";
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse(htmlContent, { status: 200, statusText: "OK" }))
        );

        const result = await check404NoindexNofollow("https://example.com/404");
        expect(fetchMock).toHaveBeenCalled();
        expect(result.metaTagPresent).toBe(true);
    });

    it("should return error if fetch response is not ok", async () => {
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse("Not Found", { status: 404, statusText: "Not Found" }))
        );

        const result = await check404NoindexNofollow("https://example.com/404");
        expect(fetchMock).toHaveBeenCalled();
        expect(result.metaTagPresent).toBe(false);
        expect(result.error).toBe("HTTP Error: 404 Not Found");
    });
});

// Existing tests for check404PageExists

describe("check404PageExists (40)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return exists true when the fetched page returns 404", async () => {
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse("Not Found", { status: 404, statusText: "Not Found" }))
        );

        const result = await check404PageExists("https://example.com/404");
        expect(fetchMock).toHaveBeenCalled();
        expect(result.exists).toBe(true);
    });

    it("should return exists false when the fetched page does not return 404", async () => {
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse("Page OK", { status: 200, statusText: "OK" }))
        );

        const result = await check404PageExists("https://example.com/404");
        expect(fetchMock).toHaveBeenCalled();
        expect(result.exists).toBe(false);
    });

    it("should return error when fetch throws an exception", async () => {
        const errorMessage = "Network Error";
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.reject(new Error(errorMessage))
        );

        const result = await check404PageExists("https://example.com/404");
        expect(fetchMock).toHaveBeenCalled();
        expect(result.exists).toBe(false);
        expect(result.error).toBe(errorMessage);
    });

    it("should return error when input is not a valid URL", async () => {
        const result = await check404PageExists("not-a-url");
        expect(result.exists).toBe(false);
        expect(result.error).toBe("Input is not a valid URL");
    });
});

// Existing tests for verify404PageStatus

describe("verify404PageStatus (42)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return is404 true when the fetched page returns 404", async () => {
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse("Not Found", { status: 404, statusText: "Not Found" }))
        );
        
        const result = await verify404PageStatus("https://example.com/404");
        expect(fetchMock).toHaveBeenCalled();
        expect(result.is404).toBe(true);
    });

    it("should return is404 false when the fetched page does not return 404", async () => {
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse("Page OK", { status: 200, statusText: "OK" }))
        );
        
        const result = await verify404PageStatus("https://example.com/404");
        expect(fetchMock).toHaveBeenCalled();
        expect(result.is404).toBe(false);
    });

    it("should return error when fetch throws an exception", async () => {
        const errorMessage = "Network Error";
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.reject(new Error(errorMessage))
        );
        
        const result = await verify404PageStatus("https://example.com/404");
        expect(fetchMock).toHaveBeenCalled();
        expect(result.is404).toBe(false);
        expect(result.error).toBe(errorMessage);
    });

    it("should return error when input is not a valid URL", async () => {
        const result = await verify404PageStatus("not-a-url");
        expect(result.is404).toBe(false);
        expect(result.error).toBe("Input is not a valid URL");
    });
});

// Existing tests for checkInternalLinks4xx

describe("checkInternalLinks4xx (39)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return only URLs with 4xx status when input is a list", async () => {
        const urls = ["https://example.com/page1", "https://example.com/page2"];
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((input: RequestInfo, init?: RequestInit) => {
            if (typeof input === "string") {
                if (init && init.method === "HEAD") {
                    if (input === "https://example.com/page1") {
                        return Promise.resolve(createFakeResponse("", { status: 200, statusText: "OK" }));
                    }
                    if (input === "https://example.com/page2") {
                        return Promise.resolve(createFakeResponse("", { status: 404, statusText: "Not Found" }));
                    }
                }
            }
            return Promise.resolve(createFakeResponse("", { status: 200, statusText: "OK" }));
        }) as unknown as () => Promise<Response>;
        const result = await checkInternalLinks4xx(urls);
        expect(fetchMock).toHaveBeenCalled();
        expect(result.links).toEqual(["https://example.com/page2"]);
    });

    it("should fetch sitemap.xml and return only URLs with 4xx status when input is a domain URL", async () => {
        const sitemapXml = "<urlset><url><loc>https://example.com/page1</loc></url><url><loc>https://example.com/page2</loc></url></urlset>";
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((input: RequestInfo, init?: RequestInit) => {
            if (typeof input === "string") {
                if (input.includes("sitemap.xml")) {
                    return Promise.resolve(createFakeResponse(sitemapXml, { status: 200, statusText: "OK" }));
                }
                if (init && init.method === "HEAD") {
                    if (input === "https://example.com/page1") {
                        return Promise.resolve(createFakeResponse("", { status: 404, statusText: "Not Found" }));
                    }
                    if (input === "https://example.com/page2") {
                        return Promise.resolve(createFakeResponse("", { status: 200, statusText: "OK" }));
                    }
                }
            }
            return Promise.resolve(createFakeResponse("", { status: 200, statusText: "OK" }));
        }) as unknown as () => Promise<Response>;
        const result = await checkInternalLinks4xx("example.com");
        expect(fetchMock).toHaveBeenCalled();
        expect(result.links).toEqual(["https://example.com/page1"]);
    });
});

// New tests for checkInternalLinks5xx (43)

describe("checkInternalLinks5xx (43)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return only URLs with 5xx status when input is a list", async () => {
        const urls = ["https://example.com/page1", "https://example.com/page2"];
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((input: RequestInfo, init?: RequestInit) => {
            if (typeof input === "string" && init && init.method === "HEAD") {
                if (input === "https://example.com/page1") {
                    return Promise.resolve(createFakeResponse("", { status: 500, statusText: "Internal Server Error" }));
                }
                if (input === "https://example.com/page2") {
                    return Promise.resolve(createFakeResponse("", { status: 200, statusText: "OK" }));
                }
            }
            return Promise.resolve(createFakeResponse("", { status: 200, statusText: "OK" }));
        }) as unknown as () => Promise<Response>;
        const result = await checkInternalLinks5xx(urls);
        expect(fetchMock).toHaveBeenCalled();
        expect(result.links).toEqual(["https://example.com/page1"]);
    });

    it("should fetch sitemap.xml and return only URLs with 5xx status when input is a domain URL", async () => {
        const sitemapXml = "<urlset><url><loc>https://example.com/page1</loc></url><url><loc>https://example.com/page2</loc></url></urlset>";
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((input: RequestInfo, init?: RequestInit) => {
            if (typeof input === "string") {
                if (input.includes("sitemap.xml")) {
                    return Promise.resolve(createFakeResponse(sitemapXml, { status: 200, statusText: "OK" }));
                }
                if (init && init.method === "HEAD") {
                    if (input === "https://example.com/page1") {
                        return Promise.resolve(createFakeResponse("", { status: 502, statusText: "Bad Gateway" }));
                    }
                    if (input === "https://example.com/page2") {
                        return Promise.resolve(createFakeResponse("", { status: 200, statusText: "OK" }));
                    }
                }
            }
            return Promise.resolve(createFakeResponse("", { status: 200, statusText: "OK" }));
        }) as unknown as () => Promise<Response>;
        const result = await checkInternalLinks5xx("example.com");
        expect(fetchMock).toHaveBeenCalled();
        expect(result.links).toEqual(["https://example.com/page1"]);
    });
});
