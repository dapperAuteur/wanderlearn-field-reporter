import { NextResponse } from "next/server";
import { startSession } from "@/lib/auth/dal";
import { consumeLoginToken } from "@/lib/auth/tokens";

// Touches node:crypto and the database; must never be cached.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/auth/verify?token=… — redeems a magic link.
 *
 * On a valid token: consume it, issue the session cookie, land on the console.
 * On a missing/invalid/expired/used token: bounce back to `/signin` with an
 * error so the operator can request a fresh link.
 */
export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/signin?error=missing", url.origin));
  }

  const email = await consumeLoginToken(token);
  if (!email) {
    return NextResponse.redirect(new URL("/signin?error=invalid", url.origin));
  }

  await startSession(email);
  return NextResponse.redirect(new URL("/field-report", url.origin));
}
