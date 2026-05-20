/**
 * Thin wrapper around `sendToInbox` — reads the three `INBOX_*` env vars and
 * falls back to a dev log when any is unset.
 *
 * Reads `process.env` directly (not via `getEnv()`) so the fallback fires in
 * any context — Server Action, `after()` continuation, route handler — without
 * depending on a separate env getter being initialized first. Per the handoff,
 * this file is the only place env-var reads for the Inbox integration live.
 */
import { sendToInbox, type InboxSubmission } from "./inbox-sender";

export async function submitToInbox(s: InboxSubmission) {
  const url = process.env.INBOX_INGEST_URL;
  const secret = process.env.INBOX_INGEST_SECRET;
  const slug = process.env.INBOX_SOURCE_SLUG;
  if (!url || !secret || !slug) {
    console.log("[inbox] dev-log fallback (env unset):", s.form_type);
    return { ok: false as const, status: 0, detail: "env unset" };
  }
  return sendToInbox({
    inboxUrl: url,
    hmacSecret: secret,
    sourceSlug: slug,
    submission: s,
  });
}
