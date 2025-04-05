import { describe, it, expect, vi, afterEach } from "vitest";
import { checkTitleTagPresence, checkMultipleTitleTags, checkTitleTagLong, checkTitleTagShort, checkTitleTagForKeyword, checkDuplicateTitleAcrossPages } from "../title-tag";

function createFakeResponse(body: string, init?: ResponseInit): Response {
    return new Response(body, init);
}

// Existing Tests

describe("checkTitleTagPresence (128)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return exists false when no <title> tag is present", async () => {
        const htmlContent = "<html><head></head><body><h1>Content</h1></body></html>";
        const result = await checkTitleTagPresence(htmlContent);
        expect(result.exists).toBe(false);
        expect(result.empty).toBe(true);
    });

    it("should return empty true when <title> tag is present but empty", async () => {
        const htmlContent = "<html><head><title>   </title></head><body></body></html>";
        const result = await checkTitleTagPresence(htmlContent);
        expect(result.exists).toBe(true);
        expect(result.empty).toBe(true);
        expect(result.titleText).toBe("");
    });

    it("should return the title text when <title> tag is present and not empty", async () => {
        const htmlContent = "<html><head><title>Example Title</title></head><body></body></html>";
        const result = await checkTitleTagPresence(htmlContent);
        expect(result.exists).toBe(true);
        expect(result.empty).toBe(false);
        expect(result.titleText).toBe("Example Title");
    });

    it("should fetch content when input is a URL", async () => {
        const htmlContent = "<html><head><title>Fetched Title</title></head><body></body></html>";
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse(htmlContent, { status: 200, statusText: "OK" }))
        );
        const result = await checkTitleTagPresence("http://example.com");
        expect(fetchMock).toHaveBeenCalledWith("http://example.com");
        expect(result.exists).toBe(true);
        expect(result.empty).toBe(false);
        expect(result.titleText).toBe("Fetched Title");
    });
});

describe("checkMultipleTitleTags (127)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return count 0 and multipleTitleTags false when no <title> tag is present", async () => {
        const htmlContent = "<html><head></head><body><h1>No title tag here</h1></body></html>";
        const result = await checkMultipleTitleTags(htmlContent);
        expect(result.titleTagCount).toBe(0);
        expect(result.multipleTitleTags).toBe(false);
    });

    it("should return count 1 and multipleTitleTags false when one <title> tag is present", async () => {
        const htmlContent = "<html><head><title>Single Title</title></head><body></body></html>";
        const result = await checkMultipleTitleTags(htmlContent);
        expect(result.titleTagCount).toBe(1);
        expect(result.multipleTitleTags).toBe(false);
    });

    it("should return count 2 and multipleTitleTags true when two <title> tags are present", async () => {
        const htmlContent = "<html><head><title>First Title</title><title>Second Title</title></head><body></body></html>";
        const result = await checkMultipleTitleTags(htmlContent);
        expect(result.titleTagCount).toBe(2);
        expect(result.multipleTitleTags).toBe(true);
    });

    it("should fetch content when input is a URL and check for multiple title tags", async () => {
        const htmlContent = "<html><head><title>Fetched Title</title><title>Extra Title</title></head><body></body></html>";
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse(htmlContent, { status: 200, statusText: "OK" }))
        );
        const result = await checkMultipleTitleTags("http://example.com");
        expect(fetchMock).toHaveBeenCalledWith("http://example.com");
        expect(result.titleTagCount).toBe(2);
        expect(result.multipleTitleTags).toBe(true);
    });
});

describe("checkTitleTagLong (131)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return an error when no <title> tag is present", async () => {
        const htmlContent = "<html><head></head><body><h1>No title here</h1></body></html>";
        const result = await checkTitleTagLong(htmlContent);
        expect(result.error).toBe("No <title> tag found");
    });

    it("should return isLong false for a title with <= 60 characters", async () => {
        const htmlContent = "<html><head><title>Short Title</title></head><body></body></html>";
        const result = await checkTitleTagLong(htmlContent);
        expect(result.isLong).toBe(false);
        expect(result.titleText).toBe("Short Title");
        expect(result.length).toBe(11);
    });

    it("should return isLong true for a title with > 60 characters", async () => {
        const longTitle = "This is an example of a very long title that exceeds sixty characters easily";
        const htmlContent = "<html><head><title>" + longTitle + "</title></head><body></body></html>";
        const result = await checkTitleTagLong(htmlContent);
        expect(result.isLong).toBe(true);
        expect(result.titleText).toBe(longTitle);
        expect(result.length).toBe(longTitle.length);
    });

    it("should fetch content when input is a URL for long title check", async () => {
        const htmlContent = "<html><head><title>Fetched Title from URL</title></head><body></body></html>";
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse(htmlContent, { status: 200, statusText: "OK" }))
        );
        const result = await checkTitleTagLong("http://example.com");
        expect(fetchMock).toHaveBeenCalledWith("http://example.com");
        expect(result.titleText).toBe("Fetched Title from URL");
    });
});

