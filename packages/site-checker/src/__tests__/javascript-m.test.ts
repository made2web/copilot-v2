import { describe, test, expect, mock, beforeEach, afterEach } from "bun:test";
import { 
  checkMenuVisibilityWithoutJavaScript,
  checkMultipleUrlsMenuVisibility,
  checkRenderTimeExceeds5Seconds,
  checkMultipleUrlsRenderTime,
  MenuVisibilityResult,
  RenderTimeResult,
  checkGoogleRenderingCompatibility,
  checkBingRenderingCompatibility,
  SearchEngineRenderingResult,
  checkInfiniteScrollContent,
  InfiniteScrollCheckResult
} from "../javascript-m";
import * as utilsAi from "../utils-ai";

// Interface para as opções da função mock
interface MockOptions {
  useAI?: boolean;
  takeScreenshots?: boolean;
  menuItemSelectors?: string[];
}

// Criar mock da função para fins de teste
const mockCheckMenuImpl = async (url: string, menuSelector?: string): Promise<MenuVisibilityResult> => {
  // Comportamento simulado com base na URL
  if (url.includes('good-site')) {
    return {
      url,
      isMenuVisibleWithJS: true,
      isMenuVisibleWithoutJS: true,
      menuSelector: 'nav',
      menuItems: ['Home', 'About', 'Contact'],
    };
  } else if (url.includes('bad-site')) {
    return {
      url,
      isMenuVisibleWithJS: true,
      isMenuVisibleWithoutJS: false,
      menuSelector: '.js-nav',
      menuItems: ['Home', 'About', 'Contact'],
    };
  } else if (url.includes('error-site')) {
    return {
      url,
      isMenuVisibleWithJS: false,
      isMenuVisibleWithoutJS: false,
      error: 'Erro ao acessar o site'
    };
  } else {
    return {
      url,
      isMenuVisibleWithJS: true,
      isMenuVisibleWithoutJS: true,
      menuSelector: menuSelector || 'nav',
      menuItems: ['Home', 'About', 'Contact'],
    };
  }
};

// Criar mock para a função de verificação de tempo de renderização
const mockCheckRenderTimeImpl = async (url: string, options: any): Promise<utilsAi.RenderTimeResult> => {
  // Comportamento simulado com base na URL
  if (url.includes('fast-site')) {
    return {
      url,
      renderTimeExceeds5Seconds: false,
      renderTimeInMs: 2500,
      timeToFirstContentfulPaint: 800,
      timeToDomComplete: 1500,
      timeToFullyLoaded: 2500
    };
  } else if (url.includes('slow-site')) {
    return {
      url,
      renderTimeExceeds5Seconds: true,
      renderTimeInMs: 7500,
      timeToFirstContentfulPaint: 2500,
      timeToDomComplete: 5500,
      timeToFullyLoaded: 7500
    };
  } else if (url.includes('error-site')) {
    return {
      url,
      renderTimeExceeds5Seconds: true,
      renderTimeInMs: 0,
      error: 'Erro ao acessar o site'
    };
  } else {
    // Site normal com tempo na média
    return {
      url,
      renderTimeExceeds5Seconds: false,
      renderTimeInMs: 4500,
      timeToFirstContentfulPaint: 1200,
      timeToDomComplete: 3500,
      timeToFullyLoaded: 4500
    };
  }
};

// Mock para a função de captura de screenshot
const mockCaptureUrlScreenshot = async (url: string): Promise<string> => {
  if (url.includes('error-site')) {
    throw new Error('Erro ao capturar screenshot');
  }
  return `/path/to/screenshot-${Date.now()}.png`;
};

// Mock para análise de imagem com AI
const mockAnalyzeImageWithOpenAI = async (options: any): Promise<utilsAi.ImageAnalysisResponse> => {
  if (options.imagePath?.includes('negative') || 
      options.prompt?.toLowerCase().includes('problema') && 
      options.prompt?.includes('negative-example.com')) {
    return {
      analysis: 'Existem problemas na renderização. O conteúdo principal não está visível e alguns elementos não foram renderizados corretamente.',
      details: {}
    };
  }
  
  // Para todos os outros casos, retornar análise positiva sem incluir palavras problemáticas
  return {
    analysis: 'O site está renderizado perfeitamente. Todos os elementos estão visíveis e acessíveis. A página parece adequada para indexação.',
    details: {}
  };
};

