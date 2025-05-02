import axios from 'axios';

export interface PageSpeedResult {
    loadingExperience: {
      metrics: {
        LARGEST_CONTENTFUL_PAINT_MS?: { percentile: number };
        CUMULATIVE_LAYOUT_SHIFT_SCORE?: { percentile: number };
        INTERACTION_TO_NEXT_PAINT?: { percentile: number };
      };
    };
    lighthouseResult: {
      categories: {
        performance: { score: number };
      };
      environment: {
        networkUserAgent: string;
        hostUserAgent: string;
      };
      audits: {
        'server-response-time'?: {
          numericValue: number;
        };
        // Adicione outros audits conforme necessário
      };
    };
  }

export async function getPageSpeedInsights(
    url: string, 
    apiKey: string,
    strategy: 'mobile' | 'desktop'
): Promise<PageSpeedResult> {
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${apiKey}&strategy=${strategy}`;
    
    try {
      const response = await axios.get(apiUrl);
      return response.data as PageSpeedResult;
    } catch (error) {
      throw new Error(`Erro na requisição: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}