describe("checkTitleTagShort (130)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return an error when no <title> tag is present", async () => {
        const htmlContent = "<html><head></head><body><h1>No title here</h1></body></html>";
        const result = await checkTitleTagShort(htmlContent);
        expect(result.error).toBe("No <title> tag found");
    });

    it("should return isShort true for a title with less than 30 characters", async () => {
        const htmlContent = "<html><head><title>Short</title></head><body></body></html>";
        const result = await checkTitleTagShort(htmlContent);
        expect(result.isShort).toBe(true);
        expect(result.titleText).toBe("Short");
        expect(result.length).toBe(5);
    });

    it("should return isShort false for a title with 30 or more characters", async () => {
        const longTitle = "This title is definitely longer than thirty chars";
        const htmlContent = "<html><head><title>" + longTitle + "</title></head><body></body></html>";
        const result = await checkTitleTagShort(htmlContent);
        expect(result.isShort).toBe(false);
        expect(result.titleText).toBe(longTitle);
        expect(result.length).toBe(longTitle.length);
    });

    it("should fetch content when input is a URL for short title check", async () => {
        const htmlContent = "<html><head><title>URL Short</title></head><body></body></html>";
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse(htmlContent, { status: 200, statusText: "OK" }))
        );
        const result = await checkTitleTagShort("http://example.com");
        expect(fetchMock).toHaveBeenCalledWith("http://example.com");
        expect(result.titleText).toBe("URL Short");
        expect(result.isShort).toBe(true);
    });
});

describe("checkTitleTagForKeyword (132)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return error when no <title> tag is present", async () => {
        const htmlContent = "<html><head></head><body><h1>No title tag</h1></body></html>";
        const result = await checkTitleTagForKeyword(htmlContent, "Example");
        expect(result.error).toBe("No <title> tag found");
    });

    it("should return containsKeyword true when the keyword is present in the title", async () => {
        const htmlContent = "<html><head><title>Example Title</title></head><body></body></html>";
        const result = await checkTitleTagForKeyword(htmlContent, "Example");
        expect(result.containsKeyword).toBe(true);
        expect(result.titleText).toBe("Example Title");
    });

    it("should return containsKeyword false when the keyword is not present in the title", async () => {
        const htmlContent = "<html><head><title>Another Title</title></head><body></body></html>";
        const result = await checkTitleTagForKeyword(htmlContent, "Example");
        expect(result.containsKeyword).toBe(false);
        expect(result.titleText).toBe("Another Title");
    });

    it("should fetch content when input is a URL and check the keyword in the title", async () => {
        const htmlContent = "<html><head><title>Fetched Example Title</title></head><body></body></html>";
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse(htmlContent, { status: 200, statusText: "OK" }))
        );
        const result = await checkTitleTagForKeyword("http://example.com", "Example");
        expect(fetchMock).toHaveBeenCalledWith("http://example.com");
        expect(result.containsKeyword).toBe(true);
        expect(result.titleText).toBe("Fetched Example Title");
    });
});

// New Tests for checkDuplicateTitleAcrossPages (129)

describe("checkDuplicateTitleAcrossPages (129)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return duplicate titles when multiple URLs share the same title", async () => {
        const url1 = "http://example.com/page1";
        const url2 = "http://example.com/page2";
        const url3 = "http://example.com/page3";

        // url1 and url2 will have the same title, url3 different
        const responses: Record<string, string> = {};
        responses[url1] = "<html><head><title>Duplicate Title</title></head><body></body></html>";
        responses[url2] = "<html><head><title>Duplicate Title</title></head><body></body></html>";
        responses[url3] = "<html><head><title>Unique Title</title></head><body></body></html>";

        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((input: RequestInfo) => {
            const url = input.toString();
            if (responses[url]) {
                return Promise.resolve(createFakeResponse(responses[url], { status: 200, statusText: "OK" }));
            }
            return Promise.resolve(createFakeResponse("", { status: 404, statusText: "Not Found" }));
        });

        const result = await checkDuplicateTitleAcrossPages([url1, url2, url3]);
        expect(fetchMock).toHaveBeenCalledTimes(3);
        expect(Object.keys(result.duplicateTitles).length).toBe(1);
        expect(result.duplicateTitles["Duplicate Title"]).toContain(url1);
        expect(result.duplicateTitles["Duplicate Title"]).toContain(url2);
    });

    it("should extract URLs from a domain homepage and detect duplicate titles", async () => {
        const domain = "example.com";
        const homepageHtml = "<html><body>\n<a href=\"http://example.com/pageA\">Page A</a>\n<a href=\"http://example.com/pageB\">Page B</a>\n</body></html>";
        
        const responses: Record<string, string> = {};
        // Homepage response
        responses["https://" + domain] = homepageHtml;
        // Both pages have the same title
        responses["http://example.com/pageA"] = "<html><head><title>Same Title</title></head><body></body></html>";
        responses["http://example.com/pageB"] = "<html><head><title>Same Title</title></head><body></body></html>";

        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((input: RequestInfo) => {
            const url = input.toString();
            if (responses[url]) {
                return Promise.resolve(createFakeResponse(responses[url], { status: 200, statusText: "OK" }));
            }
            return Promise.resolve(createFakeResponse("", { status: 404, statusText: "Not Found" }));
        });

        const result = await checkDuplicateTitleAcrossPages(domain);
        // Expect homepage fetch + 2 page fetches = 3 calls
        expect(fetchMock).toHaveBeenCalledTimes(3);
        expect(Object.keys(result.duplicateTitles).length).toBe(1);
        expect(result.duplicateTitles["Same Title"]).toContain("http://example.com/pageA");
        expect(result.duplicateTitles["Same Title"]).toContain("http://example.com/pageB");
    });
});
