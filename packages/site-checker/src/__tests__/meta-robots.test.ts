import { describe, it, expect, vi } from "vitest";
import { checkMetaRobots, checkIfMetaRobotsExists, checkUniqueMetaRobots, checkPaginationFollow, checkThankYouPageNoindex, checkPageIndexFollow } from "../meta-robots";

// Helper to create a fake Response
function createFakeResponse(body: string, init?: ResponseInit): Response {
    return new Response(body, init);
}

describe("checkMetaRobots (12)", () => {
    it("should detect noindex in HTML content", async () => {
        const html = "<html><head><meta name=\"robots\" content=\"noindex, nofollow\"></head><body></body></html>";
        const result = await checkMetaRobots(html);
        expect(result.metaNoindexFound).toBe(true);
    });

    it("should not detect noindex when not present", async () => {
        const html = "<html><head><meta name=\"robots\" content=\"index, follow\"></head><body></body></html>";
        const result = await checkMetaRobots(html);
        expect(result.metaNoindexFound).toBe(false);
    });

    it("should detect noindex from URL content", async () => {
        const html = "<html><head><meta name=\"robots\" content=\"noindex\"></head><body></body></html>";
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse(html))
        );
        const result = await checkMetaRobots("http://example.com");
        expect(result.metaNoindexFound).toBe(true);
        fetchMock.mockRestore();
    });

    it("should return error on fetch failure", async () => {
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse("", { status: 500, statusText: "Internal Server Error" }))
        );
        const result = await checkMetaRobots("http://example.com");
        expect(result.error).toContain("HTTP Error");
        fetchMock.mockRestore();
    });
});

describe("checkIfMetaRobotsExists (13)", () => {
    it("should detect the existence of meta robots tag in HTML content", async () => {
        const html = "<html><head><meta name=\"robots\" content=\"index, follow\"></head><body></body></html>";
        const result = await checkIfMetaRobotsExists(html);
        expect(result.metaTagFound).toBe(true);
    });

    it("should return false if meta robots tag does not exist in HTML content", async () => {
        const html = "<html><head><title>Test page</title></head><body></body></html>";
        const result = await checkIfMetaRobotsExists(html);
        expect(result.metaTagFound).toBe(false);
    });

    it("should detect meta robots tag from URL content", async () => {
        const html = "<html><head><meta name=\"robots\" content=\"noindex\"></head><body></body></html>";
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
            Promise.resolve(createFakeResponse(html))
        );
        const result = await checkIfMetaRobotsExists("http://example.com");
        expect(result.metaTagFound).toBe(true);
        fetchMock.mockRestore();
    });

    it("should return error on fetch failure", async () => {
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
            Promise.resolve(createFakeResponse("", { status: 404, statusText: "Not Found" }))
        );
        const result = await checkIfMetaRobotsExists("http://example.com");
        expect(result.error).toContain("HTTP Error");
        fetchMock.mockRestore();
    });
});

describe("checkUniqueMetaRobots (14)", () => {
    it("should return unique true when exactly one meta robots tag is present in HTML content", async () => {
        const html = "<html><head><meta name=\"robots\" content=\"noindex\"></head><body></body></html>";
        const result = await checkUniqueMetaRobots(html);
        expect(result.unique).toBe(true);
        expect(result.count).toBe(1);
    });

    it("should return unique false when multiple meta robots tags are present", async () => {
        const html = "<html><head>" +
                     "<meta name=\"robots\" content=\"noindex\">" +
                     "<meta name=\"robots\" content=\"index,follow\">" +
                     "</head><body></body></html>";
        const result = await checkUniqueMetaRobots(html);
        expect(result.unique).toBe(false);
        expect(result.count).toBe(2);
    });

    it("should return unique false when no meta robots tag is present", async () => {
        const html = "<html><head><title>No robots meta</title></head><body></body></html>";
        const result = await checkUniqueMetaRobots(html);
        expect(result.unique).toBe(false);
        expect(result.count).toBe(0);
    });

    it("should return unique true from URL content", async () => {
        const html = "<html><head><meta name=\"robots\" content=\"noindex\"></head><body></body></html>";
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
            Promise.resolve(createFakeResponse(html))
        );
        const result = await checkUniqueMetaRobots("http://example.com");
        expect(result.unique).toBe(true);
        expect(result.count).toBe(1);
        fetchMock.mockRestore();
    });

    it("should return error on URL fetch failure", async () => {
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
            Promise.resolve(createFakeResponse("", { status: 500, statusText: "Internal Server Error" }))
        );
        const result = await checkUniqueMetaRobots("http://example.com");
        expect(result.error).toContain("HTTP Error");
        fetchMock.mockRestore();
    });
});

