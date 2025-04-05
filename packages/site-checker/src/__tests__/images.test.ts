import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { checkImagesAltTextCompliance, checkHeavyImages, checkImagesWebpExtension } from "../images";

// Helper to create a fake Response
function createFakeResponse(body: string, init?: ResponseInit): Response {
    return new Response(body, init);
}

describe("checkImagesAltTextCompliance (141)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return compliance true when all images have alt text", async () => {
        const htmlContent = '<html><body>' +
            '<img src="image1.jpg" alt="Description 1" />' +
            '<img src="image2.jpg" alt="Another description" />' +
            '</body></html>';
        const result = await checkImagesAltTextCompliance(htmlContent);
        expect(result.totalImages).toBe(2);
        expect(result.imagesWithoutAlt).toBe(0);
        expect(result.compliance).toBe(true);
    });

    it("should return compliance false when some images are missing alt text", async () => {
        const htmlContent = '<html><body>' +
            '<img src="image1.jpg" alt="Description 1" />' +
            '<img src="image2.jpg" />' +
            '<img src="image3.jpg" alt="" />' +
            '</body></html>';
        const result = await checkImagesAltTextCompliance(htmlContent);
        expect(result.totalImages).toBe(3);
        expect(result.imagesWithoutAlt).toBe(2);
        expect(result.compliance).toBe(false);
    });

    it("should handle fetching HTML from a URL and check alt texts", async () => {
        const htmlContent = '<html><body>' +
            '<img src="image1.jpg" alt="Description 1" />' +
            '<img src="image2.jpg" />' +
            '</body></html>';
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse(htmlContent))
        );
        
        const result = await checkImagesAltTextCompliance("https://example.com");
        expect(fetchMock).toHaveBeenCalled();
        expect(result.totalImages).toBe(2);
        expect(result.imagesWithoutAlt).toBe(1);
        expect(result.compliance).toBe(false);
    });
});

describe("checkHeavyImages (140)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return heavy images when one image is over 100kb", async () => {
        const htmlContent = '<html><body>' +
            '<img src="https://example.com/small.jpg" />' +
            '<img src="https://example.com/heavy.jpg" />' +
            '</body></html>';

        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((url, options) => {
            if (!options) {
                // GET request for HTML content
                return Promise.resolve(createFakeResponse(htmlContent));
            } else if (options.method === "HEAD") {
                if (typeof url === "string" && url.includes("small.jpg")) {
                    return Promise.resolve(createFakeResponse("", { headers: { "Content-Length": "50000" } }));
                }
                if (typeof url === "string" && url.includes("heavy.jpg")) {
                    return Promise.resolve(createFakeResponse("", { headers: { "Content-Length": "150000" } }));
                }
            }
            return Promise.resolve(createFakeResponse(""));
        }) as unknown as (input: RequestInfo, init?: RequestInit) => Promise<Response>;

        const result = await checkHeavyImages(htmlContent);
        expect(result.heavyImages.length).toBe(1);
        expect(result.heavyImages[0].url).toBe("https://example.com/heavy.jpg");
        expect(result.heavyImages[0].contentLength).toBe(150000);
    });

    it("should properly handle relative image URLs when input is a URL", async () => {
        const htmlContent = '<html><body>' +
            '<img src="/relative.jpg" />' +
            '</body></html>';

        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((url, options) => {
            if (!options) {
                // GET request for HTML content
                return Promise.resolve(createFakeResponse(htmlContent));
            } else if (options.method === "HEAD") {
                if (typeof url === "string" && url.endsWith("/relative.jpg")) {
                    return Promise.resolve(createFakeResponse("", { headers: { "Content-Length": "200000" } }));
                }
            }
            return Promise.resolve(createFakeResponse(""));
        }) as unknown as (input: RequestInfo, init?: RequestInit) => Promise<Response>;

        const result = await checkHeavyImages("https://example.com");
        expect(result.heavyImages.length).toBe(1);
        expect(result.heavyImages[0].url).toBe("https://example.com/relative.jpg");
        expect(result.heavyImages[0].contentLength).toBe(200000);
    });
});

describe("checkImagesWebpExtension (142)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return an empty list when all images use .webp extension", async () => {
        const htmlContent = '<html><body>' +
            '<img src="https://example.com/image1.webp" />' +
            '<img src="https://example.com/image2.webp" srcset="https://example.com/image2.webp 1x, https://example.com/image2.webp 2x" />' +
            '</body></html>';
        const result = await checkImagesWebpExtension(htmlContent);
        expect(result.nonWebpImages.length).toBe(0);
    });

    it("should return non-webp images from src and srcset attributes", async () => {
        const htmlContent = '<html><body>' +
            '<img src="https://example.com/image1.jpg" />' +
            '<img src="https://example.com/image2.webp" srcset="https://example.com/image2.jpg 1x, https://example.com/image2.webp 2x" />' +
            '</body></html>';
        const result = await checkImagesWebpExtension(htmlContent);
        // Expect image1.jpg from src and image2.jpg from srcset to be reported
        expect(result.nonWebpImages).toContain("https://example.com/image1.jpg");
        expect(result.nonWebpImages).toContain("https://example.com/image2.jpg");
        expect(result.nonWebpImages.length).toBe(2);
    });

    it("should handle relative URLs when input is a URL", async () => {
        const htmlContent = '<html><body>' +
            '<img src="/relative.jpg" />' +
            '<img src="/image.webp" />' +
            '</body></html>';
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((url, options) => {
            if (!options) {
                return Promise.resolve(createFakeResponse(htmlContent));
            }
            return Promise.resolve(createFakeResponse(""));
        }) as unknown as (input: RequestInfo, init?: RequestInit) => Promise<Response>;

        const result = await checkImagesWebpExtension("https://example.com");
        expect(result.nonWebpImages).toContain("https://example.com/relative.jpg");
        expect(result.nonWebpImages.length).toBe(1);
    });
});
