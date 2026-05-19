import { NextResponse } from "next/server";
import { listFieldReports } from "@/lib/reports";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/field-report — recent reports, newest first. */
export async function GET(): Promise<NextResponse> {
  const reports = await listFieldReports();
  return NextResponse.json({ ok: true, reports });
}
