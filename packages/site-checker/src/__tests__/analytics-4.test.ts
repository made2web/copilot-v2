import { describe, it, expect, vi } from "vitest";
import { checkAnalytics4Installation } from "../analytics-4";

describe("checkAnalytics4Installation (87)", () => {
    it("should return isInstalled true for correct GA4 installation in HTML", async () => {
        const gaCode = "G-123456";
        const htmlContent = "<html><head><script async src=\"https://www.googletagmanager.com/gtag/js?id=" + gaCode + "\"></script></head><body><script>gtag('config', '" + gaCode + "');</script></body></html>";
        const result = await checkAnalytics4Installation(htmlContent, gaCode);
        expect(result.isInstalled).toBe(true);
        expect(result.issues).toHaveLength(0);
    });

    it("should return isInstalled false if missing GA4 script tag", async () => {
        const gaCode = "G-654321";
        const htmlContent = "<html><head></head><body><script>gtag('config', '" + gaCode + "');</script></body></html>";
        const result = await checkAnalytics4Installation(htmlContent, gaCode);
        expect(result.isInstalled).toBe(false);
        expect(result.issues).toContain("Missing GA4 script tag with provided code");
    });

    it("should return isInstalled false if missing gtag config invocation", async () => {
        const gaCode = "G-111111";
        const htmlContent = "<html><head><script async src=\"https://www.googletagmanager.com/gtag/js?id=" + gaCode + "\"></script></head><body></body></html>";
        const result = await checkAnalytics4Installation(htmlContent, gaCode);
        expect(result.isInstalled).toBe(false);
        expect(result.issues).toContain("Missing gtag config invocation with provided code");
    });

    it("should fetch HTML content when input is a URL", async () => {
        const gaCode = "G-222222";
        const htmlContent = "<html><head><script async src=\"https://www.googletagmanager.com/gtag/js?id=" + gaCode + "\"></script></head><body><script>gtag('config', '" + gaCode + "');</script></body></html>";
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
            Promise.resolve(new Response(htmlContent))
        );
        const result = await checkAnalytics4Installation("http://example.com", gaCode);
        expect(result.isInstalled).toBe(true);
        expect(result.issues).toHaveLength(0);
        fetchMock.mockRestore();
    });
});
