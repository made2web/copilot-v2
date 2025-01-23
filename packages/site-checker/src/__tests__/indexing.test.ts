import { beforeEach, describe, expect, it, vi } from "vitest";
import { checkBrandRanking, checkDomainIndexing } from "../indexing";
import * as serperDev from "../libs/serper-dev";

describe("Funções de Indexação", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("checkDomainIndexing", () => {
    it("deve retornar isIndexed true quando encontrar resultados", async () => {
      const mockSearchResult = {
        organic: [
          {
            title: "Made2Web",
            link: "https://www.made2web.com",
            snippet: "Descrição da página",
            position: 1,
          },
        ],
      };
      vi.spyOn(serperDev, "searchSerper").mockResolvedValueOnce(
        mockSearchResult,
      );

      const result = await checkDomainIndexing("made2web.com");
      expect(result).toEqual({
        isIndexed: true,
        totalResults: 1,
      });
    });

    it("deve retornar isIndexed false quando não encontrar resultados", async () => {
      const mockSearchResult = {
        organic: [],
      };
      vi.spyOn(serperDev, "searchSerper").mockResolvedValueOnce(
        mockSearchResult,
      );

      const result = await checkDomainIndexing("site-nao-existe.com");
      expect(result).toEqual({
        isIndexed: false,
        totalResults: 0,
      });
    });
  });

  describe("checkBrandRanking", () => {
    it("deve identificar quando o site está em primeiro lugar", async () => {
      const mockSearchResult = {
        organic: [
          {
            title: "Made2Web Digital",
            link: "https://made2web.com",
            snippet: "Site da Made2Web",
            position: 1,
          },
        ],
      };
      vi.spyOn(serperDev, "searchSerper").mockResolvedValueOnce(
        mockSearchResult,
      );

      const result = await checkBrandRanking(
        "made2web.com",
        "Made2Web Digital",
      );
      expect(result).toEqual({
        isRankingFirst: true,
        position: 1,
        topResult: {
          link: "https://made2web.com",
        },
      });
    });
  });
});
