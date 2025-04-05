import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { checkAmpCanonicalReponsiveness, checkAmpHtmlLinkPresence, checkMetaViewportPresence, checkMobileOptimization, AmpCanonicalCheckResult, AmpHtmlLinkCheckResult, MetaViewportCheckResult, MobileOptimizationCheckResult } from "../responsiveness";

// Helper to create a fake Response
function createFakeResponse(body: string, init?: ResponseInit): Response {
    return new Response(body, init);
}

describe("checkAmpCanonical (64)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return valid canonical when canonical tag points to non-AMP URL", async () => {
        const htmlContent = "<html>\n                <head>\n                    <link rel=\"canonical\" href=\"https://example.com/page\" />\n                </head>\n                <body>\n                    <p>Test content</p>\n                </body>\n            </html>";
            
        // Test with HTML string input
        let result: AmpCanonicalCheckResult = await checkAmpCanonicalReponsiveness(htmlContent);
        expect(result.foundCanonical).toBe(true);
        expect(result.canonicalURL).toBe("https://example.com/page");
        expect(result.isValid).toBe(true);
    });

    it("should return invalid canonical when canonical tag points to an AMP URL", async () => {
        const htmlContent = "<html>\n                <head>\n                    <link rel=\"canonical\" href=\"https://example.com/amp/page\" />\n                </head>\n                <body>\n                    <p>Test content</p>\n                </body>\n            </html>";
            
        let result: AmpCanonicalCheckResult = await checkAmpCanonicalReponsiveness(htmlContent);
        expect(result.foundCanonical).toBe(true);
        expect(result.canonicalURL).toBe("https://example.com/amp/page");
        expect(result.isValid).toBe(false);
    });

    it("should return error when canonical tag is missing", async () => {
        const htmlContent = "<html>\n                <head>\n                    <title>No canonical here</title>\n                </head>\n                <body>\n                    <p>Test content</p>\n                </body>\n            </html>";
            
        let result: AmpCanonicalCheckResult = await checkAmpCanonicalReponsiveness(htmlContent);
        expect(result.foundCanonical).toBe(false);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe("Canonical tag not found");
    });

    it("should fetch content if input is URL", async () => {
        const htmlContent = "<html>\n                <head>\n                    <link rel=\"canonical\" href=\"https://example.com/page\" />\n                </head>\n                <body>\n                    <p>Test content</p>\n                </body>\n            </html>";

        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => Promise.resolve(createFakeResponse(htmlContent)) as Promise<Response>);
            
        let result: AmpCanonicalCheckResult = await checkAmpCanonicalReponsiveness("https://example.com/amp/page");
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(result.foundCanonical).toBe(true);
        expect(result.canonicalURL).toBe("https://example.com/page");
        expect(result.isValid).toBe(true);
    });
});

describe("checkAmpHtmlLinkPresence (65)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return valid AMP HTML link when link tag with valid href is present", async () => {
        const htmlContent = "<html>\n                <head>\n                    <link rel=\"amphtml\" href=\"https://example.com/amp\" />\n                </head>\n                <body>\n                    <p>Some content</p>\n                </body>\n            </html>";
        let result: AmpHtmlLinkCheckResult = await checkAmpHtmlLinkPresence(htmlContent);
        expect(result.foundAmpHtml).toBe(true);
        expect(result.ampHtmlURL).toBe("https://example.com/amp");
        expect(result.isValid).toBe(true);
    });

    it("should return invalid AMP HTML link when href does not contain '/amp'", async () => {
        const htmlContent = "<html>\n                <head>\n                    <link rel=\"amphtml\" href=\"https://example.com/page\" />\n                </head>\n                <body>\n                    <p>Some content</p>\n                </body>\n            </html>";
        let result: AmpHtmlLinkCheckResult = await checkAmpHtmlLinkPresence(htmlContent);
        expect(result.foundAmpHtml).toBe(true);
        expect(result.ampHtmlURL).toBe("https://example.com/page");
        expect(result.isValid).toBe(false);
    });

    it("should return error when AMP HTML link tag is missing", async () => {
        const htmlContent = "<html>\n                <head>\n                    <title>No AMP link</title>\n                </head>\n                <body>\n                    <p>Some content</p>\n                </body>\n            </html>";
        let result: AmpHtmlLinkCheckResult = await checkAmpHtmlLinkPresence(htmlContent);
        expect(result.foundAmpHtml).toBe(false);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe("AMP HTML link tag not found");
    });

    it("should fetch content if input is URL", async () => {
        const htmlContent = "<html>\n                <head>\n                    <link rel=\"amphtml\" href=\"https://example.com/amp\" />\n                </head>\n                <body>\n                    <p>Some content</p>\n                </body>\n            </html>";

        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => Promise.resolve(createFakeResponse(htmlContent)) as Promise<Response>);
            
        let result: AmpHtmlLinkCheckResult = await checkAmpHtmlLinkPresence("https://example.com/page");
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(result.foundAmpHtml).toBe(true);
        expect(result.ampHtmlURL).toBe("https://example.com/amp");
        expect(result.isValid).toBe(true);
    });
});

