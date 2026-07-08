// Completes the "Sign in with WitUS" OIDC flow:
//   1. verify state, exchange the code (+ PKCE verifier) for tokens,
//   2. read the user's claims from the IdP userinfo endpoint (server-to-server,
//      so there is no client-side JWT to verify — avoids a jose/JWKS dependency),
//   3. enforce the SAME single-admin gate the magic-link flow uses: the WitUS
//      email must equal ADMIN_EMAIL, or sign-in is denied,
//   4. mint THIS app's own session by reusing `startSession` — the exact same
//      `wlfr_session` HS256 JWT cookie the magic-link `/api/auth/verify` sets.
//
// There is no user table to find-or-create against: the session is stateless and
// keyed only on the email claim, so a WitUS login and a magic-link login produce
// an identical session for the one authorized address.
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getEnv } from "@/lib/env";
import { startSession } from "@/lib/auth/dal";

// Touches the session helper (node:crypto via jose) and sets cookies; never cache.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TOKEN_URL =
  process.env.WITUS_OIDC_TOKEN_URL ??
  "https://accounts.witus.online/api/idp/oauth2/token";
const USERINFO_URL =
  process.env.WITUS_OIDC_USERINFO_URL ??
  "https://accounts.witus.online/api/idp/oauth2/userinfo";

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const cookieStore = await cookies();
  const expectedState = cookieStore.get("witus_oauth_state")?.value;
  const verifier = cookieStore.get("witus_oauth_verifier")?.value;

  const clearTransient = () => {
    cookieStore.set({
      name: "witus_oauth_state",
      value: "",
      maxAge: 0,
      path: "/",
    });
    cookieStore.set({
      name: "witus_oauth_verifier",
      value: "",
      maxAge: 0,
      path: "/",
    });
  };
  const fail = (reason: string) => {
    clearTransient();
    return NextResponse.redirect(
      new URL(`/signin?error=${reason}`, request.url),
    );
  };

  if (!code || !state || !expectedState || state !== expectedState || !verifier) {
    return fail("witus_state");
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? url.origin;
  const redirectUri = `${siteUrl.replace(/\/$/, "")}/api/auth/witus/callback`;

  // 1. Exchange the authorization code for tokens.
  const tokenRes = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: process.env.WITUS_OIDC_CLIENT_ID ?? "",
      client_secret: process.env.WITUS_OIDC_CLIENT_SECRET ?? "",
      code_verifier: verifier,
    }),
    cache: "no-store",
  });
  if (!tokenRes.ok) return fail("witus_token");
  const tokens = (await tokenRes.json()) as { access_token?: string };
  if (!tokens.access_token) return fail("witus_token");

  // 2. Read claims from userinfo.
  const userinfoRes = await fetch(USERINFO_URL, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
    cache: "no-store",
  });
  if (!userinfoRes.ok) return fail("witus_userinfo");
  const claims = (await userinfoRes.json()) as { sub?: string; email?: string };
  const email = claims.email?.trim().toLowerCase();
  if (!claims.sub || !email) return fail("witus_claims");

  // 3. Single-admin gate — identical to the magic-link flow (see auth/actions.ts).
  //    Only the one authorized address may establish a session; every other WitUS
  //    account is denied, so SSO cannot widen access beyond the magic-link path.
  const admin = getEnv().ADMIN_EMAIL?.trim().toLowerCase();
  if (!admin || email !== admin) {
    return fail("witus_denied");
  }

  // 4. Mint THIS app's own session (reuses the magic-link session helper).
  await startSession(email);

  clearTransient();
  return NextResponse.redirect(new URL("/field-report", request.url));
}
