import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { getCompiledFieldReportGraph } from "@/agent/graph";
import {
  LocationSchema,
  RawInputSchema,
  TargetAudienceSchema,
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
});

/**
 * POST /api/field-report/generate — runs the agent on a capture, persists the
 * report and its revision history, and returns the new report id.
 *
 * Synchronous: the request blocks for the full agent run (PRD §4 — minutes,
 * not seconds). A durable queue would replace this at production scale.
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
  try {
    const graph = getCompiledFieldReportGraph();
    const result = (await graph.invoke({
      reportId,
      location: parsed.data.location,
      rawInput: parsed.data.rawInput,
      targetAudience: parsed.data.targetAudience,
    })) as FieldReportState;

    await saveFieldReport(reportId, result);
    return NextResponse.json({ ok: true, reportId }, { status: 201 });
  } catch (err) {
    console.error("[generate] agent run failed:", err);
    return NextResponse.json(
      { ok: false, error: "agent run failed" },
      { status: 500 },
    );
  }
}
