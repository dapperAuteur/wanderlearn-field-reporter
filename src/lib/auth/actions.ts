"use server";

/**
 * Server Actions for the sign-in flow.
 *
 * `requestLoginLink` is intentionally constant-time in its reply: it returns
 * the same `sent` state whether or not the submitted address is the admin, so
 * the form never reveals which email can sign in. Only `ADMIN_EMAIL` actually
 * gets a link.
 */
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getEnv } from "@/lib/env";
import { endSession } from "./dal";
import { sendLoginLink } from "./mailer";
import { issueLoginToken } from "./tokens";

export type RequestLinkState = {
  status: "idle" | "sent" | "error";
  message?: string;
};

async function currentOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/** Email a magic link — but only to the configured admin address. */
export async function requestLoginLink(
  _prev: RequestLinkState,
  formData: FormData,
): Promise<RequestLinkState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const admin = getEnv().ADMIN_EMAIL?.trim().toLowerCase();

  if (admin && email === admin) {
    try {
      const token = await issueLoginToken(email);
      const origin = await currentOrigin();
      await sendLoginLink(email, `${origin}/api/auth/verify?token=${token}`);
    } catch (err) {
      console.error("[auth] failed to send login link:", err);
      return { status: "error", message: "Could not send the link — try again." };
    }
  }

  // Same reply for any address — no account enumeration.
  return { status: "sent" };
}

/** Clear the session and return to the sign-in screen. */
export async function signOut(): Promise<void> {
  await endSession();
  redirect("/signin");
}
