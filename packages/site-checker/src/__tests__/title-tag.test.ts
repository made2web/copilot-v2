import { beforeEach, describe, expect, it, vi } from "vitest";
import { checkMultipleTitleTags, checkMissingOrEmptyTitleTags, checkShortTitleTags, checkLongTitleTags } from "../title-tag";


describe("checkMultipleTitleTags (127)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should return hasMultipleTitles true when multiple <title> tags are present", async () => {
    const mockHtml = `<html><head><title>Title 1</title><title>Title 2</title></head><body></body></html>`;
    global.fetch = vi.fn().mockResolvedValueOnce({ ok: true, text: vi.fn().mockResolvedValueOnce(mockHtml) });

    const result = await checkMultipleTitleTags("made2web.com");
    expect(result.hasMultipleTitles).toBe(true);
  });

  it("should return hasMultipleTitles false when only one <title> tag is present", async () => {
    const mockHtml = `<html><head><title>Single Title</title></head><body></body></html>`;
    global.fetch = vi.fn().mockResolvedValueOnce({ ok: true, text: vi.fn().mockResolvedValueOnce(mockHtml) });

    const result = await checkMultipleTitleTags("made2web.com");
    expect(result.hasMultipleTitles).toBe(false);
  });
});

describe("checkMissingOrEmptyTitleTags (128)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should return hasMissingOrEmptyTitles true when <title> tag is missing", async () => {
    const mockHtml = `<html><head></head><body></body></html>`;
    global.fetch = vi.fn().mockResolvedValueOnce({ ok: true, text: vi.fn().mockResolvedValueOnce(mockHtml) });

    const result = await checkMissingOrEmptyTitleTags("made2web.com");
    expect(result.hasMissingOrEmptyTitles).toBe(true);
    expect(result.missingTitlesCount).toBe(1);
  });

  it("should return hasMissingOrEmptyTitles true when <title> tag is empty", async () => {
    const mockHtml = `<html><head><title></title></head><body></body></html>`;
    global.fetch = vi.fn().mockResolvedValueOnce({ ok: true, text: vi.fn().mockResolvedValueOnce(mockHtml) });

    const result = await checkMissingOrEmptyTitleTags("made2web.com");
    expect(result.hasMissingOrEmptyTitles).toBe(true);
    expect(result.emptyTitlesCount).toBe(1);
  });

  it("should return hasMissingOrEmptyTitles false when <title> tag is present and not empty", async () => {
    const mockHtml = `<html><head><title>Valid Title</title></head><body></body></html>`;
    global.fetch = vi.fn().mockResolvedValueOnce({ ok: true, text: vi.fn().mockResolvedValueOnce(mockHtml) });

    const result = await checkMissingOrEmptyTitleTags("made2web.com");
    expect(result.hasMissingOrEmptyTitles).toBe(false);
  });
});

describe("checkShortTitleTags (130)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should return hasShortTitles true when the title tag is shorter than 30 characters", async () => {
    const mockHtml = `<html><head><title>Short Title</title></head><body></body></html>`;
    global.fetch = vi.fn().mockResolvedValueOnce({ ok: true, text: vi.fn().mockResolvedValueOnce(mockHtml) });

    const result = await checkShortTitleTags("made2web.com");
    expect(result.hasShortTitles).toBe(true);
    expect(result.shortTitlesCount).toBe(1);
  });

  it("should return hasShortTitles false when the title tag is 30 characters or longer", async () => {
    const mockHtml = `<html><head><title>This is a sufficiently long title tag</title></head><body></body></html>`;
    global.fetch = vi.fn().mockResolvedValueOnce({ ok: true, text: vi.fn().mockResolvedValueOnce(mockHtml) });

    const result = await checkShortTitleTags("made2web.com");
    expect(result.hasShortTitles).toBe(false);
    expect(result.shortTitlesCount).toBe(0);
  });
});

describe("checkLongTitleTags (131)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should return hasLongTitles true when the title tag exceeds 60 characters", async () => {
    const mockTitle = "This is a very long title tag that definitely exceeds sixty characters.";
    const mockHtml = `<html><head><title>${mockTitle}</title></head><body></body></html>`;
    global.fetch = vi.fn().mockResolvedValueOnce({ ok: true, text: vi.fn().mockResolvedValueOnce(mockHtml) });

    const result = await checkLongTitleTags("made2web.com");
    expect(result.hasLongTitles).toBe(true);
    expect(result.longTitlesCount).toBe(1);
  });

  it("should return hasLongTitles false when the title tag does not exceed 60 characters", async () => {
    const mockTitle = "This title is within the acceptable length.";
    const mockHtml = `<html><head><title>${mockTitle}</title></head><body></body></html>`;
    global.fetch = vi.fn().mockResolvedValueOnce({ ok: true, text: vi.fn().mockResolvedValueOnce(mockHtml) });

    const result = await checkLongTitleTags("made2web.com");
    expect(result.hasLongTitles).toBe(false);
    expect(result.longTitlesCount).toBe(0);
  });
});