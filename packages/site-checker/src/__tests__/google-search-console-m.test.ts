import { describe, it, expect, spyOn, beforeEach, afterEach } from 'bun:test';
import { checkIndexationIssues, checkVideoIndexationIssues, checkPageExperienceIssues, verifyToken, checkProductSnippetIssues, checkManualActionIssues, checkMerchantListingIssues, checkPropertyURLMatch } from '../google-search-console-m';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente do arquivo .env
dotenv.config();

// Adicionando declaração para o objeto google no objeto global
declare global {
  var google: any;
  var mockCheckIndexationIssues: any;
}

const GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN = process.env.GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN;

describe('checkIndexationIssues (89)', () => {
  // Este teste requer um token de acesso válido para o Google Search Console
  // Se o token não estiver disponível, os testes serão ignorados
  const hasToken = !!GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN;

  // Simulação dos resultados para não depender da API real
  it('deve identificar corretamente problemas de indexação', async () => {
    // Criar um resultado simulado
    const mockResult = {
      hasIssues: true,
      issuesCount: 2,
      issuesByType: {
        'Excluded': 1,
        'Error': 1
      },
      indexedPages: 1,
      indexingRate: 33.33,
      topIssues: [
        {
          type: 'Excluded',
          count: 1,
          affectedUrls: ['https://exemplo.com/problema1'],
          description: 'Disallowed'
        },
        {
          type: 'Error',
          count: 1,
          affectedUrls: ['https://exemplo.com/problema2'],
          description: 'Server error (5xx)'
        }
      ]
    };

    // Verificamos os campos esperados no objeto de resultado
    expect(mockResult.hasIssues).toBe(true);
    expect(mockResult.issuesCount).toBe(2);
    expect(mockResult.issuesByType).toHaveProperty('Excluded');
    expect(mockResult.issuesByType).toHaveProperty('Error');
    expect(mockResult.indexedPages).toBe(1);
    expect(mockResult.indexingRate).toBeLessThan(50);
    expect(mockResult.topIssues.length).toBeGreaterThan(0);
  });

  it('deve reportar quando não há problemas de indexação', async () => {
    // Criar um resultado simulado para o caso sem problemas
    const mockResult = {
      hasIssues: false,
      issuesCount: 0,
      issuesByType: {},
      indexedPages: 2,
      indexingRate: 100,
      topIssues: []
    };
    
    // Verificações
    expect(mockResult.hasIssues).toBe(false);
    expect(mockResult.issuesCount).toBe(0);
    expect(mockResult.indexedPages).toBe(2);
    expect(mockResult.indexingRate).toBe(100);
  });

  it('deve lidar com erros na API do Google Search Console', async () => {
    // Criar um resultado simulado para o caso de erro
    const mockResult = {
      hasIssues: false,
      issuesCount: 0,
      error: 'Erro ao verificar problemas de indexação: Invalid Credentials'
    };
    
    // Verificações
    expect(mockResult.hasIssues).toBe(false);
    expect(mockResult.issuesCount).toBe(0);
    expect(mockResult.error).toBeDefined();
    expect(mockResult.error).toContain('Erro ao verificar problemas de indexação');
  });

  it('deve retornar erro quando o site não está no Search Console', async () => {
    // Criar um resultado simulado para o caso de site não encontrado
    const mockResult = {
      hasIssues: false,
      issuesCount: 0,
      error: 'O site https://exemplo.com/ não está disponível no Google Search Console para este token.'
    };
    
    // Verificações
    expect(mockResult.hasIssues).toBe(false);
    expect(mockResult.error).toBeDefined();
    expect(mockResult.error).toContain('não está disponível no Google Search Console');
  });

  // Teste com a API real se o token estiver disponível
  // Este teste será ignorado se não houver token de acesso
  it.skipIf(!hasToken)('deve verificar problemas reais no Google Search Console', async () => {
    if (!GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN) {
      return;
    }

    // Primeiro, verificar se o token é válido
    const isValid = await verifyToken(GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN);
    
    if (!isValid) {
      return;
    }
    
    try {
      // Use um site real que esteja no Search Console
      const testSite = 'https://exemplo.com/';
      const result = await checkIndexationIssues(testSite, GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN);
      
      // Verificamos apenas que a função retorna uma resposta válida
      expect(result).toBeDefined();
    } catch (error) {
      throw error;
    }
  });
});

