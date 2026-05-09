"use client";

import Link from "next/link";
import { useState } from "react";

import { signOutAction } from "@/actions/auth";

type GuestProps = { mode: "guest" };

type UserProps = {
  mode: "user";
  display: string;
};

type Props = GuestProps | UserProps;

export default function DashboardHeader(props: Props) {
  const [open, setOpen] = useState(false);

  const guestLinks = [
    { href: "/", label: "Home" },
    { href: "/services", label: "Services" },
    { href: "/blog", label: "Journal" },
    { href: "/dashboard/reports", label: "Saved reports" },
    { href: "/dashboard/subscription", label: "Plans & checkout" },
  ] as const;

  const userLinks = [
    { href: "/services", label: "Services" },
    { href: "/dashboard", label: "Overview" },
    { href: "/dashboard/reports", label: "Reports" },
    { href: "/blog", label: "Blog" },
    { href: "/dashboard/subscription", label: "Subscription" },
  ] as const;

  if (props.mode === "guest") {
    return (
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
          <div className="min-w-0">
            <Link href="/" className="truncate text-sm font-semibold text-amber-950">
              AstroMarriage
            </Link>
            <p className="hidden truncate text-[0.6875rem] text-stone-500 sm:block">
              Browsing as guest
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/auth/login"
              className="rounded-full bg-stone-900 px-3 py-2 text-xs font-semibold text-[#fdfcf9] hover:bg-stone-800"
            >
              Sign in
            </Link>

            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 text-stone-700 md:hidden"
              aria-expanded={open}
              aria-controls="dash-guest-mobile-nav"
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

          <nav className="hidden items-center gap-6 text-sm text-stone-600 md:flex">
            {guestLinks.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-stone-900">
                {l.label}
              </Link>
            ))}
            <Link
              href="/auth/login"
              className="rounded-full bg-stone-900 px-4 py-1.5 text-xs font-semibold text-[#fdfcf9] hover:bg-stone-800"
            >
              Sign in to buy or save
            </Link>
          </nav>
        </div>

        {open ? (
          <nav
            id="dash-guest-mobile-nav"
            className="border-t border-stone-100 bg-white px-4 py-3 md:hidden"
          >
            <ul className="flex flex-col gap-0.5">
              {guestLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="block rounded-xl px-3 py-3 text-base text-stone-800 active:bg-stone-50"
                    onClick={() => setOpen(false)}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <Link
                  href="/auth/login"
                  className="block rounded-xl bg-stone-900 px-3 py-3 text-center text-base font-semibold text-[#fdfcf9]"
                  onClick={() => setOpen(false)}
                >
                  Sign in to buy or save
                </Link>
              </li>
            </ul>
          </nav>
        ) : null}
      </header>
    );
  }

  const initials = props.display.slice(0, 2).toUpperCase();

  return (
    <header className="border-b border-stone-200 bg-white shadow-sm shadow-stone-100">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4 md:h-auto md:flex-wrap md:gap-4 md:py-4">
        <div className="flex min-w-0 flex-1 items-center gap-2 md:gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-orange-50 text-[0.65rem] font-semibold text-amber-900 md:h-9 md:w-9 md:text-xs">
            {initials}
          </div>
          <div className="min-w-0">
            <Link
              href="/dashboard"
              className="block truncate text-sm font-semibold text-amber-950"
            >
              Your sanctuary
            </Link>
            <p className="hidden truncate text-xs text-stone-500 sm:block">
              {props.display}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-stone-200 text-stone-700 md:hidden"
          aria-expanded={open}
          aria-controls="dash-user-mobile-nav"
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

        <nav className="hidden flex-wrap items-center gap-x-6 gap-y-2 text-sm text-stone-600 md:flex">
          {userLinks.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-stone-900">
              {l.label}
            </Link>
          ))}
          <form action={signOutAction}>
            <button
              type="submit"
              className="rounded-full border border-stone-300 px-4 py-1.5 text-xs font-medium hover:bg-stone-100"
            >
              Sign out
            </button>
          </form>
        </nav>
      </div>

      {open ? (
        <div
          id="dash-user-mobile-nav"
          className="border-t border-stone-100 bg-white px-4 py-4 md:hidden"
        >
          <p className="pb-3 text-xs text-stone-500">Signed in as {props.display}</p>
          <ul className="flex flex-col gap-0.5">
            {userLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="block rounded-xl px-3 py-3 text-base text-stone-800 active:bg-stone-50"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <form
                action={signOutAction}
                onSubmit={() => setOpen(false)}
              >
                <button
                  type="submit"
                  className="w-full rounded-xl border border-stone-300 py-3 text-base font-medium text-stone-800 hover:bg-stone-50"
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
