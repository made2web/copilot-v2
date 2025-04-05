import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { checkCanonicalTagParameters, CanonicalParametersCheckResult, checkCanonicalSelfReference, CanonicalSelfReferenceCheckResult, checkAmpPageCanonical, AmpCanonicalCheckResult, checkCanonicalExistence, CanonicalExistenceCheckResult, checkPaginationCanonical, PaginationCanonicalCheckResult } from "../link-canonical";

// Utility to create a fake Response
function createFakeResponse(body: string, init?: ResponseInit): Response {
    return new Response(body, init);
}

describe("checkCanonicalTagParameters (30)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return canonical link with no invalid parameters when canonical tag is clean", async () => {
        const htmlContent = '<html><head><link rel=\"canonical\" href=\"https://example.com/page\" /></head><body>Content</body></html>';
        const result: CanonicalParametersCheckResult = await checkCanonicalTagParameters(htmlContent);
        expect(result.canonicalLink).toBe("https://example.com/page");
        expect(result.hasInvalidParameters).toBeFalsy();
        expect(result.invalidParameters).toEqual([]);
        expect(result.error).toBeUndefined();
    });

    it("should detect invalid parameters (UTM) in the canonical tag", async () => {
        const htmlContent = '<html><head><link rel=\"canonical\" href=\"https://example.com/page?utm_source=google&utm_medium=cpc\" /></head><body>Content</body></html>';
        const result: CanonicalParametersCheckResult = await checkCanonicalTagParameters(htmlContent);
        expect(result.canonicalLink).toBe("https://example.com/page?utm_source=google&utm_medium=cpc");
        expect(result.hasInvalidParameters).toBeTruthy();
        expect(result.invalidParameters).toEqual(expect.arrayContaining(["utm_source", "utm_medium"]));
        expect(result.error).toBeUndefined();
    });

    it("should detect invalid parameters (id) in the canonical tag", async () => {
        const htmlContent = '<html><head><link rel=\"canonical\" href=\"https://example.com/page?id=123\" /></head><body>Content</body></html>';
        const result: CanonicalParametersCheckResult = await checkCanonicalTagParameters(htmlContent);
        expect(result.canonicalLink).toBe("https://example.com/page?id=123");
        expect(result.hasInvalidParameters).toBeTruthy();
        expect(result.invalidParameters).toEqual(expect.arrayContaining(["id"]));
        expect(result.error).toBeUndefined();
    });

    it("should return an error when canonical tag is not present", async () => {
        const htmlContent = '<html><head><title>No canonical</title></head><body>Content</body></html>';
        const result: CanonicalParametersCheckResult = await checkCanonicalTagParameters(htmlContent);
        expect(result.canonicalLink).toBeUndefined();
        expect(result.error).toBe("Canonical link not found");
    });

    it("should fetch content when provided a URL and check for invalid parameters", async () => {
        const htmlContent = '<html><head><link rel=\"canonical\" href=\"https://example.com/page?amp=true\" /></head><body>Content</body></html>';
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse(htmlContent, { status: 200, statusText: "OK" }))
        );

        const result: CanonicalParametersCheckResult = await checkCanonicalTagParameters("https://example.com/amp");
        expect(fetchMock).toHaveBeenCalledWith("https://example.com/amp");
        expect(result.canonicalLink).toBe("https://example.com/page?amp=true");
        expect(result.hasInvalidParameters).toBeTruthy();
        expect(result.invalidParameters).toEqual(expect.arrayContaining(["amp"]));
        expect(result.error).toBeUndefined();
    });

    it("should return an error if fetching a URL results in a non-ok response", async () => {
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse("Not Found", { status: 404, statusText: "Not Found" }))
        );

        const result: CanonicalParametersCheckResult = await checkCanonicalTagParameters("https://example.com/404canonical");
        expect(fetchMock).toHaveBeenCalledWith("https://example.com/404canonical");
        expect(result.canonicalLink).toBeUndefined();
        expect(result.error).toBe("HTTP Error: 404 Not Found");
    });
});