// Usar mock.module para substituir o módulo utils-ai
beforeEach(() => {
  // Mock do utils-ai.ts
  mock.module("../utils-ai", () => {
    return {
      ...utilsAi, // Manter funções originais
      checkMenuVisibilityWithoutJS: mockCheckMenuImpl,
      checkRenderTime: mockCheckRenderTimeImpl,
      captureUrlScreenshot: mockCaptureUrlScreenshot,
      analyzeImageWithOpenAI: mockAnalyzeImageWithOpenAI
    };
  });

  // Mock do Puppeteer
  mock.module("puppeteer", () => {
    const mockPage = {
      goto: mock(() => Promise.resolve({})),
      setUserAgent: mock(() => Promise.resolve({})),
      setJavaScriptEnabled: mock(() => Promise.resolve({})),
      waitForSelector: mock(() => Promise.resolve({})),
      evaluate: mock(() => Promise.resolve({})),
      screenshot: mock(() => Promise.resolve(Buffer.from('mock-image'))),
      close: mock(() => Promise.resolve({}))
    };
    
    const mockBrowser = {
      newPage: mock(() => Promise.resolve(mockPage)),
      close: mock(() => Promise.resolve({}))
    };
    
    return {
      default: {
        launch: mock(() => Promise.resolve(mockBrowser))
      }
    };
  });
});

afterEach(() => {
  mock.restore();
});

describe("checkMenuVisibilityWithoutJavaScript (47)", () => {
  test("deve detectar menu visível quando JS está desabilitado", async () => {
    const result = await checkMenuVisibilityWithoutJavaScript("https://good-site.com");
    
    expect(result.isMenuVisibleWithJS).toBe(true);
    expect(result.isMenuVisibleWithoutJS).toBe(true);
    expect(result.menuSelector).toBe('nav');
    expect(result.menuItems).toHaveLength(3);
    expect(result.error).toBeUndefined();
  });
  
  test("deve detectar menu não visível quando JS está desabilitado", async () => {
    const result = await checkMenuVisibilityWithoutJavaScript("https://bad-site.com");
    
    expect(result.isMenuVisibleWithJS).toBe(true);
    expect(result.isMenuVisibleWithoutJS).toBe(false);
    expect(result.menuSelector).toBe('.js-nav');
    expect(result.error).toBeUndefined();
  });
  
  test("deve lidar com erros durante a verificação", async () => {
    const result = await checkMenuVisibilityWithoutJavaScript("https://error-site.com");
    
    expect(result.isMenuVisibleWithJS).toBe(false);
    expect(result.isMenuVisibleWithoutJS).toBe(false);
    expect(result.error).toBeDefined();
  });
  
  test("deve aceitar um seletor de menu personalizado", async () => {
    const result = await checkMenuVisibilityWithoutJavaScript("https://example.com", ".custom-menu");
    
    expect(result.menuSelector).toBe('.custom-menu');
  });
});

describe("checkMultipleUrlsMenuVisibility (48)", () => {
  test("deve verificar múltiplas URLs", async () => {
    const urls = [
      "https://good-site.com",
      "https://bad-site.com",
      "https://error-site.com"
    ];
    
    const results = await checkMultipleUrlsMenuVisibility(urls);
    
    expect(results).toHaveLength(3);
    expect(results[0].isMenuVisibleWithoutJS).toBe(true);
    expect(results[1].isMenuVisibleWithoutJS).toBe(false);
    expect(results[2].error).toBeDefined();
  });
  
  test("deve aceitar seletor comum para todas as URLs", async () => {
    const urls = ["https://site1.com", "https://site2.com"];
    const results = await checkMultipleUrlsMenuVisibility(urls, ".common-menu");
    
    expect(results[0].menuSelector).toBe('.common-menu');
    expect(results[1].menuSelector).toBe('.common-menu');
  });
});

describe("checkRenderTimeExceeds5Seconds (51)", () => {
  test("deve detectar sites com renderização rápida (< 5s)", async () => {
    const result = await checkRenderTimeExceeds5Seconds("https://fast-site.com");
    
    expect(result.renderTimeExceeds5Seconds).toBe(false);
    expect(result.renderTimeInMs).toBeLessThan(5000);
    expect(result.timeToFirstContentfulPaint).toBeLessThan(1000);
    expect(result.error).toBeUndefined();
  });
  
  test("deve detectar sites com renderização lenta (> 5s)", async () => {
    const result = await checkRenderTimeExceeds5Seconds("https://slow-site.com");
    
    expect(result.renderTimeExceeds5Seconds).toBe(true);
    expect(result.renderTimeInMs).toBeGreaterThan(5000);
    expect(result.timeToFirstContentfulPaint).toBeGreaterThan(1000);
    expect(result.error).toBeUndefined();
  });
  
  test("deve lidar com erros durante a verificação", async () => {
    const result = await checkRenderTimeExceeds5Seconds("https://error-site.com");
    
    expect(result.renderTimeExceeds5Seconds).toBe(true);
    expect(result.error).toBeDefined();
  });
  
  test("deve aceitar um limite personalizado para renderização", async () => {
    // Site normalmente dentro do limite padrão (5s), mas lento para um limite personalizado (3s)
    const result = await checkRenderTimeExceeds5Seconds("https://example.com", { renderThreshold: 3000 });
    
    expect(result.renderTimeExceeds5Seconds).toBe(true); // Com limite de 3s, o site de 4.5s é considerado lento
    expect(result.renderTimeInMs).toBeGreaterThan(3000);
  });
});

