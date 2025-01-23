import axios from "axios";

interface RobotsCheckResult {
  hasRobotsTxt: boolean;
  robotsTxtUrl?: string;
  error?: string;
}

/**
 * Verifica se um site tem um arquivo robots.txt
 * @param domain - O domínio a ser verificado (ex: "example.com")
 * @returns Promise<RobotsCheckResult> - Resultado da verificação
 */
export async function checkRobotsTxt(
  domain: string,
): Promise<RobotsCheckResult> {
  try {
    const robotsTxtUrl = `https://${domain}/robots.txt`;
    const response = await axios.get(robotsTxtUrl);

    if (response.status === 200) {
      return {
        hasRobotsTxt: true,
        robotsTxtUrl,
      };
    }
    return {
      hasRobotsTxt: false,
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return {
        hasRobotsTxt: false,
      };
    }
    console.error("Erro ao verificar robots.txt:", error);
    return {
      hasRobotsTxt: false,
      error:
        error instanceof Error
          ? error.message
          : "Erro desconhecido ao verificar robots.txt",
    };
  }
}

//vamos progrmar um agente para verificar se o robots tem sitemap, verificar se o sitemap é valido e se o sitemap tem os links corretos

// Exemplo de uso:
/*
const result = await checkRobotsTxt('example.com');
console.log(result);
// { hasRobotsTxt: true, robotsTxtUrl: 'https://example.com/robots.txt' }
// ou 
// { hasRobotsTxt: false }
*/
