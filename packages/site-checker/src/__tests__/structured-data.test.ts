import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { checkStructuredDataArticle, checkStructuredDataOrganization, checkStructuredDataProduct, checkStructuredDataLocalBusiness, checkStructuredDataCollection, checkStructuredDataFAQPage } from "../structured-data";

// Helper to create a fake Response with a type definition
function createFakeResponse(body: string, init?: ResponseInit): Response {
    return new Response(body, init);
}

const structuredDataLocalBusinessHtml = `<html><head>
<script type=\"application/ld+json\">{
  \"@context\": \"http://schema.org\",
  \"@type\": \"LocalBusiness\",
  \"name\": \"Example Local Business\"
}</script>
</head><body></body></html>`;

const noStructuredDataHtml = `<html><head><title>No Structured Data</title></head><body><p>Some content without structured data.</p></body></html>`;

const structuredDataCollectionPageHtml = `<html><head>
<script type=\"application/ld+json\">{
  \"@context\": \"http://schema.org\",
  \"@type\": \"CollectionPage\",
  \"name\": \"Example Collection Page\"
}</script>
</head><body></body></html>`;

const structuredDataItemListHtml = `<html><head>
<script type=\"application/ld+json\">{
  \"@context\": \"http://schema.org\",
  \"@type\": \"ItemList\",
  \"itemListElement\": []
}</script>
</head><body></body></html>`;

const structuredDataFAQHtml = `<html><head>
<script type=\"application/ld+json\">{
  \"@context\": \"http://schema.org\",
  \"@type\": \"FAQPage\",
  \"mainEntity\": []
}</script>
</head><body></body></html>`;

describe("checkStructuredDataLocalBusiness (115)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return true when structured data for LocalBusiness is present in HTML content", async () => {
        const result = await checkStructuredDataLocalBusiness(structuredDataLocalBusinessHtml);
        expect(result.hasStructuredDataLocalBusiness).toBe(true);
    });

    it("should return false when no LocalBusiness structured data is present in HTML content", async () => {
        const result = await checkStructuredDataLocalBusiness(noStructuredDataHtml);
        expect(result.hasStructuredDataLocalBusiness).toBe(false);
    });

    it("should fetch content when a URL is provided and detect LocalBusiness structured data", async () => {
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse(structuredDataLocalBusinessHtml))
        );
        const result = await checkStructuredDataLocalBusiness("https://example.com/localbusiness");
        expect(result.hasStructuredDataLocalBusiness).toBe(true);
        expect(fetchMock).toHaveBeenCalledWith("https://example.com/localbusiness");
    });

    it("should handle HTTP errors gracefully when URL is provided", async () => {
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse('', { status: 404, statusText: 'Not Found' }))
        );
        const result = await checkStructuredDataLocalBusiness("https://example.com/localbusiness");
        expect(result.hasStructuredDataLocalBusiness).toBe(false);
        expect(result.error).toContain('HTTP Error');
        expect(fetchMock).toHaveBeenCalledWith("https://example.com/localbusiness");
    });
});

// Existing tests remain below

describe("checkStructuredDataProduct (119)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return true when structured data for Product is present in HTML content", async () => {
        const result = await checkStructuredDataProduct(`<html><head>
<script type=\"application/ld+json\">{
  \"@context\": \"http://schema.org\",
  \"@type\": \"Product\",
  \"name\": \"Example Product\"
}</script>
</head><body></body></html>`);
        expect(result.hasStructuredDataProduct).toBe(true);
    });

    it("should return false when no product structured data is present in HTML content", async () => {
        const result = await checkStructuredDataProduct(noStructuredDataHtml);
        expect(result.hasStructuredDataProduct).toBe(false);
    });

    it("should fetch content when a URL is provided and detect structured data for Product", async () => {
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse(`<html><head>
<script type=\"application/ld+json\">{
  \"@context\": \"http://schema.org\",
  \"@type\": \"Product\",
  \"name\": \"Example Product\"
}</script>
</head><body></body></html>`))
        );
        const result = await checkStructuredDataProduct("https://example.com/product");
        expect(result.hasStructuredDataProduct).toBe(true);
        expect(fetchMock).toHaveBeenCalledWith("https://example.com/product");
    });

    it("should handle HTTP errors gracefully when URL is provided", async () => {
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse('', { status: 404, statusText: 'Not Found' }))
        );
        const result = await checkStructuredDataProduct("https://example.com/product");
        expect(result.hasStructuredDataProduct).toBe(false);
        expect(result.error).toContain('HTTP Error');
        expect(fetchMock).toHaveBeenCalledWith("https://example.com/product");
    });
});

