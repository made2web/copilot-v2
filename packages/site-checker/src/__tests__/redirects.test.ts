import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { checkWWWAvailability, WWWAvailabilityCheckResult, checkURLsFor302, URLs302CheckResult } from "../redirects";

// Helper function to create a fake Response
function createFakeResponse(body: string, init?: ResponseInit): Response {
    return new Response(body, init);
}

describe("checkWWWAvailability (38)", () => {
    let fetchMock: ReturnType<typeof vi.spyOn>;

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return true for both non-www and www when both are accessible", async () => {
        const nonWwwResponse = createFakeResponse('<html>Non-WWW OK</html>', { status: 200 });
        const wwwResponse = createFakeResponse('<html>WWW OK</html>', { status: 200 });

        let callCount = 0;
        fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((input: RequestInfo, init?: RequestInit): Promise<Response> => {
            callCount++;
            if (typeof input === 'string') {
                if (input.startsWith('https://www.')) {
                    return Promise.resolve(wwwResponse);
                } else if (input.startsWith('https://')) {
                    return Promise.resolve(nonWwwResponse);
                }
            }
            return Promise.reject(new Error("Unexpected fetch call"));
        });

        const result: WWWAvailabilityCheckResult = await checkWWWAvailability('example.com');
        expect(result.nonWwwAccessible).toBe(true);
        expect(result.wwwAccessible).toBe(true);
    });

    it("should return false for www when fetch for www fails", async () => {
        const nonWwwResponse = createFakeResponse('<html>Non-WWW OK</html>', { status: 200 });

        fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((input: RequestInfo, init?: RequestInit): Promise<Response> => {
            if (typeof input === 'string') {
                if (input.startsWith('https://www.')) {
                    return Promise.reject(new Error("WWW fetch failed"));
                } else if (input.startsWith('https://')) {
                    return Promise.resolve(nonWwwResponse);
                }
            }
            return Promise.reject(new Error("Unexpected fetch call"));
        });

        const result: WWWAvailabilityCheckResult = await checkWWWAvailability('example.com');
        expect(result.nonWwwAccessible).toBe(true);
        expect(result.wwwAccessible).toBe(false);
    });

    it("should return false for non-www when fetch for non-www fails", async () => {
        const wwwResponse = createFakeResponse('<html>WWW OK</html>', { status: 200 });

        fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((input: RequestInfo, init?: RequestInit): Promise<Response> => {
            if (typeof input === 'string') {
                if (input.startsWith('https://www.')) {
                    return Promise.resolve(wwwResponse);
                } else if (input.startsWith('https://')) {
                    return Promise.reject(new Error("Non-WWW fetch failed"));
                }
            }
            return Promise.reject(new Error("Unexpected fetch call"));
        });

        const result: WWWAvailabilityCheckResult = await checkWWWAvailability('example.com');
        expect(result.nonWwwAccessible).toBe(false);
        expect(result.wwwAccessible).toBe(true);
    });

    it("should return false for both when both fetch calls fail", async () => {
        fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => {
            return Promise.reject(new Error("Network error"));
        });

        const result: WWWAvailabilityCheckResult = await checkWWWAvailability('example.com');
        expect(result.nonWwwAccessible).toBe(false);
        expect(result.wwwAccessible).toBe(false);
    });
});

describe("checkURLsFor302 (34)", () => {
    let fetchMock: ReturnType<typeof vi.spyOn>;

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return only URLs with status 302", async () => {
        const url302 = 'https://example-302.com';
        const url200 = 'https://example-ok.com';
        const urlError = 'https://example-fail.com';

        fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((input: RequestInfo, init?: RequestInit): Promise<Response> => {
            if (typeof input === 'string') {
                if (input === url302) {
                    return Promise.resolve(createFakeResponse('', { status: 302 }));
                } else if (input === url200) {
                    return Promise.resolve(createFakeResponse('', { status: 200 }));
                } else if (input === urlError) {
                    return Promise.reject(new Error("Fetch error"));
                }
            }
            return Promise.reject(new Error("Unexpected fetch call"));
        });

        const inputs = [url302, url200, urlError];
        const result: URLs302CheckResult = await checkURLsFor302(inputs);
        expect(result.urlsWith302).toEqual([url302]);
    });

    it("should return an empty array when no URL returns 302", async () => {
        const url200 = 'https://example-ok.com';
        const url404 = 'https://example-404.com';

        fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((input: RequestInfo, init?: RequestInit): Promise<Response> => {
            if (typeof input === 'string') {
                if (input === url200) {
                    return Promise.resolve(createFakeResponse('', { status: 200 }));
                } else if (input === url404) {
                    return Promise.resolve(createFakeResponse('', { status: 404 }));
                }
            }
            return Promise.reject(new Error("Unexpected fetch call"));
        });

        const inputs = [url200, url404];
        const result: URLs302CheckResult = await checkURLsFor302(inputs);
        expect(result.urlsWith302).toEqual([]);
    });

    it("should handle an empty input list", async () => {
        const result: URLs302CheckResult = await checkURLsFor302([]);
        expect(result.urlsWith302).toEqual([]);
    });
});