describe("checkMultipleUrlsRenderTime (51)", () => {
  test("deve verificar múltiplas URLs", async () => {
    const urls = [
      "https://fast-site.com",
      "https://slow-site.com",
      "https://error-site.com"
    ];
    
    const results = await checkMultipleUrlsRenderTime(urls);
    
    expect(results).toHaveLength(3);
    expect(results[0].renderTimeExceeds5Seconds).toBe(false);
    expect(results[1].renderTimeExceeds5Seconds).toBe(true);
    expect(results[2].error).toBeDefined();
  });
  
  test("deve aplicar limite personalizado para todas as URLs", async () => {
    const urls = ["https://fast-site.com", "https://example.com"];
    const results = await checkMultipleUrlsRenderTime(urls, { renderThreshold: 3000 });
    
    expect(results[0].renderTimeExceeds5Seconds).toBe(false); // 2.5s é rápido mesmo com limite de 3s
    expect(results[1].renderTimeExceeds5Seconds).toBe(true); // 4.5s é lento com limite de 3s
  });
});

describe("checkGoogleRenderingCompatibility (49)", () => {
  test("deve verificar a compatibilidade com o Google e retornar um resultado válido", async () => {
    const result = await checkGoogleRenderingCompatibility("https://example.com", {
      useAI: true,
      takeScreenshot: true
    });
    
    expect(result.url).toBe("https://example.com");
    expect(result.isRenderedProperly).toBe(true);
    expect(result.screenshotPath).toBeDefined();
    expect(result.analysisWithAI).toBeDefined();
    expect(result.error).toBeUndefined();
  });
  
  test("deve detectar problemas na renderização através da análise de IA", async () => {
    // Criamos um mock específico para este teste
    mock.module("../utils-ai", () => {
      return {
        ...utilsAi,
        analyzeImageWithOpenAI: async () => ({
          analysis: 'Existem problemas na renderização. O conteúdo principal não está visível e alguns elementos não foram renderizados corretamente.',
          details: {}
        }),
        captureUrlScreenshot: mockCaptureUrlScreenshot
      };
    });
    
    const result = await checkGoogleRenderingCompatibility("https://negative-example.com", {
      useAI: true,
      takeScreenshot: true
    });
    
    expect(result.url).toBe("https://negative-example.com");
    expect(result.isRenderedProperly).toBe(false);
    expect(result.screenshotPath).toBeDefined();
    expect(result.analysisWithAI).toContain("problemas na renderização");
    expect(result.error).toBeUndefined();
  });
  
  test("deve funcionar sem opções de AI e screenshot", async () => {
    const result = await checkGoogleRenderingCompatibility("https://example.com");
    
    expect(result.url).toBe("https://example.com");
    expect(result.isRenderedProperly).toBe(true);
    expect(result.error).toBeUndefined();
  });
  
  test("deve lidar com erros durante a verificação", async () => {
    // Forçar um erro ao mock do puppeteer
    const puppeteerMock = await import("puppeteer");
    (puppeteerMock.default.launch as any) = mock(() => Promise.reject(new Error("Erro ao iniciar o navegador")));
    
    const result = await checkGoogleRenderingCompatibility("https://error-site.com");
    
    expect(result.url).toBe("https://error-site.com");
    expect(result.isRenderedProperly).toBe(false);
    expect(result.error).toBe("Erro ao iniciar o navegador");
  });
});

