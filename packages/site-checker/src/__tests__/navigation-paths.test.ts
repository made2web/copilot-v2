import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { checkBreadcrumbPresence, checkLastBreadcrumbClickable, checkAllBreadcrumbsClickable } from "../navigation-paths";

// Helper to create a fake Response object
function createFakeResponse(body: string, init?: ResponseInit): Response {
    return new Response(body, init);
}

describe("checkBreadcrumbPresence (121)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return exists true if breadcrumb is found using <nav aria-label=\"breadcrumb\">", async () => {
        const htmlContent = "<html><body><nav aria-label=\"breadcrumb\"><ul><li>Home</li></ul></nav></body></html>";
        const result = await checkBreadcrumbPresence(htmlContent);
        expect(result.exists).toBe(true);
    });

    it("should return exists true if breadcrumb is found using class attribute", async () => {
        const htmlContent = "<html><body><div class=\"header breadcrumb\">You are here</div></body></html>";
        const result = await checkBreadcrumbPresence(htmlContent);
        expect(result.exists).toBe(true);
    });

    it("should return exists false if breadcrumb is not present", async () => {
        const htmlContent = "<html><body><div class=\"content\">No breadcrumb here</div></body></html>";
        const result = await checkBreadcrumbPresence(htmlContent);
        expect(result.exists).toBe(false);
    });

    it("should fetch content when a URL is provided and detect breadcrumb", async () => {
        const htmlContent = "<html><body><nav aria-label=\"breadcrumb\"><ol><li>Home</li></ol></nav></body></html>";
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse(htmlContent, { status: 200, statusText: "OK" }))
        );

        const result = await checkBreadcrumbPresence("https://example.com");
        expect(result.exists).toBe(true);
        expect(fetchMock).toHaveBeenCalledWith("https://example.com");
    });

    it("should return error if fetch fails with non-ok response", async () => {
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse("Not Found", { status: 404, statusText: "Not Found" }))
        );

        const result = await checkBreadcrumbPresence("https://example.com");
        expect(result.exists).toBe(false);
        expect(result.error).toContain("404");
        expect(fetchMock).toHaveBeenCalledWith("https://example.com");
    });

    it("should return error on exception during fetch", async () => {
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error("Network Error"));
        
        const result = await checkBreadcrumbPresence("https://example.com");
        expect(result.exists).toBe(false);
        expect(result.error).toBe("Network Error");
        expect(fetchMock).toHaveBeenCalledWith("https://example.com");
    });
});

describe("checkLastBreadcrumbClickable (123)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return clickable false when the last breadcrumb item is not a link (using <li> structure)", async () => {
        const htmlContent = '<html><body><nav aria-label=\"breadcrumb\"><ul>' +
            '<li><a href=\"/home\">Home</a></li>' +
            '<li>Current Page</li>' +
            '</ul></nav></body></html>';
        const result = await checkLastBreadcrumbClickable(htmlContent);
        expect(result.clickable).toBe(false);
    });

    it("should return clickable true when the last breadcrumb item is a link (using <li> structure)", async () => {
        const htmlContent = '<html><body><nav aria-label=\"breadcrumb\"><ul>' +
            '<li><a href=\"/home\">Home</a></li>' +
            '<li><a href=\"/current\">Current Page</a></li>' +
            '</ul></nav></body></html>';
        const result = await checkLastBreadcrumbClickable(htmlContent);
        expect(result.clickable).toBe(true);
    });

    it("should return clickable based on fallback method when <li> tags are not used", async () => {
        const htmlContent = '<html><body><div class=\"breadcrumb\">' +
            '<a href=\"/home\">Home</a> &gt; ' +
            'Current Page' +
            '</div></body></html>';
        const result = await checkLastBreadcrumbClickable(htmlContent);
        expect(result.clickable).toBe(false);
    });

    it("should fetch content when a URL is provided and check last breadcrumb clickable", async () => {
        const htmlContent = '<html><body><nav aria-label=\"breadcrumb\"><ul>' +
            '<li><a href=\"/home\">Home</a></li>' +
            '<li>Current Page</li>' +
            '</ul></nav></body></html>';
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
            Promise.resolve(createFakeResponse(htmlContent, { status: 200, statusText: "OK" }))
        );

        const result = await checkLastBreadcrumbClickable("https://example.com");
        expect(result.clickable).toBe(false);
        expect(fetchMock).toHaveBeenCalledWith("https://example.com");
    });

    it("should return error if fetch fails with non-ok response", async () => {
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
            Promise.resolve(createFakeResponse("Not Found", { status: 404, statusText: "Not Found" }))
        );

        const result = await checkLastBreadcrumbClickable("https://example.com");
        expect(result.clickable).toBe(false);
        expect(result.error).toContain("404");
        expect(fetchMock).toHaveBeenCalledWith("https://example.com");
    });

    it("should return error on exception during fetch", async () => {
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error("Network Error"));
        
        const result = await checkLastBreadcrumbClickable("https://example.com");
        expect(result.clickable).toBe(false);
        expect(result.error).toBe("Network Error");
        expect(fetchMock).toHaveBeenCalledWith("https://example.com");
    });
});

