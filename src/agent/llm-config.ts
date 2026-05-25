/**
 * Pure model configuration — providers, cost class, default models, labels.
 *
 * Zero imports on purpose. `agent/llm.ts` (the factory) and `lib/settings.ts`
 * (the DB-backed store) both pull in server-only deps; a "use client"
 * component (the capture form's provider picker, the /admin settings form)
 * imports types and value-level constants from here so the server dependency
 * chain never reaches a browser bundle.
 *
 * Wanderlearn uses one model per provider (not per-role) — the agent runs
 * the same model across all nodes for the chosen provider. Per-node tuning
 * is a possible future enhancement; coach and triage do per-role/per-node
 * because their nodes have different latency/cost tradeoffs. The field
 * reporter's nodes are all substantive generation work.
 */

/** Display order: free providers first, then paid. Source of truth for the
 * LlmProvider union — `as const` preserves literal tuple so
 * `z.enum(FIELD_REPORTER_PROVIDERS)` picks up the exact union. */
export const FIELD_REPORTER_PROVIDERS = [
  "ollama",
  "cerebras",
  "openrouter",
  "mistral",
  "together",
  "anthropic",
  "google",
] as const;

export type LlmProvider = (typeof FIELD_REPORTER_PROVIDERS)[number];

export type ProviderCostClass = "free" | "paid";

/** Cost-class per provider — drives the free-vs-paid UI in /admin + capture form. */
export const PROVIDER_COST_CLASS: Record<LlmProvider, ProviderCostClass> = {
  ollama: "free",
  cerebras: "free",
  openrouter: "free",
  mistral: "free",
  together: "free",
  anthropic: "paid",
  google: "paid",
};

/** Human-readable label per provider — used by the capture form picker and /admin. */
export const PROVIDER_LABELS: Record<LlmProvider, string> = {
  ollama: "Ollama (local)",
  cerebras: "Cerebras",
  openrouter: "OpenRouter",
  mistral: "Mistral",
  together: "Together AI",
  anthropic: "Anthropic Claude",
  google: "Google Gemini",
};

/**
 * Built-in default model per provider — the fallback when `app_settings`
 * has no row or has no entry for the active provider. The /admin dashboard
 * overrides these.
 *
 * - Claude Sonnet 4.6 is the PRD baseline (§5).
 * - Gemini 2.5 Flash (free-tier-friendly; Pro returns 429 with limit=0).
 * - Llama 3.3 70B on Cerebras / Together — open-weight strongest available.
 * - DeepSeek free on OpenRouter — capable structured-output model.
 * - Mistral Small — free tier 1B tokens/month.
 * - Llama 3.1 8B on Ollama — fits on a laptop with reasonable inference speed.
 */
export const DEFAULT_MODELS: Record<LlmProvider, string> = {
  anthropic: "claude-sonnet-4-6",
  google: "gemini-2.5-flash",
  ollama: "llama3.1:8b",
  cerebras: "llama-3.3-70b",
  openrouter: "deepseek/deepseek-chat:free",
  mistral: "mistral-small-latest",
  together: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
};
