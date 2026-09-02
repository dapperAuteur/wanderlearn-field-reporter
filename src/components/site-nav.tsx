import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/dal";
import { NavLink } from "@/components/nav-link";
import { SignOutButton } from "@/components/sign-out-button";
import { witusEndSessionUrl } from "@/lib/witus-sso-config";

/**
 * The always-visible top navigation, rendered once in the root layout.
 *
 * Sticky, so it stays reachable on scroll, and auth-aware: the operator-only
 * destinations (new capture, the waitlist dashboard) and the sign-in/out
 * control swap with the session. `getCurrentUser()` reads the session cookie,
 * so the layout renders dynamically — `signOut` calls `revalidatePath` to keep
 * this in sync after a sign-out.
 *
 * Sign-out is GLOBAL when this app is a configured WitUS OIDC client: the end-session URL is
 * resolved here, on the server (the button is a client component and must not read the raw env),
 * and is null otherwise, which leaves sign-out purely local. See src/lib/witus-sso-config.ts.
 */
export async function SiteNav() {
  const currentUser = await getCurrentUser();
  const endSessionUrl = currentUser ? await witusEndSessionUrl() : null;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
      <nav className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-6 py-3">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100"
        >
          Field Reporter
        </Link>
        <div className="flex flex-wrap items-center gap-1">
          <NavLink href="/field-report">Field reports</NavLink>
          <NavLink href="/help">Help</NavLink>
          {currentUser ? (
            <>
              <NavLink href="/field-report/new">New capture</NavLink>
              <NavLink href="/admin">Waitlist</NavLink>
              <SignOutButton endSessionUrl={endSessionUrl} />
            </>
          ) : (
            <NavLink href="/signin">Sign in</NavLink>
          )}
        </div>
      </nav>
    </header>
  );
}