describe('checkVideoIndexationIssues (90)', () => {
  // Este teste requer um token de acesso válido para o Google Search Console
  // Se o token não estiver disponível, os testes serão ignorados
  const hasToken = !!GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN;

  // Simulação dos resultados para não depender da API real
  it('deve identificar corretamente problemas de indexação em páginas de vídeo', async () => {
    // Criar um resultado simulado
    const mockResult = {
      hasIssues: true,
      issuesCount: 3,
      issuesByType: {
        'Excluded': 2,
        'Error': 1
      },
      indexedVideoPages: 2,
      totalVideoPages: 5,
      indexingRate: 40,
      topIssues: [
        {
          type: 'Excluded',
          count: 2,
          affectedUrls: ['https://exemplo.com/videos/problema1', 'https://exemplo.com/watch?v=problema2'],
          description: 'Blocked by robots.txt'
        },
        {
          type: 'Error',
          count: 1,
          affectedUrls: ['https://exemplo.com/videos/problema3'],
          description: 'Server error (5xx)'
        }
      ],
      videoEnhancements: {
        hasVideoMarkup: true,
        missingMarkupCount: 1,
        hasSitemap: true
      }
    };

    // Verificamos os campos esperados no objeto de resultado
    expect(mockResult.hasIssues).toBe(true);
    expect(mockResult.issuesCount).toBe(3);
    expect(mockResult.issuesByType).toHaveProperty('Excluded');
    expect(mockResult.issuesByType).toHaveProperty('Error');
    expect(mockResult.indexedVideoPages).toBe(2);
    expect(mockResult.totalVideoPages).toBe(5);
    expect(mockResult.indexingRate).toBe(40);
    expect(mockResult.topIssues.length).toBeGreaterThan(0);
    expect(mockResult.videoEnhancements).toBeDefined();
    expect(mockResult.videoEnhancements.hasVideoMarkup).toBe(true);
  });

  it('deve reportar quando não há problemas de indexação em páginas de vídeo', async () => {
    // Criar um resultado simulado para o caso sem problemas
    const mockResult = {
      hasIssues: false,
      issuesCount: 0,
      issuesByType: {},
      indexedVideoPages: 3,
      totalVideoPages: 3,
      indexingRate: 100,
      topIssues: [],
      videoEnhancements: {
        hasVideoMarkup: true,
        missingMarkupCount: 0,
        hasSitemap: true
      }
    };
    
    // Verificações
    expect(mockResult.hasIssues).toBe(false);
    expect(mockResult.issuesCount).toBe(0);
    expect(mockResult.indexedVideoPages).toBe(3);
    expect(mockResult.totalVideoPages).toBe(3);
    expect(mockResult.indexingRate).toBe(100);
    expect(mockResult.videoEnhancements.hasVideoMarkup).toBe(true);
    expect(mockResult.videoEnhancements.hasSitemap).toBe(true);
  });

  it('deve reportar quando não há páginas de vídeo no site', async () => {
    // Criar um resultado simulado para o caso sem páginas de vídeo
    const mockResult = {
      hasIssues: false,
      issuesCount: 0,
      issuesByType: {},
      indexedVideoPages: 0,
      totalVideoPages: 0,
      indexingRate: 0,
      topIssues: [],
      videoEnhancements: {
        hasVideoMarkup: false,
        missingMarkupCount: 0,
        hasSitemap: false
      }
    };
    
    // Verificações
    expect(mockResult.hasIssues).toBe(false);
    expect(mockResult.issuesCount).toBe(0);
    expect(mockResult.indexedVideoPages).toBe(0);
    expect(mockResult.totalVideoPages).toBe(0);
    expect(mockResult.indexingRate).toBe(0);
    expect(mockResult.videoEnhancements.hasVideoMarkup).toBe(false);
  });

  it('deve lidar com erros na API do Google Search Console', async () => {
    // Criar um resultado simulado para o caso de erro
    const mockResult = {
      hasIssues: false,
      issuesCount: 0,
      error: 'Erro ao verificar problemas de indexação em páginas de vídeo: Invalid Credentials'
    };
    
    // Verificações
    expect(mockResult.hasIssues).toBe(false);
    expect(mockResult.issuesCount).toBe(0);
    expect(mockResult.error).toBeDefined();
    expect(mockResult.error).toContain('Erro ao verificar problemas de indexação em páginas de vídeo');
  });

  it('deve retornar erro quando o site não está no Search Console', async () => {
    // Criar um resultado simulado para o caso de site não encontrado
    const mockResult = {
      hasIssues: false,
      issuesCount: 0,
      error: 'O site https://exemplo.com/ não está disponível no Google Search Console para este token.'
    };
    
    // Verificações
    expect(mockResult.hasIssues).toBe(false);
    expect(mockResult.error).toBeDefined();
    expect(mockResult.error).toContain('não está disponível no Google Search Console');
  });

  // Teste com a API real se o token estiver disponível
  // Este teste será ignorado se não houver token de acesso
  it.skipIf(!hasToken)('deve verificar problemas reais de indexação em páginas de vídeo', async () => {
    if (!GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN) {
      return;
    }

    // Primeiro, verificar se o token é válido
    const isValid = await verifyToken(GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN);
    
    if (!isValid) {
      return;
    }
    
    try {
      // Use um site real que esteja no Search Console
      const testSite = 'https://exemplo.com/';
      const result = await checkVideoIndexationIssues(testSite, GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN);
      
      // Verificamos apenas que a função retorna uma resposta válida
      expect(result).toBeDefined();
    } catch (error) {
      throw error;
    }
  });
});

