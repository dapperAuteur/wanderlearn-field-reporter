/**
 * Proxy — the app-wide auth gate. (Next 16 renamed `middleware` to `proxy`.)
 *
 * It runs an OPTIMISTIC check: it only reads and verifies the session cookie,
 * never the database, so it stays fast on every navigation. The authoritative
 * checks live in `dal.ts` (`requireUser` / `requireApiUser`), called close to
 * the data — proxy alone is not the security boundary.
 *
 * The gate's scope is deliberately narrow: this is a portfolio piece, so the
 * read-only report views stay public for visitors to browse. Only the
 * cost-incurring paths — the capture form and the agent-run endpoint — sit
 * behind sign-in. Unauthenticated page requests are redirected to `/signin`;
 * unauthenticated API requests get a 401.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session";

/** Paths reachable without a session — the public surface of the app. */
function isPublic(pathname: string): boolean {
  // Marketing home and the sign-in flow itself.
  if (pathname === "/" || pathname === "/signin") return true;
  if (pathname.startsWith("/signin/") || pathname.startsWith("/api/auth/")) {
    return true;
  }

  // Read-only report views (the portfolio surface).
  // `/field-report` lists reports; `/field-report/<id>` opens one.
  // `/field-report/new` is the capture form — that one stays gated.
  if (pathname === "/field-report") return true;
  if (
    pathname.startsWith("/field-report/") &&
    !pathname.startsWith("/field-report/new")
  ) {
    return true;
  }

  // The LangSmith trace link on a public report page resolves through this
  // redirect — keep it reachable so the trace stays one click away.
  if (/^\/api\/field-report\/[^/]+\/trace\/?$/.test(pathname)) return true;

  return false;
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
