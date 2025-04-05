import { isURL, cleanDomainName } from "./utils.js";

export interface HSTSCheckResult {
    hstsEnabled: boolean;
    error?: string;
}

export interface InternalLinksHTTPCheckResult {
    hasHTTPInternalLinks: boolean;
    httpInternalLinks: string[];
    error?: string;
}

/**
 * Verifica se o site possui o protocolo HSTS ativado ao verificar se o cabeçalho "strict-transport-security" está presente
 * @param input - URL do site a ser checado (e.g., "https://example.com")
 * @returns Promise<HSTSCheckResult> - O resultado da verificação, contendo se o HSTS está ativo
 */
export async function checkHSTSProtocol(input: string): Promise<HSTSCheckResult> {
    if (!isURL(input)) {
        return { hstsEnabled: false, error: "O input não é uma URL válida." };
    }
    try {
        const response = await fetch(input);
        const hstsHeader = response.headers.get("strict-transport-security");
        return { hstsEnabled: hstsHeader !== null };
    } catch (error) {
        return {
            hstsEnabled: false,
            error: error instanceof Error ? error.message : "Erro desconhecido"
        };
    }
}

/**
 * Verifica se um site possui links internos utilizando HTTP ao invés de HTTPS.
 * Caso o input seja uma URL, o conteúdo da página é buscado e o domínio é determinado a partir da URL.
 * Em seguida, é feito o parse do HTML para extrair links que comecem com "http://" e que pertençam ao mesmo domínio.
 * Se o input for um conteúdo HTML, a verificação é feita diretamente sobre esse conteúdo.
 * 
 * @param input - URL ou conteúdo HTML da página a ser verificada
 * @returns Promise<InternalLinksHTTPCheckResult> - Resultado com o indicador booleano e a lista de links internos que usam HTTP
 */
export async function checkInternalLinksUsingHTTP(input: string): Promise<InternalLinksHTTPCheckResult> {
    try {
        let content: string;
        let domain = "";

        if (isURL(input)) {
            const response = await fetch(input);
            if (!response.ok) {
                return {
                    hasHTTPInternalLinks: false,
                    httpInternalLinks: [],
                    error: `HTTP Error: ${response.status} ${response.statusText}`
                };
            }
            content = await response.text();
            // Extrai o hostname da URL
            try {
                const urlObj = new URL(input);
                domain = urlObj.hostname;
            } catch (err) {
                domain = "";
            }
        } else {
            content = input;
        }

        // Regex para capturar href com protocolo http
        const regex = /<a\s+(?:[^>]*?\s+)?href=(\"|')(http:\/\/[^\"']+)\1/gi;
        const httpLinks: string[] = [];
        let match: RegExpExecArray | null;

        while ((match = regex.exec(content)) !== null) {
            const link = match[2];
            if (domain) {
                try {
                    const linkUrl = new URL(link);
                    if (linkUrl.hostname === domain) {
                        httpLinks.push(link);
                    }
                } catch (err) {
                    // Se houver erro ao criar URL, ignora o link
                }
            } else {
                // Caso não possua domínio, assume que todos os links http encontrados são internos
                httpLinks.push(link);
            }
        }

        return {
            hasHTTPInternalLinks: httpLinks.length > 0,
            httpInternalLinks: httpLinks
        };
    } catch (error) {
        return {
            hasHTTPInternalLinks: false,
            httpInternalLinks: [],
            error: error instanceof Error ? error.message : "Erro desconhecido"
        };
    }
}

import https from "https";

export interface CertificateCheckResult {
    certificateValid: boolean;
    validFrom?: string;
    validTo?: string;
    error?: string;
}

/**
 * Verifica se o certificado SSL de um domínio é válido utilizando conexão TLS.
 * Caso o input seja uma URL, o domínio é extraído a partir da URL.
 * 
 * @param input - URL ou nome do domínio a ser verificado (e.g., "https://example.com" ou "example.com")
 * @returns Promise<CertificateCheckResult> - Resultado da verificação do certificado SSL.
 */
export async function checkSSLCertificateValidity(input: string): Promise<CertificateCheckResult> {
    return new Promise((resolve) => {
        try {
            let domain = "";
            if (isURL(input)) {
                try {
                    const urlObj = new URL(input);
                    domain = urlObj.hostname;
                } catch (err) {
                    domain = "";
                }
            } else {
                domain = input;
            }
            if (!domain) {
                resolve({ certificateValid: false, error: "Domínio inválido." });
                return;
            }
            const cleanDomain = cleanDomainName(domain);
            const options = {
                host: cleanDomain,
                port: 443,
                method: 'GET'
            };
            const req = https.request(options, (res: any) => {
                const certificate = res.socket.getPeerCertificate();
                if (!certificate || Object.keys(certificate).length === 0) {
                    resolve({ certificateValid: false, error: "Nenhum certificado encontrado." });
                    return;
                }
                const validFrom = new Date(certificate.valid_from);
                const validTo = new Date(certificate.valid_to);
                const now = new Date();
                const certificateValid = now >= validFrom && now <= validTo;
                resolve({
                    certificateValid,
                    validFrom: certificate.valid_from,
                    validTo: certificate.valid_to
                });
            });
            req.on("error", (e: Error) => {
                resolve({ certificateValid: false, error: e.message });
            });
            req.end();
        } catch (error: any) {
            resolve({ certificateValid: false, error: error.message });
        }
    });
}

export interface HTTPSProtocolCheckResult {
    isHTTPS: boolean;
    statusOk?: boolean;
    error?: string;
}

/**
 * Verifica se a página utiliza o protocolo HTTPS e se a requisição retorna status 200
 * @param input - URL da página a ser verificada (e.g., "https://example.com")
 * @returns Promise<HTTPSProtocolCheckResult> - Resultado da verificação com isHTTPS true se o protocolo for HTTPS e statusOk true se a requisição retornar 200
 */
export async function checkHTTPSProtocol(input: string): Promise<HTTPSProtocolCheckResult> {
    if (!isURL(input)) {
        return { isHTTPS: false, error: "O input não é uma URL válida." };
    }
    try {
        const urlObj = new URL(input);
        if (urlObj.protocol !== "https:") {
            return { isHTTPS: false };
        }
        const response = await fetch(input);
        return { isHTTPS: true, statusOk: response.status === 200 };
    } catch (error) {
        return { isHTTPS: true, error: error instanceof Error ? error.message : "Erro desconhecido" };
    }
}