describe("checkMetaViewportPresence (62)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return valid meta viewport when meta tag with proper content is present", async () => {
        const htmlContent = "<html>\n                <head>\n                    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n                </head>\n                <body>\n                    <p>Responsive content</p>\n                </body>\n            </html>";

        let result: MetaViewportCheckResult = await checkMetaViewportPresence(htmlContent);
        expect(result.foundViewport).toBe(true);
        expect(result.viewportContent).toBe("width=device-width, initial-scale=1.0");
        expect(result.isValid).toBe(true);
    });

    it("should return error when meta viewport tag is present but missing content attribute", async () => {
        const htmlContent = "<html>\n                <head>\n                    <meta name=\"viewport\">\n                </head>\n                <body>\n                    <p>Responsive content</p>\n                </body>\n            </html>";

        let result: MetaViewportCheckResult = await checkMetaViewportPresence(htmlContent);
        expect(result.foundViewport).toBe(true);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe("Viewport meta tag found but content attribute is missing");
    });

    it("should return error when meta viewport tag is missing", async () => {
        const htmlContent = "<html>\n                <head>\n                    <title>No viewport meta</title>\n                </head>\n                <body>\n                    <p>Content without meta viewport</p>\n                </body>\n            </html>";

        let result: MetaViewportCheckResult = await checkMetaViewportPresence(htmlContent);
        expect(result.foundViewport).toBe(false);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe("Viewport meta tag not found");
    });

    it("should fetch content if input is URL", async () => {
        const htmlContent = "<html>\n                <head>\n                    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n                </head>\n                <body>\n                    <p>Responsive content</p>\n                </body>\n            </html>";

        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => Promise.resolve(createFakeResponse(htmlContent)) as Promise<Response>);
            
        let result: MetaViewportCheckResult = await checkMetaViewportPresence("https://example.com");
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(result.foundViewport).toBe(true);
        expect(result.viewportContent).toBe("width=device-width, initial-scale=1.0");
        expect(result.isValid).toBe(true);
    });
});

describe("checkMobileOptimization (63)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return mobile optimized when valid meta viewport is present", async () => {
        const htmlContent = "<html>\n                <head>\n                    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n                </head>\n                <body>\n                    <p>Mobile optimized content</p>\n                </body>\n            </html>";
        let result: MobileOptimizationCheckResult = await checkMobileOptimization(htmlContent);
        expect(result.isMobileOptimized).toBe(true);
        expect(result.metaViewportStatus?.foundViewport).toBe(true);
        expect(result.metaViewportStatus?.isValid).toBe(true);
    });

    it("should return mobile optimized when meta viewport is invalid but AMP HTML link is valid", async () => {
        // Meta viewport tag with empty content (invalid) and AMP html link valid
        const htmlContent = "<html>\n                <head>\n                    <meta name=\"viewport\" content=\"\">\n                    <link rel=\"amphtml\" href=\"https://example.com/amp\" />\n                </head>\n                <body>\n                    <p>Content</p>\n                </body>\n            </html>";
        let result: MobileOptimizationCheckResult = await checkMobileOptimization(htmlContent);
        expect(result.isMobileOptimized).toBe(true);
        // The meta viewport is invalid
        expect(result.metaViewportStatus?.foundViewport).toBe(true);
        expect(result.metaViewportStatus?.isValid).toBe(false);
        // The AMP link is used as a fallback
        expect(result.ampHtmlStatus?.foundAmpHtml).toBe(true);
        expect(result.ampHtmlStatus?.isValid).toBe(true);
    });

    it("should return not mobile optimized when both meta viewport and AMP HTML link are missing", async () => {
        const htmlContent = "<html>\n                <head>\n                    <title>No mobile optimization</title>\n                </head>\n                <body>\n                    <p>Content</p>\n                </body>\n            </html>";
        let result: MobileOptimizationCheckResult = await checkMobileOptimization(htmlContent);
        expect(result.isMobileOptimized).toBe(false);
        expect(result.metaViewportStatus?.foundViewport).toBe(false);
    });

    it("should fetch content if input is URL and determine mobile optimization accordingly", async () => {
        const htmlContent = "<html>\n                <head>\n                    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n                </head>\n                <body>\n                    <p>Responsive content</p>\n                </body>\n            </html>";

        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => Promise.resolve(createFakeResponse(htmlContent)) as Promise<Response>);
            
        let result: MobileOptimizationCheckResult = await checkMobileOptimization("https://example.com");
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(result.isMobileOptimized).toBe(true);
        expect(result.metaViewportStatus?.foundViewport).toBe(true);
        expect(result.metaViewportStatus?.viewportContent).toBe("width=device-width, initial-scale=1.0");
    });
});