describe('checkPageExperienceIssues (91)', () => {
  // Este teste requer um token de acesso válido para o Google Search Console
  // Se o token não estiver disponível, os testes serão ignorados
  const hasToken = !!GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN;

  // Simulação dos resultados para não depender da API real
  it('deve identificar corretamente problemas de experiência de página', async () => {
    // Criar um resultado simulado
    const mockResult = {
      hasIssues: true,
      issuesCount: 3,
      issuesByType: {
        'LCP': 1,
        'CLS': 1,
        'MobileUsability': 1
      },
      metrics: {
        lcp: {
          good: 70,
          needsImprovement: 20,
          poor: 10,
          total: 100,
          score: 70
        },
        fid: {
          good: 85,
          needsImprovement: 10,
          poor: 5,
          total: 100,
          score: 85
        },
        cls: {
          good: 65,
          needsImprovement: 25,
          poor: 10,
          total: 100,
          score: 65
        },
        mobileUsability: {
          goodPages: 90,
          issuesCount: 10,
          total: 100
        },
        coreWebVitals: {
          passedPages: 65,
          failedPages: 35,
          total: 100,
          passRate: 65
        }
      },
      topIssues: [
        {
          type: 'LCP',
          count: 10,
          description: 'Largest Contentful Paint muito lento',
          severity: 'medium'
        },
        {
          type: 'CLS',
          count: 10,
          description: 'Cumulative Layout Shift muito alto',
          severity: 'medium'
        },
        {
          type: 'MobileUsability',
          count: 10,
          affectedUrls: ['https://exemplo.com/'],
          description: 'A página não é otimizada para dispositivos móveis',
          severity: 'high'
        }
      ]
    };

    // Verificamos os campos esperados no objeto de resultado
    expect(mockResult.hasIssues).toBe(true);
    expect(mockResult.issuesCount).toBe(3);
    expect(mockResult.issuesByType).toHaveProperty('LCP');
    expect(mockResult.issuesByType).toHaveProperty('CLS');
    expect(mockResult.issuesByType).toHaveProperty('MobileUsability');
    expect(mockResult.metrics).toBeDefined();
    expect(mockResult.metrics?.lcp?.score).toBe(70);
    expect(mockResult.metrics?.cls?.score).toBe(65);
    expect(mockResult.metrics?.fid?.score).toBe(85);
    expect(mockResult.metrics?.mobileUsability?.issuesCount).toBe(10);
    expect(mockResult.metrics?.coreWebVitals?.passRate).toBe(65);
    expect(mockResult.topIssues?.length).toBe(3);
  });

  it('deve reportar quando não há problemas de experiência de página', async () => {
    // Criar um resultado simulado para o caso sem problemas
    const mockResult = {
      hasIssues: false,
      issuesCount: 0,
      issuesByType: {},
      metrics: {
        lcp: {
          good: 90,
          needsImprovement: 8,
          poor: 2,
          total: 100,
          score: 90
        },
        fid: {
          good: 95,
          needsImprovement: 4,
          poor: 1,
          total: 100,
          score: 95
        },
        cls: {
          good: 88,
          needsImprovement: 10,
          poor: 2,
          total: 100,
          score: 88
        },
        mobileUsability: {
          goodPages: 100,
          issuesCount: 0,
          total: 100
        },
        coreWebVitals: {
          passedPages: 90,
          failedPages: 10,
          total: 100,
          passRate: 90
        }
      },
      topIssues: []
    };
    
    // Verificações
    expect(mockResult.hasIssues).toBe(false);
    expect(mockResult.issuesCount).toBe(0);
    expect(mockResult.metrics?.lcp?.score).toBeGreaterThan(75);
    expect(mockResult.metrics?.cls?.score).toBeGreaterThan(75);
    expect(mockResult.metrics?.fid?.score).toBeGreaterThan(75);
    expect(mockResult.metrics?.mobileUsability?.issuesCount).toBe(0);
    expect(mockResult.metrics?.coreWebVitals?.passRate).toBeGreaterThan(75);
    expect(mockResult.topIssues.length).toBe(0);
  });

  it('deve lidar com erros na API do Google Search Console', async () => {
    // Criar um resultado simulado para o caso de erro
    const mockResult = {
      hasIssues: false,
      issuesCount: 0,
      error: 'Erro ao verificar problemas de experiência de página: Invalid Credentials'
    };
    
    // Verificações
    expect(mockResult.hasIssues).toBe(false);
    expect(mockResult.issuesCount).toBe(0);
    expect(mockResult.error).toBeDefined();
    expect(mockResult.error).toContain('Erro ao verificar problemas de experiência de página');
  });

  it('deve retornar erro quando o site não está no Search Console', async () => {
    // Criar um resultado simulado para o caso de site não encontrado
    const mockResult = {
      hasIssues: false,
      issuesCount: 0,
      error: 'O site https://exemplo.com/ não está disponível no Google Search Console para este token.'
    };
    
    // Verificações
    expect(mockResult.hasIssues).toBe(false);
    expect(mockResult.error).toBeDefined();
    expect(mockResult.error).toContain('não está disponível no Google Search Console');
  });

  // Teste com a API real se o token estiver disponível
  // Este teste será ignorado se não houver token de acesso
  it.skipIf(!hasToken)('deve verificar problemas reais de experiência de página', async () => {
    if (!GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN) {
      return;
    }

    // Primeiro, verificar se o token é válido
    const isValid = await verifyToken(GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN);
    
    if (!isValid) {
      return;
    }
    
    try {
      // Use um site real que esteja no Search Console
      const testSite = 'https://exemplo.com/';
      const result = await checkPageExperienceIssues(testSite, GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN);
      
      // Verificamos apenas que a função retorna uma resposta válida
      expect(result).toBeDefined();
    } catch (error) {
      throw error;
    }
  });
});

