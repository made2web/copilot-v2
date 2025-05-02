import { detectIntrusivePopups, analyzeImageWithOpenAI } from './utils-ai';

/**
 * Interface para os resultados da verificação de SEO
 */
export interface SeoCheckResult {
  passed: boolean;
  score: number; // 0 a 1, onde 1 é perfeito
  message: string;
  details?: Record<string, any>;
  recommendations?: string[];
  screenshot?: string;
}

/**
 * Verifica se existem popups intrusivos bloqueando o conteúdo da página
 * @param url URL da página a ser analisada
 * @param options Opções adicionais para a verificação
 * @returns Resultado da verificação SEO para popups intrusivos
 */
export async function checkIntrusivePopups(url: string, options: {
  useAI?: boolean;
  threshold?: number; // Limite de tamanho para popups serem considerados intrusivos (0-1)
} = {}): Promise<SeoCheckResult> {
  try {
    // Detectar popups na página
    const popupResult = await detectIntrusivePopups(url, { 
      takeScreenshot: true,
      waitTime: 3500 // Esperar tempo suficiente para popups aparecerem
    });

    // Se não foram encontrados popups, retorna score perfeito
    if (!popupResult.hasIntrusivePopups && popupResult.popupCount === 0) {
      return {
        passed: true,
        score: 1.0,
        message: "Nenhum popup encontrado na página.",
        details: {
          popupCount: 0
        }
      };
    }

    // Se foram encontrados popups mas nenhum é intrusivo
    if (!popupResult.hasIntrusivePopups && popupResult.popupCount > 0) {
      return {
        passed: true,
        score: 0.9, // Pequena penalidade por ter popups, mesmo que não intrusivos
        message: "Existem popups na página, mas não bloqueiam o conteúdo principal.",
        details: {
          popupCount: popupResult.popupCount,
          popups: popupResult.popupDetails.map(p => ({
            type: p.type,
            size: p.size,
            position: p.position
          }))
        },
        recommendations: [
          "Embora não sejam intrusivos, monitore o uso de popups para garantir boa experiência do usuário.",
          "Considere usar alternativas menos invasivas para banners de cookies e newsletters."
        ],
        screenshot: popupResult.screenshotPath
      };
    }

    // Contagem de popups intrusivos
    const intrusivePopups = popupResult.popupDetails.filter(p => p.isIntrusive);
    
    // Calcular o score com base no número e no tamanho dos popups intrusivos
    // Quanto mais popups intrusivos e quanto maior seu tamanho, menor o score
    const maxScore = 0.7; // Score máximo se tiver popups intrusivos (já é uma falha)
    const viewportArea = popupResult.pageMetrics ? 
      popupResult.pageMetrics.viewportWidth * popupResult.pageMetrics.viewportHeight : 
      1366 * 768;
    
    // Calcular a área ocupada pelos popups intrusivos
    const totalPopupArea = intrusivePopups.reduce((sum, popup) => {
      return sum + (popup.size.width * popup.size.height);
    }, 0);
    
    // Porcentagem da viewport ocupada por popups
    const occupiedPercentage = totalPopupArea / viewportArea;
    
    // Calcular score - quanto mais área ocupada, menor o score
    const score = Math.max(0, maxScore * (1 - occupiedPercentage));

    // Gerar recomendações específicas
    const recommendations = [
      "Remova popups intrusivos que bloqueiam o conteúdo principal da página.",
      "Se precisar usar popups, certifique-se de que eles não cubram o conteúdo principal.",
      "Utilize abordagens menos intrusivas, como banners pequenos em rodapés ou cabeçalhos."
    ];

    // Para popups específicos, adicionar recomendações mais detalhadas
    if (intrusivePopups.some(p => p.type === 'Modal' || p.type === 'Overlay')) {
      recommendations.push(
        "Substitua modais e overlays de tela cheia por versões menores que não bloqueiem todo o conteúdo."
      );
    }
    
    if (intrusivePopups.some(p => p.type === 'Cookie Consent' && p.isIntrusive)) {
      recommendations.push(
        "Redesenhe o banner de consentimento de cookies para que seja menos intrusivo, como uma barra fixa no rodapé."
      );
    }

    // Analisar screenshot com AI se solicitado
    let aiAnalysis = undefined;
    if (options.useAI && popupResult.screenshotPath) {
      try {
        const analysisResult = await analyzeImageWithOpenAI({
          imagePath: popupResult.screenshotPath,
          prompt: "Analise esta captura de tela e identifique se há popups ou modais intrusivos bloqueando o conteúdo principal da página. Descreva brevemente o impacto que esses elementos podem ter na experiência do usuário e no SEO da página."
        });
        
        aiAnalysis = analysisResult.analysis;
        
        // Adicionar recomendações da IA
        if (aiAnalysis) {
          recommendations.push("Análise de IA: " + aiAnalysis);
        }
      } catch (error) {
        console.error("Erro ao analisar screenshot com IA:", error);
      }
    }

    return {
      passed: false,
      score,
      message: `Foram encontrados ${intrusivePopups.length} popup(s) intrusivo(s) bloqueando o conteúdo.`,
      details: {
        intrusivePopupCount: intrusivePopups.length,
        totalPopupCount: popupResult.popupCount,
        intrusivePopups: intrusivePopups.map(p => ({
          type: p.type,
          size: p.size,
          position: p.position,
          zIndex: p.zIndex
        })),
        occupiedScreenPercentage: Math.round(occupiedPercentage * 100),
        aiAnalysis
      },
      recommendations,
      screenshot: popupResult.screenshotPath
    };
  } catch (error) {
    return {
      passed: false,
      score: 0,
      message: `Erro ao verificar popups intrusivos: ${(error as Error).message}`,
      details: { error: (error as Error).message }
    };
  }
}
