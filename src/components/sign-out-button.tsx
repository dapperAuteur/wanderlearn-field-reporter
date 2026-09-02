"use client";

import { useTransition } from "react";
import { signOut, signOutLocal } from "@/lib/auth/actions";

const BUTTON_CLASS =
  "rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-400 disabled:opacity-60 dark:border-slate-700 dark:text-slate-400";

/**
 * A sign-out control, in two shapes decided on the SERVER.
 *
 * `endSessionUrl` null — this app is not a configured WitUS OIDC client, so there is no shared
 * session to end. Sign-out is the plain Server-Action form it has always been: no client JS on the
 * path, label "Sign out".
 *
 * `endSessionUrl` set — GLOBAL SIGN-OUT (BAM's decision, 2026-08-30: signing out of one WitUS app
 * signs you out of every WitUS app). We destroy the local session, then hand off to the IdP's
 * end-session endpoint, which ends the shared session and returns here. Label "Sign out of WitUS",
 * because a control that signs you out of six other apps should say so before it is clicked.
 *
 * ORDER IS THE SAFETY PROPERTY, and it is the reason this branch is client-side at all: the local
 * session is destroyed and AWAITED first, so if the IdP is unreachable, refuses the request, or the
 * redirect never completes, the person is still signed out HERE. Handing off first would turn any
 * IdP failure into "I clicked sign out and I am still signed in", which is the one outcome a
 * sign-out button must never produce.
 */
export function SignOutButton({
  endSessionUrl = null,
}: { endSessionUrl?: string | null } = {}) {
  const [pending, startTransition] = useTransition();

  if (!endSessionUrl) {
    return (
      <form action={signOut}>
        <button type="submit" className={BUTTON_CLASS}>
          Sign out
        </button>
      </form>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          // Local first. Everything below this line is best-effort.
          await signOutLocal();
          // A full navigation, not a router push: this leaves our origin for the IdP, which then
          // returns to the post_logout_redirect_uri already baked into the URL on the server
          // (src/lib/witus-sso-config.ts). If that URI is not registered for this client the IdP
          // keeps the visitor on its own page instead of coming back — they are signed out of both
          // places either way.
          window.location.assign(endSessionUrl);
        })
      }
      className={BUTTON_CLASS}
    >
      {pending ? "Signing out…" : "Sign out of WitUS"}
    </button>
  );
}
