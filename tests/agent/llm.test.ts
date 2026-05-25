// Tests for the 7-provider chat-model factory and the fallback parser.
//
// getSettings is mocked so tests don't touch the real database; the dispatch
// being verified is buildChatModel's switch and parseFallbackProviders's
// normalisation. Each provider sets its API key in process.env so requireEnv
// does not throw on construction.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_MODELS,
  FIELD_REPORTER_PROVIDERS,
  type LlmProvider,
} from "@/agent/llm-config";

const baseEnv = { ...process.env };

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  process.env = { ...baseEnv };
  vi.restoreAllMocks();
});

/** Build a stub FieldReporterSettings object with DEFAULT_MODELS for every provider. */
function stubSettings(provider: LlmProvider) {
  const models = {} as Record<LlmProvider, string>;
  for (const p of FIELD_REPORTER_PROVIDERS) {
    models[p] = DEFAULT_MODELS[p];
  }
  return {
    provider,
    models,
    temperature: 0.4,
    maxTokens: 4096,
    tracingEnabled: false,
  };
}

async function mockedFactory(provider: LlmProvider) {
  vi.doMock("@/lib/settings", () => ({
    getSettings: vi.fn(async () => stubSettings(provider)),
    getStoredSettings: vi.fn(async () => stubSettings(provider)),
    providerOverride: vi.fn(() => null),
    updateSettings: vi.fn(),
    invalidateSettingsCache: vi.fn(),
    resolveSettings: vi.fn(() => stubSettings(provider)),
  }));
  return await import("@/agent/llm");
}

describe("getChatModel — provider dispatch", () => {
  it("builds ChatAnthropic for anthropic", async () => {
    process.env.ANTHROPIC_API_KEY = "test-anthropic";
    const { getChatModel } = await mockedFactory("anthropic");
    const model = await getChatModel();
    expect(model.constructor.name).toBe("ChatAnthropic");
  });

  it("builds ChatGoogleGenerativeAI for google", async () => {
    process.env.GEMINI_API_KEY = "test-gemini";
    const { getChatModel } = await mockedFactory("google");
    const model = await getChatModel();
    expect(model.constructor.name).toBe("ChatGoogleGenerativeAI");
  });

  it("builds ChatOllama for ollama (no API key required)", async () => {
    const { getChatModel } = await mockedFactory("ollama");
    const model = await getChatModel();
    expect(model.constructor.name).toBe("ChatOllama");
  });

  it("builds ChatMistralAI for mistral", async () => {
    process.env.MISTRAL_API_KEY = "test-mistral";
    const { getChatModel } = await mockedFactory("mistral");
    const model = await getChatModel();
    expect(model.constructor.name).toBe("ChatMistralAI");
  });

  it("builds ChatOpenAI for cerebras", async () => {
    process.env.CEREBRAS_API_KEY = "test-cerebras";
    const { getChatModel } = await mockedFactory("cerebras");
    const model = await getChatModel();
    expect(model.constructor.name).toBe("ChatOpenAI");
  });

  it("builds ChatOpenAI for openrouter", async () => {
    process.env.OPENROUTER_API_KEY = "test-openrouter";
    const { getChatModel } = await mockedFactory("openrouter");
    const model = await getChatModel();
    expect(model.constructor.name).toBe("ChatOpenAI");
  });

  it("builds ChatOpenAI for together", async () => {
    process.env.TOGETHER_API_KEY = "test-together";
    const { getChatModel } = await mockedFactory("together");
    const model = await getChatModel();
    expect(model.constructor.name).toBe("ChatOpenAI");
  });

  it("throws when the required API key is missing for a hosted provider", async () => {
    delete process.env.CEREBRAS_API_KEY;
    const { getChatModel } = await mockedFactory("cerebras");
    await expect(getChatModel()).rejects.toThrow(/CEREBRAS_API_KEY/);
  });

  it("honours the per-call provider override", async () => {
    process.env.CEREBRAS_API_KEY = "test-cerebras";
    process.env.ANTHROPIC_API_KEY = "test-anthropic";
    const { getChatModel } = await mockedFactory("anthropic");
    const model = await getChatModel({ provider: "cerebras" });
    expect(model.constructor.name).toBe("ChatOpenAI");
  });
});

describe("parseFallbackProviders", () => {
  it("returns [] for undefined / empty", async () => {
    const { parseFallbackProviders } = await import("@/agent/with-fallback");
    expect(parseFallbackProviders(undefined)).toEqual([]);
    expect(parseFallbackProviders("")).toEqual([]);
  });

  it("parses a comma-separated list", async () => {
    const { parseFallbackProviders } = await import("@/agent/with-fallback");
    expect(parseFallbackProviders("openrouter,anthropic")).toEqual([
      "openrouter",
      "anthropic",
    ]);
  });

  it("trims whitespace and lowercases", async () => {
    const { parseFallbackProviders } = await import("@/agent/with-fallback");
    expect(parseFallbackProviders(" Cerebras , OpenRouter ")).toEqual([
      "cerebras",
      "openrouter",
    ]);
  });

  it("drops unknown providers and keeps the valid ones", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { parseFallbackProviders } = await import("@/agent/with-fallback");
    expect(parseFallbackProviders("openrouter,bogus,anthropic")).toEqual([
      "openrouter",
      "anthropic",
    ]);
    expect(warn).toHaveBeenCalled();
  });
});
