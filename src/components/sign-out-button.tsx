"use client";

import { useId, useTransition } from "react";
import { signOut, signOutLocal } from "@/lib/auth/actions";
import {
  SIGN_OUT_EVERYWHERE_HELP,
  SIGN_OUT_EVERYWHERE_LABEL,
  SIGN_OUT_LABEL,
  signOutEverywhere,
} from "@/lib/witus-sso";

const BUTTON_CLASS =
  "rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-400 disabled:opacity-60 dark:border-slate-700 dark:text-slate-400";

// Secondary: no border, underlined, so "Sign out" stays the obvious control.
const SECONDARY_BUTTON_CLASS =
  "rounded-md px-2 py-1.5 text-sm font-medium text-slate-500 underline underline-offset-2 transition-colors hover:text-slate-700 disabled:opacity-60 dark:text-slate-400 dark:hover:text-slate-200";

/**
 * The sign-out controls (BAM, 2026-10-29, witus task 128 option (b)).
 *
 * "Sign out" — always rendered, always exactly that name. The plain Server-Action form it has
 * always been, with no client JS on the path: it ends ONLY this app's session and redirects to
 * /signin. It never visits the IdP, so the WitUS session and other WitUS apps stay signed in.
 *
 * "Sign out of WitUS everywhere" — rendered beside it only when `endSessionUrl` is set, i.e. this
 * app is a configured WitUS OIDC client (decided on the SERVER in src/lib/witus-sso-config.ts,
 * which also bakes `client_id` and `post_logout_redirect_uri` into the URL).
 */
export function SignOutButton({
  endSessionUrl = null,
}: { endSessionUrl?: string | null } = {}) {
  return (
    <div className="flex flex-wrap items-start gap-1">
      <form action={signOut}>
        <button type="submit" className={BUTTON_CLASS}>
          {SIGN_OUT_LABEL}
        </button>
      </form>
      {endSessionUrl ? <SignOutEverywhereButton endSessionUrl={endSessionUrl} /> : null}
    </div>
  );
}

/**
 * Ends this app's session, then the shared WitUS session at the IdP.
 *
 * ORDER IS THE SAFETY PROPERTY, and it is the reason this control is client-side at all: the local
 * session is destroyed and AWAITED first (`signOutEverywhere` in src/lib/witus-sso.ts), so if the
 * IdP is unreachable, refuses the request, or the redirect never completes, the person is still
 * signed out HERE. Handing off first would turn any IdP failure into "I clicked sign out and I am
 * still signed in", which is the one outcome a sign-out button must never produce.
 */
export function SignOutEverywhereButton({ endSessionUrl }: { endSessionUrl: string }) {
  const [pending, startTransition] = useTransition();
  const helpId = useId();

  return (
    <div className="max-w-xs">
      <button
        type="button"
        disabled={pending}
        aria-describedby={helpId}
        onClick={() =>
          startTransition(() =>
            signOutEverywhere({
              // Local first. Everything after it is best-effort.
              signOutLocal: () => signOutLocal(),
              // A full navigation, not a router push: this leaves our origin for the IdP, which
              // then returns to the post_logout_redirect_uri already baked into the URL on the
              // server (src/lib/witus-sso-config.ts). If that URI is not registered for this client
              // the IdP keeps the visitor on its own page instead of coming back — they are signed
              // out of both places either way.
              navigate: (url) => window.location.assign(url),
              endSessionUrl,
            }),
          )
        }
        className={SECONDARY_BUTTON_CLASS}
      >
        {pending ? "Signing out…" : SIGN_OUT_EVERYWHERE_LABEL}
      </button>
      <p id={helpId} className="mt-1 px-2 text-xs text-slate-500 dark:text-slate-400">
        {SIGN_OUT_EVERYWHERE_HELP}
      </p>
    </div>
  );
}
