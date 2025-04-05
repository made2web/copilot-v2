/**
 * Remove protocolos (http/https) e www de um domínio
 * @param domain - O domínio a ser limpo
 * @returns string - O domínio limpo
 */
export function cleanDomainName(domain: string): string {
  return domain.replace(/^https?:\/\//, "").replace(/^www\./, "");
}

export function isURL(input: string): boolean {
  try {
      const url = new URL(input);
      return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
      return false;
  }
}

export function isHtmlContent(input: string): [boolean, string] {
  const trimmed = input.trim();
  
  if (trimmed.startsWith('<?xml')) {
    return [true, trimmed];
  }

  const tagMatch = trimmed.match(/^<(!DOCTYPE|[a-zA-Z]+)/i);
  if (!tagMatch) {
    const cleanDomain = input.replace(/^(https?:\/\/)?(www\.)?/, '')
                            .replace(/\/.*/, '');
    const protocol = input.startsWith('http://') ? 'http' : 'https';
    const url = `${protocol}://${cleanDomain}/`;
    return [false, url];
  }

  const tagName = tagMatch[1].toLowerCase();
  
  if (tagName === '!doctype') {
    return [true, trimmed];
  }

  const closingTag = `</${tagName}>`;
  const hasValidStructure = trimmed.endsWith(closingTag) && 
                          (trimmed.indexOf('>') < trimmed.lastIndexOf(closingTag));

  return hasValidStructure 
    ? [true, trimmed.slice(trimmed.indexOf('>') + 1, trimmed.lastIndexOf(closingTag))]
    : [false, ""];
}