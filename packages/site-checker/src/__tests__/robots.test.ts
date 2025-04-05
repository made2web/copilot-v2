import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { checkRobotsBlockingIndexedUrls, RobotsBlockingIndexedUrlsResult, checkRobotsBlockingJsFiles, RobotsBlockingJsFilesResult, checkRobotsBlockingSpecifiedPath, RobotsBlockingSpecifiedPathResult, checkRobotsMentionsSitemap, RobotsSitemapMentionResult, checkRobotsTxtExists, RobotsTxtExistsResult } from "../robots";

// Helper function to create fake Response for fetch mocking
function createFakeResponse(body: string, init?: ResponseInit): Response {
    return new Response(body, init);
}

describe("checkRobotsBlockingIndexedUrls (8)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return true when robots.txt has 'Disallow: /' for User-agent: * using direct content input", async () => {
        const robotsContent = "User-agent: *\nDisallow: /\n";

        const result: RobotsBlockingIndexedUrlsResult = await checkRobotsBlockingIndexedUrls(robotsContent);
        expect(result.isBlockingIndexedUrls).toBe(true);
        expect(result.disallowDirectives).toContain("/");
    });

    it("should return false when robots.txt does not block all URLs for User-agent: * using direct content input", async () => {
        const robotsContent = "User-agent: *\nDisallow: /private\n";

        const result: RobotsBlockingIndexedUrlsResult = await checkRobotsBlockingIndexedUrls(robotsContent);
        expect(result.isBlockingIndexedUrls).toBe(false);
        expect(result.disallowDirectives).toContain("/private");
    });

    it("should fetch content when input is a URL and correctly parse the robots.txt content", async () => {
        const robotsContent = "User-agent: *\nDisallow: /\n";
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
            Promise.resolve(createFakeResponse(robotsContent, { status: 200 }))
        );

        const url = "https://example.com/robots.txt";
        const result: RobotsBlockingIndexedUrlsResult = await checkRobotsBlockingIndexedUrls(url);
        expect(fetchMock).toHaveBeenCalledWith(url);
        expect(result.isBlockingIndexedUrls).toBe(true);
        expect(result.disallowDirectives).toContain("/");
    });

    it("should return an error when fetch fails", async () => {
        const errorMessage = "Network Error";
        vi.spyOn(globalThis, 'fetch').mockImplementation(() => Promise.reject(new Error(errorMessage)));

        const url = "https://example.com/robots.txt";
        const result: RobotsBlockingIndexedUrlsResult = await checkRobotsBlockingIndexedUrls(url);
        expect(result.isBlockingIndexedUrls).toBe(false);
        expect(result.error).toBe(errorMessage);
    });
});

describe("checkRobotsBlockingJsFiles (9)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return true when agents have a Disallow directive blocking JS files using direct content input", async () => {
        const robotsContent = "User-agent: *\nDisallow: /assets/js/\n";
        const result: RobotsBlockingJsFilesResult = await checkRobotsBlockingJsFiles(robotsContent);
        expect(result.isBlockingJs).toBe(true);
        expect(result.jsDirectives).toContain("/assets/js/");
    });

    it("should return false when no JS blocking directive is present for User-agent: *", async () => {
        const robotsContent = "User-agent: *\nDisallow: /private\n";
        const result: RobotsBlockingJsFilesResult = await checkRobotsBlockingJsFiles(robotsContent);
        expect(result.isBlockingJs).toBe(false);
        expect(result.jsDirectives).toHaveLength(0);
    });

    it("should fetch content when input is a URL and correctly parse JS blocking directives", async () => {
        const robotsContent = "User-agent: *\nDisallow: /js/\n";
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
            Promise.resolve(createFakeResponse(robotsContent, { status: 200 }))
        );
        const url = "https://example.com/robots.txt";
        const result: RobotsBlockingJsFilesResult = await checkRobotsBlockingJsFiles(url);
        expect(fetchMock).toHaveBeenCalledWith(url);
        expect(result.isBlockingJs).toBe(true);
        expect(result.jsDirectives).toContain("/js/");
    });

    it("should return an error when fetch fails for JS check", async () => {
        const errorMessage = "Fetch failed";
        vi.spyOn(globalThis, 'fetch').mockImplementation(() => Promise.reject(new Error(errorMessage)));
        const url = "https://example.com/robots.txt";
        const result: RobotsBlockingJsFilesResult = await checkRobotsBlockingJsFiles(url);
        expect(result.isBlockingJs).toBe(false);
        expect(result.error).toBe(errorMessage);
    });
});