describe("checkAllBreadcrumbsClickable (122)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return error if breadcrumb container is not found", async () => {
        const htmlContent = "<html><body><div>No breadcrumbs here</div></body></html>";
        const result = await checkAllBreadcrumbsClickable(htmlContent);
        expect(result.allClickable).toBe(false);
        expect(result.error).toContain("Breadcrumb container not found");
    });

    it("should return true if only one breadcrumb item exists (assumed current page)", async () => {
        const htmlContent = "<html><body><nav aria-label=\"breadcrumb\"><ul><li>Current</li></ul></nav></body></html>";
        const result = await checkAllBreadcrumbsClickable(htmlContent);
        expect(result.allClickable).toBe(true);
    });

    it("should return false if not all intermediate breadcrumb items are clickable (using <li> structure)", async () => {
        const htmlContent = "<html><body><nav aria-label=\"breadcrumb\"><ul>" +
            "<li><a href=\"/home\">Home</a></li>" +
            "<li>Section</li>" +
            "<li><a href=\"/current\">Current</a></li>" +
            "</ul></nav></body></html>";
        const result = await checkAllBreadcrumbsClickable(htmlContent);
        expect(result.allClickable).toBe(false);
    });

    it("should return true if all intermediate breadcrumb items are clickable (using <li> structure)", async () => {
        const htmlContent = "<html><body><nav aria-label=\"breadcrumb\"><ul>" +
            "<li><a href=\"/home\">Home</a></li>" +
            "<li><a href=\"/section\">Section</a></li>" +
            "<li>Current</li>" +
            "</ul></nav></body></html>";
        const result = await checkAllBreadcrumbsClickable(htmlContent);
        expect(result.allClickable).toBe(true);
    });

    it("should handle fallback when no <li> tags exist but links are present", async () => {
        const htmlContent = "<html><body><div class=\"breadcrumb\">" +
            "<a href=\"/home\">Home</a> &gt; " +
            "<a href=\"/section\">Section</a> &gt; " +
            "Current" +
            "</div></body></html>";
        const result = await checkAllBreadcrumbsClickable(htmlContent);
        expect(result.allClickable).toBe(true);
    });

    it("should fetch content when a URL is provided", async () => {
        const htmlContent = "<html><body><nav aria-label=\"breadcrumb\"><ul>" +
            "<li><a href=\"/home\">Home</a></li>" +
            "<li>Current</li>" +
            "</ul></nav></body></html>";
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse(htmlContent, { status: 200, statusText: "OK" }))
        );

        const result = await checkAllBreadcrumbsClickable("https://example.com");
        expect(result.allClickable).toBe(true);
        expect(fetchMock).toHaveBeenCalledWith("https://example.com");
    });
});