describe("checkStructuredDataArticle (118)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });
    
    it("should return true when structured data for Article is present in HTML content", async () => {
        const result = await checkStructuredDataArticle(`<html><head>
<script type=\"application/ld+json\">{
  \"@context\": \"http://schema.org\",
  \"@type\": \"Article\",
  \"headline\": \"Example Article\"
}</script>
</head><body></body></html>`);
        expect(result.hasStructuredDataArticle).toBe(true);
    });

    it("should return true when structured data for BlogPosting is present in HTML content", async () => {
        const result = await checkStructuredDataArticle(`<html><head>
<script type=\"application/ld+json\">{
  \"@context\": \"http://schema.org\",
  \"@type\": \"BlogPosting\",
  \"headline\": \"Example Blog Post\"
}</script>
</head><body></body></html>`);
        expect(result.hasStructuredDataArticle).toBe(true);
    });

    it("should return false when no article structured data is present in HTML content", async () => {
        const result = await checkStructuredDataArticle(noStructuredDataHtml);
        expect(result.hasStructuredDataArticle).toBe(false);
    });

    it("should fetch content when a URL is provided and detect structured data for Article", async () => {
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse(`<html><head>
<script type=\"application/ld+json\">{
  \"@context\": \"http://schema.org\",
  \"@type\": \"Article\",
  \"headline\": \"Example Article\"
}</script>
</head><body></body></html>`))
        );
        const result = await checkStructuredDataArticle("https://example.com/article");
        expect(result.hasStructuredDataArticle).toBe(true);
        expect(fetchMock).toHaveBeenCalledWith("https://example.com/article");
    });

    it("should handle HTTP errors gracefully when URL is provided", async () => {
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse('', { status: 500, statusText: 'Internal Server Error' }))
        );
        const result = await checkStructuredDataArticle("https://example.com/article");
        expect(result.hasStructuredDataArticle).toBe(false);
        expect(result.error).toContain('HTTP Error');
        expect(fetchMock).toHaveBeenCalledWith("https://example.com/article");
    });
});

describe("checkStructuredDataOrganization (116)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return true when structured data for Organization is present in HTML content", async () => {
        const result = await checkStructuredDataOrganization(`<html><head>
<script type=\"application/ld+json\">{
  \"@context\": \"http://schema.org\",
  \"@type\": \"Organization\",
  \"name\": \"Example Organization\"
}</script>
</head><body></body></html>`);
        expect(result.hasStructuredDataOrganization).toBe(true);
    });

    it("should return false when no organization structured data is present in HTML content", async () => {
        const result = await checkStructuredDataOrganization(noStructuredDataHtml);
        expect(result.hasStructuredDataOrganization).toBe(false);
    });

    it("should fetch content when a URL is provided and detect structured data for Organization", async () => {
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse(`<html><head>
<script type=\"application/ld+json\">{
  \"@context\": \"http://schema.org\",
  \"@type\": \"Organization\",
  \"name\": \"Example Organization\"
}</script>
</head><body></body></html>`))
        );
        const result = await checkStructuredDataOrganization("https://example.com/organization");
        expect(result.hasStructuredDataOrganization).toBe(true);
        expect(fetchMock).toHaveBeenCalledWith("https://example.com/organization");
    });

    it("should handle HTTP errors gracefully when URL is provided", async () => {
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse('', { status: 404, statusText: 'Not Found' }))
        );
        const result = await checkStructuredDataOrganization("https://example.com/organization");
        expect(result.hasStructuredDataOrganization).toBe(false);
        expect(result.error).toContain('HTTP Error');
        expect(fetchMock).toHaveBeenCalledWith("https://example.com/organization");
    });
});

describe("checkStructuredDataCollection (120)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return true when CollectionPage structured data is present in HTML content", async () => {
        const result = await checkStructuredDataCollection(structuredDataCollectionPageHtml);
        expect(result.hasStructuredDataCollection).toBe(true);
    });

    it("should return true when ItemList structured data is present in HTML content", async () => {
        const result = await checkStructuredDataCollection(structuredDataItemListHtml);
        expect(result.hasStructuredDataCollection).toBe(true);
    });

    it("should return false when no CollectionPage/ItemList structured data is present", async () => {
        const result = await checkStructuredDataCollection(noStructuredDataHtml);
        expect(result.hasStructuredDataCollection).toBe(false);
    });

    it("should fetch content when a URL is provided and detect CollectionPage structured data", async () => {
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
            Promise.resolve(createFakeResponse(structuredDataCollectionPageHtml))
        );
        const result = await checkStructuredDataCollection("https://example.com/collection");
        expect(result.hasStructuredDataCollection).toBe(true);
        expect(fetchMock).toHaveBeenCalledWith("https://example.com/collection");
    });

    it("should handle HTTP errors gracefully when URL is provided", async () => {
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
            Promise.resolve(createFakeResponse('', { status: 404, statusText: 'Not Found' }))
        );
        const result = await checkStructuredDataCollection("https://example.com/collection");
        expect(result.hasStructuredDataCollection).toBe(false);
        expect(result.error).toContain('HTTP Error');
        expect(fetchMock).toHaveBeenCalledWith("https://example.com/collection");
    });
});

describe("checkStructuredDataFAQPage (117)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return true when structured data for FAQPage is present in HTML content", async () => {
        const result = await checkStructuredDataFAQPage(structuredDataFAQHtml);
        expect(result.hasStructuredDataFAQPage).toBe(true);
    });

    it("should return false when no FAQPage structured data is present in HTML content", async () => {
        const result = await checkStructuredDataFAQPage(noStructuredDataHtml);
        expect(result.hasStructuredDataFAQPage).toBe(false);
    });

    it("should fetch content when a URL is provided and detect FAQPage structured data", async () => {
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
            Promise.resolve(createFakeResponse(structuredDataFAQHtml))
        );
        const result = await checkStructuredDataFAQPage("https://example.com/faq");
        expect(result.hasStructuredDataFAQPage).toBe(true);
        expect(fetchMock).toHaveBeenCalledWith("https://example.com/faq");
    });

    it("should handle HTTP errors gracefully when URL is provided", async () => {
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
            Promise.resolve(createFakeResponse('', { status: 404, statusText: 'Not Found' }))
        );
        const result = await checkStructuredDataFAQPage("https://example.com/faq");
        expect(result.hasStructuredDataFAQPage).toBe(false);
        expect(result.error).toContain('HTTP Error');
        expect(fetchMock).toHaveBeenCalledWith("https://example.com/faq");
    });
});
