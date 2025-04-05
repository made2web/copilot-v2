import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { checkPageHasH1, checkPageHasH2, checkMultipleH1Tags, checkFooterHeadingTagsAreH4, checkHeadingTagsHierarchy, checkH1KeywordPresence, checkH2KeywordPresence, checkDuplicateH1AcrossPages } from "../heading-tags";

// Helper to create a fake Response object
function createFakeResponse(body: string, init?: ResponseInit): Response {
    return new Response(body, init);
}

describe("checkPageHasH1 (97)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return hasH1 true when HTML contains one H1 tag", async () => {
        const htmlContent = "<html><head><title>Test</title></head><body><h1>Welcome</h1></body></html>";
        const result = await checkPageHasH1(htmlContent);
        expect(result.hasH1).toBe(true);
        expect(result.h1Count).toBe(1);
    });

    it("should return hasH1 true when HTML contains multiple H1 tags", async () => {
        const htmlContent = "<html><body><h1>Title 1</h1><div><h1>Title 2</h1></div></body></html>";
        const result = await checkPageHasH1(htmlContent);
        expect(result.hasH1).toBe(true);
        expect(result.h1Count).toBe(2);
    });

    it("should return hasH1 false when HTML does not contain any H1 tags", async () => {
        const htmlContent = "<html><body><h2>No H1 here</h2></body></html>";
        const result = await checkPageHasH1(htmlContent);
        expect(result.hasH1).toBe(false);
        expect(result.h1Count).toBe(0);
    });

    it("should fetch content when input is a URL", async () => {
        const htmlContent = "<html><body><h1>Fetched H1</h1></body></html>";
        
        // Mock isURL to return true for this test
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse(htmlContent, { status: 200, statusText: "OK" }))
        );

        // Using a sample URL
        const result = await checkPageHasH1("https://example.com");
        expect(fetchMock).toHaveBeenCalledWith("https://example.com");
        expect(result.hasH1).toBe(true);
        expect(result.h1Count).toBe(1);
    });

    it("should return error when fetch fails", async () => {
        const errorMessage = "Network error";
        vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.reject(new Error(errorMessage))
        );

        const result = await checkPageHasH1("https://example.com");
        expect(result.hasH1).toBe(false);
        expect(result.h1Count).toBe(0);
        expect(result.error).toBe(errorMessage);
    });
});

describe("checkPageHasH2 (101)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return hasH2 true when HTML contains one H2 tag", async () => {
        const htmlContent = "<html><head><title>Test</title></head><body><h2>Subtitle</h2></body></html>";
        const result = await checkPageHasH2(htmlContent);
        expect(result.hasH2).toBe(true);
        expect(result.h2Count).toBe(1);
    });

    it("should return hasH2 true when HTML contains multiple H2 tags", async () => {
        const htmlContent = "<html><body><h2>Sub 1</h2><div><h2>Sub 2</h2></div></body></html>";
        const result = await checkPageHasH2(htmlContent);
        expect(result.hasH2).toBe(true);
        expect(result.h2Count).toBe(2);
    });

    it("should return hasH2 false when HTML does not contain any H2 tags", async () => {
        const htmlContent = "<html><body><h1>Title</h1><p>No h2 here</p></body></html>";
        const result = await checkPageHasH2(htmlContent);
        expect(result.hasH2).toBe(false);
        expect(result.h2Count).toBe(0);
    });

    it("should fetch content when input is a URL", async () => {
        const htmlContent = "<html><body><h2>Fetched Subtitle</h2></body></html>";
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
            Promise.resolve(createFakeResponse(htmlContent, { status: 200, statusText: "OK" }))
        );
        const result = await checkPageHasH2("https://example.com");
        expect(fetchMock).toHaveBeenCalledWith("https://example.com");
        expect(result.hasH2).toBe(true);
        expect(result.h2Count).toBe(1);
    });

    it("should return error when fetch fails", async () => {
        const errorMessage = "Network error";
        vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
            Promise.reject(new Error(errorMessage))
        );
        const result = await checkPageHasH2("https://example.com");
        expect(result.hasH2).toBe(false);
        expect(result.h2Count).toBe(0);
        expect(result.error).toBe(errorMessage);
    });
});

