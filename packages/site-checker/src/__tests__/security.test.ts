import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { checkInternalLinksUsingHTTP } from "../security";

// Helper para criar fake Response
function createFakeResponse(body: string, init?: ResponseInit): Response {
    return new Response(body, init);
}

describe("checkInternalLinksUsingHTTP (80)", () => {
    let fetchMock: ReturnType<typeof vi.spyOn>;

    afterEach(() => {
        if (fetchMock) {
            fetchMock.mockRestore();
        }
    });

    it("deve identificar links internos HTTP quando o input é uma URL", async () => {
        const htmlContent = "<html><body>" +
            "<a href=\"http://example.com/page1\">Link 1</a>" +
            "<a href=\"https://example.com/page2\">Link 2</a>" +
            "<a href=\"http://otherdomain.com/page3\">Link 3</a>" +
            "</body></html>";
        // Simula fetch retornando o htmlContent
        fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(() => 
            Promise.resolve(createFakeResponse(htmlContent))
        );
        
        const result = await checkInternalLinksUsingHTTP("https://example.com");
        expect(result.hasHTTPInternalLinks).toBe(true);
        expect(result.httpInternalLinks).toEqual(["http://example.com/page1"]);
    });

    it("deve retornar false quando não há links internos HTTP no conteúdo HTML", async () => {
        const htmlContent = "<html><body>" +
            "<a href=\"https://example.com/page1\">Link 1</a>" +
            "<a href=\"https://example.com/page2\">Link 2</a>" +
            "</body></html>";
        const result = await checkInternalLinksUsingHTTP(htmlContent);
        expect(result.hasHTTPInternalLinks).toBe(false);
        expect(result.httpInternalLinks).toEqual([]);
    });

    it("deve identificar links HTTP como internos quando o input é conteúdo HTML sem URL definida", async () => {
        const htmlContent = "<html><body>" +
            "<a href=\"http://algumdominio.com/page\">Link 1</a>" +
            "</body></html>";
        const result = await checkInternalLinksUsingHTTP(htmlContent);
        // Como não temos domínio de referência, assume que o link http é interno
        expect(result.hasHTTPInternalLinks).toBe(true);
        expect(result.httpInternalLinks).toEqual(["http://algumdominio.com/page"]);
    });

    it("deve retornar erro se o fetch falhar ao buscar conteúdo de uma URL", async () => {
        fetchMock = vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Falha no fetch"));

        const result = await checkInternalLinksUsingHTTP("https://example.com");
        expect(result.hasHTTPInternalLinks).toBe(false);
        expect(result.httpInternalLinks).toEqual([]);
        expect(result.error).toBe("Falha no fetch");
    });
});

import https from "https";
import { checkSSLCertificateValidity } from "../security";

describe("checkSSLCertificateValidity (79)", () => {
    let requestMock: ReturnType<typeof vi.spyOn>;

    afterEach(() => {
        if (requestMock) {
            requestMock.mockRestore();
        }
    });

    it("deve retornar certificado válido para domínio com SSL válido", async () => {
        const validFrom = new Date(Date.now() - 3600000).toUTCString();
        const validTo = new Date(Date.now() + 3600000).toUTCString();

        const fakeResponse = {
            socket: {
                getPeerCertificate: () => ({
                    valid_from: validFrom,
                    valid_to: validTo
                })
            }
        };

        requestMock = vi.spyOn(https, "request").mockImplementation((options: any, callback: any) => {
            callback(fakeResponse);
            return {
                on: (event: string, handler: Function) => {},
                end: () => {}
            };
        });

        const result = await checkSSLCertificateValidity("https://valid.com");
        expect(result.certificateValid).toBe(true);
        expect(result.validFrom).toBe(validFrom);
        expect(result.validTo).toBe(validTo);
    });

    it("deve retornar certificado inválido para domínio com SSL expirado", async () => {
        const validFrom = new Date(Date.now() - 7200000).toUTCString();
        const validTo = new Date(Date.now() - 3600000).toUTCString();

        const fakeResponse = {
            socket: {
                getPeerCertificate: () => ({
                    valid_from: validFrom,
                    valid_to: validTo
                })
            }
        };

        requestMock = vi.spyOn(https, "request").mockImplementation((options: any, callback: any) => {
            callback(fakeResponse);
            return {
                on: (event: string, handler: Function) => {},
                end: () => {}
            };
        });

        const result = await checkSSLCertificateValidity("https://expired.com");
        expect(result.certificateValid).toBe(false);
        expect(result.validFrom).toBe(validFrom);
        expect(result.validTo).toBe(validTo);
    });

    it("deve retornar erro se a conexão falhar", async () => {
        requestMock = vi.spyOn(https, "request").mockImplementation((options: any, callback: any) => {
            const fakeRequest = {
                on: (event: string, handler: Function) => {
                    if (event === "error") {
                        handler(new Error("Falha na conexão"));
                    }
                },
                end: () => {}
            };
            return fakeRequest;
        });

        const result = await checkSSLCertificateValidity("https://error.com");
        expect(result.certificateValid).toBe(false);
        expect(result.error).toBe("Falha na conexão");
    });
});

import { checkHTTPSProtocol } from "../security";

describe("checkHTTPSProtocol (78)", () => {
    let fetchMock: ReturnType<typeof vi.spyOn>;

    afterEach(() => {
        if (fetchMock) {
            fetchMock.mockRestore();
        }
    });

    it("deve retornar isHTTPS false se a URL não inicia com https", async () => {
        const result = await checkHTTPSProtocol("http://example.com");
        expect(result.isHTTPS).toBe(false);
        expect(result.statusOk).toBeUndefined();
    });

    it("deve retornar isHTTPS true e statusOk true se a URL inicia com https e retorna status 200", async () => {
        const htmlContent = "<html><body>Test</body></html>";
        fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(() =>
            Promise.resolve(createFakeResponse(htmlContent, { status: 200, statusText: "OK" }))
        );
        const result = await checkHTTPSProtocol("https://example.com");
        expect(result.isHTTPS).toBe(true);
        expect(result.statusOk).toBe(true);
    });

    it("deve retornar isHTTPS true com erro se fetch falhar", async () => {
        fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(() => 
            Promise.reject(new Error("Falha na requisição"))
        );
        const result = await checkHTTPSProtocol("https://example.com");
        expect(result.isHTTPS).toBe(true);
        expect(result.error).toBe("Falha na requisição");
    });

    it("deve retornar erro para input não URL válido", async () => {
        const result = await checkHTTPSProtocol("notAUrl");
        expect(result.isHTTPS).toBe(false);
        expect(result.error).toBe("O input não é uma URL válida.");
    });
});
