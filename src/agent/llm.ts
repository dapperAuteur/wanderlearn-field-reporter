/**
 * Chat-model factory for the field-reporter agent.
 *
 * One Anthropic model — Claude Sonnet 4.6 — powers every LLM node on Day 1
 * (research, outline, write, generateImagePrompts). Centralizing construction
 * here keeps the model id in a single place and means tests mock exactly one
 * module to run the graph offline.
 */
import { ChatAnthropic } from "@langchain/anthropic";
import { getEnv } from "@/lib/env";

/** Claude Sonnet 4.6 — the agent's model (PRD §5). */
export const SONNET_MODEL = "claude-sonnet-4-6";

/** Bounded retries — a fail-soft node degrades gracefully rather than hanging. */
const MAX_RETRIES = 2;

export interface ChatModelOptions {
  /** Sampling temperature. */
  temperature?: number;
  /** Max output tokens. */
  maxTokens?: number;
}

/**
 * Build a Claude Sonnet 4.6 chat model. The API key is read leniently — if it
 * is absent the model still constructs and fails only at call time, where the
 * fail-soft nodes catch it.
 */
export function getChatModel(opts: ChatModelOptions = {}): ChatAnthropic {
  return new ChatAnthropic({
    model: SONNET_MODEL,
    temperature: opts.temperature ?? 0.4,
    maxTokens: opts.maxTokens ?? 4096,
    maxRetries: MAX_RETRIES,
    apiKey: getEnv().ANTHROPIC_API_KEY,
  });
}
