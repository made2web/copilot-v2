import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { checkContentLanguage, ContentLanguageCheckResult, checkLanguageDirectiveConsistency, LanguageDirectiveResult } from "../language";

// Helper to create a fake Response
function createFakeResponse(body: string, init?: ResponseInit): Response {
  return new Response(body, init);
}

describe("checkContentLanguage (44)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return the detected language when HTML contains a lang attribute", async () => {
    const htmlContent = "<html lang=\"en\"><head><title>Test</title></head><body>Hello World</body></html>";
    const result: ContentLanguageCheckResult = await checkContentLanguage(htmlContent);
    expect(result.hasLanguageTag).toBe(true);
    expect(result.languageDetected).toBe("en");
  });

  it("should return false for hasLanguageTag when HTML does not contain a lang attribute", async () => {
    const htmlContent = "<html><head><title>Test</title></head><body>Hello World</body></html>";
    const result: ContentLanguageCheckResult = await checkContentLanguage(htmlContent);
    expect(result.hasLanguageTag).toBe(false);
    expect(result.languageDetected).toBeUndefined();
  });

  it("should fetch the content when given a URL and return detected language", async () => {
    const htmlContent = "<html lang=\"fr\"><head><title>Test Page</title></head><body>Bonjour</body></html>";
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
      Promise.resolve(createFakeResponse(htmlContent, { status: 200, statusText: "OK" }))
    );

    const result: ContentLanguageCheckResult = await checkContentLanguage("https://example.com");

    expect(fetchMock).toHaveBeenCalled();
    expect(result.hasLanguageTag).toBe(true);
    expect(result.languageDetected).toBe("fr");
  });

  it("should return error when fetch fails with a non-ok response", async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
      Promise.resolve(createFakeResponse("Not Found", { status: 404, statusText: "Not Found" }))
    );

    const result: ContentLanguageCheckResult = await checkContentLanguage("https://example.com");

    expect(fetchMock).toHaveBeenCalled();
    expect(result.hasLanguageTag).toBe(false);
    expect(result.error).toContain("HTTP Error");
  });
});

describe("checkLanguageDirectiveConsistency (45)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return correct directive when declared language matches detected language (English)", async () => {
    // Content in English with several english keywords
    const htmlContent = "<html lang=\"en\"><head><title>Test</title></head><body>The quick brown fox jumps over the lazy dog and of course, the result is amazing.</body></html>";
    const result: LanguageDirectiveResult = await checkLanguageDirectiveConsistency(htmlContent);
    expect(result.correctDirective).toBe(true);
    expect(result.declaredLanguage).toBe("en");
    expect(result.detectedLanguage).toBe("en");
  });

  it("should return correct directive when declared language matches detected language (Portuguese)", async () => {
    // Content in Portuguese with several portuguese keywords
    const htmlContent = "<html lang=\"pt\"><head><title>Teste</title></head><body>O rápido desenvolvimento da aplicação e a facilidade de uso garantem de fato uma boa performance.</body></html>";
    const result: LanguageDirectiveResult = await checkLanguageDirectiveConsistency(htmlContent);
    expect(result.correctDirective).toBe(true);
    expect(result.declaredLanguage).toBe("pt");
    expect(result.detectedLanguage).toBe("pt");
  });

  it("should return incorrect directive when declared language does not match detected language", async () => {
    // Declared as English but content is in Portuguese
    const htmlContent = "<html lang=\"en\"><head><title>Teste</title></head><body>O rápido desenvolvimento da aplicação e a facilidade de uso garantem de fato uma boa performance.</body></html>";
    const result: LanguageDirectiveResult = await checkLanguageDirectiveConsistency(htmlContent);
    expect(result.correctDirective).toBe(false);
    expect(result.declaredLanguage).toBe("en");
    expect(result.detectedLanguage).toBe("pt");
  });

  it("should return error when no lang attribute is found", async () => {
    const htmlContent = "<html><head><title>No Lang</title></head><body>This is some content with the language implicitly set.</body></html>";
    const result: LanguageDirectiveResult = await checkLanguageDirectiveConsistency(htmlContent);
    expect(result.correctDirective).toBe(false);
    expect(result.error).toContain("No lang attribute found");
  });

  it("should fetch the content when given a URL and perform consistency check", async () => {
    const htmlContent = "<html lang=\"fr\"><head><title>Test Page</title></head><body>Le renard brun rapide saute par-dessus le chien paresseux et la magie opère.</body></html>";
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
      Promise.resolve(createFakeResponse(htmlContent, { status: 200, statusText: "OK" }))
    );

    const result: LanguageDirectiveResult = await checkLanguageDirectiveConsistency("https://example.com");

    expect(fetchMock).toHaveBeenCalled();
    expect(result.declaredLanguage).toBe("fr");
    expect(result.detectedLanguage).toBe("fr");
    expect(result.correctDirective).toBe(true);
  });
});
