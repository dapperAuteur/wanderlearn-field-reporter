/**
 * Sends the magic-link email through the Mailgun HTTP API.
 *
 * Calls the REST endpoint directly with `fetch` — the same no-SDK approach the
 * `webSearch` tool takes for Tavily — so there is no SMTP client and no extra
 * dependency. Auth is HTTP Basic: username `api`, password the private key.
 */
import "server-only";
import { requireEnv } from "@/lib/env";

/** Send `link` as a sign-in email to `email`. Throws if Mailgun rejects it. */
export async function sendLoginLink(
  email: string,
  link: string,
): Promise<void> {
  const domain = requireEnv("MAILGUN_DOMAIN");
  const apiKey = requireEnv("MAILGUN_API_KEY");
  const from = requireEnv("EMAIL_FROM");

  const body = new URLSearchParams({
    from,
    to: email,
    subject: "Your Wanderlearn Field Reporter sign-in link",
    text:
      `Sign in to Wanderlearn Field Reporter:\n\n${link}\n\n` +
      `This link expires in 15 minutes and works once. ` +
      `If you didn't request it, you can ignore this email.`,
    html:
      `<p>Sign in to Wanderlearn Field Reporter:</p>` +
      `<p><a href="${link}">Sign in</a></p>` +
      `<p>This link expires in 15 minutes and works once. ` +
      `If you didn't request it, you can ignore this email.</p>`,
  });

  const auth = Buffer.from(`api:${apiKey}`).toString("base64");
  const res = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Mailgun send failed (${res.status}): ${detail}`);
  }
}