describe("checkCanonicalSelfReference (29)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return true when the canonical tag points to the same URL as the input", async () => {
        const pageUrl = "https://example.com/page";
        const htmlContent = '<html><head><link rel=\"canonical\" href=\"https://example.com/page\" /></head><body>Content</body></html>';
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse(htmlContent, { status: 200, statusText: "OK" }))
        );

        const result: CanonicalSelfReferenceCheckResult = await checkCanonicalSelfReference(pageUrl);
        expect(fetchMock).toHaveBeenCalledWith(pageUrl);
        expect(result.isSelfReference).toBeTruthy();
        expect(result.canonicalLink).toBe("https://example.com/page");
        expect(result.error).toBeUndefined();
    });

    it("should return false when the canonical tag points to a different URL than the input", async () => {
        const pageUrl = "https://example.com/page";
        const htmlContent = '<html><head><link rel=\"canonical\" href=\"https://example.com/other-page\" /></head><body>Content</body></html>';
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse(htmlContent, { status: 200, statusText: "OK" }))
        );

        const result: CanonicalSelfReferenceCheckResult = await checkCanonicalSelfReference(pageUrl);
        expect(fetchMock).toHaveBeenCalledWith(pageUrl);
        expect(result.isSelfReference).toBeFalsy();
        expect(result.canonicalLink).toBe("https://example.com/other-page");
        expect(result.error).toBeUndefined();
    });

    it("should return an error when the canonical tag is missing", async () => {
        const pageUrl = "https://example.com/page";
        const htmlContent = '<html><head><title>No canonical</title></head><body>Content</body></html>';
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse(htmlContent, { status: 200, statusText: "OK" }))
        );

        const result: CanonicalSelfReferenceCheckResult = await checkCanonicalSelfReference(pageUrl);
        expect(fetchMock).toHaveBeenCalledWith(pageUrl);
        expect(result.isSelfReference).toBeFalsy();
        expect(result.error).toBe("Canonical link not found");
    });

    it("should return an error when input is not a URL", async () => {
        const input = "<html><head><link rel=\"canonical\" href=\"https://example.com/page\" /></head><body>Content</body></html>";
        const result: CanonicalSelfReferenceCheckResult = await checkCanonicalSelfReference(input);
        expect(result.isSelfReference).toBeFalsy();
        expect(result.error).toBe("Input is not a valid URL");
    });
});

describe("checkAmpPageCanonical (32)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return valid result when AMP page has a canonical tag pointing to non-AMP version (URL input)", async () => {
        const ampUrl = "https://example.com/page/amp";
        const htmlContent = '<html><head><link rel=\"canonical\" href=\"https://example.com/page\" /></head><body>AMP Content</body></html>';
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse(htmlContent, { status: 200, statusText: "OK" }))
        );

        const result: AmpCanonicalCheckResult = await checkAmpPageCanonical(ampUrl);
        expect(fetchMock).toHaveBeenCalledWith(ampUrl);
        expect(result.hasCanonical).toBeTruthy();
        expect(result.isCanonicalNonAmp).toBeTruthy();
        expect(result.canonicalLink).toBe("https://example.com/page");
        expect(result.error).toBeUndefined();
    });

    it("should return error when AMP page has no canonical tag", async () => {
        const ampUrl = "https://example.com/page/amp";
        const htmlContent = '<html><head><title>No canonical</title></head><body>AMP Content</body></html>';
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse(htmlContent, { status: 200, statusText: "OK" }))
        );

        const result: AmpCanonicalCheckResult = await checkAmpPageCanonical(ampUrl);
        expect(fetchMock).toHaveBeenCalledWith(ampUrl);
        expect(result.hasCanonical).toBeFalsy();
        expect(result.error).toBe("Canonical tag not found");
    });

    it("should detect when canonical tag points to the AMP page itself (invalid canonical)", async () => {
        const ampUrl = "https://example.com/page/amp";
        const htmlContent = '<html><head><link rel=\"canonical\" href=\"https://example.com/page/amp\" /></head><body>AMP Content</body></html>';
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse(htmlContent, { status: 200, statusText: "OK" }))
        );

        const result: AmpCanonicalCheckResult = await checkAmpPageCanonical(ampUrl);
        expect(fetchMock).toHaveBeenCalledWith(ampUrl);
        expect(result.hasCanonical).toBeTruthy();
        expect(result.isCanonicalNonAmp).toBeFalsy();
        expect(result.canonicalLink).toBe("https://example.com/page/amp");
    });

    it("should work with HTML content input (non-URL) and return canonical as is", async () => {
        const htmlContent = '<html><head><link rel=\"canonical\" href=\"https://example.com/page\" /></head><body>AMP Content</body></html>';
        const result: AmpCanonicalCheckResult = await checkAmpPageCanonical(htmlContent);
        expect(result.hasCanonical).toBeTruthy();
        // When HTML content is given, we cannot compare with input URL so default to true
        expect(result.isCanonicalNonAmp).toBeTruthy();
        expect(result.canonicalLink).toBe("https://example.com/page");
        expect(result.error).toBeUndefined();
    });
});

