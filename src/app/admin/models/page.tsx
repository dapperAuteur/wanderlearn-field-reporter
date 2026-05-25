// /admin/models — runtime LLM configuration. Picks the model used for each
// of the seven providers; the provider itself is chosen per-run from the
// capture form (PRD Appendix A). Changes apply to the next run — no env
// edit, no redeploy.

import Link from "next/link";
import { requireUser } from "@/lib/auth/dal";
import { getStoredSettings, providerOverride } from "@/lib/settings";
import {
  FIELD_REPORTER_PROVIDERS,
  type LlmProvider,
} from "@/agent/llm-config";
import { SettingsForm } from "./SettingsForm";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminModelsPage() {
  await requireUser();
  const settings = await getStoredSettings();
  const envProviderOverride = providerOverride();
  const hasLangsmithKey = Boolean(process.env.LANGSMITH_API_KEY);
  const providerKeyPresent = computeProviderKeyPresent();

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          Model configuration
        </h1>
        <nav className="flex shrink-0 items-center gap-3 text-xs">
          <Link
            href="/admin"
            className="text-sky-700 hover:underline dark:text-sky-400"
          >
            ← Waitlist
          </Link>
          <Link
            href="/field-report"
            className="text-sky-700 hover:underline dark:text-sky-400"
          >
            Reports
          </Link>
        </nav>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        Pick the model each provider uses, plus the run-default provider that
        prefills the capture form. The capture form&rsquo;s picker can still
        override the default per run (PRD Appendix A — operator A/B compare).
      </p>
      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <SettingsForm
          initialSettings={settings}
          envProviderOverride={envProviderOverride}
          hasLangsmithKey={hasLangsmithKey}
          providerKeyPresent={providerKeyPresent}
        />
      </div>
    </main>
  );
}

/**
 * Map provider → whether a credential is configured for it. Ollama needs no
 * API key (just a reachable base URL), so it is always treated as available.
 */
function computeProviderKeyPresent(): Record<LlmProvider, boolean> {
  const map: Record<LlmProvider, boolean> = {
    ollama: true,
    cerebras: Boolean(process.env.CEREBRAS_API_KEY),
    openrouter: Boolean(process.env.OPENROUTER_API_KEY),
    mistral: Boolean(process.env.MISTRAL_API_KEY),
    together: Boolean(process.env.TOGETHER_API_KEY),
    anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
    google: Boolean(process.env.GEMINI_API_KEY),
  };
  for (const p of FIELD_REPORTER_PROVIDERS) {
    if (!(p in map)) throw new Error(`Missing key-presence entry for ${p}`);
  }
  return map;
}
