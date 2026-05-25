// GET  /api/admin/settings — current configuration + env context.
// PUT  /api/admin/settings — replace it (full object). Admin-gated by the
// same `requireApiUser` guard that protects the rest of /api/admin/* and
// the cost-incurring /api/field-report/* paths.

import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getStoredSettings,
  providerOverride,
  updateSettings,
} from "@/lib/settings";
import { requireApiUser } from "@/lib/auth/dal";
import { FIELD_REPORTER_PROVIDERS } from "@/agent/llm-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Build the seven-key models object schema from FIELD_REPORTER_PROVIDERS so
// adding a new provider in one place propagates here automatically.
const modelsSchema = z.object(
  Object.fromEntries(
    FIELD_REPORTER_PROVIDERS.map((p) => [p, z.string().trim().min(1)]),
  ) as Record<(typeof FIELD_REPORTER_PROVIDERS)[number], z.ZodString>,
);

const settingsSchema = z.object({
  provider: z.enum(FIELD_REPORTER_PROVIDERS),
  models: modelsSchema,
  temperature: z.number().min(0).max(2),
  maxTokens: z.number().int().min(64).max(8192),
  tracingEnabled: z.boolean(),
});

/** Env context the dashboard needs to render correctly. */
function envContext() {
  return {
    // When set, FIELD_REPORTER_LLM_PROVIDER overrides the stored provider.
    envProviderOverride: providerOverride(),
    // Tracing cannot run without a key, regardless of the toggle.
    hasLangsmithKey: Boolean(process.env.LANGSMITH_API_KEY),
  };
}

export async function GET(): Promise<NextResponse> {
  const auth = await requireApiUser();
  if (auth instanceof NextResponse) return auth;

  try {
    const settings = await getStoredSettings();
    return NextResponse.json({ settings, ...envContext() });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: Request): Promise<NextResponse> {
  const auth = await requireApiUser();
  if (auth instanceof NextResponse) return auth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid settings", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    const settings = await updateSettings(parsed.data);
    return NextResponse.json({ settings, ...envContext() });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
