import "server-only";
import { z } from "zod";
import { getEnv } from "@/lib/env";

/**
 * `webSearch` tool — Tavily-backed web search.
 *
 * Calls the Tavily REST API directly (no SDK), so the result shape is fully
 * controlled and there is no dependency on `@langchain/community`, which has an
 * ERESOLVE peer conflict with `@langchain/core` 1.x.
 *
 * Fail-soft: with no `TAVILY_API_KEY`, or on any API error, it returns an empty
 * result list rather than throwing — the research node treats that the same as
 * a search that found nothing.
 */

/**
 * The hard cap on `webSearch` calls per agent run.
 *
 * It is ENFORCED by the research node as a node-level guard that reads
 * `state.webSearchCallCount` before each call — never by a prompt instruction.
 * Exported here so the cap lives alongside the tool it bounds.
 */
export const MAX_WEB_SEARCHES_PER_RUN = 5;

const TAVILY_SEARCH_URL = "https://api.tavily.com/search";

export const WebSearchInputSchema = z.object({
  query: z.string().min(1),
});
export type WebSearchInput = z.infer<typeof WebSearchInputSchema>;

/** One web result, normalized to the shape the research node consumes. */
export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
}

/** The slice of the Tavily response this tool reads. */
const TavilyResponseSchema = z.object({
  results: z
    .array(
      z.object({
        title: z.string(),
        url: z.string(),
        content: z.string(),
      }),
    )
    .optional(),
});

export async function webSearch(
  input: WebSearchInput,
): Promise<WebSearchResult[]> {
  const { query } = WebSearchInputSchema.parse(input);

  const apiKey = getEnv().TAVILY_API_KEY;
  if (!apiKey) {
    console.warn("[webSearch] TAVILY_API_KEY not set — returning no results.");
    return [];
  }

  try {
    const response = await fetch(TAVILY_SEARCH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        query,
        search_depth: "basic",
        max_results: 5,
        topic: "general",
      }),
    });
    if (!response.ok) {
      console.error(`[webSearch] Tavily returned HTTP ${response.status}.`);
      return [];
    }
    const parsed = TavilyResponseSchema.safeParse(await response.json());
    if (!parsed.success) {
      console.error("[webSearch] unexpected Tavily response shape.");
      return [];
    }
    return (parsed.data.results ?? []).map((result) => ({
      title: result.title,
      url: result.url,
      snippet: result.content,
    }));
  } catch (err) {
    console.error("[webSearch] request failed:", err);
    return [];
  }
}
