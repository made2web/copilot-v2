import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { checkSubdomainCrosslinking } from "../subdomain-subdirectory-m";
import { JSDOM } from "jsdom";

function createFakeResponse(body: string, init?: ResponseInit): Response {
  return new Response(body, init);
}

describe("checkSubdomainCrosslinking (59)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("deve detectar subdomínios linkados em menu e rodapé", async () => {
    const htmlContent = `
      <html>
        <head><title>Teste</title></head>
        <body>
          <nav class="menu">
            <ul>
              <li><a href="https://loja.exemplo.com">Loja</a></li>
              <li><a href="https://blog.exemplo.com">Blog</a></li>
              <li><a href="https://suporte.exemplo.com">Suporte</a></li>
            </ul>
          </nav>
          <main>Conteúdo principal</main>
          <footer>
            <div>
              <a href="https://loja.exemplo.com">Loja</a>
              <a href="https://blog.exemplo.com">Blog</a>
              <a href="https://api.exemplo.com">API</a>
            </div>
          </footer>
        </body>
      </html>
    `;

    const subdomains = [
      'loja.exemplo.com',
      'blog.exemplo.com',
      'suporte.exemplo.com',
      'api.exemplo.com',
      'naoexiste.exemplo.com'
    ];

    const results = await checkSubdomainCrosslinking(htmlContent, subdomains);
    
    expect(results.length).toBe(5);
    
    // loja.exemplo.com está no menu e rodapé
    const loja = results.find(r => r.subdomain === 'loja.exemplo.com');
    expect(loja?.linkedInMenu).toBe(true);
    expect(loja?.linkedInFooter).toBe(true);
    expect(loja?.linkedInMenuAndFooter).toBe(true);
    
    // blog.exemplo.com está no menu e rodapé
    const blog = results.find(r => r.subdomain === 'blog.exemplo.com');
    expect(blog?.linkedInMenu).toBe(true);
    expect(blog?.linkedInFooter).toBe(true);
    expect(blog?.linkedInMenuAndFooter).toBe(true);
    
    // suporte.exemplo.com está apenas no menu
    const suporte = results.find(r => r.subdomain === 'suporte.exemplo.com');
    expect(suporte?.linkedInMenu).toBe(true);
    expect(suporte?.linkedInFooter).toBe(false);
    expect(suporte?.linkedInMenuAndFooter).toBe(false);
    
    // api.exemplo.com está apenas no rodapé
    const api = results.find(r => r.subdomain === 'api.exemplo.com');
    expect(api?.linkedInMenu).toBe(false);
    expect(api?.linkedInFooter).toBe(true);
    expect(api?.linkedInMenuAndFooter).toBe(false);
    
    // naoexiste.exemplo.com não está em nenhum lugar
    const naoexiste = results.find(r => r.subdomain === 'naoexiste.exemplo.com');
    expect(naoexiste?.linkedInMenu).toBe(false);
    expect(naoexiste?.linkedInFooter).toBe(false);
    expect(naoexiste?.linkedInMenuAndFooter).toBe(false);
  });

  it("deve buscar conteúdo de uma URL e analisar links", async () => {
    const htmlContent = `
      <html>
        <nav>
          <a href="https://shop.example.com">Shop</a>
          <a href="https://blog.example.com">Blog</a>
        </nav>
        <footer>
          <a href="https://shop.example.com">Shop</a>
          <a href="https://help.example.com">Help</a>
        </footer>
      </html>
    `;

    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
      Promise.resolve(createFakeResponse(htmlContent, { status: 200, statusText: "OK" }))
    );

    const subdomains = [
      'shop.example.com',
      'blog.example.com',
      'help.example.com'
    ];

    const results = await checkSubdomainCrosslinking("https://example.com", subdomains);
    
    expect(fetchMock).toHaveBeenCalledWith("https://example.com");
    expect(results.length).toBe(3);
    
    // shop.example.com está no menu e rodapé
    const shop = results.find(r => r.subdomain === 'shop.example.com');
    expect(shop?.linkedInMenuAndFooter).toBe(true);
    
    // blog.example.com está apenas no menu
    const blog = results.find(r => r.subdomain === 'blog.example.com');
    expect(blog?.linkedInMenu).toBe(true);
    expect(blog?.linkedInFooter).toBe(false);
    
    // help.example.com está apenas no rodapé
    const help = results.find(r => r.subdomain === 'help.example.com');
    expect(help?.linkedInMenu).toBe(false);
    expect(help?.linkedInFooter).toBe(true);
  });

  it("deve retornar erro quando a requisição falhar", async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
      Promise.reject(new Error("Network error"))
    );

    const subdomains = ['sub1.example.com', 'sub2.example.com'];
    
    const results = await checkSubdomainCrosslinking("https://example.com", subdomains);
    
    expect(fetchMock).toHaveBeenCalledWith("https://example.com");
    expect(results.length).toBe(2);
    
    results.forEach(result => {
      expect(result.linkedInMenuAndFooter).toBe(false);
      expect(result.linkedInMenu).toBe(false);
      expect(result.linkedInFooter).toBe(false);
      expect(result.error).toBe("Network error");
    });
  });

  it("deve lidar com erro HTTP", async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
      Promise.resolve(createFakeResponse("", { status: 404, statusText: "Not Found" }))
    );

    const subdomains = ['sub.example.com'];
    
    const results = await checkSubdomainCrosslinking("https://example.com", subdomains);
    
    expect(fetchMock).toHaveBeenCalledWith("https://example.com");
    expect(results[0].error).toBe("HTTP Error: 404 Not Found");
    expect(results[0].linkedInMenuAndFooter).toBe(false);
  });

  it("deve encontrar menu e rodapé em estruturas HTML não convencionais", async () => {
    const htmlContent = `
      <html>
        <body>
          <div class="navigation-bar">
            <a href="https://store.example.com">Store</a>
            <a href="https://blog.example.com">Blog</a>
            <a href="https://about.example.com">About</a>
            <a href="https://contact.example.com">Contact</a>
          </div>
          <main>Content</main>
          <div class="bottom-info">
            <a href="https://store.example.com">Store</a>
            <a href="https://support.example.com">Support</a>
          </div>
        </body>
      </html>
    `;

    const subdomains = [
      'store.example.com',
      'blog.example.com',
      'support.example.com'
    ];

    const results = await checkSubdomainCrosslinking(htmlContent, subdomains);
    
    // store.example.com está no menu e rodapé
    const store = results.find(r => r.subdomain === 'store.example.com');
    expect(store?.linkedInMenuAndFooter).toBe(true);
    
    // blog.example.com está apenas no menu
    const blog = results.find(r => r.subdomain === 'blog.example.com');
    expect(blog?.linkedInMenu).toBe(true);
    expect(blog?.linkedInFooter).toBe(false);
    
    // support.example.com está apenas no rodapé
    const support = results.find(r => r.subdomain === 'support.example.com');
    expect(support?.linkedInMenu).toBe(false);
    expect(support?.linkedInFooter).toBe(true);
  });
});
