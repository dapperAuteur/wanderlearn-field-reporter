/**
 * Session JWT round-trip — the heart of the email-link auth.
 *
 * Offline and deterministic: no network, no DB. It pins the contract `proxy.ts`
 * and the data-access layer both rely on — a session token signed with
 * `NEXTAUTH_SECRET` verifies, and anything else (tampered, foreign-signed,
 * absent, non-JWT) yields `null` rather than a false identity.
 */
import { describe, expect, it } from "vitest";
import { SignJWT } from "jose";

// Set before `session.ts` first reads it (env access there is lazy).
process.env.NEXTAUTH_SECRET = "test-secret-key-at-least-32-characters-long";

import { signSession, verifySessionToken } from "@/lib/auth/session";

describe("session JWT", () => {
  it("round-trips the signed-in email", async () => {
    const token = await signSession("bam@awews.com");
    expect(await verifySessionToken(token)).toBe("bam@awews.com");
  });

  it("rejects a token signed with a different key", async () => {
    const foreign = await new SignJWT({ email: "attacker@evil.com" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(new TextEncoder().encode("a-totally-different-secret-key!!"));
    expect(await verifySessionToken(foreign)).toBeNull();
  });

  it("rejects a tampered token", async () => {
    const token = await signSession("bam@awews.com");
    const parts = token.split(".");
    const tampered = `${parts[0]}.${parts[1]}.${parts[2].slice(0, -4)}AAAA`;
    expect(await verifySessionToken(tampered)).toBeNull();
  });

  it("rejects a missing or non-JWT token", async () => {
    expect(await verifySessionToken(undefined)).toBeNull();
    expect(await verifySessionToken("")).toBeNull();
    expect(await verifySessionToken("not-a-jwt")).toBeNull();
  });
});
