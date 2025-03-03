import { beforeEach, describe, expect, it, vi } from "vitest";
import axios from "axios";
import { areJSFilesBlocked, isPathBlocked } from "../robots";
import { cleanDomainName } from "../utils";

describe("areJSFilesBlocked (9)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should return true when JS files are disallowed in robots.txt", async () => {
    const mockRobotsTxt = "User-agent: *\nDisallow: /*.js$";
    vi.spyOn(axios, 'get').mockResolvedValueOnce({
      status: 200,
      data: mockRobotsTxt,
    });

    const result = await areJSFilesBlocked("made2web.com");
    expect(result).toBe(true);
  });

  it("should return false when JS files are not disallowed in robots.txt", async () => {
    const mockRobotsTxt = "User-agent: *\nAllow: /";
    vi.spyOn(axios, 'get').mockResolvedValueOnce({
      status: 200,
      data: mockRobotsTxt,
    });

    const result = await areJSFilesBlocked("made2web.com");
    expect(result).toBe(false);
  });
});

describe("isPathBlocked (10)", () => {
  it("should return true when the recommended path is disallowed in robots.txt", async () => {
    const mockRobotsTxt = "User-agent: *\nDisallow: /private";
    vi.spyOn(axios, 'get').mockResolvedValueOnce({
      status: 200,
      data: mockRobotsTxt,
    });

    const result = await isPathBlocked("made2web.com", "/private");
    expect(result).toBe(true);
  });
});

describe("isUrlBlockingIndexedUrls (8)", () => {
  it("should return true when URLs that should be indexed are blocked in robots.txt", async () => {
    const mockRobotsTxt = "User-agent: *\nDisallow: /should-be-indexed";
    vi.spyOn(axios, 'get').mockResolvedValueOnce({
      status: 200,
      data: mockRobotsTxt,
    });

    const result = await isPathBlocked("made2web.com", "/should-be-indexed");
    expect(result).toBe(true);
  });
});