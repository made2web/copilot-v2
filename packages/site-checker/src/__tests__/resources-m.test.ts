import { describe, expect, test } from "bun:test";
import { 
  checkOptimizableResources, 
  analyzePageResources, 
  OptimizableResourcesResult,
  HttpClient 
} from "../resources-m";

// Cliente HTTP mockado para testes
const mockHttpClient: HttpClient = {
  get: async (url: string) => {
    // Resposta para URL principal
    if (url === "https://exemplo.com") {
      return {
        data: `
          <!DOCTYPE html>
          <html>
            <head>
              <link rel="stylesheet" href="https://exemplo.com/styles.css">
              <link rel="stylesheet" href="https://exemplo.com/large-styles.css">
              <script src="https://exemplo.com/script.js"></script>
              <script src="https://exemplo.com/large-script.js"></script>
              <script src="https://exemplo.com/async-script.js" async></script>
              <script src="https://exemplo.com/defer-script.js" defer></script>
              <script>
                // Script inline pequeno
                console.log("Hello world");
              </script>
            </head>
            <body>
              <h1>Página de teste</h1>
              <script>
                // Script inline grande (simulado)
                const largeInlineScript = "${"x".repeat(21000)}";
              </script>
            </body>
          </html>
        `
      };
    } 
    // Respostas para recursos CSS
    else if (url.includes("styles.css") && !url.includes("large")) {
      return { data: "body { margin: 0; padding: 0; }" }; // CSS pequeno
    } 
    else if (url.includes("large-styles.css")) {
      return { data: "x".repeat(25000) }; // CSS grande
    } 
    // Respostas para recursos JS
    else if (url.includes("script.js") && !url.includes("large") && !url.includes("async") && !url.includes("defer")) {
      return { data: "console.log('Script pequeno');" }; // JS pequeno
    } 
    else if (url.includes("large-script.js")) {
      return { data: "x".repeat(35000) }; // JS grande
    } 
    else if (url.includes("async-script.js")) {
      return { data: "x".repeat(35000) }; // JS grande com async
    } 
    else if (url.includes("defer-script.js")) {
      return { data: "x".repeat(35000) }; // JS grande com defer
    } 
    // Resposta padrão para URLs não reconhecidas
    return { data: "" };
  }
};

describe("Há arquivos CSS e JS que podem ser reduzidos ou adiados? (76)", () => {
  test("checkOptimizableResources deve identificar recursos que podem ser otimizados", async () => {
    const inlineScriptContent = "x".repeat(21000);
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <link rel="stylesheet" href="https://exemplo.com/styles.css">
          <link rel="stylesheet" href="https://exemplo.com/large-styles.css">
          <script src="https://exemplo.com/script.js"></script>
          <script src="https://exemplo.com/large-script.js"></script>
          <script src="https://exemplo.com/async-script.js" async></script>
          <script src="https://exemplo.com/defer-script.js" defer></script>
          <script>
            // Script inline pequeno
            console.log("Hello world");
          </script>
        </head>
        <body>
          <h1>Página de teste</h1>
          <script>
            // Script inline grande (simulado)
            ${inlineScriptContent}
          </script>
        </body>
      </html>
    `;

    const result = await checkOptimizableResources(htmlContent, "https://exemplo.com", mockHttpClient);

    // Verificações
    expect(result.hasIssues).toBe(true);

    // Verificar tamanho exato da coleção
    expect(result.optimizableResources.length).toBe(3); // 1 CSS grande + 1 JS grande + 1 script inline grande
    
    // Verificar CSS grande
    const largeCss = result.optimizableResources.find(r => 
      r.type === 'css' && r.url.includes('large-styles.css'));
    expect(largeCss).toBeDefined();
    expect(largeCss?.size).toBeGreaterThan(20000);
    
    // Verificar JS grande sem async/defer
    const largeJs = result.optimizableResources.find(r => 
      r.type === 'js' && r.url.includes('large-script.js'));
    expect(largeJs).toBeDefined();
    expect(largeJs?.size).toBeGreaterThan(30000);
    expect(largeJs?.isAsync).toBe(false);
    expect(largeJs?.isDefer).toBe(false);
    
    // Verificar script inline grande
    const inlineScript = result.optimizableResources.find(r => 
      r.type === 'js' && r.isInline);
    expect(inlineScript).toBeDefined();
    expect(inlineScript?.size).toBeGreaterThan(20000);
  });

  test("analyzePageResources deve buscar HTML e analisar corretamente", async () => {
    const result = await analyzePageResources("https://exemplo.com", mockHttpClient);
    
    expect(result.hasIssues).toBe(true);
    expect(result.optimizableResources.length).toBeGreaterThan(0);
    expect(result.totalCssSize).toBeGreaterThan(0);
    expect(result.totalJsSize).toBeGreaterThan(0);
  });

  test("checkOptimizableResources deve lidar com HTML sem recursos problemáticos", async () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <link rel="stylesheet" href="https://exemplo.com/styles.css">
          <script src="https://exemplo.com/script.js"></script>
          <script>
            console.log("Hello world");
          </script>
        </head>
        <body>
          <h1>Página sem problemas</h1>
        </body>
      </html>
    `;

    const result = await checkOptimizableResources(htmlContent, "https://exemplo.com", mockHttpClient);
    
    expect(result.hasIssues).toBe(false);
    expect(result.optimizableResources.length).toBe(0);
  });
});
