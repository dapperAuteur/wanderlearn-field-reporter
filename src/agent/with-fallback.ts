/**
 * Build a chat model for the field-reporter, with a provider-fallback chain.
 *
 * When `FIELD_REPORTER_FALLBACK_PROVIDERS` is set (comma-separated provider
 * names, e.g. `openrouter,anthropic`), the primary model — chosen per-run from
 * the capture form's picker — is wrapped with LangChain's
 * `withFallbacks([...])`. If the primary throws (rate limit, 5xx, quota wall),
 * each fallback is tried in order. Anthropic / Google appear here as the paid
 * emergency tier that catches a free-tier wall during a demo.
 *
 * **Operator A/B comparison.** The PRD's per-run picker exists so the operator
 * can compare draft quality between providers. Leave the env var **unset** on
 * developer workstations and during comparison runs — that gives a clean
 * pinned-to-one-provider experience the rubric scores can trust. Set the env
 * var on the deployed instance, where reliability beats comparison purity.
 */
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { getEnv } from "@/lib/env";
import { getChatModel, type ChatModelOptions } from "./llm";
import {
  FIELD_REPORTER_PROVIDERS,
  type LlmProvider,
} from "./llm-config";

const VALID_PROVIDERS: ReadonlySet<LlmProvider> = new Set(
  FIELD_REPORTER_PROVIDERS,
);

/**
 * Parse `FIELD_REPORTER_FALLBACK_PROVIDERS` into a list of provider names.
 * Unknown entries are dropped (with a console.warn) so a stale env value
 * never prevents the primary call from running.
 */
export function parseFallbackProviders(
  raw: string | undefined,
): LlmProvider[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((p) => p.trim().toLowerCase())
    .filter((p): p is LlmProvider => {
      if (!p) return false;
      if (!VALID_PROVIDERS.has(p as LlmProvider)) {
        console.warn(
          `[field-reporter] FIELD_REPORTER_FALLBACK_PROVIDERS: dropping unknown provider "${p}"`,
        );
        return false;
      }
      return true;
    });
}

/**
 * Build the model for the chosen provider, wrapped with a fallback chain when
 * `FIELD_REPORTER_FALLBACK_PROVIDERS` is set. Returns the bare primary when
 * the env var is empty — preserves the operator A/B comparison case.
 */
export async function buildChatModelWithFallback(
  options: ChatModelOptions = {},
): Promise<BaseChatModel> {
  const primary = await getChatModel(options);
  const chain = parseFallbackProviders(
    getEnv().FIELD_REPORTER_FALLBACK_PROVIDERS,
  );
  if (chain.length === 0) return primary;

  const fallbacks = await Promise.all(
    chain.map((provider) => getChatModel({ ...options, provider })),
  );
  return primary.withFallbacks(fallbacks) as unknown as BaseChatModel;
}