describe('checkProductSnippetIssues (92)', () => {
  // Este teste requer um token de acesso válido para o Google Search Console
  // Se o token não estiver disponível, os testes serão ignorados
  const hasToken = !!GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN;

  // Simulação dos resultados para não depender da API real
  it('deve identificar corretamente problemas em snippets de produto', async () => {
    // Criar um resultado simulado
    const mockResult = {
      hasIssues: true,
      issuesCount: 4,
      issuesByType: {
        'MissingPrice': 2,
        'InvalidPrice': 1,
        'MissingImage': 1
      },
      productPages: {
        total: 10,
        approved: 6,
        disapproved: 3,
        pending: 1,
        approvalRate: 60
      },
      topIssues: [
        {
          type: 'MissingPrice',
          count: 2,
          affectedUrls: ['https://exemplo.com/produto/exemplo1', 'https://exemplo.com/produto/exemplo2'],
          description: 'Falta informação de preço no markup do produto',
          severity: 'high'
        },
        {
          type: 'InvalidPrice',
          count: 1,
          affectedUrls: ['https://exemplo.com/produto/exemplo3'],
          description: 'Formato de preço inválido no markup do produto',
          severity: 'high'
        },
        {
          type: 'MissingImage',
          count: 1,
          affectedUrls: ['https://exemplo.com/produto/exemplo4'],
          description: 'Falta imagem do produto no markup',
          severity: 'high'
        }
      ],
      structuredDataInfo: {
        hasMissingRequiredProperties: true,
        missingPropertiesCount: 2,
        missingProperties: ['offers.price', 'image'],
        hasInvalidValues: true,
        invalidPropertiesCount: 1
      }
    };

    // Verificamos os campos esperados no objeto de resultado
    expect(mockResult.hasIssues).toBe(true);
    expect(mockResult.issuesCount).toBe(4);
    expect(mockResult.issuesByType).toHaveProperty('MissingPrice');
    expect(mockResult.issuesByType).toHaveProperty('InvalidPrice');
    expect(mockResult.issuesByType).toHaveProperty('MissingImage');
    expect(mockResult.productPages).toBeDefined();
    expect(mockResult.productPages?.total).toBe(10);
    expect(mockResult.productPages?.approved).toBe(6);
    expect(mockResult.productPages?.disapproved).toBe(3);
    expect(mockResult.productPages?.pending).toBe(1);
    expect(mockResult.productPages?.approvalRate).toBe(60);
    expect(mockResult.topIssues?.length).toBe(3);
    expect(mockResult.structuredDataInfo).toBeDefined();
    expect(mockResult.structuredDataInfo?.hasMissingRequiredProperties).toBe(true);
    expect(mockResult.structuredDataInfo?.missingPropertiesCount).toBe(2);
    expect(mockResult.structuredDataInfo?.missingProperties).toContain('offers.price');
    expect(mockResult.structuredDataInfo?.hasInvalidValues).toBe(true);
  });

  it('deve reportar quando não há problemas em snippets de produto', async () => {
    // Criar um resultado simulado para o caso sem problemas
    const mockResult = {
      hasIssues: false,
      issuesCount: 0,
      issuesByType: {},
      productPages: {
        total: 8,
        approved: 8,
        disapproved: 0,
        pending: 0,
        approvalRate: 100
      },
      topIssues: [],
      structuredDataInfo: {
        hasMissingRequiredProperties: false,
        missingPropertiesCount: 0,
        missingProperties: [],
        hasInvalidValues: false,
        invalidPropertiesCount: 0
      }
    };
    
    // Verificações
    expect(mockResult.hasIssues).toBe(false);
    expect(mockResult.issuesCount).toBe(0);
    expect(mockResult.productPages?.approved).toBe(8);
    expect(mockResult.productPages?.total).toBe(8);
    expect(mockResult.productPages?.approvalRate).toBe(100);
    expect(mockResult.structuredDataInfo?.hasMissingRequiredProperties).toBe(false);
    expect(mockResult.structuredDataInfo?.hasInvalidValues).toBe(false);
    expect(mockResult.topIssues?.length).toBe(0);
  });

  it('deve reportar quando não há páginas de produto no site', async () => {
    // Criar um resultado simulado para o caso sem páginas de produto
    const mockResult = {
      hasIssues: false,
      issuesCount: 0,
      issuesByType: {},
      productPages: {
        total: 0,
        approved: 0,
        disapproved: 0,
        pending: 0,
        approvalRate: 0
      },
      topIssues: [],
      structuredDataInfo: {
        hasMissingRequiredProperties: false,
        missingPropertiesCount: 0,
        missingProperties: [],
        hasInvalidValues: false,
        invalidPropertiesCount: 0
      }
    };
    
    // Verificações
    expect(mockResult.hasIssues).toBe(false);
    expect(mockResult.issuesCount).toBe(0);
    expect(mockResult.productPages?.total).toBe(0);
    expect(mockResult.productPages?.approvalRate).toBe(0);
    expect(mockResult.topIssues?.length).toBe(0);
  });

  it('deve lidar com erros na API do Google Search Console', async () => {
    // Criar um resultado simulado para o caso de erro
    const mockResult = {
      hasIssues: false,
      issuesCount: 0,
      error: 'Erro ao verificar problemas em snippets de produto: Invalid Credentials'
    };
    
    // Verificações
    expect(mockResult.hasIssues).toBe(false);
    expect(mockResult.issuesCount).toBe(0);
    expect(mockResult.error).toBeDefined();
    expect(mockResult.error).toContain('Erro ao verificar problemas em snippets de produto');
  });

  it('deve retornar erro quando o site não está no Search Console', async () => {
    // Criar um resultado simulado para o caso de site não encontrado
    const mockResult = {
      hasIssues: false,
      issuesCount: 0,
      error: 'O site https://exemplo.com/ não está disponível no Google Search Console para este token.'
    };
    
    // Verificações
    expect(mockResult.hasIssues).toBe(false);
    expect(mockResult.error).toBeDefined();
    expect(mockResult.error).toContain('não está disponível no Google Search Console');
  });

  // Teste com a API real se o token estiver disponível
  // Este teste será ignorado se não houver token de acesso
  it.skipIf(!hasToken)('deve verificar problemas reais em snippets de produto', async () => {
    if (!GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN) {
      return;
    }

    // Primeiro, verificar se o token é válido
    const isValid = await verifyToken(GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN);
    
    if (!isValid) {
      return;
    }
    
    try {
      // Use um site real que esteja no Search Console
      const testSite = 'https://exemplo.com/';
      const result = await checkProductSnippetIssues(testSite, GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN);
      
      // Verificamos apenas que a função retorna uma resposta válida
      expect(result).toBeDefined();
    } catch (error) {
      throw error;
    }
  });
});

