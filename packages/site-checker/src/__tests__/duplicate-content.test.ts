import { describe, it, expect, vi, afterEach } from "vitest";
import { checkDuplicateContentVariations } from "../duplicate-content";

function createFakeResponse(body: string, init?: ResponseInit): Response {
    return new Response(body, init);
}

describe("checkDuplicateContentVariations (146)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should detect variations when responses differ", async () => {
        const htmlContents = ["Content A", "Content B", "Content A"];
        let callCount = 0;
        const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(() => {
            const content = htmlContents[callCount];
            callCount++;
            return Promise.resolve(createFakeResponse(content, { status: 200 }));
        });

        const result = await checkDuplicateContentVariations("http://example.com");
        expect(result.variationsFound).toBe(true);
        expect(result.details.some(detail => detail.includes("variation detected"))).toBe(true);
        fetchMock.mockRestore();
    });

    it("should not detect variations when responses are identical", async () => {
        const htmlContent = "Uniform Content";
        const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(createFakeResponse(htmlContent, { status: 200 }));
        
        const result = await checkDuplicateContentVariations("http://example.com");
        expect(result.variationsFound).toBe(false);
        expect(result.details.every(detail => detail.includes("matches the first response"))).toBe(true);
        fetchMock.mockRestore();
    });
    
    it("should handle direct HTML input and not test variations", async () => {
        const result = await checkDuplicateContentVariations("<html>Sample HTML content</html>");
        expect(result.variationsFound).toBe(false);
        expect(result.details[0]).toBe("Input provided is direct content, no variations tested.");
    });
});