describe("checkMultipleH1Tags (99)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return hasMultipleH1 true when HTML contains more than one H1 tag", async () => {
        const htmlContent = "<html><body><h1>Title 1</h1><div><h1>Title 2</h1></div></body></html>";
        const result = await checkMultipleH1Tags(htmlContent);
        expect(result.hasMultipleH1).toBe(true);
        expect(result.h1Count).toBe(2);
    });

    it("should return hasMultipleH1 false when HTML contains exactly one H1 tag", async () => {
        const htmlContent = "<html><body><h1>Only Title</h1></body></html>";
        const result = await checkMultipleH1Tags(htmlContent);
        expect(result.hasMultipleH1).toBe(false);
        expect(result.h1Count).toBe(1);
    });

    it("should return hasMultipleH1 false when HTML does not contain any H1 tag", async () => {
        const htmlContent = "<html><body><p>No H1 tag here</p></body></html>";
        const result = await checkMultipleH1Tags(htmlContent);
        expect(result.hasMultipleH1).toBe(false);
        expect(result.h1Count).toBe(0);
    });

    it("should fetch content when input is a URL", async () => {
        const htmlContent = "<html><body><h1>Fetched H1</h1><h1>Another Fetched H1</h1></body></html>";
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
            Promise.resolve(createFakeResponse(htmlContent, { status: 200, statusText: "OK" }))
        );
        const result = await checkMultipleH1Tags("https://example.com");
        expect(fetchMock).toHaveBeenCalledWith("https://example.com");
        expect(result.hasMultipleH1).toBe(true);
        expect(result.h1Count).toBe(2);
    });

    it("should return error when fetch fails", async () => {
        const errorMessage = "Network error";
        vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
            Promise.reject(new Error(errorMessage))
        );
        const result = await checkMultipleH1Tags("https://example.com");
        expect(result.hasMultipleH1).toBe(false);
        expect(result.h1Count).toBe(0);
        expect(result.error).toBe(errorMessage);
    });
});

describe("checkFooterHeadingTagsAreH4 (103)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return allH4 true when footer has only h4 headings", async () => {
        const htmlContent = "<html><body><footer><h4>Footer Title</h4><h4>Another Title</h4></footer></body></html>";
        const result = await checkFooterHeadingTagsAreH4(htmlContent);
        expect(result.allH4).toBe(true);
        expect(result.nonH4Count).toBe(0);
    });

    it("should return allH4 false with correct nonH4Count when footer has mixed headings", async () => {
        const htmlContent = "<html><body><footer><h4>Correct</h4><h2>Incorrect</h2><h4>Another Correct</h4><h3>Incorrect</h3></footer></body></html>";
        const result = await checkFooterHeadingTagsAreH4(htmlContent);
        expect(result.allH4).toBe(false);
        expect(result.nonH4Count).toBe(2);
    });

    it("should return error when footer is not present", async () => {
        const htmlContent = "<html><body><div>No footer here</div></body></html>";
        const result = await checkFooterHeadingTagsAreH4(htmlContent);
        expect(result.allH4).toBe(false);
        expect(result.error).toBe("Footer element not found");
    });

    it("should fetch content when input is a URL", async () => {
        const htmlContent = "<html><body><footer><h4>Fetched Footer</h4></footer></body></html>";
        const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(() =>
            Promise.resolve(createFakeResponse(htmlContent, { status: 200, statusText: "OK" }))
        );
        const result = await checkFooterHeadingTagsAreH4("https://example.com");
        expect(fetchMock).toHaveBeenCalledWith("https://example.com");
        expect(result.allH4).toBe(true);
        expect(result.nonH4Count).toBe(0);
    });

    it("should return error when fetch fails", async () => {
        const errorMessage = "Network error";
        vi.spyOn(globalThis, "fetch").mockImplementation(() =>
            Promise.reject(new Error(errorMessage))
        );
        const result = await checkFooterHeadingTagsAreH4("https://example.com");
        expect(result.allH4).toBe(false);
        expect(result.nonH4Count).toBe(0);
        expect(result.error).toBe(errorMessage);
    });
});

