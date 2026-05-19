import { NextResponse } from "next/server";
import { listFieldReports } from "@/lib/reports";
import { requireApiUser } from "@/lib/auth/dal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/field-report — recent reports, newest first. */
export async function GET(): Promise<NextResponse> {
  const auth = await requireApiUser();
  if (auth instanceof NextResponse) return auth;

  const reports = await listFieldReports();
  return NextResponse.json({ ok: true, reports });
}