describe("checkCanonicalExistence (28)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return exists true with canonicalLink when canonical tag is present in HTML content", async () => {
        const htmlContent = '<html><head><link rel=\"canonical\" href=\"https://example.com/page\" /></head><body>Content</body></html>';
        const result: CanonicalExistenceCheckResult = await checkCanonicalExistence(htmlContent);
        expect(result.exists).toBeTruthy();
        expect(result.canonicalLink).toBe("https://example.com/page");
        expect(result.error).toBeUndefined();
    });

    it("should return exists false and error when canonical tag is missing in HTML content", async () => {
        const htmlContent = '<html><head><title>No canonical</title></head><body>Content</body></html>';
        const result: CanonicalExistenceCheckResult = await checkCanonicalExistence(htmlContent);
        expect(result.exists).toBeFalsy();
        expect(result.error).toBe("Canonical tag not found");
    });

    it("should fetch content when input is a URL and return canonical link if present", async () => {
        const ampUrl = "https://example.com/page";
        const htmlContent = '<html><head><link rel=\"canonical\" href=\"https://example.com/page\" /></head><body>Content</body></html>';
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
            Promise.resolve(createFakeResponse(htmlContent, { status: 200, statusText: "OK" }))
        );

        const result: CanonicalExistenceCheckResult = await checkCanonicalExistence(ampUrl);
        expect(fetchMock).toHaveBeenCalledWith(ampUrl);
        expect(result.exists).toBeTruthy();
        expect(result.canonicalLink).toBe("https://example.com/page");
        expect(result.error).toBeUndefined();
    });

    it("should return error if fetching a URL results in a non-ok response", async () => {
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
            Promise.resolve(createFakeResponse("Not Found", { status: 404, statusText: "Not Found" }))
        );

        const result: CanonicalExistenceCheckResult = await checkCanonicalExistence("https://example.com/404");
        expect(fetchMock).toHaveBeenCalledWith("https://example.com/404");
        expect(result.exists).toBeFalsy();
        expect(result.error).toBe("HTTP Error: 404 Not Found");
    });
});

describe("checkPaginationCanonical (31)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return isSelfReference true when pagination canonical tag points to the same URL as input", async () => {
        const pageUrl = "https://example.com/page/2";
        const htmlContent = '<html><head><link rel=\"canonical\" href=\"https://example.com/page/2\" /></head><body>Pagination Content</body></html>';
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
            Promise.resolve(createFakeResponse(htmlContent, { status: 200, statusText: "OK" }))
        );
        
        const result: PaginationCanonicalCheckResult = await checkPaginationCanonical(pageUrl);
        expect(fetchMock).toHaveBeenCalledWith(pageUrl);
        expect(result.isSelfReference).toBeTruthy();
        expect(result.canonicalLink).toBe("https://example.com/page/2");
        expect(result.error).toBeUndefined();
    });

    it("should return isSelfReference false when pagination canonical tag points to a different URL (non self-reference)", async () => {
        const pageUrl = "https://example.com/page/2";
        const htmlContent = '<html><head><link rel=\"canonical\" href=\"https://example.com/category\" /></head><body>Pagination Content</body></html>';
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
            Promise.resolve(createFakeResponse(htmlContent, { status: 200, statusText: "OK" }))
        );
        
        const result: PaginationCanonicalCheckResult = await checkPaginationCanonical(pageUrl);
        expect(fetchMock).toHaveBeenCalledWith(pageUrl);
        expect(result.isSelfReference).toBeFalsy();
        expect(result.canonicalLink).toBe("https://example.com/category");
        expect(result.error).toBeUndefined();
    });

    it("should return an error when input is not a valid URL", async () => {
        const input = "<html><head><link rel=\"canonical\" href=\"https://example.com/page/2\" /></head><body>Content</body></html>";
        const result: PaginationCanonicalCheckResult = await checkPaginationCanonical(input);
        expect(result.isSelfReference).toBeFalsy();
        expect(result.error).toBe("Input is not a valid URL");
    });
});
