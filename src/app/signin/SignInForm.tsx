"use client";

import { useActionState } from "react";
import { requestLoginLink, type RequestLinkState } from "@/lib/auth/actions";

const INITIAL: RequestLinkState = { status: "idle" };

/**
 * The magic-link request form. On submit it calls the `requestLoginLink`
 * Server Action; the reply is the same for any address, so a confirmed `sent`
 * state never discloses which email is allowed to sign in.
 */
export function SignInForm({ errorMessage }: { errorMessage?: string }) {
  const [state, action, pending] = useActionState(requestLoginLink, INITIAL);

  if (state.status === "sent") {
    return (
      <p className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
        Check your inbox. If that address can sign in, a link is on its way — it
        expires in 15 minutes.
      </p>
    );
  }

  return (
    <form action={action} className="space-y-3">
      {errorMessage && (
        <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
          {errorMessage}
        </p>
      )}
      {state.status === "error" && (
        <p className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200">
          {state.message}
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
        disabled={pending}
        className="w-full rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-700 disabled:opacity-60"
      >
        {pending ? "Sending…" : "Email me a sign-in link"}
      </button>
    </form>
  );
}
