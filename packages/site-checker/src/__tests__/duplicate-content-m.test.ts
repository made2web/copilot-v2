import { describe, test, expect } from "bun:test";
import { 
  compareContentSimilarity, 
  checkMultipleUrlsForDuplicateContent,
  DuplicateContentResult
} from "../duplicate-content-m";

describe("compareContentSimilarity", () => {
  test("deve calcular similaridade corretamente para conteúdos pequenos", async () => {
    const html1 = "<html><body><p>Este é um texto de teste sobre SEO técnico.</p></body></html>";
    const html2 = "<html><body><p>Este é um texto de teste sobre SEO técnico e otimização.</p></body></html>";
    
    const result = await compareContentSimilarity(html1, html2);
    
    expect(result).toBeGreaterThan(0);  // Deve ter alguma similaridade
    expect(result).toBeLessThan(100);   // Não deve ser 100% igual
  });
  
  test("deve calcular baixa similaridade para conteúdos diferentes", async () => {
    const html1 = "<html><body><p>Este é um texto sobre SEO técnico.</p></body></html>";
    const html2 = "<html><body><p>Este texto trata completamente de outro assunto não relacionado.</p></body></html>";
    
    const result = await compareContentSimilarity(html1, html2);
    
    expect(result).toBeLessThan(50);    // Conteúdos diferentes devem ter baixa similaridade
  });
  
  test("deve tratar conteúdos HTML diferentes com textos similares", async () => {
    const html1 = "<div><p class='texto'>Este é um conteúdo de teste.</p></div>";
    const html2 = "<section><h1>Título</h1><article>Este é um conteúdo de teste.</article></section>";
    
    const result = await compareContentSimilarity(html1, html2);
    
    // Espera-se que a similaridade seja média-alta já que o texto é o mesmo
    // apesar da estrutura HTML ser diferente
    expect(result).toBeGreaterThan(30);
  });
});
