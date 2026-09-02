import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/dal";
import { getEnv } from "@/lib/env";
import { WitusSsoButton } from "@/components/witus-sso-button";
import { witusSilentSsoEndpoint } from "@/lib/witus-sso-config";
import { SignInForm } from "./SignInForm";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Human-readable copy for the `?error=` codes the auth routes can set. */
const ERROR_MESSAGES: Record<string, string> = {
  missing: "That sign-in link was incomplete. Request a fresh one below.",
  invalid:
    "That sign-in link has expired or was already used. Request a fresh one below.",
  // "Sign in with WitUS" (OIDC) failure codes — see api/auth/witus/callback.
  witus_not_configured: "Sign in with WitUS isn't set up yet. Use email below.",
  witus_state: "That WitUS sign-in expired or was interrupted. Try again.",
  witus_token: "WitUS couldn't verify that sign-in. Try again.",
  witus_userinfo: "WitUS couldn't return your account details. Try again.",
  witus_claims: "WitUS didn't return an email for your account. Try again.",
  witus_denied:
    "That WitUS account isn't the authorized address for this app. Join the waitlist below.",
};

/**
 * /signin — the only page reachable without a session. Submitting an email
 * sends a one-time magic link; redeeming it (via /api/auth/verify) sets the
 * session cookie and lands on the operator console.
 */
export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await getCurrentUser()) redirect("/field-report");

  const { error } = await searchParams;
  const errorMessage = error ? ERROR_MESSAGES[error] : undefined;

  // The "Sign in with WitUS" button only appears once the app has OIDC creds.
  const witusEnabled = Boolean(getEnv().WITUS_OIDC_CLIENT_ID);
  // Where that button's silent "Continue as <name>" check asks the IdP who this browser is.
  // Resolved on the SERVER and null unless the app is a configured OIDC client, so the client
  // component never touches the raw env and the probe stays dark when there is nothing to sign
  // in to. See src/lib/witus-sso.ts for the whole design.
  const silentCheckUrl = witusSilentSsoEndpoint();

  return (
    <main className="mx-auto flex max-w-md flex-col px-6 py-24">
      <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
        WitUS ecosystem · Wanderlearn
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">
        Sign in to Field Reporter
      </h1>
      <p className="mt-2 mb-6 text-sm leading-relaxed text-muted-foreground">
        This app is private; only the administrator can sign in. Enter your
        email; we&apos;ll either send a one-time sign-in link, or invite you to
        the waitlist for when this becomes available.
      </p>

      {witusEnabled && (
        <div className="mb-6">
          <WitusSsoButton silentCheckUrl={silentCheckUrl} />
          <div className="mt-4 flex items-center gap-3">
            <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            <span className="text-xs uppercase tracking-wide text-slate-400">
              or
            </span>
            <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      )}

      <SignInForm errorMessage={errorMessage} />
    </main>
  );
}