describe("checkHeadingTagsHierarchy (96)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return valid hierarchy for properly ordered headings", async () => {
        const htmlContent = "<html><body><h1>Main Title</h1><h2>Section</h2><h3>Subsection</h3><h2>Another Section</h2></body></html>";
        const result = await checkHeadingTagsHierarchy(htmlContent);
        expect(result.isValidHierarchy).toBe(true);
        expect(result.errors.length).toBe(0);
        expect(result.headings).toEqual([1,2,3,2]);
    });

    it("should return error when the first heading is not H1", async () => {
        const htmlContent = "<html><body><h2>Title without H1</h2><h3>Subsection</h3></body></html>";
        const result = await checkHeadingTagsHierarchy(htmlContent);
        expect(result.isValidHierarchy).toBe(false);
        expect(result.errors).toContain("First heading is not H1.");
    });

    it("should return error when there is a jump greater than one level", async () => {
        const htmlContent = "<html><body><h1>Main Title</h1><h3>Skipped H2</h3></body></html>";
        const result = await checkHeadingTagsHierarchy(htmlContent);
        expect(result.isValidHierarchy).toBe(false);
        expect(result.errors[0]).toMatch(/Heading level jump from H1 to H3/);
    });

    it("should return error when no headings are found", async () => {
        const htmlContent = "<html><body><p>No headings here</p></body></html>";
        const result = await checkHeadingTagsHierarchy(htmlContent);
        expect(result.isValidHierarchy).toBe(false);
        expect(result.errors).toContain("No heading tags found.");
    });

    it("should fetch content when input is a URL and check hierarchy", async () => {
        const htmlContent = "<html><body><h1>Title</h1><h2>Section</h2></body></html>";
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
            Promise.resolve(createFakeResponse(htmlContent, { status: 200, statusText: "OK" }))
        );
        const result = await checkHeadingTagsHierarchy("https://example.com");
        expect(fetchMock).toHaveBeenCalledWith("https://example.com");
        expect(result.isValidHierarchy).toBe(true);
        expect(result.headings).toEqual([1,2]);
    });

    it("should return error when fetch fails", async () => {
        const errorMessage = "Network error";
        vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
            Promise.reject(new Error(errorMessage))
        );
        const result = await checkHeadingTagsHierarchy("https://example.com");
        expect(result.isValidHierarchy).toBe(false);
        expect(result.errors[0]).toBe(errorMessage);
    });
});

describe("checkH1KeywordPresence (100)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return hasKeyword true when H1 contains the keyword", async () => {
        const htmlContent = "<html><body><h1>Principal Keyword is here</h1></body></html>";
        const result = await checkH1KeywordPresence(htmlContent, "keyword");
        expect(result.hasKeyword).toBe(true);
        expect(result.h1Texts).toEqual(["Principal Keyword is here"]);
    });

    it("should return hasKeyword false when H1 does not contain the keyword", async () => {
        const htmlContent = "<html><body><h1>Some other text</h1></body></html>";
        const result = await checkH1KeywordPresence(htmlContent, "keyword");
        expect(result.hasKeyword).toBe(false);
        expect(result.h1Texts).toEqual(["Some other text"]);
    });

    it("should handle multiple H1 tags and detect keyword in one of them", async () => {
        const htmlContent = "<html><body><h1>First Title</h1><h1>Keyword in Title</h1></body></html>";
        const result = await checkH1KeywordPresence(htmlContent, "keyword");
        expect(result.hasKeyword).toBe(true);
        expect(result.h1Texts).toEqual(["First Title", "Keyword in Title"]);
    });

    it("should fetch content when input is a URL", async () => {
        const htmlContent = "<html><body><h1>URL Keyword Test</h1></body></html>";
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
            Promise.resolve(createFakeResponse(htmlContent, { status: 200, statusText: "OK" }))
        );
        const result = await checkH1KeywordPresence("https://example.com", "keyword");
        expect(fetchMock).toHaveBeenCalledWith("https://example.com");
        expect(result.hasKeyword).toBe(true);
        expect(result.h1Texts).toEqual(["URL Keyword Test"]);
    });

    it("should return error when fetch fails", async () => {
        const errorMessage = "Network error";
        vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
            Promise.reject(new Error(errorMessage))
        );
        const result = await checkH1KeywordPresence("https://example.com", "keyword");
        expect(result.hasKeyword).toBe(false);
        expect(result.h1Texts).toEqual([]);
        expect(result.error).toBe(errorMessage);
    });
});

