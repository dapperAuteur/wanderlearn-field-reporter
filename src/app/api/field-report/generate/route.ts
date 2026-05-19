import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { getCompiledFieldReportGraph } from "@/agent/graph";
import { resolveProvider } from "@/agent/llm";
import {
  LocationSchema,
  RawInputSchema,
  TargetAudienceSchema,
  LlmProviderSchema,
} from "@/agent/schemas";
import type { FieldReportState } from "@/agent/state";
import { saveFieldReport } from "@/lib/reports";

// The graph runs several LLM-touching nodes synchronously.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const GenerateInputSchema = z.object({
  location: LocationSchema,
  rawInput: RawInputSchema,
  targetAudience: TargetAudienceSchema,
  /** Optional — defaults to whichever provider key is configured. */
  llmProvider: LlmProviderSchema.optional(),
});

/**
 * POST /api/field-report/generate — runs the agent on a capture, persists the
 * report and its revision history, and returns the new report id.
 *
 * Synchronous: the request blocks for the full agent run (PRD §4 — minutes,
 * not seconds). The chosen provider rides in the graph state; a fresh
 * `langsmithRunId` is passed as the run's id so its LangSmith trace is
 * addressable. A durable queue would replace this at production scale.
 */
export async function POST(request: Request): Promise<NextResponse> {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid JSON body" },
      { status: 400 },
    );
  }

  const parsed = GenerateInputSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "invalid capture", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const reportId = randomUUID();
  const langsmithRunId = randomUUID();
  const llmProvider = resolveProvider(parsed.data.llmProvider);

  try {
    const graph = getCompiledFieldReportGraph();
    const result = (await graph.invoke(
      {
        reportId,
        location: parsed.data.location,
        rawInput: parsed.data.rawInput,
        targetAudience: parsed.data.targetAudience,
        llmProvider,
      },
      { runId: langsmithRunId },
    )) as FieldReportState;

    await saveFieldReport(reportId, result, langsmithRunId);
    return NextResponse.json({ ok: true, reportId }, { status: 201 });
  } catch (err) {
    console.error("[generate] agent run failed:", err);
    return NextResponse.json(
      { ok: false, error: "agent run failed" },
      { status: 500 },
    );
  }
}
