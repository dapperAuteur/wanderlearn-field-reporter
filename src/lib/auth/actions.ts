"use server";

/**
 * Server Actions for the sign-in / waitlist flow.
 *
 * The sign-in form is dual-purpose: the admin email gets a magic link; any
 * other address is told the app is private and offered the waitlist. That
 * deliberately drops the previous account-enumeration screen — the admin
 * address is published on the portfolio anyway, so the screen was theater, and
 * a useful denied-state matters more than the pretense.
 */
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { getEnv } from "@/lib/env";
import { submitToInbox } from "@/lib/submit-to-inbox";
import { addToWaitlist } from "@/lib/waitlist";
import { endSession } from "./dal";
import { sendLoginLink } from "./mailer";
import { issueLoginToken } from "./tokens";

/**
 * Discriminated union — drives the form's render branches and carries the
 * submitted email forward into the denied → waitlist step.
 */
export type RequestLinkState =
  | { status: "idle" }
  | { status: "link-sent" }
  | { status: "denied"; email: string }
  | { status: "error"; message: string };

export type WaitlistState =
  | { status: "idle" }
  | { status: "waitlisted" }
  | { status: "error"; message: string };

async function currentOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

function normalizeEmail(formData: FormData): string {
  return String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
}

/**
 * Submit an email from the sign-in form. The admin address gets a magic link;
 * every other address gets a `denied` reply that the form turns into the
 * waitlist prompt.
 */
export async function requestLoginLink(
  _prev: RequestLinkState,
  formData: FormData,
): Promise<RequestLinkState> {
  const email = normalizeEmail(formData);
  if (!email) {
    return { status: "error", message: "Enter an email address." };
  }

  const admin = getEnv().ADMIN_EMAIL?.trim().toLowerCase();
  if (!admin || email !== admin) {
    return { status: "denied", email };
  }

  try {
    const token = await issueLoginToken(email);
    const origin = await currentOrigin();
    await sendLoginLink(email, `${origin}/api/auth/verify?token=${token}`);
    return { status: "link-sent" };
  } catch (err) {
    console.error("[auth] failed to send login link:", err);
    return { status: "error", message: "Could not send the link — try again." };
  }
}

/**
 * Add the submitted email to the waitlist. Invoked from the denied branch of
 * the sign-in form, so the email rides in via a hidden input.
 */
export async function joinWaitlist(
  _prev: WaitlistState,
  formData: FormData,
): Promise<WaitlistState> {
  const email = normalizeEmail(formData);
  if (!email) {
    return { status: "error", message: "We lost your email — start over." };
  }
  try {
    await addToWaitlist(email);
    // Fire-and-forget after the user-facing response renders — the WitUS Inbox
    // receives the same signup so BAM can triage and reply from the central
    // triage queue. Skipped when INBOX_* env vars are unset (dev-log fallback).
    after(async () => {
      await submitToInbox({
        form_type: "waitlist-signup",
        submitter_email: email,
        priority: "normal",
        payload: {
          email,
          submitted_at: new Date().toISOString(),
        },
      });
    });
    return { status: "waitlisted" };
  } catch (err) {
    console.error("[waitlist] failed to add signup:", err);
    return { status: "error", message: "Could not add you — try again." };
  }
}

/** Clear the session and return to the sign-in screen. */
export async function signOut(): Promise<void> {
  await endSession();
  // Drop the root layout's cache so the sticky nav re-renders signed-out.
  revalidatePath("/", "layout");
  redirect("/signin");
}