describe("checkH2KeywordPresence (102)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return hasKeyword true when at least one H2 contains the keyword", async () => {
        const htmlContent = "<html><body><h2>This is an important Keyword</h2><h2>Another subtitle</h2></body></html>";
        const result = await checkH2KeywordPresence(htmlContent, "keyword");
        expect(result.hasKeyword).toBe(true);
        expect(result.h2Texts).toEqual(["This is an important Keyword", "Another subtitle"]);
    });

    it("should return hasKeyword false when no H2 contains the keyword", async () => {
        const htmlContent = "<html><body><h2>This is a subtitle</h2><h2>Another subtitle</h2></body></html>";
        const result = await checkH2KeywordPresence(htmlContent, "keyword");
        expect(result.hasKeyword).toBe(false);
        expect(result.h2Texts).toEqual(["This is a subtitle", "Another subtitle"]);
    });

    it("should work correctly with multiple H2 tags, detecting keyword in one", async () => {
        const htmlContent = "<html><body><h2>No match here</h2><h2>Keyword found here</h2><h2>Still no match</h2></body></html>";
        const result = await checkH2KeywordPresence(htmlContent, "keyword");
        expect(result.hasKeyword).toBe(true);
        expect(result.h2Texts).toEqual(["No match here", "Keyword found here", "Still no match"]);
    });

    it("should fetch content when input is a URL", async () => {
        const htmlContent = "<html><body><h2>URL Keyword Test</h2></body></html>";
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
            Promise.resolve(createFakeResponse(htmlContent, { status: 200, statusText: "OK" }))
        );
        const result = await checkH2KeywordPresence("https://example.com", "keyword");
        expect(fetchMock).toHaveBeenCalledWith("https://example.com");
        expect(result.hasKeyword).toBe(true);
        expect(result.h2Texts).toEqual(["URL Keyword Test"]);
    });

    it("should return error when fetch fails", async () => {
        const errorMessage = "Network error";
        vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
            Promise.reject(new Error(errorMessage))
        );
        const result = await checkH2KeywordPresence("https://example.com", "keyword");
        expect(result.hasKeyword).toBe(false);
        expect(result.h2Texts).toEqual([]);
        expect(result.error).toBe(errorMessage);
    });
});

describe("checkDuplicateH1AcrossPages (98)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return duplicateFound true when multiple URLs share the same H1", async () => {
        const url1 = "https://example.com/page1";
        const url2 = "https://example.com/page2";
        const htmlContent = "<html><body><h1>Common Title</h1></body></html>";
        
        const fetchMock = vi.spyOn(globalThis, 'fetch');
        
        fetchMock.mockImplementation((input: RequestInfo) => {
            if (typeof input === 'string') {
                if (input === url1 || input === url2) {
                    return Promise.resolve(createFakeResponse(htmlContent, { status: 200, statusText: "OK" }));
                }
            }
            return Promise.resolve(createFakeResponse("", { status: 404, statusText: "Not Found" }));
        });

        const result = await checkDuplicateH1AcrossPages([url1, url2]);
        expect(result.duplicateFound).toBe(true);
        expect(result.duplicateH1).toBe("common title");
        expect(result.urls).toEqual([url1, url2]);
    });

    it("should return duplicateFound false when all URLs have unique H1s", async () => {
        const url1 = "https://example.com/page1";
        const url2 = "https://example.com/page2";
        const html1 = "<html><body><h1>Title One</h1></body></html>";
        const html2 = "<html><body><h1>Title Two</h1></body></html>";
        
        const fetchMock = vi.spyOn(globalThis, 'fetch');
        fetchMock.mockImplementation((input: RequestInfo) => {
            if (typeof input === 'string') {
                if (input === url1) {
                    return Promise.resolve(createFakeResponse(html1, { status: 200, statusText: "OK" }));
                } else if (input === url2) {
                    return Promise.resolve(createFakeResponse(html2, { status: 200, statusText: "OK" }));
                }
            }
            return Promise.resolve(createFakeResponse("", { status: 404, statusText: "Not Found" }));
        });

        const result = await checkDuplicateH1AcrossPages([url1, url2]);
        expect(result.duplicateFound).toBe(false);
        expect(result.duplicateH1).toBe("");
        expect(result.urls).toEqual([]);
    });

    it("should extract URLs from sitemap when input is a domain string", async () => {
        const domainInput = "example.com";
        const sitemapXml = "<urlset><url><loc>https://example.com/page1</loc></url><url><loc>https://example.com/page2</loc></url></urlset>";
        const htmlContent = "<html><body><h1>Common Title</h1></body></html>";

        const fetchMock = vi.spyOn(globalThis, 'fetch');
        fetchMock.mockImplementation((input: RequestInfo) => {
            if (typeof input === 'string') {
                if (input === "https://example.com/sitemap.xml") {
                    return Promise.resolve(createFakeResponse(sitemapXml, { status: 200, statusText: "OK" }));
                } else if (input === "https://example.com/page1" || input === "https://example.com/page2") {
                    return Promise.resolve(createFakeResponse(htmlContent, { status: 200, statusText: "OK" }));
                }
            }
            return Promise.resolve(createFakeResponse("", { status: 404, statusText: "Not Found" }));
        });

        const result = await checkDuplicateH1AcrossPages(domainInput);
        expect(result.duplicateFound).toBe(true);
        expect(result.duplicateH1).toBe("common title");
        expect(result.urls).toEqual(["https://example.com/page1", "https://example.com/page2"]);
    });
});