// NEW TESTS
import { checkJavascriptRedirectPatterns, JSRedirectCheckResult, check404StandardRedirect, Standard404RedirectCheckResult } from "../redirects";

describe("checkJavascriptRedirectPatterns (35)", () => {
    let fetchMock: ReturnType<typeof vi.spyOn>;

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should detect JS redirect in URL content", async () => {
        const jsHtml = '<html><head><script>window.location = "https://example.com"</script></head></html>';
        fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((input: RequestInfo, init?: RequestInit): Promise<Response> => {
            return Promise.resolve(createFakeResponse(jsHtml, { status: 200 }));
        });
        const result: JSRedirectCheckResult = await checkJavascriptRedirectPatterns("https://test.com");
        expect(result.redirectedURLs).toEqual(["https://test.com"]);
    });

    it("should return empty array if no JS redirect found", async () => {
        const normalHtml = '<html><head><script>console.log("No redirect")</script></head></html>';
        fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((input: RequestInfo, init?: RequestInit): Promise<Response> => {
            return Promise.resolve(createFakeResponse(normalHtml, { status: 200 }));
        });
        const result: JSRedirectCheckResult = await checkJavascriptRedirectPatterns("https://test2.com");
        expect(result.redirectedURLs).toEqual([]);
    });

    it("should handle direct HTML input", async () => {
        const diffHtml = '<html><body><script>location.replace("https://redirect.com")</script></body></html>';
        const result: JSRedirectCheckResult = await checkJavascriptRedirectPatterns(diffHtml);
        expect(result.redirectedURLs).toEqual([]);
    });

    it("should handle an array of URLs", async () => {
        const jsHtml = '<html><script>document.location.href="https://site.com"</script></html>';
        const noJsHtml = '<html><body>No redirect script</body></html>';
        fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((input: RequestInfo, init?: RequestInit): Promise<Response> => {
            if (typeof input === 'string') {
                if (input === "https://a.com") {
                    return Promise.resolve(createFakeResponse(jsHtml, { status: 200 }));
                } else if (input === "https://b.com") {
                    return Promise.resolve(createFakeResponse(noJsHtml, { status: 200 }));
                }
            }
            return Promise.reject(new Error("Unexpected fetch call"));
        });
        const result: JSRedirectCheckResult = await checkJavascriptRedirectPatterns(["https://a.com", "https://b.com"]);
        expect(result.redirectedURLs).toEqual(["https://a.com"]);
    });
});

describe("check404StandardRedirect (36)", () => {
    let fetchMock: ReturnType<typeof vi.spyOn>;

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return standardRedirect true when all invalid URLs redirect to the same location", async () => {
        const redirectLocation = "https://example.com/404";
        fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((input: RequestInfo, init?: RequestInit): Promise<Response> => {
            if (typeof input === 'string') {
                if (input === "https://example.com/nonexistentpage12345" || input === "https://example.com/thispagedoesnotexist") {
                    return Promise.resolve(createFakeResponse('', { status: 302, headers: { "location": redirectLocation } }));
                }
            }
            return Promise.reject(new Error("Unexpected fetch call"));
        });
        const result: Standard404RedirectCheckResult = await check404StandardRedirect("example.com");
        expect(result.standardRedirect).toBe(true);
        expect(result.redirectURL).toBe(redirectLocation);
    });

    it("should return standardRedirect false when one invalid URL does not redirect", async () => {
        fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((input: RequestInfo, init?: RequestInit): Promise<Response> => {
            if (typeof input === 'string') {
                if (input === "https://example.com/nonexistentpage12345") {
                    return Promise.resolve(createFakeResponse('', { status: 302, headers: { "location": "https://example.com/404" } }));
                } else if (input === "https://example.com/thispagedoesnotexist") {
                    return Promise.resolve(createFakeResponse('', { status: 404 }));
                }
            }
            return Promise.reject(new Error("Unexpected fetch call"));
        });
        const result: Standard404RedirectCheckResult = await check404StandardRedirect("example.com");
        expect(result.standardRedirect).toBe(false);
    });

    it("should return standardRedirect false when invalid URLs redirect to different locations", async () => {
        fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((input: RequestInfo, init?: RequestInit): Promise<Response> => {
            if (typeof input === 'string') {
                if (input === "https://example.com/nonexistentpage12345") {
                    return Promise.resolve(createFakeResponse('', { status: 302, headers: { "location": "https://example.com/404" } }));
                } else if (input === "https://example.com/thispagedoesnotexist") {
                    return Promise.resolve(createFakeResponse('', { status: 302, headers: { "location": "https://example.com/error" } }));
                }
            }
            return Promise.reject(new Error("Unexpected fetch call"));
        });
        const result: Standard404RedirectCheckResult = await check404StandardRedirect("example.com");
        expect(result.standardRedirect).toBe(false);
    });
});
