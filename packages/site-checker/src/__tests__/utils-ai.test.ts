import { describe, it, expect } from 'vitest';
import { detectMainContentSelector } from '../utils-ai';

describe('detectMainContentSelector', () => {
  it('detecta seletores comuns para conteúdo principal', async () => {
    const html = `
      <html>
        <body>
          <header>Header</header>
          <main id="main-content">
            <h1>Título Principal</h1>
            <p>Este é o conteúdo principal da página.</p>
            <p>Contém múltiplos parágrafos com informações relevantes.</p>
          </main>
          <footer>Footer</footer>
        </body>
      </html>
    `;

    const selector = await detectMainContentSelector(html);
    expect(selector).toEqual('#main-content');
  });

  it('detecta article quando não há main', async () => {
    const html = `
      <html>
        <body>
          <header>Header</header>
          <article class="content">
            <h1>Título do Artigo</h1>
            <p>Este é o conteúdo do artigo.</p>
            <p>Contém múltiplos parágrafos.</p>
          </article>
          <footer>Footer</footer>
        </body>
      </html>
    `;

    const selector = await detectMainContentSelector(html);
    expect(selector).toEqual('.content');
  });

  it('retorna string vazia quando não há conteúdo principal', async () => {
    const html = `
      <html>
        <body>
          <div>Conteúdo vazio</div>
        </body>
      </html>
    `;

    const selector = await detectMainContentSelector(html);
    expect(selector).toEqual('');
  });
}); 