describe("checkRobotsBlockingSpecifiedPath (10)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return true when robots.txt has a Disallow directive exactly matching the specified path using direct content input", async () => {
        const robotsContent = "User-agent: *\nDisallow: /admin\nDisallow: /private\n";
        const pathToCheck = "/admin";
        const result: RobotsBlockingSpecifiedPathResult = await checkRobotsBlockingSpecifiedPath(robotsContent, pathToCheck);
        expect(result.isBlockingPath).toBe(true);
        expect(result.matchedDirective).toBe(pathToCheck);
    });

    it("should return false when the specified path is not blocked in the robots.txt content", async () => {
        const robotsContent = "User-agent: *\nDisallow: /private\n";
        const pathToCheck = "/admin";
        const result: RobotsBlockingSpecifiedPathResult = await checkRobotsBlockingSpecifiedPath(robotsContent, pathToCheck);
        expect(result.isBlockingPath).toBe(false);
        expect(result.matchedDirective).toBeUndefined();
    });

    it("should fetch content when input is a URL and correctly detect the specified disallow directive", async () => {
        const robotsContent = "User-agent: *\nDisallow: /admin\n";
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
            Promise.resolve(createFakeResponse(robotsContent, { status: 200 }))
        );
        const url = "https://example.com/robots.txt";
        const pathToCheck = "/admin";
        const result: RobotsBlockingSpecifiedPathResult = await checkRobotsBlockingSpecifiedPath(url, pathToCheck);
        expect(fetchMock).toHaveBeenCalledWith(url);
        expect(result.isBlockingPath).toBe(true);
        expect(result.matchedDirective).toBe(pathToCheck);
    });

    it("should return an error when fetch fails for the specified path check", async () => {
        const errorMessage = "Network Error";
        vi.spyOn(globalThis, 'fetch').mockImplementation(() => Promise.reject(new Error(errorMessage)));
        const url = "https://example.com/robots.txt";
        const pathToCheck = "/admin";
        const result: RobotsBlockingSpecifiedPathResult = await checkRobotsBlockingSpecifiedPath(url, pathToCheck);
        expect(result.isBlockingPath).toBe(false);
        expect(result.error).toBe(errorMessage);
    });
});

describe("checkRobotsMentionsSitemap (11)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return true and extract sitemap URL when robots.txt content mentions sitemap using direct content input", async () => {
        const robotsContent = "User-agent: *\nSitemap: https://example.com/sitemap.xml\nDisallow: /";
        const result: RobotsSitemapMentionResult = await checkRobotsMentionsSitemap(robotsContent);
        expect(result.mentionsSitemap).toBe(true);
        expect(result.sitemaps).toContain("https://example.com/sitemap.xml");
    });

    it("should return false when robots.txt content does not mention sitemap", async () => {
        const robotsContent = "User-agent: *\nDisallow: /private";
        const result: RobotsSitemapMentionResult = await checkRobotsMentionsSitemap(robotsContent);
        expect(result.mentionsSitemap).toBe(false);
        expect(result.sitemaps).toHaveLength(0);
    });

    it("should fetch content when input is a URL and correctly detect sitemap directive", async () => {
        const robotsContent = "User-agent: *\nSitemap: https://example.com/sitemap.xml\n";
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
            Promise.resolve(createFakeResponse(robotsContent, { status: 200 }))
        );
        const url = "https://example.com/robots.txt";
        const result: RobotsSitemapMentionResult = await checkRobotsMentionsSitemap(url);
        expect(fetchMock).toHaveBeenCalledWith(url);
        expect(result.mentionsSitemap).toBe(true);
        expect(result.sitemaps).toContain("https://example.com/sitemap.xml");
    });

    it("should return an error when fetching content fails", async () => {
        const errorMessage = "Network Error";
        vi.spyOn(globalThis, 'fetch').mockImplementation(() => Promise.reject(new Error(errorMessage)));
        const url = "https://example.com/robots.txt";
        const result: RobotsSitemapMentionResult = await checkRobotsMentionsSitemap(url);
        expect(result.mentionsSitemap).toBe(false);
        expect(result.error).toBe(errorMessage);
    });
});

describe("checkRobotsTxtExists (7)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return true when robots.txt exists and returns status 200", async () => {
        const fakeResponse = createFakeResponse("User-agent: *", { status: 200 });
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => Promise.resolve(fakeResponse));
        const domain = "example.com";
        const result: RobotsTxtExistsResult = await checkRobotsTxtExists(domain);
        expect(fetchMock).toHaveBeenCalledWith("https://example.com/robots.txt");
        expect(result.exists).toBe(true);
    });

    it("should return false when robots.txt does not exist (404)", async () => {
        const fakeResponse = createFakeResponse("Not Found", { status: 404 });
        vi.spyOn(globalThis, 'fetch').mockImplementation(() => Promise.resolve(fakeResponse));
        const domain = "example.org";
        const result: RobotsTxtExistsResult = await checkRobotsTxtExists(domain);
        expect(result.exists).toBe(false);
    });

    it("should return error when fetch fails", async () => {
        const errorMessage = "Network error";
        vi.spyOn(globalThis, 'fetch').mockImplementation(() => Promise.reject(new Error(errorMessage)));
        const domain = "example.net";
        const result: RobotsTxtExistsResult = await checkRobotsTxtExists(domain);
        expect(result.exists).toBe(false);
        expect(result.error).toBe(errorMessage);
    });
});
