import { signOut } from "@/lib/auth/actions";

/** A sign-out control — posts to the `signOut` Server Action, no client JS. */
export function SignOutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-400 dark:border-slate-700 dark:text-slate-400"
      >
        Sign out
      </button>
    </form>
  );
}
