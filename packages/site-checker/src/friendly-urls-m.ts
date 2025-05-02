import { analyzeTextWithOpenAI } from "./utils-ai.js";

export type AnalysisResult = {
  isShortAndObjective: boolean;
  error?: string;
};

export async function isShortAndObjectiveUrl(urls: string[]): Promise<AnalysisResult[]> {
  const results = await Promise.all(
      urls.map(async (url) => {
          try {
              const parsedUrl = new URL(url);
              const pathname = parsedUrl.pathname;

              const analysis = await analyzeTextWithOpenAI({
                  prompt: `Is the pathname '${pathname}' short and objective? Answer only true/false`
              });

              const isShortAndObjective = analysis.analysis.trim().toLowerCase() === 'true';
              
              return {
                  isShortAndObjective,
              };
          } catch (error) {
              return {
                  isShortAndObjective: false,
                  error: error instanceof Error ? error.message : 'Unknown error occurred'
              };
          }
      })
  );

  return results;
}