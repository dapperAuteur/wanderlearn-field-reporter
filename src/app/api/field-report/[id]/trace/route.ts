import { NextResponse } from "next/server";
import { getFieldReport } from "@/lib/reports";
import { getLangsmithRunUrl } from "@/lib/langsmith";
import { requireApiUser } from "@/lib/auth/dal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * GET /api/field-report/:id/trace — redirects to the report's LangSmith trace.
 *
 * 404s when the report is unknown; 503s when tracing is not configured or the
 * run carries no LangSmith run id (run-id capture is wired on Day 5).
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const auth = await requireApiUser();
  if (auth instanceof NextResponse) return auth;

  const { id } = await context.params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  const detail = await getFieldReport(id);
  if (!detail) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  const traceUrl = getLangsmithRunUrl(detail.report.langsmithRunId);
  if (!traceUrl) {
    return NextResponse.json(
      { ok: false, error: "no LangSmith trace for this report" },
      { status: 503 },
    );
  }
  return NextResponse.redirect(traceUrl);
}
