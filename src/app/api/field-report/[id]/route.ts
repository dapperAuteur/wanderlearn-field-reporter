import { NextResponse } from "next/server";
import { getFieldReport } from "@/lib/reports";
import { requireApiUser } from "@/lib/auth/dal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** GET /api/field-report/:id — a report with its full revision history. */
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
  return NextResponse.json({ ok: true, ...detail });
}
