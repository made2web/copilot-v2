/**
 * Remove protocolos (http/https) e www de um domínio
 * @param domain - O domínio a ser limpo
 * @returns string - O domínio limpo
 */
export function cleanDomainName(domain: string): string {
  return domain.replace(/^https?:\/\//, "").replace(/^www\./, "");
}
