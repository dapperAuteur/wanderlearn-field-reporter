/**
 * The auth data-access layer — the one place server code asks "who is signed
 * in?" and where the session cookie is written and cleared.
 *
 * Per the Next.js auth guide, `proxy.ts` is only an optimistic gate; the real
 * checks belong close to the data. `requireUser` guards page/Server-Action
 * code; `requireApiUser` guards Route Handlers.
 */
import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  signSession,
  verifySessionToken,
} from "./session";

/**
 * The signed-in email, or `null`. Memoized for the render pass so repeated
 * calls within one request verify the JWT only once.
 */
export const getCurrentUser = cache(async (): Promise<string | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
});

/** Issue a session cookie for `email` — called after a magic link is redeemed. */
export async function startSession(email: string): Promise<void> {
  const token = await signSession(email);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

/** Clear the session cookie — called on sign-out. */
export async function endSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

/** For pages / Server Actions: return the email, or redirect to `/signin`. */
export async function requireUser(): Promise<string> {
  const email = await getCurrentUser();
  if (!email) redirect("/signin");
  return email;
}

/**
 * For Route Handlers: return `{ email }`, or a 401 `NextResponse` the handler
 * should return as-is. Defense in depth behind `proxy.ts`.
 */
export async function requireApiUser(): Promise<
  { email: string } | NextResponse
> {
  const email = await getCurrentUser();
  if (!email) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 },
    );
  }
  return { email };
}
