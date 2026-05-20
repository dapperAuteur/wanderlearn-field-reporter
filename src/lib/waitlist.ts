/**
 * Capture early-interest signups from the sign-in screen.
 *
 * When a non-admin tries to sign in we deny access and invite them to join this
 * list — the future "early-paying customer" cohort. Repeat submissions are
 * idempotent: a duplicate email hits the unique index and is silently ignored.
 * The list of signups is rendered in the admin dashboard at `/admin`.
 */
import "server-only";
import { count, desc } from "drizzle-orm";
import { getDb } from "@/db/client";
import { waitlistSignups, type WaitlistSignup } from "@/db/schema";

export async function addToWaitlist(email: string): Promise<void> {
  await getDb()
    .insert(waitlistSignups)
    .values({ email })
    .onConflictDoNothing({ target: waitlistSignups.email });
}

/** Recent signups, newest first — the at-a-glance feed on `/admin`. */
export async function listWaitlistSignups(
  limit = 50,
): Promise<WaitlistSignup[]> {
  return getDb()
    .select()
    .from(waitlistSignups)
    .orderBy(desc(waitlistSignups.createdAt))
    .limit(limit);
}

/** Total signup count — drives the dashboard stat and the "showing N of M" hint. */
export async function countWaitlistSignups(): Promise<number> {
  const [row] = await getDb()
    .select({ n: count() })
    .from(waitlistSignups);
  return Number(row?.n ?? 0);
}
