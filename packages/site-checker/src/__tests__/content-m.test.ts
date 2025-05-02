import { describe, test, expect, mock, spyOn, beforeEach } from "bun:test";
import { checkIntrusivePopups, SeoCheckResult } from "../content-m";
import { detectIntrusivePopups, analyzeImageWithOpenAI } from "../utils-ai";

// Mock das funções do utils-ai.ts
mock.module("../utils-ai", () => {
  return {
    detectIntrusivePopups: mock(() => Promise.resolve({
      hasIntrusivePopups: false,
      popupCount: 0,
      popupDetails: [],
      pageMetrics: {
        viewportWidth: 1366,
        viewportHeight: 768,
        contentArea: { width: 1366, height: 768 }
      }
    })),
    analyzeImageWithOpenAI: mock(() => Promise.resolve({
      analysis: "Não há popups intrusivos nesta página.",
      details: {}
    }))
  };
});

describe("Testes de verificação de SEO - Popups Intrusivos (145)", () => {
  
  // Resetar os mocks antes de cada teste
  beforeEach(() => {
    mock.restore();
  });
  
  test("deve retornar score perfeito quando não há popups", async () => {
    // Mock da função detectIntrusivePopups para retornar nenhum popup
    mock.module("../utils-ai", () => ({
      detectIntrusivePopups: mock(() => Promise.resolve({
        hasIntrusivePopups: false,
        popupCount: 0,
        popupDetails: [],
        pageMetrics: {
          viewportWidth: 1366,
          viewportHeight: 768,
          contentArea: { width: 1366, height: 768 }
        }
      })),
      analyzeImageWithOpenAI
    }));
    
    const resultado = await checkIntrusivePopups("https://exemplo.com");
    
    expect(resultado.passed).toBe(true);
    expect(resultado.score).toBe(1.0);
    expect(resultado.message).toContain("Nenhum popup");
  });
  
  test("deve retornar score alto quando há popups não intrusivos", async () => {
    // Mock da função detectIntrusivePopups para retornar popups não intrusivos
    mock.module("../utils-ai", () => ({
      detectIntrusivePopups: mock(() => Promise.resolve({
        hasIntrusivePopups: false,
        popupCount: 1,
        popupDetails: [
          {
            selector: "div.cookie-banner",
            size: { width: 300, height: 80 },
            position: { x: 0, y: 688 },
            isIntrusive: false,
            zIndex: 500,
            type: "Cookie Consent"
          }
        ],
        screenshotPath: "/caminho/ficticio/screenshot.png",
        pageMetrics: {
          viewportWidth: 1366,
          viewportHeight: 768,
          contentArea: { width: 1366, height: 768 }
        }
      })),
      analyzeImageWithOpenAI
    }));
    
    const resultado = await checkIntrusivePopups("https://exemplo.com");
    
    expect(resultado.passed).toBe(true);
    expect(resultado.score).toBe(0.9);
    expect(resultado.message).toContain("não bloqueiam");
    expect(resultado.recommendations).toBeDefined();
    expect(resultado.recommendations?.length).toBeGreaterThan(0);
  });
  
  test("deve falhar e retornar score baixo quando há popups intrusivos", async () => {
    // Mock da função detectIntrusivePopups para retornar popups intrusivos
    mock.module("../utils-ai", () => ({
      detectIntrusivePopups: mock(() => Promise.resolve({
        hasIntrusivePopups: true,
        popupCount: 2,
        popupDetails: [
          {
            selector: "div#newsletter-modal",
            size: { width: 600, height: 400 },
            position: { x: 383, y: 184 },
            isIntrusive: true,
            zIndex: 9999,
            type: "Modal"
          },
          {
            selector: "div.cookie-banner",
            size: { width: 300, height: 80 },
            position: { x: 0, y: 688 },
            isIntrusive: false,
            zIndex: 500,
            type: "Cookie Consent"
          }
        ],
        screenshotPath: "/caminho/ficticio/screenshot.png",
        pageMetrics: {
          viewportWidth: 1366,
          viewportHeight: 768,
          contentArea: { width: 1366, height: 768 }
        }
      })),
      analyzeImageWithOpenAI
    }));
    
    const resultado = await checkIntrusivePopups("https://exemplo.com");
    
    expect(resultado.passed).toBe(false);
    expect(resultado.score).toBeLessThan(0.7);
    expect(resultado.message).toContain("popup(s) intrusivo(s)");
    expect(resultado.details?.intrusivePopupCount).toBe(1);
    expect(resultado.details?.totalPopupCount).toBe(2);
    expect(resultado.recommendations).toBeDefined();
    expect(resultado.recommendations?.length).toBeGreaterThan(0);
  });
  
  test("deve usar AI para analisar screenshots quando solicitado", async () => {
    // Mock da função detectIntrusivePopups para retornar popups intrusivos
    mock.module("../utils-ai", () => ({
      detectIntrusivePopups: mock(() => Promise.resolve({
        hasIntrusivePopups: true,
        popupCount: 1,
        popupDetails: [
          {
            selector: "div#popup",
            size: { width: 800, height: 600 },
            position: { x: 283, y: 84 },
            isIntrusive: true,
            zIndex: 1000,
            type: "Overlay"
          }
        ],
        screenshotPath: "/caminho/ficticio/screenshot.png",
        pageMetrics: {
          viewportWidth: 1366,
          viewportHeight: 768,
          contentArea: { width: 1366, height: 768 }
        }
      })),
      analyzeImageWithOpenAI: mock(() => Promise.resolve({
        analysis: "Existe um overlay grande que cobre quase toda a tela, bloqueando o conteúdo principal.",
        details: {}
      }))
    }));
    
    const resultado = await checkIntrusivePopups("https://exemplo.com", { useAI: true });
    
    expect(resultado.passed).toBe(false);
    expect(resultado.details?.aiAnalysis).toBeDefined();
    
    // Corrigir a asserção para verificar se alguma string no array contém o texto "Análise de IA"
    const containsAiAnalysis = resultado.recommendations?.some(rec => 
      rec.includes("Análise de IA")
    );
    expect(containsAiAnalysis).toBe(true);
  });
  
  test("deve lidar com erros na verificação de popups", async () => {
    // Mock da função detectIntrusivePopups para lançar um erro
    mock.module("../utils-ai", () => ({
      detectIntrusivePopups: mock(() => Promise.reject(new Error("Erro de conexão"))),
      analyzeImageWithOpenAI
    }));
    
    const resultado = await checkIntrusivePopups("https://exemplo.com");
    
    expect(resultado.passed).toBe(false);
    expect(resultado.score).toBe(0);
    expect(resultado.message).toContain("Erro ao verificar");
    expect(resultado.details?.error).toBe("Erro de conexão");
  });
});
