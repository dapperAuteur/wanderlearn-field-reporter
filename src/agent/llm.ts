/**
 * Chat-model factory for the field-reporter agent.
 *
 * Seven providers: five free (Ollama local + Cerebras / OpenRouter / Mistral /
 * Together hosted free tiers) plus Anthropic and Google as paid options.
 * The PROVIDER is chosen per run (PRD Appendix A — operator A/B comparison)
 * via `state.llmProvider`; the MODEL ID for that provider is runtime
 * configuration (`src/lib/settings.ts`), editable from the `/admin`
 * dashboard — no redeploy needed.
 *
 * `state.llmProvider` flows in from the capture form's picker; each node
 * passes it into `buildChatModelWithFallback`. With no operator pick and no
 * env override, the admin-stored default applies.
 */
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOllama } from "@langchain/ollama";
import { ChatMistralAI } from "@langchain/mistralai";
import { ChatOpenAI } from "@langchain/openai";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { getEnv, requireEnv } from "@/lib/env";
import { getSettings } from "@/lib/settings";
import {
  DEFAULT_MODELS,
  FIELD_REPORTER_PROVIDERS,
  type LlmProvider,
} from "./llm-config";

// Re-export the pure config so existing imports of types/constants from
// "@/agent/llm" keep working.
export {
  DEFAULT_MODELS,
  FIELD_REPORTER_PROVIDERS,
  PROVIDER_COST_CLASS,
  PROVIDER_LABELS,
} from "./llm-config";
export type { LlmProvider, ProviderCostClass } from "./llm-config";

/** Back-compat: the original Sonnet 4.6 / Flash exports. */
export const ANTHROPIC_MODEL = DEFAULT_MODELS.anthropic;
export const GOOGLE_MODEL = DEFAULT_MODELS.google;

/** OpenAI-compatible endpoints, per provider. */
const OPENAI_COMPATIBLE_BASE_URLS: Record<
  "cerebras" | "openrouter" | "together",
  string
> = {
  cerebras: "https://api.cerebras.ai/v1",
  openrouter: "https://openrouter.ai/api/v1",
  together: "https://api.together.xyz/v1",
};

const VALID_PROVIDERS: ReadonlySet<LlmProvider> = new Set(
  FIELD_REPORTER_PROVIDERS,
);

/** Bounded retries — fail-soft nodes degrade gracefully rather than hanging. */
const MAX_RETRIES = 2;

export interface ChatModelOptions {
  /** Which provider to build for. Defaults to the resolved env / settings. */
  provider?: LlmProvider;
  /** Sampling temperature. */
  temperature?: number;
  /** Max output tokens. */
  maxTokens?: number;
}

/**
 * Resolve the provider purely from the environment: the
 * `FIELD_REPORTER_LLM_PROVIDER` override, else whichever paid API key is
 * present (backward compatible with the pre-swap auto-detect). The dashboard
 * default is applied separately in `getSettings()` when a request omits its
 * own `llmProvider`.
 */
export function resolveProvider(requested?: LlmProvider): LlmProvider {
  if (requested && VALID_PROVIDERS.has(requested)) return requested;
  const env = getEnv();
  if (env.FIELD_REPORTER_LLM_PROVIDER) return env.FIELD_REPORTER_LLM_PROVIDER;
  if (env.ANTHROPIC_API_KEY) return "anthropic";
  if (env.GEMINI_API_KEY) return "google";
  return "anthropic";
}

/**
 * Build a chat model for the resolved provider. Async because the model id
 * for the provider comes from `getSettings()` (a DB-backed singleton row).
 * The API key is read leniently — if it is absent the model still constructs
 * and fails only at call time, where the fail-soft nodes catch it.
 */
export async function getChatModel(
  opts: ChatModelOptions = {},
): Promise<BaseChatModel> {
  const settings = await getSettings();
  const provider = opts.provider ?? settings.provider;
  const model = settings.models[provider] || DEFAULT_MODELS[provider];
  const temperature = opts.temperature ?? settings.temperature;
  const maxTokens = opts.maxTokens ?? settings.maxTokens;
  const env = getEnv();

  switch (provider) {
    case "anthropic":
      return new ChatAnthropic({
        model,
        temperature,
        maxTokens,
        maxRetries: MAX_RETRIES,
        apiKey: env.ANTHROPIC_API_KEY,
      });

    case "google":
      return new ChatGoogleGenerativeAI({
        model,
        temperature,
        maxOutputTokens: maxTokens,
        maxRetries: MAX_RETRIES,
        apiKey: env.GEMINI_API_KEY,
      });

    case "ollama":
      return new ChatOllama({
        model,
        temperature,
        numPredict: maxTokens,
        baseUrl: env.OLLAMA_BASE_URL ?? "http://localhost:11434",
      });

    case "mistral":
      return new ChatMistralAI({
        model,
        temperature,
        maxTokens,
        maxRetries: MAX_RETRIES,
        apiKey: requireEnv("MISTRAL_API_KEY"),
      });

    case "cerebras":
    case "openrouter":
    case "together":
      return new ChatOpenAI({
        model,
        temperature,
        maxTokens,
        maxRetries: MAX_RETRIES,
        apiKey: requireEnv(
          provider === "cerebras"
            ? "CEREBRAS_API_KEY"
            : provider === "openrouter"
              ? "OPENROUTER_API_KEY"
              : "TOGETHER_API_KEY",
        ),
        configuration: { baseURL: OPENAI_COMPATIBLE_BASE_URLS[provider] },
      });

    default: {
      // Compile-fail if a new provider is added to the union without a case.
      const _exhaustive: never = provider;
      throw new Error(`Unhandled provider: ${String(_exhaustive)}`);
    }
  }
}
