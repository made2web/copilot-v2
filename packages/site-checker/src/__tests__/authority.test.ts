import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { checkAuthorRelTag, checkInternalLinkCount } from "../authority";

function createFakeResponse(body: string, init?: ResponseInit): Response {
    return new Response(body, init);
}

describe("checkAuthorRelTag (149)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return true if HTML contains rel=\"author\"", async () => {
        const htmlContent = "<html><body><a rel=\"author\" href=\"#\">Author</a></body></html>";
        const result = await checkAuthorRelTag(htmlContent);
        expect(result.found).toBe(true);
    });

    it("should return false if HTML does not contain rel=\"author\"", async () => {
        const htmlContent = "<html><body><p>No author info here</p></body></html>";
        const result = await checkAuthorRelTag(htmlContent);
        expect(result.found).toBe(false);
    });

    it("should fetch content if URL is provided and return true when found", async () => {
        const htmlContent = "<html><head></head><body><div rel=\"author\">Author info</div></body></html>";
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse(htmlContent, { status: 200, statusText: "OK" }))
        );
        const result = await checkAuthorRelTag("https://example.com");
        expect(fetchMock).toHaveBeenCalled();
        expect(result.found).toBe(true);
    });

    it("should fetch content if URL is provided and return false when not found", async () => {
        const htmlContent = "<html><head></head><body><div>No author info</div></body></html>";
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse(htmlContent, { status: 200, statusText: "OK" }))
        );
        const result = await checkAuthorRelTag("https://example.com");
        expect(fetchMock).toHaveBeenCalled();
        expect(result.found).toBe(false);
    });

    it("should return error if fetch fails", async () => {
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.reject(new Error("Network error"))
        );
        const result = await checkAuthorRelTag("https://example.com");
        expect(result.found).toBe(false);
        expect(result.error).toBe("Network error");
    });
});

describe("checkInternalLinkCount (148)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return true when HTML content has at least 3 internal links (relative links)", async () => {
        const htmlContent = "<html><body>"
                          + "<a href=\"/page1\">Link1</a>"
                          + "<a href=\"/page2\">Link2</a>"
                          + "<a href=\"/page3\">Link3</a>"
                          + "</body></html>";
        const result = await checkInternalLinkCount(htmlContent);
        expect(result.hasMinInternalLinks).toBe(true);
        expect(result.internalLinkCount).toBe(3);
    });

    it("should return false when HTML content has less than 3 internal links", async () => {
        const htmlContent = "<html><body>"
                          + "<a href=\"/page1\">Link1</a>"
                          + "<a href=\"/page2\">Link2</a>"
                          + "</body></html>";
        const result = await checkInternalLinkCount(htmlContent);
        expect(result.hasMinInternalLinks).toBe(false);
        expect(result.internalLinkCount).toBe(2);
    });

    it("should count absolute internal links when URL input is provided", async () => {
        const htmlContent = "<html><body>"
                          + "<a href=\"https://example.com/page1\">Link1</a>"
                          + "<a href=\"/page2\">Link2</a>"
                          + "<a href=\"https://example.com/page3\">Link3</a>"
                          + "<a href=\"https://external.com/page4\">External Link</a>"
                          + "</body></html>";
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse(htmlContent, { status: 200, statusText: "OK" }))
        );
        const result = await checkInternalLinkCount("https://example.com");
        expect(fetchMock).toHaveBeenCalled();
        // Internal links: two absolute matching example.com and one relative
        expect(result.internalLinkCount).toBe(3);
        expect(result.hasMinInternalLinks).toBe(true);
    });

    it("should return error if fetch fails when URL is provided", async () => {
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.reject(new Error("Network failure"))
        );
        const result = await checkInternalLinkCount("https://example.com");
        expect(result.hasMinInternalLinks).toBe(false);
        expect(result.internalLinkCount).toBe(0);
        expect(result.error).toBe("Network failure");
    });
});
