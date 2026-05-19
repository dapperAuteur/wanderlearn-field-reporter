/**
 * Session JWT — sign and verify.
 *
 * Deliberately dependency-light and free of `next/headers`, so it is safe to
 * import from `proxy.ts` (which reads the cookie off the request directly) as
 * well as from server code. Cookie writing lives in `dal.ts`.
 *
 * The session is a stateless HS256 JWT — see the Next.js "stateless sessions"
 * auth guide. The single claim is the signed-in email; `NEXTAUTH_SECRET` is the
 * signing key, shared with the magic-link token.
 */
import { SignJWT, jwtVerify } from "jose";
import { requireEnv } from "@/lib/env";

/** Name of the HttpOnly cookie that carries the session JWT. */
export const SESSION_COOKIE = "wlfr_session";

/** Session lifetime — also the cookie `Max-Age` and the JWT expiry. */
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function signingKey(): Uint8Array {
  return new TextEncoder().encode(requireEnv("NEXTAUTH_SECRET"));
}

/** Sign a session JWT for `email`, valid for `SESSION_TTL_SECONDS`. */
export async function signSession(email: string): Promise<string> {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(email)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(signingKey());
}

/**
 * Verify a session JWT and return its email, or `null` if the token is
 * missing, malformed, expired, or signed with a different key.
 */
export async function verifySessionToken(
  token: string | undefined,
): Promise<string | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, signingKey(), {
      algorithms: ["HS256"],
    });
    return typeof payload.email === "string" && payload.email.length > 0
      ? payload.email
      : null;
  } catch {
    return null;
  }
}
