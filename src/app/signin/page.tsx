import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/dal";
import { SignInForm } from "./SignInForm";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Human-readable copy for the `?error=` codes the verify route can set. */
const ERROR_MESSAGES: Record<string, string> = {
  missing: "That sign-in link was incomplete. Request a fresh one below.",
  invalid:
    "That sign-in link has expired or was already used. Request a fresh one below.",
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

  return (
    <main className="mx-auto flex max-w-md flex-col px-6 py-24">
      <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
        WitUS ecosystem · Wanderlearn
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">
        Sign in to Field Reporter
      </h1>
      <p className="mt-2 mb-6 text-sm leading-relaxed text-muted-foreground">
        The operator console is private. Enter your email and we&apos;ll send a
        one-time sign-in link — no password.
      </p>
      <SignInForm errorMessage={errorMessage} />
    </main>
  );
}