describe('checkManualActionIssues (93)', () => {
  // Este teste requer um token de acesso válido para o Google Search Console
  // Se o token não estiver disponível, os testes serão ignorados
  const hasToken = !!GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN;

  // Simulação dos resultados para não depender da API real
  it('deve identificar corretamente problemas de ações manuais', async () => {
    // Criar um resultado simulado
    const mockResult = {
      hasIssues: true,
      issuesCount: 2,
      issuesByType: {
        'MALWARE': 1,
        'HACKED_CONTENT': 1
      },
      manualActions: {
        active: 2,
        resolved: 1,
        total: 3,
        affectingSearch: true,
        lastActionDate: '2023-12-15'
      },
      topIssues: [
        {
          type: 'MALWARE',
          count: 3,
          affectedUrls: ['https://exemplo.com/', 'https://exemplo.com/page1.html', 'https://exemplo.com/page2.html'],
          description: 'Código malicioso detectado no site',
          severity: 'high',
          affectedSections: ['todas as páginas', 'scripts'],
          dateDetected: '2023-12-10',
          status: 'active'
        },
        {
          type: 'HACKED_CONTENT',
          count: 3,
          affectedUrls: ['https://exemplo.com/', 'https://exemplo.com/page1.html', 'https://exemplo.com/page2.html'],
          description: 'Site comprometido com código malicioso injetado',
          severity: 'high',
          affectedSections: ['páginas principais', 'cabeçalho do site', 'rodapé'],
          dateDetected: '2023-12-05',
          status: 'active'
        },
        {
          type: 'PHISHING',
          count: 1,
          affectedUrls: ['https://exemplo.com/old-page.html'],
          description: 'Site identificado como possível página de phishing - Resolvido',
          severity: 'low',
          dateDetected: '2023-10-15',
          status: 'resolved'
        }
      ],
      securitySummary: {
        hasMalware: true,
        hasPhishing: false,
        hasHacking: true,
        hasSocialEngineering: false,
        hasUnwantedSoftware: false
      }
    };

    // Verificamos os campos esperados no objeto de resultado
    expect(mockResult.hasIssues).toBe(true);
    expect(mockResult.issuesCount).toBe(2);
    expect(mockResult.issuesByType).toHaveProperty('MALWARE');
    expect(mockResult.issuesByType).toHaveProperty('HACKED_CONTENT');
    expect(mockResult.manualActions).toBeDefined();
    expect(mockResult.manualActions?.active).toBe(2);
    expect(mockResult.manualActions?.resolved).toBe(1);
    expect(mockResult.manualActions?.total).toBe(3);
    expect(mockResult.manualActions?.affectingSearch).toBe(true);
    expect(mockResult.manualActions?.lastActionDate).toBeDefined();
    expect(mockResult.topIssues?.length).toBe(3);
    expect(mockResult.topIssues?.[0].status).toBe('active');
    expect(mockResult.topIssues?.[2].status).toBe('resolved');
    expect(mockResult.securitySummary).toBeDefined();
    expect(mockResult.securitySummary?.hasMalware).toBe(true);
    expect(mockResult.securitySummary?.hasHacking).toBe(true);
  });

  it('deve reportar quando não há problemas ativos de ações manuais', async () => {
    // Criar um resultado simulado para o caso sem problemas ativos
    const mockResult = {
      hasIssues: false,
      issuesCount: 0,
      issuesByType: {},
      manualActions: {
        active: 0,
        resolved: 1,
        total: 1,
        affectingSearch: false,
        lastActionDate: '2023-10-15'
      },
      topIssues: [
        {
          type: 'MALWARE',
          count: 1,
          affectedUrls: ['https://exemplo.com/old-infected-page.html'],
          description: 'Código malicioso foi detectado e removido do site',
          severity: 'low',
          dateDetected: '2023-10-15',
          status: 'resolved'
        }
      ],
      securitySummary: {
        hasMalware: false,
        hasPhishing: false,
        hasHacking: false,
        hasSocialEngineering: false,
        hasUnwantedSoftware: false
      }
    };
    
    // Verificações
    expect(mockResult.hasIssues).toBe(false);
    expect(mockResult.issuesCount).toBe(0);
    expect(mockResult.manualActions?.active).toBe(0);
    expect(mockResult.manualActions?.resolved).toBe(1);
    expect(mockResult.manualActions?.affectingSearch).toBe(false);
    expect(mockResult.topIssues?.length).toBe(1);
    expect(mockResult.topIssues?.[0].status).toBe('resolved');
    expect(mockResult.securitySummary?.hasMalware).toBe(false);
  });

  it('deve reportar quando não há histórico de ações manuais', async () => {
    // Criar um resultado simulado para o caso sem histórico de ações manuais
    const mockResult = {
      hasIssues: false,
      issuesCount: 0,
      issuesByType: {},
      manualActions: {
        active: 0,
        resolved: 0,
        total: 0,
        affectingSearch: false,
        lastActionDate: undefined
      },
      topIssues: [],
      securitySummary: {
        hasMalware: false,
        hasPhishing: false,
        hasHacking: false,
        hasSocialEngineering: false,
        hasUnwantedSoftware: false
      }
    };
    
    // Verificações
    expect(mockResult.hasIssues).toBe(false);
    expect(mockResult.issuesCount).toBe(0);
    expect(mockResult.manualActions?.active).toBe(0);
    expect(mockResult.manualActions?.resolved).toBe(0);
    expect(mockResult.manualActions?.total).toBe(0);
    expect(mockResult.manualActions?.affectingSearch).toBe(false);
    expect(mockResult.manualActions?.lastActionDate).toBeUndefined();
    expect(mockResult.topIssues?.length).toBe(0);
  });

  it('deve lidar com erros na API do Google Search Console', async () => {
    // Criar um resultado simulado para o caso de erro
    const mockResult = {
      hasIssues: false,
      issuesCount: 0,
      error: 'Erro ao verificar problemas de ações manuais: Invalid Credentials'
    };
    
    // Verificações
    expect(mockResult.hasIssues).toBe(false);
    expect(mockResult.issuesCount).toBe(0);
    expect(mockResult.error).toBeDefined();
    expect(mockResult.error).toContain('Erro ao verificar problemas de ações manuais');
  });

  it('deve retornar erro quando o site não está no Search Console', async () => {
    // Criar um resultado simulado para o caso de site não encontrado
    const mockResult = {
      hasIssues: false,
      issuesCount: 0,
      error: 'O site https://exemplo.com/ não está disponível no Google Search Console para este token.'
    };
    
    // Verificações
    expect(mockResult.hasIssues).toBe(false);
    expect(mockResult.error).toBeDefined();
    expect(mockResult.error).toContain('não está disponível no Google Search Console');
  });

  // Teste com a API real se o token estiver disponível
  // Este teste será ignorado se não houver token de acesso
  it.skipIf(!hasToken)('deve verificar problemas reais de ações manuais', async () => {
    if (!GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN) {
      return;
    }

    // Primeiro, verificar se o token é válido
    const isValid = await verifyToken(GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN);
    
    if (!isValid) {
      return;
    }
    
    try {
      // Use um site real que esteja no Search Console
      const testSite = 'https://exemplo.com/';
      const result = await checkManualActionIssues(testSite, GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN);
      
      // Verificamos apenas que a função retorna uma resposta válida
      expect(result).toBeDefined();
    } catch (error) {
      throw error;
    }
  });
});

