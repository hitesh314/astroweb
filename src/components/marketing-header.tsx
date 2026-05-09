"use client";

import Link from "next/link";
import { useState } from "react";

/** Marketing site navigation — slim top bar + full-width dropdown on mobile. */
export default function MarketingHeader() {
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/services", label: "Services" },
    { href: "/blog", label: "Journal" },
    { href: "/dashboard", label: "My account" },
  ] as const;

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-[#fdfcf9]/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4 sm:h-[3.75rem] sm:px-6">
        <Link
          href="/"
          className="shrink-0 text-sm font-semibold tracking-wide text-amber-950 sm:text-base"
        >
          AstroMarriage
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-stone-600 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="hover:text-stone-900"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 md:gap-3">
          <Link
            href="/auth/login"
            className="rounded-full bg-stone-900 px-3.5 py-2 text-xs font-semibold text-[#fdfcf9] shadow-sm hover:bg-stone-800 md:border md:border-stone-300 md:bg-transparent md:shadow-none md:text-stone-800 md:hover:bg-stone-100"
          >
            Sign in
          </Link>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 text-stone-700 md:hidden"
            aria-expanded={open}
            aria-controls="marketing-mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <span className="text-lg leading-none" aria-hidden>
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
        <nav
          id="marketing-mobile-nav"
          className="border-t border-stone-100 bg-[#fdfcf9] px-4 py-3 md:hidden"
        >
          <ul className="flex flex-col gap-1">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="block rounded-xl px-3 py-3 text-base text-stone-800 active:bg-stone-100"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
