import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { checkWpAdminStatus } from "../wordPress";

// Helper function to create a fake Response object that mimics the Fetch API
function createFakeResponse(body: string, init?: ResponseInit): Response {
    return new Response(body, init);
}

describe("checkWpAdminStatus (84)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return true for a URL input when the wp-admin page contains wp-login.php", async () => {
        const htmlContent = "<html><body><form action=\"wp-login.php\"></form></body></html>";
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse(htmlContent, { status: 200 }))
        );

        const result = await checkWpAdminStatus("https://example.com");
        expect(fetchMock).toHaveBeenCalled();
        expect(result.isWordPressAdmin).toBe(true);
        expect(result.statusCode).toBe(200);
        expect(result.function_type).toBe("TestInput.URL");
        expect(result.functionName).toBe("checkWpAdminStatus");
    });

    it("should return false for a URL input when the wp-admin page does not contain wp-login.php", async () => {
        const htmlContent = "<html><body><p>No login form here</p></body></html>";
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => 
            Promise.resolve(createFakeResponse(htmlContent, { status: 200 }))
        );

        const result = await checkWpAdminStatus("https://example.com");
        expect(fetchMock).toHaveBeenCalled();
        expect(result.isWordPressAdmin).toBe(false);
        expect(result.statusCode).toBe(200);
    });

    it("should analyze raw HTML input and return true when it contains wp-login.php", async () => {
        const htmlContent = "<html><body><form action=\"wp-login.php\"></form></body></html>";
        const result = await checkWpAdminStatus(htmlContent);
        expect(result.isWordPressAdmin).toBe(true);
        expect(result.function_type).toBe("TestInput.HTML");
    });

    it("should analyze raw HTML input and return false when it does not contain wp-login.php", async () => {
        const htmlContent = "<html><body><p>No login form here</p></body></html>";
        const result = await checkWpAdminStatus(htmlContent);
        expect(result.isWordPressAdmin).toBe(false);
        expect(result.function_type).toBe("TestInput.HTML");
    });
});
