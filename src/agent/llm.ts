/**
 * Chat-model factory for the field-reporter agent.
 *
 * The agent runs on either provider, chosen per run so the operator can
 * compare draft quality (PRD Appendix A):
 *   - `anthropic` — Claude Sonnet 4.6 (`ANTHROPIC_API_KEY`);
 *   - `google`    — Gemini 2.5 Pro (`GEMINI_API_KEY`).
 *
 * Both return a `BaseChatModel`, so `.withStructuredOutput()` works identically
 * downstream — nodes never branch on the provider. The chosen provider rides
 * in the graph state (`state.llmProvider`); each node passes it here.
 */
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { getEnv } from "@/lib/env";
import type { LlmProvider } from "./schemas";

/** Claude Sonnet 4.6 — the Anthropic model (PRD §5). */
export const ANTHROPIC_MODEL = "claude-sonnet-4-6";
/**
 * Gemini 2.5 Flash — the Google model. The PRD Appendix names Gemini 2.5 Pro,
 * but Pro is not on the Gemini API free tier (the free tier returns HTTP 429
 * with `limit: 0` for Pro). Flash runs on the free tier, so it is the default
 * that lets the agent run for $0; switch to Pro only with billing enabled.
 */
export const GOOGLE_MODEL = "gemini-2.5-flash";

/** Bounded retries — a fail-soft node degrades gracefully rather than hanging. */
const MAX_RETRIES = 2;

export interface ChatModelOptions {
  /** Which provider to build for. Defaults to `resolveProvider()`. */
  provider?: LlmProvider;
  /** Sampling temperature. */
  temperature?: number;
  /** Max output tokens. */
  maxTokens?: number;
}

/**
 * Resolve the provider: an explicit choice wins; otherwise auto-detect from
 * whichever API key is configured, preferring Anthropic.
 */
export function resolveProvider(requested?: LlmProvider): LlmProvider {
  if (requested) return requested;
  const env = getEnv();
  if (env.ANTHROPIC_API_KEY) return "anthropic";
  if (env.GEMINI_API_KEY) return "google";
  return "anthropic";
}

/**
 * Build a chat model for the resolved provider. The API key is read leniently
 * — if it is absent the model still constructs and fails only at call time,
 * where the fail-soft nodes catch it.
 */
export function getChatModel(opts: ChatModelOptions = {}): BaseChatModel {
  const provider = resolveProvider(opts.provider);
  const temperature = opts.temperature ?? 0.4;
  const maxTokens = opts.maxTokens ?? 4096;
  const env = getEnv();

  if (provider === "google") {
    return new ChatGoogleGenerativeAI({
      model: GOOGLE_MODEL,
      temperature,
      maxOutputTokens: maxTokens,
      maxRetries: MAX_RETRIES,
      apiKey: env.GEMINI_API_KEY,
    });
  }

  return new ChatAnthropic({
    model: ANTHROPIC_MODEL,
    temperature,
    maxTokens,
    maxRetries: MAX_RETRIES,
    apiKey: env.ANTHROPIC_API_KEY,
  });
}
