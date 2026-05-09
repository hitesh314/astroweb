"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { signOutAction } from "@/actions/auth";

const NAV = [
  { href: "/dashboard", label: "Overview", match: "exact" as const },
  { href: "/dashboard/reports", label: "Reports", match: "prefix" as const },
  { href: "/blog", label: "Journal", match: "prefix" as const },
  { href: "/dashboard/subscription", label: "Subscription", match: "prefix" as const },
];

function navActive(pathname: string, href: string, match: "exact" | "prefix") {
  if (match === "exact") return pathname === href || pathname === `${href}/`;
  return pathname === href || pathname.startsWith(`${href}/`);
}

type Props = { displayName: string };

export default function DashboardSiteHeader({ displayName }: Props) {
  const pathname = usePathname() ?? "";
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-[#fdfcf9]/95 shadow-[0_1px_0_rgba(0,0,0,0.04)] backdrop-blur-md">
      <div className="mx-auto flex min-h-14 max-w-5xl items-start justify-between gap-3 px-4 py-3 sm:h-auto sm:min-h-[3.75rem] sm:items-center sm:px-6 sm:py-4">
        <div className="flex min-w-0 flex-1 gap-3 sm:items-center">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-orange-50 text-sm font-semibold tracking-tight text-amber-950 ring-2 ring-white shadow-sm">
            {displayName.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 pt-0.5 sm:pt-0">
            <Link
              href="/dashboard"
              className="font-[family-name:var(--font-display)] text-lg font-semibold leading-tight text-stone-900 sm:text-xl"
            >
              Your sanctuary
            </Link>
            <p className="mt-0.5 truncate text-xs text-stone-500 sm:text-[0.8125rem]">
              <span className="text-stone-600">{displayName}</span>
              <span className="mx-1.5 text-stone-300" aria-hidden>
                ·
              </span>
              <Link
                href="/"
                className="font-medium text-amber-900/90 underline decoration-amber-900/20 underline-offset-2 hover:decoration-amber-900/50"
              >
                Main site
              </Link>
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <nav
            aria-label="Dashboard navigation"
            className="hidden items-center gap-1 md:flex"
          >
            {NAV.map(({ href, label, match }) => {
              const active = navActive(pathname, href, match);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`rounded-full px-3.5 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-amber-100/90 text-amber-950 ring-1 ring-amber-200/80"
                      : "text-stone-600 hover:bg-stone-100/80 hover:text-stone-900"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <form action={signOutAction} className="hidden sm:block">
            <button
              type="submit"
              className="rounded-full border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-800 shadow-sm transition hover:border-stone-300 hover:bg-stone-50"
            >
              Sign out
            </button>
          </form>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-700 shadow-sm md:hidden"
            aria-expanded={open}
            aria-controls="dashboard-mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <span className="text-xl leading-none" aria-hidden>
                ×
              </span>
            ) : (
              <span className="flex flex-col gap-1" aria-hidden>
                <span className="h-0.5 w-5 rounded-full bg-stone-700" />
                <span className="h-0.5 w-5 rounded-full bg-stone-700" />
                <span className="h-0.5 w-5 rounded-full bg-stone-700" />
              </span>
            )}
          </button>
        </div>
      </div>

      {open ? (
        <div
          id="dashboard-mobile-nav"
          className="border-t border-stone-100 bg-[#fdfcf9] px-4 py-3 md:hidden"
        >
          <ul className="flex flex-col gap-0.5">
            {NAV.map(({ href, label, match }) => {
              const active = navActive(pathname, href, match);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`block rounded-xl px-3 py-3 text-base ${
                      active
                        ? "bg-amber-100/90 font-semibold text-amber-950"
                        : "text-stone-800 active:bg-stone-100"
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
            <li className="border-t border-stone-100 pt-2">
              <Link
                href="/"
                className="block rounded-xl px-3 py-3 text-base font-medium text-amber-950"
                onClick={() => setOpen(false)}
              >
                Main site
              </Link>
            </li>
            <li className="pt-2">
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="w-full rounded-xl border border-stone-200 bg-white py-3 text-base font-semibold text-stone-800"
                >
                  Sign out
                </button>
              </form>
            </li>
          </ul>
        </div>
      ) : null}
    </header>
  );
}