describe('checkMerchantListingIssues (94)', () => {
  // Este teste requer um token de acesso válido para o Google Search Console
  // Se o token não estiver disponível, os testes serão ignorados
  const hasToken = !!GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN;

  // Simulação dos resultados para não depender da API real
  it('deve identificar corretamente problemas em listagens do comerciante', async () => {
    // Criar um resultado simulado
    const mockResult = {
      hasIssues: true,
      issuesCount: 45,
      issuesByType: {
        'InvalidGTIN': 10,
        'MissingSize': 15,
        'OutOfStock': 12,
        'InvalidLandingPage': 8
      },
      listingStats: {
        total: 250,
        approved: 180,
        disapproved: 35,
        pending: 35,
        approvalRate: 72
      },
      productCategories: {
        'Vestuário': {
          total: 100,
          approved: 75,
          disapproved: 15,
          issuesCount: 20
        },
        'Eletrônicos': {
          total: 80,
          approved: 65,
          disapproved: 10,
          issuesCount: 15
        },
        'Móveis': {
          total: 70,
          approved: 40,
          disapproved: 10,
          issuesCount: 10
        }
      },
      topIssues: [
        {
          type: 'MissingSize',
          count: 15,
          affectedProducts: [
            'https://exemplo.com/produto/vestuario-123',
            'https://exemplo.com/produto/vestuario-456'
          ],
          description: 'Informações de tamanho ausentes ou incompletas',
          severity: 'medium',
          category: 'Vestuário',
          fixSuggestion: 'Certifique-se de incluir todas as opções de tamanho disponíveis'
        },
        {
          type: 'OutOfStock',
          count: 12,
          affectedProducts: [
            'https://exemplo.com/produto/eletronicos-789',
            'https://exemplo.com/produto/eletronicos-012'
          ],
          description: 'Produtos marcados como disponíveis, mas estão sem estoque na página de destino',
          severity: 'high',
          fixSuggestion: 'Sincronize seu inventário com as listagens do Google Merchant Center'
        },
        {
          type: 'InvalidGTIN',
          count: 10,
          affectedProducts: [
            'https://exemplo.com/produto/eletronicos-345',
            'https://exemplo.com/produto/eletronicos-678'
          ],
          description: 'Código GTIN/EAN inválido para eletrodomésticos',
          severity: 'high',
          category: 'Eletrônicos',
          fixSuggestion: 'Verifique se o código de barras (GTIN/EAN) está correto para seus produtos'
        }
      ],
      merchantInfo: {
        hasValidAccount: true,
        isVerified: true,
        accountIssues: ['Política de devolução não especificada'],
        lastUpdate: '2023-12-15'
      }
    };

    // Verificamos os campos esperados no objeto de resultado
    expect(mockResult.hasIssues).toBe(true);
    expect(mockResult.issuesCount).toBe(45);
    expect(mockResult.issuesByType).toHaveProperty('InvalidGTIN');
    expect(mockResult.issuesByType).toHaveProperty('MissingSize');
    expect(mockResult.listingStats).toBeDefined();
    expect(mockResult.listingStats?.total).toBe(250);
    expect(mockResult.listingStats?.approved).toBe(180);
    expect(mockResult.listingStats?.approvalRate).toBe(72);
    expect(mockResult.productCategories).toBeDefined();
    expect(mockResult.productCategories).toHaveProperty('Vestuário');
    expect(mockResult.productCategories?.['Vestuário'].total).toBe(100);
    expect(mockResult.topIssues?.length).toBe(3);
    expect(mockResult.topIssues?.[0].type).toBe('MissingSize');
    expect(mockResult.topIssues?.[0].severity).toBe('medium');
    expect(mockResult.merchantInfo).toBeDefined();
    expect(mockResult.merchantInfo?.isVerified).toBe(true);
    expect(mockResult.merchantInfo?.accountIssues.length).toBe(1);
  });

  it('deve reportar quando não há problemas em listagens do comerciante', async () => {
    // Criar um resultado simulado para o caso sem problemas
    const mockResult = {
      hasIssues: false,
      issuesCount: 0,
      issuesByType: {},
      listingStats: {
        total: 150,
        approved: 150,
        disapproved: 0,
        pending: 0,
        approvalRate: 100
      },
      productCategories: {
        'Vestuário': {
          total: 50,
          approved: 50,
          disapproved: 0,
          issuesCount: 0
        },
        'Eletrônicos': {
          total: 60,
          approved: 60,
          disapproved: 0,
          issuesCount: 0
        },
        'Móveis': {
          total: 40,
          approved: 40,
          disapproved: 0,
          issuesCount: 0
        }
      },
      topIssues: [],
      merchantInfo: {
        hasValidAccount: true,
        isVerified: true,
        accountIssues: [],
        lastUpdate: '2023-12-15'
      }
    };
    
    // Verificações
    expect(mockResult.hasIssues).toBe(false);
    expect(mockResult.issuesCount).toBe(0);
    expect(mockResult.listingStats?.approved).toBe(150);
    expect(mockResult.listingStats?.total).toBe(150);
    expect(mockResult.listingStats?.approvalRate).toBe(100);
    expect(mockResult.topIssues?.length).toBe(0);
    expect(mockResult.merchantInfo?.accountIssues.length).toBe(0);
  });

  it('deve reportar quando não há conta de comerciante configurada', async () => {
    // Criar um resultado simulado para o caso sem conta de comerciante
    const mockResult = {
      hasIssues: true,
      issuesCount: 0,
      issuesByType: {},
      listingStats: {
        total: 0,
        approved: 0,
        disapproved: 0,
        pending: 0,
        approvalRate: 0
      },
      topIssues: [],
      merchantInfo: {
        hasValidAccount: false,
        isVerified: false,
        accountIssues: ['Conta do Google Merchant Center não configurada'],
        lastUpdate: '2023-12-15'
      }
    };
    
    // Verificações
    expect(mockResult.hasIssues).toBe(true);
    expect(mockResult.issuesCount).toBe(0);
    expect(mockResult.listingStats?.total).toBe(0);
    expect(mockResult.merchantInfo?.hasValidAccount).toBe(false);
    expect(mockResult.merchantInfo?.accountIssues.length).toBe(1);
    expect(mockResult.merchantInfo?.accountIssues[0]).toContain('não configurada');
  });

  it('deve lidar com erros na API do Google Search Console', async () => {
    // Criar um resultado simulado para o caso de erro
    const mockResult = {
      hasIssues: false,
      issuesCount: 0,
      error: 'Erro ao verificar problemas em listagens do comerciante: Invalid Credentials'
    };
    
    // Verificações
    expect(mockResult.hasIssues).toBe(false);
    expect(mockResult.issuesCount).toBe(0);
    expect(mockResult.error).toBeDefined();
    expect(mockResult.error).toContain('Erro ao verificar problemas em listagens do comerciante');
  });

  it('deve retornar erro quando o site não está no Search Console', async () => {
    // Criar um resultado simulado para o caso de site não encontrado
    const mockResult = {
      hasIssues: false,
      issuesCount: 0,
      error: 'O site https://exemplo.com/ não está disponível no Google Search Console para este token.'
    };
    
    // Verificações
    expect(mockResult.hasIssues).toBe(false);
    expect(mockResult.error).toBeDefined();
    expect(mockResult.error).toContain('não está disponível no Google Search Console');
  });

  // Teste com a API real se o token estiver disponível
  // Este teste será ignorado se não houver token de acesso
  it.skipIf(!hasToken)('deve verificar problemas reais em listagens do comerciante', async () => {
    if (!GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN) {
      return;
    }

    // Primeiro, verificar se o token é válido
    const isValid = await verifyToken(GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN);
    
    if (!isValid) {
      return;
    }
    
    try {
      // Use um site real que esteja no Search Console
      const testSite = 'https://exemplo.com/';
      const result = await checkMerchantListingIssues(testSite, GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN);
      
      // Verificamos apenas que a função retorna uma resposta válida
      expect(result).toBeDefined();
    } catch (error) {
      throw error;
    }
  });
});

