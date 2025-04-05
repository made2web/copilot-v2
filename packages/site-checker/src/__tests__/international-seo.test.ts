import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { checkUniqueLanguageUrls, checkHreflangMentions, checkHreflangXDefault, checkLanguageDirective } from "../international-seo";

// Função auxiliar para criar uma resposta fake
function createFakeResponse(body: string, init?: ResponseInit): Response {
    return new Response(body, init);
}

describe("checkUniqueLanguageUrls (53)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("deve retornar isUnique true e mapear as linguagens corretamente quando cada linguagem aparece apenas uma vez", async () => {
        const htmlContent = '<html><head>' +
            '<link rel=\"alternate\" hreflang=\"en\" href=\"https://example.com/en\">' +
            '<link rel=\"alternate\" hreflang=\"pt\" href=\"https://example.com/pt\">' +
            '</head><body></body></html>';
        
        const result = await checkUniqueLanguageUrls(htmlContent);
        expect(result.isUnique).toBe(true);
        expect(result.languages).toEqual({
            "en": "https://example.com/en",
            "pt": "https://example.com/pt"
        });
    });

    it("deve retornar isUnique false quando existir duplicidade na mesma linguagem", async () => {
        const htmlContent = '<html><head>' +
            '<link rel=\"alternate\" hreflang=\"en\" href=\"https://example.com/en\">' +
            '<link rel=\"alternate\" hreflang=\"en\" href=\"https://example.com/english\">' +
            '</head><body></body></html>';
        
        const result = await checkUniqueLanguageUrls(htmlContent);
        expect(result.isUnique).toBe(false);
        // Apenas o primeiro valor é considerado na contagem
        expect(result.languages).toEqual({
            "en": "https://example.com/en"
        });
    });

    it("deve buscar o conteúdo via URL e realizar a verificação", async () => {
        const htmlContent = '<html><head>' +
            '<link rel=\"alternate\" hreflang=\"fr\" href=\"https://example.com/fr\">' +
            '</head><body></body></html>';

        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse(htmlContent)) as Promise<Response>
        );

        const result = await checkUniqueLanguageUrls("https://example.com");
        expect(fetchMock).toHaveBeenCalledWith("https://example.com");
        expect(result.isUnique).toBe(true);
        expect(result.languages).toEqual({
            "fr": "https://example.com/fr"
        });
    });

    it("deve retornar isUnique true com languages vazio quando não houver tags relevantes", async () => {
        const htmlContent = '<html><head></head><body><p>Some content</p></body></html>';
        const result = await checkUniqueLanguageUrls(htmlContent);
        expect(result.isUnique).toBe(true);
        expect(result.languages).toEqual({});
    });
});

describe("checkHreflangMentions (55)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("deve retornar true e identificar a linguagem quando existir uma tag hreflang", async () => {
        const htmlContent = '<html><head>' +
            '<link rel=\"alternate\" hreflang=\"de\" href=\"https://example.com/de\">' +
            '</head><body></body></html>';

        const result = await checkHreflangMentions(htmlContent);
        expect(result.hasHreflang).toBe(true);
        expect(result.languages).toEqual(["de"]);
    });

    it("deve retornar false e uma lista vazia quando não houver tags hreflang", async () => {
        const htmlContent = '<html><head><title>Teste</title></head><body><p>No hreflang here</p></body></html>';

        const result = await checkHreflangMentions(htmlContent);
        expect(result.hasHreflang).toBe(false);
        expect(result.languages).toEqual([]);
    });

    it("deve buscar o conteúdo via URL e verificar a presença de hreflang", async () => {
        const htmlContent = '<html><head>' +
            '<link rel=\"alternate\" hreflang=\"es\" href=\"https://example.com/es\">' +
            '</head><body></body></html>';

        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse(htmlContent)) as Promise<Response>
        );

        const result = await checkHreflangMentions("https://example.com");
        expect(fetchMock).toHaveBeenCalledWith("https://example.com");
        expect(result.hasHreflang).toBe(true);
        expect(result.languages).toEqual(["es"]);
    });
});

describe("checkHreflangXDefault (57)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("deve retornar true e o href correto quando a tag hreflang x-default está presente no HTML", async () => {
        const htmlContent = '<html><head>' +
            '<link rel=\"alternate\" hreflang=\"x-default\" href=\"https://example.com/default\">' +
            '</head><body></body></html>';
        
        const result = await checkHreflangXDefault(htmlContent);
        expect(result.hasXDefault).toBe(true);
        expect(result.href).toBe("https://example.com/default");
    });

    it("deve retornar false quando a tag hreflang x-default não está presente no HTML", async () => {
        const htmlContent = '<html><head>' +
            '<link rel=\"alternate\" hreflang=\"en\" href=\"https://example.com/en\">' +
            '</head><body></body></html>';
        
        const result = await checkHreflangXDefault(htmlContent);
        expect(result.hasXDefault).toBe(false);
        expect(result.href).toBeUndefined();
    });

    it("deve buscar o conteúdo via URL e detectar a existência da tag hreflang x-default", async () => {
        const htmlContent = '<html><head>' +
            '<link rel=\"alternate\" hreflang=\"x-default\" href=\"https://example.com/default\">' +
            '</head><body></body></html>';

        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse(htmlContent)) as Promise<Response>
        );

        const result = await checkHreflangXDefault("https://example.com");
        expect(fetchMock).toHaveBeenCalledWith("https://example.com");
        expect(result.hasXDefault).toBe(true);
        expect(result.href).toBe("https://example.com/default");
    });
});

describe("checkLanguageDirective (56)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("deve retornar isMatching true quando o lang do HTML corresponde ao idioma esperado", async () => {
        const htmlContent = '<html lang=\"en\"><head></head><body></body></html>';
        const result = await checkLanguageDirective(htmlContent, "en");
        expect(result.isMatching).toBe(true);
        expect(result.currentLanguage).toBe("en");
    });

    it("deve retornar isMatching false quando o lang do HTML não corresponde ao idioma esperado", async () => {
        const htmlContent = '<html lang=\"pt\"><head></head><body></body></html>';
        const result = await checkLanguageDirective(htmlContent, "en");
        expect(result.isMatching).toBe(false);
        expect(result.currentLanguage).toBe("pt");
    });

    it("deve buscar o conteúdo via URL e retornar o resultado correto", async () => {
        const htmlContent = '<html lang=\"fr\"><head></head><body></body></html>';
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse(htmlContent)) as Promise<Response>
        );
        const result = await checkLanguageDirective("https://example.com", "fr");
        expect(fetchMock).toHaveBeenCalledWith("https://example.com");
        expect(result.isMatching).toBe(true);
        expect(result.currentLanguage).toBe("fr");
    });

    it("deve retornar erro quando a tag lang não é encontrada", async () => {
        const htmlContent = '<html><head></head><body></body></html>';
        const result = await checkLanguageDirective(htmlContent, "en");
        expect(result.isMatching).toBe(false);
        expect(result.error).toBe("Lang attribute not found in HTML.");
    });
});
