// Starts the "Sign in with WitUS" OIDC flow: generate state + PKCE, stash them in
// short-lived httpOnly cookies, and redirect to the WitUS IdP authorize endpoint.
// The IdP returns to /api/auth/witus/callback with a code.
//
// This is a parallel entry point to the magic-link flow, NOT a replacement. The
// callback still mints THIS app's own session (the `wlfr_session` HS256 JWT via
// `startSession`) and still enforces the single-admin gate (ADMIN_EMAIL), so a
// WitUS login grants exactly the same access as a magic link and nothing more.
import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";

// Touches node:crypto and sets cookies; must never be cached.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const AUTHORIZE_URL =
  process.env.WITUS_OIDC_AUTHORIZE_URL ??
  "https://accounts.witus.online/api/idp/oauth2/authorize";

const b64url = (buf: Buffer) => buf.toString("base64url");

export async function GET(request: NextRequest) {
  const clientId = process.env.WITUS_OIDC_CLIENT_ID;
  if (!clientId) {
    return NextResponse.redirect(
      new URL("/signin?error=witus_not_configured", request.url),
    );
  }

  // Must EXACTLY match the redirect URI registered for this app in the IdP.
  // Prefer the configured site URL over the request origin (which on Vercel may
  // be the deployment host, not the canonical domain).
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin;
  const redirectUri = `${siteUrl.replace(/\/$/, "")}/api/auth/witus/callback`;

  const state = b64url(crypto.randomBytes(16));
  const verifier = b64url(crypto.randomBytes(32));
  const challenge = b64url(
    crypto.createHash("sha256").update(verifier).digest(),
  );

  const authUrl = new URL(AUTHORIZE_URL);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("scope", "openid email profile");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("code_challenge", challenge);
  authUrl.searchParams.set("code_challenge_method", "S256");

  const res = NextResponse.redirect(authUrl.toString());
  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 600, // 10 minutes
  };
  res.cookies.set("witus_oauth_state", state, cookieOpts);
  res.cookies.set("witus_oauth_verifier", verifier, cookieOpts);
  return res;
}
