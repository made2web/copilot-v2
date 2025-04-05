import { describe, it, expect, vi, afterEach } from "vitest";
import { extractFooterSocialLinks, validateSocialLinksFormat, checkMenuLinks, checkFooterLinks, checkFooterLinksForSlugs } from "../page-experience";

// Helper function to create a fake Response
function createFakeResponse(body: string, init?: ResponseInit): Response {
    return new Response(body, init);
}

describe("extractFooterSocialLinks (166)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should extract social links from HTML footer", async () => {
        const html = "<html><body><footer><a href=\"https://www.facebook.com/page\">Facebook</a><a href=\"https://twitter.com/page\">Twitter</a><a href=\"https://www.example.com\">Example</a></footer></body></html>";
        const result = await extractFooterSocialLinks(html);
        expect(result.socialLinks).toEqual([
            "https://www.facebook.com/page",
            "https://twitter.com/page"
        ]);
    });

    it("should return empty array if no footer is found", async () => {
        const html = "<html><body><div>No footer here</div></body></html>";
        const result = await extractFooterSocialLinks(html);
        expect(result.socialLinks).toEqual([]);
    });

    it("should extract social links from fetched HTML when URL is provided", async () => {
        const html = "<html><body><footer><a href=\"https://instagram.com/page\">Instagram</a></footer></body></html>";
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse(html)) as Promise<Response>
        );
        
        const result = await extractFooterSocialLinks("https://example.com");
        expect(fetchMock).toHaveBeenCalledWith("https://example.com");
        expect(result.socialLinks).toEqual([
            "https://instagram.com/page"
        ]);
    });
});

describe("validateSocialLinksFormat (167)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return invalid links when format is not https://www.", async () => {
        const html = "<html><body><footer>\
                        <a href=\"http://facebook.com/page\">Facebook</a>\
                        <a href=\"https://twitter.com/page\">Twitter</a>\
                        <a href=\"https://www.instagram.com/page\">Instagram</a>\
                      </footer></body></html>";
        const result = await validateSocialLinksFormat(html);
        expect(result.invalidSocialLinks).toEqual([
            "http://facebook.com/page",
            "https://twitter.com/page"
        ]);
    });

    it("should return empty array when all social links are correctly formatted", async () => {
        const html = "<html><body><footer>\
                        <a href=\"https://www.facebook.com/page\">Facebook</a>\
                        <a href=\"https://www.twitter.com/page\">Twitter</a>\
                        <a href=\"https://www.instagram.com/page\">Instagram</a>\
                      </footer></body></html>";
        const result = await validateSocialLinksFormat(html);
        expect(result.invalidSocialLinks).toEqual([]);
    });

    it("should extract and validate social links from fetched HTML when URL is provided", async () => {
        const html = "<html><body><footer>\
                        <a href=\"http://linkedin.com/page\">LinkedIn</a>\
                        <a href=\"https://www.youtube.com/page\">YouTube</a>\
                      </footer></body></html>";
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse(html)) as Promise<Response>
        );

        const result = await validateSocialLinksFormat("https://example.com");
        expect(fetchMock).toHaveBeenCalledWith("https://example.com");
        expect(result.invalidSocialLinks).toEqual([
            "http://linkedin.com/page"
        ]);
    });
});

describe("checkMenuLinks (158)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return empty missingLinks array when all required links are present in the menu", async () => {
        const html = "<html><body><nav>\
                        <a href=\"https://example.com/home\">Home</a>\
                        <a href=\"https://example.com/about\">About</a>\
                        <a href=\"https://example.com/contact\">Contact</a>\
                      </nav></body></html>";
        const requiredLinks = [
            "https://example.com/home",
            "https://example.com/about",
            "https://example.com/contact"
        ];
        const result = await checkMenuLinks(html, requiredLinks);
        expect(result.missingLinks).toEqual([]);
    });

    it("should return all required links as missing when the menu is not found", async () => {
        const html = "<html><body><div>No menu here</div></body></html>";
        const requiredLinks = [
            "https://example.com/home",
            "https://example.com/about"
        ];
        const result = await checkMenuLinks(html, requiredLinks);
        expect(result.missingLinks).toEqual(requiredLinks);
    });

    it("should return only the missing links when the menu contains some of the required links", async () => {
        const html = "<html><body><nav>\
                        <a href=\"https://example.com/home\">Home</a>\
                      </nav></body></html>";
        const requiredLinks = [
            "https://example.com/home",
            "https://example.com/about",
            "https://example.com/contact"
        ];
        const result = await checkMenuLinks(html, requiredLinks);
        expect(result.missingLinks).toEqual([
            "https://example.com/about",
            "https://example.com/contact"
        ]);
    });

    it("should extract menu links from fetched HTML when URL is provided", async () => {
        const html = "<html><body><nav>\
                        <a href=\"https://example.com/home\">Home</a>\
                        <a href=\"https://example.com/about\">About</a>\
                      </nav></body></html>";
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse(html)) as Promise<Response>
        );
        const requiredLinks = [
            "https://example.com/home",
            "https://example.com/about",
            "https://example.com/contact"
        ];
        const result = await checkMenuLinks("https://example.com", requiredLinks);
        expect(fetchMock).toHaveBeenCalledWith("https://example.com");
        expect(result.missingLinks).toEqual([
            "https://example.com/contact"
        ]);
    });
});