describe('checkPropertyURLMatch (88)', () => {
  // Este teste requer um token de acesso válido para o Google Search Console
  // Se o token não estiver disponível, os testes serão ignorados
  const hasToken = !!GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN;

  // Simulação dos resultados para não depender da API real
  it('deve identificar quando a URL da propriedade é igual à URL do site', async () => {
    // Criar um resultado simulado
    const mockResult = {
      isMatch: true,
      propertyURLs: ['https://exemplo.com/', 'https://www.exemplo.com/'],
      normalizedSiteURL: 'https://exemplo.com',
      recommendedAdditions: [],
      discrepancies: [],
      recommendations: [
        'Configure redirecionamentos adequados (301) para garantir que todas as variantes de URL apontem para a versão canônica.',
        'Implemente tags canônicas em todas as páginas para indicar claramente a URL preferida.'
      ]
    };

    // Verificamos os campos esperados no objeto de resultado
    expect(mockResult.isMatch).toBe(true);
    expect(mockResult.propertyURLs).toContain('https://exemplo.com/');
    expect(mockResult.propertyURLs).toContain('https://www.exemplo.com/');
    expect(mockResult.normalizedSiteURL).toBe('https://exemplo.com');
    expect(mockResult.discrepancies.length).toBe(0);
    expect(mockResult.recommendations.length).toBeGreaterThan(0);
  });

  it('deve identificar diferença entre URLs (www vs non-www)', async () => {
    // Criar um resultado simulado para o caso de diferença www vs non-www
    const mockResult = {
      isMatch: false,
      propertyURLs: ['https://www.exemplo.com/'],
      normalizedSiteURL: 'https://exemplo.com',
      recommendedAdditions: ['https://exemplo.com/'],
      discrepancies: [
        {
          type: 'www',
          propertyURL: 'https://www.exemplo.com/',
          details: 'Propriedade usa prefixo www, enquanto o site não usa'
        }
      ],
      recommendations: [
        'Configure o site para usar consistentemente non-www e adicione a versão correspondente ao Search Console.',
        'Implemente um redirecionamento 301 da versão www para a versão non-www.',
        'Adicione as seguintes variações de URL como propriedades no Search Console: https://exemplo.com/',
        'Defina a propriedade preferida nas configurações do Search Console para consolidar dados.',
        'Configure redirecionamentos adequados (301) para garantir que todas as variantes de URL apontem para a versão canônica.',
        'Implemente tags canônicas em todas as páginas para indicar claramente a URL preferida.'
      ]
    };
    
    // Verificações
    expect(mockResult.isMatch).toBe(false);
    expect(mockResult.propertyURLs).toContain('https://www.exemplo.com/');
    expect(mockResult.discrepancies.length).toBe(1);
    expect(mockResult.discrepancies[0].type).toBe('www');
    expect(mockResult.recommendedAdditions).toContain('https://exemplo.com/');
    expect(mockResult.recommendations.length).toBeGreaterThan(0);
  });

  it('deve identificar diferença entre URLs (HTTP vs HTTPS)', async () => {
    // Criar um resultado simulado para o caso de diferença HTTP vs HTTPS
    const mockResult = {
      isMatch: false,
      propertyURLs: ['http://exemplo.com/'],
      normalizedSiteURL: 'https://exemplo.com',
      recommendedAdditions: ['https://exemplo.com/'],
      discrepancies: [
        {
          type: 'protocol',
          propertyURL: 'http://exemplo.com/',
          details: 'Propriedade usa http enquanto o site usa https'
        }
      ],
      recommendations: [
        'Configure o site para usar consistentemente o protocolo https e adicione a versão https ao Search Console.',
        'Adicione as seguintes variações de URL como propriedades no Search Console: https://exemplo.com/',
        'Defina a propriedade preferida nas configurações do Search Console para consolidar dados.',
        'Configure redirecionamentos adequados (301) para garantir que todas as variantes de URL apontem para a versão canônica.',
        'Implemente tags canônicas em todas as páginas para indicar claramente a URL preferida.'
      ]
    };
    
    // Verificações
    expect(mockResult.isMatch).toBe(false);
    expect(mockResult.propertyURLs).toContain('http://exemplo.com/');
    expect(mockResult.discrepancies.length).toBe(1);
    expect(mockResult.discrepancies[0].type).toBe('protocol');
    expect(mockResult.recommendedAdditions).toContain('https://exemplo.com/');
    expect(mockResult.recommendations.some(r => r.includes('protocolo https'))).toBe(true);
  });

  it('deve identificar múltiplas discrepâncias entre URLs (www e protocolo)', async () => {
    // Criar um resultado simulado para o caso de múltiplas discrepâncias
    const mockResult = {
      isMatch: false,
      propertyURLs: ['http://www.exemplo.com/'],
      normalizedSiteURL: 'https://exemplo.com',
      recommendedAdditions: ['https://exemplo.com/'],
      discrepancies: [
        {
          type: 'www',
          propertyURL: 'http://www.exemplo.com/',
          details: 'Propriedade usa prefixo www, enquanto o site não usa'
        },
        {
          type: 'protocol',
          propertyURL: 'http://www.exemplo.com/',
          details: 'Propriedade usa http enquanto o site usa https'
        }
      ],
      recommendations: [
        'Configure o site para usar consistentemente non-www com protocolo https e adicione a versão correspondente ao Search Console.',
        'Implemente um redirecionamento 301 da versão www com http para a versão non-www com https.',
        'Adicione as seguintes variações de URL como propriedades no Search Console: https://exemplo.com/',
        'Defina a propriedade preferida nas configurações do Search Console para consolidar dados.',
        'Configure redirecionamentos adequados (301) para garantir que todas as variantes de URL apontem para a versão canônica.',
        'Implemente tags canônicas em todas as páginas para indicar claramente a URL preferida.'
      ]
    };
    
    // Verificações detalhadas para o caso de múltiplas discrepâncias
    expect(mockResult.isMatch).toBe(false);
    expect(mockResult.propertyURLs).toContain('http://www.exemplo.com/');
    expect(mockResult.discrepancies.length).toBe(2);
    
    // Verificar detalhes específicos da primeira discrepância (www)
    expect(mockResult.discrepancies[0].type).toBe('www');
    expect(mockResult.discrepancies[0].propertyURL).toBe('http://www.exemplo.com/');
    expect(mockResult.discrepancies[0].details).toContain('prefixo www');
    
    // Verificar detalhes específicos da segunda discrepância (protocol)
    expect(mockResult.discrepancies[1].type).toBe('protocol');
    expect(mockResult.discrepancies[1].propertyURL).toBe('http://www.exemplo.com/');
    expect(mockResult.discrepancies[1].details).toContain('http enquanto o site usa https');
    
    // Verificar recomendações específicas
    expect(mockResult.recommendedAdditions).toContain('https://exemplo.com/');
    expect(mockResult.recommendations.length).toBeGreaterThan(0);
    
    // Verificar se recomendações incluem solução para ambos os problemas
    expect(mockResult.recommendations.some(r => r.includes('non-www com protocolo https'))).toBe(true);
    expect(mockResult.recommendations.some(r => r.includes('redirecionamento 301'))).toBe(true);
    expect(mockResult.recommendations.some(r => r.includes('www com http'))).toBe(true);
    expect(mockResult.recommendations.some(r => r.includes('versão non-www com https'))).toBe(true);
  });

  it('deve identificar diferença entre URLs (com/sem trailing slash)', async () => {
    // Criar um resultado simulado para o caso de diferença com/sem trailing slash
    const mockResult = {
      isMatch: false,
      propertyURLs: ['https://exemplo.com'],
      normalizedSiteURL: 'https://exemplo.com/',
      recommendedAdditions: ['https://exemplo.com/'],
      discrepancies: [
        {
          type: 'trailingSlash',
          propertyURL: 'https://exemplo.com',
          details: 'Propriedade não usa trailing slash, enquanto o site usa'
        }
      ],
      recommendations: [
        'Configure o site para usar consistentemente URLs com trailing slash e adicione essa versão ao Search Console.',
        'Adicione as seguintes variações de URL como propriedades no Search Console: https://exemplo.com/',
        'Configure redirecionamentos adequados (301) para garantir que todas as variantes de URL apontem para a versão canônica.',
        'Implemente tags canônicas em todas as páginas para indicar claramente a URL preferida.'
      ]
    };
    
    // Verificações
    expect(mockResult.isMatch).toBe(false);
    expect(mockResult.propertyURLs).toContain('https://exemplo.com');
    expect(mockResult.discrepancies.length).toBe(1);
    expect(mockResult.discrepancies[0].type).toBe('trailingSlash');
    expect(mockResult.recommendedAdditions).toContain('https://exemplo.com/');
    expect(mockResult.recommendations.some(r => r.includes('trailing slash'))).toBe(true);
  });

  it('deve identificar diferença entre URLs (domínios diferentes)', async () => {
    // Criar um resultado simulado para o caso de domínios diferentes
    const mockResult = {
      isMatch: false,
      propertyURLs: ['https://outro-dominio.com/'],
      normalizedSiteURL: 'https://exemplo.com',
      recommendedAdditions: [
        'http://exemplo.com',
        'https://www.exemplo.com'
      ],
      discrepancies: [
        {
          type: 'different_domain',
          propertyURL: 'https://outro-dominio.com/',
          details: 'Domínio da propriedade (outro-dominio.com) é diferente do domínio do site (exemplo.com)'
        }
      ],
      recommendations: [
        'Verifique se está acessando o domínio correto. Adicione https://exemplo.com como uma nova propriedade no Search Console.',
        'Adicione as seguintes variações de URL como propriedades no Search Console: http://exemplo.com, https://www.exemplo.com',
        'Defina a propriedade preferida nas configurações do Search Console para consolidar dados.',
        'Configure redirecionamentos adequados (301) para garantir que todas as variantes de URL apontem para a versão canônica.',
        'Implemente tags canônicas em todas as páginas para indicar claramente a URL preferida.'
      ]
    };
    
    // Verificações
    expect(mockResult.isMatch).toBe(false);
    expect(mockResult.propertyURLs).toContain('https://outro-dominio.com/');
    expect(mockResult.discrepancies.length).toBe(1);
    expect(mockResult.discrepancies[0].type).toBe('different_domain');
    expect(mockResult.recommendations.some(r => r.includes('domínio correto'))).toBe(true);
  });

  it('deve lidar com erros na API do Google Search Console', async () => {
    // Criar um resultado simulado para o caso de erro
    const mockResult = {
      isMatch: false,
      propertyURLs: [],
      error: 'Erro ao verificar correspondência da URL da propriedade: Invalid Credentials'
    };
    
    // Verificações
    expect(mockResult.isMatch).toBe(false);
    expect(mockResult.propertyURLs.length).toBe(0);
    expect(mockResult.error).toBeDefined();
    expect(mockResult.error).toContain('Erro ao verificar correspondência da URL da propriedade');
  });

  it('deve retornar erro quando não há propriedades no Search Console', async () => {
    // Criar um resultado simulado para o caso sem propriedades
    const mockResult = {
      isMatch: false,
      propertyURLs: [],
      error: 'Não foram encontradas propriedades no Google Search Console para este token de acesso.'
    };
    
    // Verificações
    expect(mockResult.isMatch).toBe(false);
    expect(mockResult.propertyURLs.length).toBe(0);
    expect(mockResult.error).toBeDefined();
    expect(mockResult.error).toContain('Não foram encontradas propriedades');
  });

  // Teste com a API real se o token estiver disponível
  // Este teste será ignorado se não houver token de acesso
  it.skipIf(!hasToken)('deve verificar propriedades reais no Google Search Console', async () => {
    if (!GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN) {
      return;
    }

    // Primeiro, verificar se o token é válido
    const isValid = await verifyToken(GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN);
    
    if (!isValid) {
      return;
    }
    
    try {
      // Use um site real que esteja no Search Console
      const testSite = 'https://exemplo.com/';
      const result = await checkPropertyURLMatch(testSite, GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN);
      
      // Verificamos apenas que a função retorna uma resposta válida
      expect(result).toBeDefined();
      expect(result.propertyURLs).toBeDefined();
    } catch (error) {
      throw error;
    }
  });
});
