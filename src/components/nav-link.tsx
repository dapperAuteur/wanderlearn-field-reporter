"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * A top-nav link that highlights when its route is the current page.
 *
 * A Client Component so it can read `usePathname()`; the surrounding `SiteNav`
 * stays a Server Component and renders these as children.
 */
export function NavLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  const active = usePathname() === href;
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={
        active
          ? "rounded-md bg-sky-50 px-3 py-1.5 text-sm font-medium text-sky-800 dark:bg-sky-500/10 dark:text-sky-300"
          : "rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
      }
    >
      {children}
    </Link>
  );
}
