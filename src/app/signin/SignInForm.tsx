"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  joinWaitlist,
  requestLoginLink,
  type RequestLinkState,
  type WaitlistState,
} from "@/lib/auth/actions";

const LINK_INITIAL: RequestLinkState = { status: "idle" };
const WAIT_INITIAL: WaitlistState = { status: "idle" };

/**
 * The sign-in / waitlist form.
 *
 * Two Server Actions, four render branches: an idle email form, a
 * "check your inbox" confirmation for the admin, an explicit denied state with
 * a waitlist CTA for everyone else, and a waitlist confirmation. The terminal
 * states are checked first so they win once reached.
 */
export function SignInForm({ errorMessage }: { errorMessage?: string }) {
  const [linkState, linkAction, linkPending] = useActionState(
    requestLoginLink,
    LINK_INITIAL,
  );
  const [waitState, waitAction, waitPending] = useActionState(
    joinWaitlist,
    WAIT_INITIAL,
  );

  if (waitState.status === "waitlisted") {
    return (
      <p className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
        Thanks — you&apos;re on the list. We&apos;ll be in touch when this
        becomes available as a product.
      </p>
    );
  }

  if (linkState.status === "link-sent") {
    return (
      <p className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
        Check your inbox. A one-time sign-in link is on its way — it expires in
        15 minutes.
      </p>
    );
  }

  if (linkState.status === "denied") {
    return (
      <div className="space-y-4">
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
          <p>
            Sorry — this app is private right now and{" "}
            <span className="font-mono text-xs">{linkState.email}</span>{" "}
            isn&apos;t an authorized address, so you can&apos;t use it yet.
          </p>
          <p className="mt-2">
            Want to be notified — and join the early-paying waitlist — when
            this becomes available as a product?
          </p>
        </div>

        <form action={waitAction} className="space-y-2">
          <input type="hidden" name="email" value={linkState.email} />
          {waitState.status === "error" && (
            <p className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200">
              {waitState.message}
            </p>
          )}
          <button
            type="submit"
            disabled={waitPending}
            className="w-full rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-700 disabled:opacity-60"
          >
            {waitPending ? "Adding…" : "Add me to the waitlist"}
          </button>
        </form>

        <p className="text-xs text-slate-500">
          <Link
            href="/signin"
            className="text-sky-700 hover:underline dark:text-sky-400"
          >
            Try a different email
          </Link>
        </p>
      </div>
    );
  }

  // status: "idle" or "error" — render the email form.
  return (
    <form action={linkAction} className="space-y-3">
      {errorMessage && (
        <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
          {errorMessage}
        </p>
      )}
      {linkState.status === "error" && (
        <p className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200">
          {linkState.message}
        </p>
      )}
      <label htmlFor="email" className="block text-sm font-medium">
        Email
      </label>
      <input
        id="email"
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="you@example.com"
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-950"
      />
      <button
        type="submit"
        disabled={linkPending}
        className="w-full rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-700 disabled:opacity-60"
      >
        {linkPending ? "Working…" : "Continue"}
      </button>
    </form>
  );
}
