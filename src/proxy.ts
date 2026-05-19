/**
 * Proxy — the app-wide auth gate. (Next 16 renamed `middleware` to `proxy`.)
 *
 * It runs an OPTIMISTIC check: it only reads and verifies the session cookie,
 * never the database, so it stays fast on every navigation. The authoritative
 * checks live in `dal.ts` (`requireUser` / `requireApiUser`), called close to
 * the data — proxy alone is not the security boundary.
 *
 * Unauthenticated page requests are redirected to `/signin`; unauthenticated
 * API requests get a 401.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session";

/** Paths reachable without a session: the sign-in screen and auth endpoints. */
const PUBLIC_PREFIXES = ["/signin", "/api/auth/"];

function isPublic(pathname: string): boolean {
  return PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix),
  );
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  if (isPublic(pathname)) return NextResponse.next();

  const email = await verifySessionToken(
    request.cookies.get(SESSION_COOKIE)?.value,
  );
  if (email) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 },
    );
  }
  return NextResponse.redirect(new URL("/signin", request.url));
}

export const config = {
  // Run on every route except static assets, the brand package, and the
  // manifest — those must load on the sign-in screen before any session exists.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|brand/|manifest.webmanifest).*)",
  ],
};
