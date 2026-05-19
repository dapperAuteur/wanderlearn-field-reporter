/**
 * Capture early-interest signups from the sign-in screen.
 *
 * When a non-admin tries to sign in we deny access and invite them to join this
 * list — the future "early-paying customer" cohort. Repeat submissions are
 * idempotent: a duplicate email hits the unique index and is silently ignored.
 */
import "server-only";
import { getDb } from "@/db/client";
import { waitlistSignups } from "@/db/schema";

export async function addToWaitlist(email: string): Promise<void> {
  await getDb()
    .insert(waitlistSignups)
    .values({ email })
    .onConflictDoNothing({ target: waitlistSignups.email });
}
