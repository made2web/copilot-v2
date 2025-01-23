import axios from "axios";
import type { SerperSearchResult } from "./types.js";

const SERPER_API_KEY = "29413796207777b5606270ec134f08b45e43c751";
const SERPER_BASE_URL = "https://google.serper.dev/search";

const DEFAULT_PARAMS = {
  location: "Lisbon, Portugal",
  gl: "pt",
  hl: "pt",
} as const;

interface SerperSearchParams {
  q: string;
  location?: string;
  gl?: string;
  hl?: string;
}

/**
 * Faz uma única consulta à API do Serper
 */
export async function searchSerper(
  params: Pick<SerperSearchParams, "q"> &
    Partial<Omit<SerperSearchParams, "q">>,
): Promise<SerperSearchResult> {
  try {
    const searchParams = {
      ...DEFAULT_PARAMS,
      ...params,
    };

    const response = await axios.post(SERPER_BASE_URL, searchParams, {
      headers: {
        "X-API-KEY": SERPER_API_KEY,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Erro ao fazer requisição ao Serper:", error);
    throw error;
  }
}

/**
 * Faz múltiplas consultas em lote à API do Serper
 */
export async function batchSearchSerper(
  queries: (Pick<SerperSearchParams, "q"> &
    Partial<Omit<SerperSearchParams, "q">>)[],
): Promise<SerperSearchResult[]> {
  try {
    const searchQueries = queries.map((query) => ({
      ...DEFAULT_PARAMS,
      ...query,
    }));

    const response = await axios.post(SERPER_BASE_URL, searchQueries, {
      headers: {
        "X-API-KEY": SERPER_API_KEY,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Erro ao fazer requisição em lote ao Serper:", error);
    throw error;
  }
}
