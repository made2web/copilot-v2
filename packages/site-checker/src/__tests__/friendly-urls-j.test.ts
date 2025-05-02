import { describe, test, expect, spyOn } from 'bun:test';
import { isShortAndObjectiveUrl } from '../friendly-urls-m';
import * as utilsAi from '../utils-ai';

describe('isShortAndObjectiveUrl (106)', () => {
  test('deve retornar true quando a URL tem caminho curto e objetivo', async () => {
    const spy = spyOn(utilsAi, 'analyzeTextWithOpenAI');
    
    spy.mockImplementation(async () => {
      return { analysis: 'true', details: {} };
    });
    
    const urls = ['https://exemplo.com/produtos'];
    
    const resultado = await isShortAndObjectiveUrl(urls);
    
    expect(resultado).toHaveLength(1);
    expect(resultado[0].isShortAndObjective).toBe(true);
    expect(resultado[0].error).toBeUndefined();
    
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0].prompt).toContain("/produtos");
    
    spy.mockRestore();
  });

  test('deve retornar false quando a URL tem caminho longo e não objetivo', async () => {
    const spy = spyOn(utilsAi, 'analyzeTextWithOpenAI');
    
    spy.mockImplementation(async () => {
      return { analysis: 'false', details: {} };
    });
    
    const urls = ['https://exemplo.com/categoria/subcategoria/produtos/detalhes/item-12345'];
    
    const resultado = await isShortAndObjectiveUrl(urls);
    
    expect(resultado).toHaveLength(1);
    expect(resultado[0].isShortAndObjective).toBe(false);
    expect(resultado[0].error).toBeUndefined();
    
    spy.mockRestore();
  });

  test('deve processar múltiplas URLs corretamente', async () => {
    const spy = spyOn(utilsAi, 'analyzeTextWithOpenAI');
    
    let callCount = 0;
    spy.mockImplementation(async () => {
      callCount++;
      return { 
        analysis: callCount === 1 ? 'true' : 'false', 
        details: {} 
      };
    });
    
    const urls = [
      'https://exemplo.com/produtos',
      'https://exemplo.com/categoria/subcategoria/produtos/item-12345'
    ];
    

    const resultados = await isShortAndObjectiveUrl(urls);
    
    expect(resultados).toHaveLength(2);
    expect(resultados[0].isShortAndObjective).toBe(true);
    expect(resultados[1].isShortAndObjective).toBe(false);
    
    spy.mockRestore();
  });

  test('deve lidar com erros de URL inválida', async () => {
    const urls = ['url-invalida'];
    
    const resultado = await isShortAndObjectiveUrl(urls);
    
    expect(resultado).toHaveLength(1);
    expect(resultado[0].isShortAndObjective).toBe(false);
    expect(resultado[0].error).toBeDefined();
    expect(resultado[0].error).toContain('"url-invalida" cannot be parsed as a URL.');
  });
});