describe("checkFooterLinks (162)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return empty missingLinks array when all required links are present in the footer", async () => {
        const html = "<html><body><footer>\
                        <a href=\"https://example.com/privacy\">Privacy</a>\
                        <a href=\"https://example.com/terms\">Terms</a>\
                      </footer></body></html>";
        const requiredLinks = [
            "https://example.com/privacy",
            "https://example.com/terms"
        ];
        const result = await checkFooterLinks(requiredLinks, html);
        expect(result.missingLinks).toEqual([]);
    });

    it("should return all required links as missing when the footer is not found", async () => {
        const html = "<html><body><div>No footer here</div></body></html>";
        const requiredLinks = [
            "https://example.com/privacy",
            "https://example.com/terms"
        ];
        const result = await checkFooterLinks(requiredLinks, html);
        expect(result.missingLinks).toEqual(requiredLinks);
    });

    it("should return only the missing links when the footer contains some of the required links", async () => {
        const html = "<html><body><footer>\
                        <a href=\"https://example.com/privacy\">Privacy</a>\
                      </footer></body></html>";
        const requiredLinks = [
            "https://example.com/privacy",
            "https://example.com/terms",
            "https://example.com/contact"
        ];
        const result = await checkFooterLinks(requiredLinks, html);
        expect(result.missingLinks).toEqual([
            "https://example.com/terms",
            "https://example.com/contact"
        ]);
    });

    it("should extract footer links from fetched HTML when URL is provided", async () => {
        const html = "<html><body><footer>\
                        <a href=\"https://example.com/privacy\">Privacy</a>\
                        <a href=\"https://example.com/terms\">Terms</a>\
                      </footer></body></html>";
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse(html)) as Promise<Response>
        );
        const requiredLinks = [
            "https://example.com/privacy",
            "https://example.com/terms",
            "https://example.com/contact"
        ];
        const result = await checkFooterLinks(requiredLinks, "https://example.com");
        expect(fetchMock).toHaveBeenCalledWith("https://example.com");
        expect(result.missingLinks).toEqual([
            "https://example.com/contact"
        ]);
    });
});

describe("checkFooterLinksForSlugs (165)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return an empty array when all footer links contain at least one of the slugs", async () => {
        const html = "<html><body><footer>\
                        <a href=\"https://example.com/privacy-policy\">Privacy</a>\
                        <a href=\"https://example.com/terms-conditions\">Terms</a>\
                      </footer></body></html>";
        const slugs = ["privacy", "terms"];
        const result = await checkFooterLinksForSlugs(slugs, html);
        expect(result.linksWithoutSlug).toEqual([]);
    });

    it("should return links that do not contain any of the provided slugs", async () => {
        const html = "<html><body><footer>\
                        <a href=\"https://example.com/about\">About</a>\
                        <a href=\"https://example.com/contact\">Contact</a>\
                        <a href=\"https://example.com/privacy-policy\">Privacy</a>\
                      </footer></body></html>";
        const slugs = ["privacy", "terms"];
        const result = await checkFooterLinksForSlugs(slugs, html);
        expect(result.linksWithoutSlug).toEqual([
            "https://example.com/about",
            "https://example.com/contact"
        ]);
    });

    it("should return empty array when no footer is found", async () => {
        const html = "<html><body><div>No footer here</div></body></html>";
        const slugs = ["privacy", "terms"];
        const result = await checkFooterLinksForSlugs(slugs, html);
        expect(result.linksWithoutSlug).toEqual([]);
    });

    it("should extract footer links from fetched HTML when URL is provided", async () => {
        const html = "<html><body><footer>\
                        <a href=\"https://example.com/about\">About</a>\
                        <a href=\"https://example.com/privacy-info\">Privacy Info</a>\
                      </footer></body></html>";
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
            Promise.resolve(createFakeResponse(html)) as Promise<Response>
        );
        const slugs = ["privacy"];
        const result = await checkFooterLinksForSlugs(slugs, "https://example.com");
        expect(fetchMock).toHaveBeenCalledWith("https://example.com");
        expect(result.linksWithoutSlug).toEqual([
            "https://example.com/about"
        ]);
    });
});