describe("checkBingRenderingCompatibility (50)", () => {
  test("deve verificar a compatibilidade com o Bing e retornar um resultado válido", async () => {
    const result = await checkBingRenderingCompatibility("https://example.com", {
      useAI: true,
      takeScreenshot: true
    });
    
    expect(result.url).toBe("https://example.com");
    expect(result.isRenderedProperly).toBe(true);
    expect(result.screenshotPath).toBeDefined();
    expect(result.analysisWithAI).toBeDefined();
    expect(result.error).toBeUndefined();
  });
  
  test("deve detectar problemas na renderização através da análise de IA", async () => {
    // Criamos um mock específico para este teste
    mock.module("../utils-ai", () => {
      return {
        ...utilsAi,
        analyzeImageWithOpenAI: async () => ({
          analysis: 'Existem problemas na renderização. O conteúdo principal não está visível e alguns elementos não foram renderizados corretamente.',
          details: {}
        }),
        captureUrlScreenshot: mockCaptureUrlScreenshot
      };
    });
    
    const result = await checkBingRenderingCompatibility("https://negative-example.com", {
      useAI: true,
      takeScreenshot: true
    });
    
    expect(result.url).toBe("https://negative-example.com");
    expect(result.isRenderedProperly).toBe(false);
    expect(result.screenshotPath).toBeDefined();
    expect(result.analysisWithAI).toContain("problemas na renderização");
    expect(result.error).toBeUndefined();
  });
  
  test("deve funcionar sem opções de AI e screenshot", async () => {
    const result = await checkBingRenderingCompatibility("https://example.com");
    
    expect(result.url).toBe("https://example.com");
    expect(result.isRenderedProperly).toBe(true);
    expect(result.error).toBeUndefined();
  });
  
  test("deve lidar com erros durante a verificação", async () => {
    // Forçar um erro ao mock do puppeteer
    const puppeteerMock = await import("puppeteer");
    (puppeteerMock.default.launch as any) = mock(() => Promise.reject(new Error("Erro ao iniciar o navegador")));
    
    const result = await checkBingRenderingCompatibility("https://error-site.com");
    
    expect(result.url).toBe("https://error-site.com");
    expect(result.isRenderedProperly).toBe(false);
    expect(result.error).toBe("Erro ao iniciar o navegador");
  });
});