describe("checkPaginationFollow (16)", () => {
    it("should return true when meta robots tag has follow directive", async () => {
        const html = "<html><head><meta name=\"robots\" content=\"index, follow\"></head><body></body></html>";
        const result = await checkPaginationFollow(html);
        expect(result.follow).toBe(true);
    });

    it("should return false when meta robots tag has nofollow directive", async () => {
        const html = "<html><head><meta name=\"robots\" content=\"noindex, nofollow\"></head><body></body></html>";
        const result = await checkPaginationFollow(html);
        expect(result.follow).toBe(false);
    });

    it("should default to true when meta robots tag is absent", async () => {
        const html = "<html><head><title>Test page</title></head><body></body></html>";
        const result = await checkPaginationFollow(html);
        expect(result.follow).toBe(true);
    });

    it("should check follow status from URL content", async () => {
        const html = "<html><head><meta name=\"robots\" content=\"index, follow\"></head><body></body></html>";
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
            Promise.resolve(createFakeResponse(html))
        );
        const result = await checkPaginationFollow("http://example-pagination.com");
        expect(result.follow).toBe(true);
        fetchMock.mockRestore();
    });

    it("should return error on URL fetch failure", async () => {
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
            Promise.resolve(createFakeResponse("", { status: 500, statusText: "Internal Server Error" }))
        );
        const result = await checkPaginationFollow("http://example-pagination.com");
        expect(result.error).toContain("HTTP Error");
        fetchMock.mockRestore();
    });
});

describe("checkThankYouPageNoindex (17)", () => {
    it("should return true when meta robots tag contains noindex in HTML content", async () => {
        const html = "<html><head><meta name=\"robots\" content=\"noindex, follow\"></head><body></body></html>";
        const result = await checkThankYouPageNoindex(html);
        expect(result.thankYouNoindex).toBe(true);
    });

    it("should return false when meta robots tag does not contain noindex in HTML content", async () => {
        const html = "<html><head><meta name=\"robots\" content=\"index, follow\"></head><body></body></html>";
        const result = await checkThankYouPageNoindex(html);
        expect(result.thankYouNoindex).toBe(false);
    });

    it("should check noindex from URL content", async () => {
        const html = "<html><head><meta name=\"robots\" content=\"noindex\"></head><body></body></html>";
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
            Promise.resolve(createFakeResponse(html))
        );
        const result = await checkThankYouPageNoindex("http://example-thankyou.com");
        expect(result.thankYouNoindex).toBe(true);
        fetchMock.mockRestore();
    });

    it("should return error on fetch failure for URL content", async () => {
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
            Promise.resolve(createFakeResponse("", { status: 500, statusText: "Internal Server Error" }))
        );
        const result = await checkThankYouPageNoindex("http://example-thankyou.com");
        expect(result.error).toContain("HTTP Error");
        fetchMock.mockRestore();
    });
});

describe("checkPageIndexFollow (15)", () => {
    it("should return index true and follow true when meta tag contains 'index, follow'", async () => {
        const html = "<html><head><meta name=\"robots\" content=\"index, follow\"></head><body></body></html>";
        const result = await checkPageIndexFollow(html);
        expect(result.index).toBe(true);
        expect(result.follow).toBe(true);
    });

    it("should return index false and follow true when meta tag contains 'noindex, follow'", async () => {
        const html = "<html><head><meta name=\"robots\" content=\"noindex, follow\"></head><body></body></html>";
        const result = await checkPageIndexFollow(html);
        expect(result.index).toBe(false);
        expect(result.follow).toBe(true);
    });

    it("should return index true and follow false when meta tag contains 'index, nofollow'", async () => {
        const html = "<html><head><meta name=\"robots\" content=\"index, nofollow\"></head><body></body></html>";
        const result = await checkPageIndexFollow(html);
        expect(result.index).toBe(true);
        expect(result.follow).toBe(false);
    });

    it("should return index false and follow false when meta tag contains 'noindex, nofollow'", async () => {
        const html = "<html><head><meta name=\"robots\" content=\"noindex, nofollow\"></head><body></body></html>";
        const result = await checkPageIndexFollow(html);
        expect(result.index).toBe(false);
        expect(result.follow).toBe(false);
    });

    it("should assume index true and follow true when no meta tag is present", async () => {
        const html = "<html><head><title>No meta robots</title></head><body></body></html>";
        const result = await checkPageIndexFollow(html);
        expect(result.index).toBe(true);
        expect(result.follow).toBe(true);
    });

    it("should work with URL content", async () => {
        const html = "<html><head><meta name=\"robots\" content=\"noindex, follow\"></head><body></body></html>";
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
            Promise.resolve(createFakeResponse(html))
        );
        const result = await checkPageIndexFollow("http://example-indexfollow.com");
        expect(result.index).toBe(false);
        expect(result.follow).toBe(true);
        fetchMock.mockRestore();
    });

    it("should return error on fetch failure", async () => {
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
            Promise.resolve(createFakeResponse("", { status: 500, statusText: "Internal Server Error" }))
        );
        const result = await checkPageIndexFollow("http://example-indexfollow.com");
        expect(result.error).toContain("HTTP Error");
        fetchMock.mockRestore();
    });
});
