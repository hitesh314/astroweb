import Link from "next/link";

import { PRACTITIONER } from "@/lib/site/practitioner";
import { CHAT_APP_HREF } from "@/lib/site/chat-cta";

export default function DashboardSubscriptionPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
          Plans & checkout
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-stone-600">
          Open chat with {PRACTITIONER.shortName} to discuss options, pricing, and payment —
          your signed-in account keeps everything tied to your dashboard profile.
        </p>
      </div>

      <div className="max-w-md">
        <article className="rounded-3xl border border-amber-200 bg-white p-8 shadow-lg shadow-amber-100/50 ring-2 ring-amber-200">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-800">
            Marriage reading
          </p>
          <p className="mt-4 text-sm leading-relaxed text-stone-600">
            Rates and details are confirmed in chat — we don&apos;t show public rate cards here.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-stone-700">
            <li>• Written report — love vs arranged focus</li>
            <li>• One chart, plain language delivery</li>
          </ul>
          <div className="mt-8">
            <Link
              href={CHAT_APP_HREF}
              className="inline-flex w-full items-center justify-center rounded-full bg-stone-900 px-8 py-3 text-sm font-semibold text-[#fdfcf9] shadow-sm transition hover:bg-stone-800"
            >
              Chat now
            </Link>
            <p className="mt-3 text-center text-xs text-stone-500">
              Opens your consultation thread in the dashboard
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}
