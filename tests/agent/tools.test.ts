/**
 * Day 3 — the agent tools and the webSearch per-run guard.
 *
 * Covers:
 *   - existingWanderlearnCourses — the static catalog + the topic filter;
 *   - webSearch — Tavily mapping (with `fetch` mocked) and the no-key fail-soft path;
 *   - cloudinaryMetadata — the unconfigured fail-soft path;
 *   - the research node's node-level guard: webSearch is never called once
 *     MAX_WEB_SEARCHES_PER_RUN has been reached.
 *
 * `@/lib/env` is mocked so each test controls which keys are "set", and
 * `@/agent/llm` is mocked so the research node runs offline. No API key needed.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

const env = vi.hoisted(() => ({
  values: {} as Record<string, string | undefined>,
}));

vi.mock("@/lib/env", () => ({
  getEnv: () => env.values,
  requireEnv: (key: string) => env.values[key] ?? "",
}));

vi.mock("@/agent/llm", () => ({
  SONNET_MODEL: "claude-sonnet-4-6",
  getChatModel: vi.fn(() => ({
    withStructuredOutput: () => ({
      invoke: async () => ({
        facts: [{ claim: "A synthesized fact.", source: "mock source" }],
        relatedCourses: [],
      }),
    }),
  })),
}));

import { webSearch, MAX_WEB_SEARCHES_PER_RUN } from "@/agent/tools/webSearch";
import { cloudinaryMetadata } from "@/agent/tools/cloudinaryMetadata";
import { existingWanderlearnCourses } from "@/agent/tools/existingWanderlearnCourses";
import { research } from "@/agent/nodes/research";
import type { FieldReportState } from "@/agent/state";

/** A Tavily-shaped HTTP response carrying `count` results. */
function tavilyResponse(count: number): Response {
  const results = Array.from({ length: count }, (_, i) => ({
    title: `Result ${i}`,
    url: `https://example.com/${i}`,
    content: `Snippet ${i}.`,
  }));
  return new Response(JSON.stringify({ results }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

/** A complete FieldReportState for exercising the research node directly. */
function baseState(webSearchCallCount: number): FieldReportState {
  return {
    reportId: "tools-test",
    location: {
      name: "MUCHO Museo del Chocolate",
      gps: { lat: 19.4264, lng: -99.1618 },
      capturedAt: "2026-03-14T17:30:00.000Z",
    },
    rawInput: { transcript: "A museum about chocolate.", imageRefs: [] },
    targetAudience: "curious_learner",
    research: undefined,
    outline: undefined,
    draft: undefined,
    critique: undefined,
    revisionHistory: [],
    imagePrompts: undefined,
    finalMarkdown: undefined,
    flaggedForHumanReview: false,
    webSearchCallCount,
  };
}

beforeEach(() => {
  env.values = {};
  vi.unstubAllGlobals();
});

describe("existingWanderlearnCourses", () => {
  it("returns the full catalog when no topic is given", async () => {
    const courses = await existingWanderlearnCourses();
    expect(courses.length).toBeGreaterThanOrEqual(3);
  });

  it("filters the catalog by topic", async () => {
    const courses = await existingWanderlearnCourses({ topic: "Oaxaca" });
    expect(courses).toHaveLength(1);
    expect(courses[0].slug).toBe("oaxaca-cacao-farms");
  });
});

describe("webSearch", () => {
  it("returns no results when TAVILY_API_KEY is unset", async () => {
    env.values = {};
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const results = await webSearch({ query: "anything" });

    expect(results).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("maps Tavily results to { title, url, snippet } when configured", async () => {
    env.values = { TAVILY_API_KEY: "tvly-test" };
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => tavilyResponse(3)),
    );

    const results = await webSearch({ query: "MUCHO chocolate museum" });

    expect(results).toHaveLength(3);
    expect(results[0]).toEqual({
      title: "Result 0",
      url: "https://example.com/0",
      snippet: "Snippet 0.",
    });
  });
});

describe("cloudinaryMetadata", () => {
  it("returns empty metadata when CLOUDINARY_URL is unset", async () => {
    env.values = {};
    const metadata = await cloudinaryMetadata({
      imageId: "wanderlearn/mucho/courtyard-kitchen",
    });
    expect(metadata.imageId).toBe("wanderlearn/mucho/courtyard-kitchen");
    expect(metadata.tags).toEqual([]);
    expect(metadata.dimensions).toEqual({ width: 0, height: 0 });
  });
});

describe("research — webSearch per-run guard", () => {
  it("searches the web while under the per-run cap", async () => {
    env.values = { TAVILY_API_KEY: "tvly-test" };
    const fetchMock = vi.fn(async () => tavilyResponse(2));
    vi.stubGlobal("fetch", fetchMock);

    const update = await research(baseState(0));

    expect(fetchMock).toHaveBeenCalled();
    expect(update.webSearchCallCount ?? 0).toBeGreaterThan(0);
  });

  it("makes zero webSearch calls once MAX_WEB_SEARCHES_PER_RUN is reached", async () => {
    env.values = { TAVILY_API_KEY: "tvly-test" };
    const fetchMock = vi.fn(async () => tavilyResponse(2));
    vi.stubGlobal("fetch", fetchMock);

    const update = await research(baseState(MAX_WEB_SEARCHES_PER_RUN));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(update.webSearchCallCount).toBe(0);
  });
});
