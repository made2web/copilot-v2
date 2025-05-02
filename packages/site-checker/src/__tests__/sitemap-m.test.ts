import { describe, expect, test } from "bun:test";
import { 
  checkSitemap,
  isSitemapSubmittedToGSC,
  checkSitemapSubmissionToGSC,
  HttpClient
} from "../sitemap-m";

// Mock do cliente HTTP para testes
const mockHttpClient: HttpClient = {
  get: async (url: string) => {
    if (url === "https://www.exemplo.com/sitemap.xml") {
      // Sitemap válido
      return {
        data: `<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
          <url>
            <loc>https://www.exemplo.com/</loc>
            <lastmod>2023-01-01</lastmod>
            <changefreq>weekly</changefreq>
            <priority>1.0</priority>
          </url>
          <url>
            <loc>https://www.exemplo.com/pagina1</loc>
            <lastmod>2023-01-02</lastmod>
            <changefreq>monthly</changefreq>
            <priority>0.8</priority>
          </url>
        </urlset>`,
        status: 200
      };
    } else if (url === "https://www.exemplo-invalido.com/sitemap.xml") {
      // Arquivo existe, mas não é um sitemap válido
      return {
        data: "<html><body>Este não é um sitemap</body></html>",
        status: 200
      };
    } else if (url === "https://www.exemplo-index.com/sitemap.xml") {
      // Sitemap index válido
      return {
        data: `<?xml version="1.0" encoding="UTF-8"?>
        <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
          <sitemap>
            <loc>https://www.exemplo-index.com/sitemap1.xml</loc>
            <lastmod>2023-01-01</lastmod>
          </sitemap>
          <sitemap>
            <loc>https://www.exemplo-index.com/sitemap2.xml</loc>
            <lastmod>2023-01-02</lastmod>
          </sitemap>
        </sitemapindex>`,
        status: 200
      };
    }
    
    // Simula 404 para domínios que não correspondem aos padrões acima
    const error: any = new Error("Not found");
    error.response = { status: 404 };
    throw error;
  }
};

describe("O sitemap foi inserido no Google Search Console? (25)", () => {
  test("checkSitemap deve identificar sitemap.xml válido", async () => {
    const result = await checkSitemap("www.exemplo.com", mockHttpClient);
    
    expect(result.hasSitemap).toBe(true);
    expect(result.isValidSitemap).toBe(true);
    expect(result.sitemapUrl).toBe("https://www.exemplo.com/sitemap.xml");
  });
  
  test("checkSitemap deve identificar sitemapindex válido", async () => {
    const result = await checkSitemap("www.exemplo-index.com", mockHttpClient);
    
    expect(result.hasSitemap).toBe(true);
    expect(result.isValidSitemap).toBe(true);
    expect(result.sitemapUrl).toBe("https://www.exemplo-index.com/sitemap.xml");
  });
  
  test("checkSitemap deve identificar XML inválido como não sendo um sitemap", async () => {
    const result = await checkSitemap("www.exemplo-invalido.com", mockHttpClient);
    
    expect(result.hasSitemap).toBe(false);
    expect(result.isValidSitemap).toBe(false);
    expect(result.sitemapUrl).toBe("https://www.exemplo-invalido.com/sitemap.xml");
  });
  
  test("checkSitemap deve lidar com domínios sem sitemap", async () => {
    const result = await checkSitemap("www.sem-sitemap.com", mockHttpClient);
    
    expect(result.hasSitemap).toBe(false);
    expect(result.isValidSitemap).toBe(false);
    expect(result.sitemapUrl).toBe(null);
  });
  
  test("isSitemapSubmittedToGSC deve relatar corretamente sites com sitemap", async () => {
    const result = await isSitemapSubmittedToGSC("www.exemplo.com", undefined, mockHttpClient);
    
    expect(result.hasSitemap).toBe(true);
    expect(result.isValidSitemap).toBe(true);
    expect(result.isSubmittedToGSC).toBe(false); // Sem API key, não pode verificar
    expect(result.message).toContain("Verifique manualmente");
  });
  
  test("isSitemapSubmittedToGSC com API key deve simular verificação no GSC", async () => {
    const result = await isSitemapSubmittedToGSC("www.exemplo.com", "fake-api-key", mockHttpClient);
    
    expect(result.hasSitemap).toBe(true);
    expect(result.isValidSitemap).toBe(true);
    expect(result.isSubmittedToGSC).toBe(true); // Com API key simulada, verifica
    expect(result.message).toContain("verificado no Google Search Console");
  });
  
  test("checkSitemapSubmissionToGSC deve retornar false quando não há API key", async () => {
    const result = await checkSitemapSubmissionToGSC("https://www.exemplo.com/sitemap.xml");
    
    expect(result).toBe(false);
  });
  
  test("checkSitemapSubmissionToGSC deve retornar true com API key simulada", async () => {
    const result = await checkSitemapSubmissionToGSC(
      "https://www.exemplo.com/sitemap.xml",
      "fake-api-key"
    );
    
    expect(result).toBe(true);
  });
});