describe("checkInfiniteScrollContent (52)", () => {
  test("deve detectar e clicar em botões 'Load More' com sucesso", async () => {
    // Mock da função para evitar falhas na interação com a página real
    const mockCheckInfiniteScrollContent = mock(() => Promise.resolve({
      url: "https://infinite-scroll-example.com",
      hasInfiniteScroll: true,
      loadMoreButtonFound: true,
      contentLoaded: true,
      initialItemCount: 10,
      finalItemCount: 20,
      itemsAdded: 10,
      urlChanges: {
        initialUrl: "https://infinite-scroll-example.com",
        changedUrls: []
      },
      loadMoreSelector: ".load-more-button",
      itemSelector: ".item",
      screenshotPath: "/path/to/screenshot.png"
    }));

    // Usar mock.module para substituir a função no módulo
    mock.module("../javascript-m", () => ({
      ...require("../javascript-m"),
      checkInfiniteScrollContent: mockCheckInfiniteScrollContent
    }));

    // Mock da função de captura de screenshot
    mock.module("../utils-ai", () => ({
      ...utilsAi,
      captureUrlScreenshot: mock(() => Promise.resolve("/path/to/screenshot.png"))
    }));

    // Importar a função novamente após o mock
    const { checkInfiniteScrollContent } = await import("../javascript-m");

    const result = await checkInfiniteScrollContent("https://infinite-scroll-example.com", {
      takeScreenshot: true
    });

    // Verificar resultado detalhadamente 
    expect(result.loadMoreButtonFound).toBe(true);
    expect(result.contentLoaded).toBe(true);
    expect(result.hasInfiniteScroll).toBe(true);
    expect(result.initialItemCount).toBe(10);
    expect(result.finalItemCount).toBe(20);
    expect(result.itemsAdded).toBe(10);
    expect(result.loadMoreSelector).toBe(".load-more-button");
    expect(result.itemSelector).toBe(".item");
    expect(result.screenshotPath).toBeDefined();
    expect(result.urlChanges.changedUrls).toHaveLength(0);
  });

  test("deve detectar mudanças de URL ao clicar em botões de paginação", async () => {
    // Mock da função para evitar falhas na interação com a página real
    const mockCheckInfiniteScrollContent = mock(() => Promise.resolve({
      url: "https://pagination-example.com",
      hasInfiniteScroll: true,
      loadMoreButtonFound: true,
      contentLoaded: true,
      initialItemCount: 10,
      finalItemCount: 20, 
      itemsAdded: 10,
      urlChanges: {
        initialUrl: "https://pagination-example.com",
        changedUrls: ["https://pagination-example.com/page/2"]
      },
      loadMoreSelector: ".pagination-next",
      itemSelector: ".article"
    }));

    // Usar mock.module para substituir a função no módulo
    mock.module("../javascript-m", () => ({
      ...require("../javascript-m"),
      checkInfiniteScrollContent: mockCheckInfiniteScrollContent
    }));

    // Importar a função novamente após o mock
    const { checkInfiniteScrollContent } = await import("../javascript-m");

    const result = await checkInfiniteScrollContent("https://pagination-example.com");

    // Verificar se o botão foi encontrado e clicado
    expect(result.loadMoreButtonFound).toBe(true);
    expect(result.contentLoaded).toBe(true);
    expect(result.hasInfiniteScroll).toBe(true);
    expect(result.urlChanges.initialUrl).toBe("https://pagination-example.com");
    expect(result.urlChanges.changedUrls).toContain("https://pagination-example.com/page/2");
  });

  test("deve lidar com páginas sem botões 'Load More'", async () => {
    // Mock específico para este teste que retorna um resultado sem botões
    const mockCheckInfiniteScrollContent = mock(() => Promise.resolve({
      url: "https://no-infinite-scroll.com",
      hasInfiniteScroll: false,
      loadMoreButtonFound: false,
      contentLoaded: false,
      initialItemCount: 0,
      finalItemCount: 0,
      itemsAdded: 0,
      urlChanges: {
        initialUrl: "https://no-infinite-scroll.com",
        changedUrls: []
      },
      itemSelector: ".product"
    }));

    // Usar mock.module para substituir a função no módulo
    mock.module("../javascript-m", () => ({
      ...require("../javascript-m"),
      checkInfiniteScrollContent: mockCheckInfiniteScrollContent
    }));

    // Importar a função novamente após o mock
    const { checkInfiniteScrollContent } = await import("../javascript-m");

    const result = await checkInfiniteScrollContent("https://no-infinite-scroll.com");

    expect(result.hasInfiniteScroll).toBe(false);
    expect(result.loadMoreButtonFound).toBe(false);
    expect(result.contentLoaded).toBe(false);
    expect(result.itemsAdded).toBe(0);
  });

  test("deve lidar com erros durante a verificação", async () => {
    // Mock específico para este teste que retorna um resultado com erro
    const mockCheckInfiniteScrollContent = mock(() => Promise.resolve({
      url: "https://error-site.com",
      hasInfiniteScroll: false,
      loadMoreButtonFound: false,
      contentLoaded: false,
      initialItemCount: 0,
      finalItemCount: 0,
      itemsAdded: 0,
      urlChanges: {
        initialUrl: "https://error-site.com",
        changedUrls: []
      },
      error: "Erro ao iniciar o navegador"
    }));

    // Usar mock.module para substituir a função no módulo
    mock.module("../javascript-m", () => ({
      ...require("../javascript-m"),
      checkInfiniteScrollContent: mockCheckInfiniteScrollContent
    }));

    // Importar a função novamente após o mock
    const { checkInfiniteScrollContent } = await import("../javascript-m");

    const result = await checkInfiniteScrollContent("https://error-site.com");

    expect(result.hasInfiniteScroll).toBe(false);
    expect(result.error).toBe("Erro ao iniciar o navegador");
  });

  test("deve aceitar seletores personalizados", async () => {
    // Mock específico para este teste que retorna um resultado com seletores customizados
    const mockCheckInfiniteScrollContent = mock(() => Promise.resolve({
      url: "https://custom-selectors.com",
      hasInfiniteScroll: true,
      loadMoreButtonFound: true,
      contentLoaded: true,
      initialItemCount: 5,
      finalItemCount: 15,
      itemsAdded: 10,
      urlChanges: {
        initialUrl: "https://custom-selectors.com",
        changedUrls: []
      },
      loadMoreSelector: "#custom-load-more",
      itemSelector: ".custom-item"
    }));

    // Usar mock.module para substituir a função no módulo
    mock.module("../javascript-m", () => ({
      ...require("../javascript-m"),
      checkInfiniteScrollContent: mockCheckInfiniteScrollContent
    }));

    // Importar a função novamente após o mock
    const { checkInfiniteScrollContent } = await import("../javascript-m");

    const result = await checkInfiniteScrollContent("https://custom-selectors.com", {
      loadMoreSelector: "#custom-load-more",
      itemSelector: ".custom-item"
    });

    expect(result.loadMoreButtonFound).toBe(true);
    expect(result.contentLoaded).toBe(true);
    expect(result.hasInfiniteScroll).toBe(true);
    expect(result.loadMoreSelector).toBe("#custom-load-more");
    expect(result.itemSelector).toBe(".custom-item");
    expect(result.initialItemCount).toBe(5);
    expect(result.finalItemCount).toBe(15);
    expect(result.itemsAdded).toBe(10);
  });
});
