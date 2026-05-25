import "server-only";

/**
 * Runtime configuration for the field-reporter agent — the per-provider
 * model id, generation defaults, and the LangSmith tracing toggle. Stored as
 * one singleton row in `app_settings` and edited from the `/admin` dashboard.
 *
 * Resolution order, highest priority first:
 *   1. `FIELD_REPORTER_LLM_PROVIDER` env var (provider only) — a hard override
 *      used for background jobs that don't carry an explicit provider.
 *   2. The `app_settings` row.
 *   3. Built-in defaults (`DEFAULT_MODELS` + the constants below).
 *
 * `getSettings()` is the hot path (`buildChatModel` calls it per build), so
 * it is cached briefly. `updateSettings()` clears the cache — a dashboard
 * save takes effect immediately.
 */
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { appSettings, type AppSettingsRow } from "@/db/schema";
import {
  DEFAULT_MODELS,
  FIELD_REPORTER_PROVIDERS,
  type LlmProvider,
} from "@/agent/llm-config";
import { getEnv } from "@/lib/env";

const SETTINGS_ID = "singleton";
const CACHE_TTL_MS = 10_000;
const DEFAULT_TEMPERATURE = 0.4;
const DEFAULT_MAX_TOKENS = 4096;

export interface FieldReporterSettings {
  provider: LlmProvider;
  /** One model id per provider — the dashboard picks the model for the chosen
   *  provider; nodes look it up by their run's provider. */
  models: Record<LlmProvider, string>;
  temperature: number;
  maxTokens: number;
  tracingEnabled: boolean;
}

const VALID_PROVIDERS: ReadonlySet<LlmProvider> = new Set(
  FIELD_REPORTER_PROVIDERS,
);

/** Default provider when there is no stored row — from whichever key is set,
 *  preserving the pre-swap auto-detect. */
function keysDefaultProvider(): LlmProvider {
  const env = getEnv();
  if (env.ANTHROPIC_API_KEY) return "anthropic";
  if (env.GEMINI_API_KEY) return "google";
  return "anthropic";
}

/**
 * Spread the built-in defaults under whatever the stored row has for each
 * provider. Operators set models lazily — every unset slot returns the
 * built-in default from `DEFAULT_MODELS`.
 */
function mergedModels(
  stored: Partial<Record<LlmProvider, string>>,
): Record<LlmProvider, string> {
  const out = {} as Record<LlmProvider, string>;
  for (const provider of FIELD_REPORTER_PROVIDERS) {
    out[provider] = stored[provider] ?? DEFAULT_MODELS[provider];
  }
  return out;
}

/**
 * Build settings from an `app_settings` row (or built-in defaults when the
 * row is absent). Pure — does NOT apply the env-var override; see
 * `getSettings`.
 */
export function resolveSettings(
  row: AppSettingsRow | null,
): FieldReporterSettings {
  const stored = (row?.models ?? {}) as Partial<Record<LlmProvider, string>>;
  const storedProvider = row?.provider as LlmProvider | undefined;
  const provider =
    storedProvider && VALID_PROVIDERS.has(storedProvider)
      ? storedProvider
      : keysDefaultProvider();
  return {
    provider,
    models: mergedModels(stored),
    temperature: row?.temperature ?? DEFAULT_TEMPERATURE,
    maxTokens: row?.maxTokens ?? DEFAULT_MAX_TOKENS,
    tracingEnabled: row
      ? row.tracingEnabled
      : Boolean(process.env.LANGSMITH_API_KEY),
  };
}

/** The `FIELD_REPORTER_LLM_PROVIDER` override, or null when unset/invalid. */
export function providerOverride(): LlmProvider | null {
  const value = process.env.FIELD_REPORTER_LLM_PROVIDER?.toLowerCase();
  return value && VALID_PROVIDERS.has(value as LlmProvider)
    ? (value as LlmProvider)
    : null;
}

async function readRow(): Promise<AppSettingsRow | null> {
  try {
    const found = await getDb()
      .select()
      .from(appSettings)
      .where(eq(appSettings.id, SETTINGS_ID))
      .limit(1);
    return found[0] ?? null;
  } catch {
    // Table missing (pre-migration) or DB unreachable — fall back to defaults.
    return null;
  }
}

/** Settings exactly as stored — no env override. Used by the `/admin` form. */
export async function getStoredSettings(): Promise<FieldReporterSettings> {
  return resolveSettings(await readRow());
}

let cache: { value: FieldReporterSettings; at: number } | null = null;

/** Effective settings (env override applied), cached for CACHE_TTL_MS. */
export async function getSettings(): Promise<FieldReporterSettings> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) {
    return cache.value;
  }
  const stored = await getStoredSettings();
  const override = providerOverride();
  const value: FieldReporterSettings = override
    ? { ...stored, provider: override }
    : stored;
  cache = { value, at: Date.now() };
  return value;
}

/** Drop the cache so the next getSettings() re-reads the database. */
export function invalidateSettingsCache(): void {
  cache = null;
}

/** Upsert the single settings row and clear the cache. */
export async function updateSettings(
  input: FieldReporterSettings,
): Promise<FieldReporterSettings> {
  const values = {
    id: SETTINGS_ID,
    provider: input.provider,
    models: input.models,
    temperature: input.temperature,
    maxTokens: input.maxTokens,
    tracingEnabled: input.tracingEnabled,
    updatedAt: new Date(),
  };
  await getDb()
    .insert(appSettings)
    .values(values)
    .onConflictDoUpdate({ target: appSettings.id, set: values });
  invalidateSettingsCache();
  return getStoredSettings();
}
