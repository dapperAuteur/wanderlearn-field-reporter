/**
 * Magic-link sign-in tokens.
 *
 * A raw 256-bit token rides in the email link; only its SHA-256 hash is stored,
 * so a leaked `login_tokens` row never yields a usable link. Redemption is a
 * single atomic `UPDATE ... RETURNING` whose `WHERE` clause requires the token
 * to be unconsumed and unexpired — that makes each token strictly single-use
 * and safe against a double-submit race.
 */
import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, isNull } from "drizzle-orm";
import { getDb } from "@/db/client";
import { loginTokens } from "@/db/schema";

/** How long a magic link stays valid after it is issued. */
const TOKEN_TTL_SECONDS = 60 * 15; // 15 minutes

function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

/** Issue a login token for `email` and return the raw value for the link. */
export async function issueLoginToken(email: string): Promise<string> {
  const raw = randomBytes(32).toString("hex");
  await getDb()
    .insert(loginTokens)
    .values({
      email,
      tokenHash: hashToken(raw),
      expiresAt: new Date(Date.now() + TOKEN_TTL_SECONDS * 1000),
    });
  return raw;
}

/**
 * Redeem a raw token. Returns the email it was issued for, or `null` if the
 * token is unknown, already consumed, or expired. The token is consumed in the
 * same statement, so it cannot be redeemed twice.
 */
export async function consumeLoginToken(raw: string): Promise<string | null> {
  const now = new Date();
  const rows = await getDb()
    .update(loginTokens)
    .set({ consumedAt: now })
    .where(
      and(
        eq(loginTokens.tokenHash, hashToken(raw)),
        isNull(loginTokens.consumedAt),
        gt(loginTokens.expiresAt, now),
      ),
    )
    .returning({ email: loginTokens.email });
  return rows[0]?.email ?? null;
}
