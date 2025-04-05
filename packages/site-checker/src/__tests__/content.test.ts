import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { checkParagraphsMax3Lines } from "../content";

// Helper to create a fake Response
function createFakeResponse(body: string, init?: ResponseInit): Response {
    return new Response(body, init);
}

const htmlSingleLine = "<html><body><p>This is a simple paragraph without breaks.</p></body></html>";

const htmlExactly3Lines = "<html><body><p>Line1<br />Line2<br />Line3</p></body></html>";

const htmlMoreThan3Lines = "<html><body><p>Line1<br />Line2<br />Line3<br />Line4</p></body></html>";

const htmlMultipleParagraphs = "<html><body>" +
    "<p>Paragraph one without break.</p>" +
    "<p>Paragraph two<br />still line two</p>" +
    "<p>Paragraph three<br />line two<br />line three<br />line four</p>" +
    "</body></html>";

const testURL = "https://example.com/testParagraphs";

describe("checkParagraphsMax3Lines (144)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return valid for HTML with a single paragraph without <br> tags", async () => {
        const result = await checkParagraphsMax3Lines(htmlSingleLine);
        expect(result.paragraphsValid).toBe(true);
        expect(result.totalParagraphs).toBe(1);
        expect(result.invalidParagraphs).toBe(0);
    });

    it("should return valid for a paragraph with exactly 3 lines (2 <br> tags)", async () => {
        const result = await checkParagraphsMax3Lines(htmlExactly3Lines);
        expect(result.paragraphsValid).toBe(true);
        expect(result.totalParagraphs).toBe(1);
        expect(result.invalidParagraphs).toBe(0);
    });

    it("should return invalid for a paragraph with more than 3 lines (3 <br> tags)", async () => {
        const result = await checkParagraphsMax3Lines(htmlMoreThan3Lines);
        expect(result.paragraphsValid).toBe(false);
        expect(result.totalParagraphs).toBe(1);
        expect(result.invalidParagraphs).toBe(1);
    });

    it("should correctly evaluate multiple paragraphs with mixed line counts", async () => {
        const result = await checkParagraphsMax3Lines(htmlMultipleParagraphs);
        expect(result.totalParagraphs).toBe(3);
        // Only the third paragraph has more than 3 lines
        expect(result.invalidParagraphs).toBe(1);
        expect(result.paragraphsValid).toBe(false);
    });

    it("should fetch content from a URL and evaluate the paragraph structure", async () => {
        const htmlContent = htmlExactly3Lines;
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse(htmlContent))
        );
        
        const result = await checkParagraphsMax3Lines(testURL);
        expect(fetchMock).toHaveBeenCalledWith(testURL);
        expect(result.paragraphsValid).toBe(true);
    });

    it("should return an error if the fetch fails", async () => {
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse('', { status: 500, statusText: "Internal Server Error" }))
        );
        
        const result = await checkParagraphsMax3Lines(testURL);
        expect(fetchMock).toHaveBeenCalledWith(testURL);
        expect(result.error).toContain("HTTP Error");
        expect(result.paragraphsValid).toBe(false);
    });
});
