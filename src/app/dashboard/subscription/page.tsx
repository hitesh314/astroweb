import { whatsappMarriageReadingHref } from "@/lib/contact/whatsapp-payment";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardSubscriptionPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = user?.email ?? null;
  const name =
    (user?.user_metadata?.full_name as string | undefined) ??
    (user?.user_metadata?.name as string | undefined) ??
    null;

  const waHref = whatsappMarriageReadingHref({ email, name });

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
          Plans & checkout
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-stone-600">
          Complete booking and payment over WhatsApp — we&apos;ll share options in chat.
          When you&apos;re signed in, your dashboard email can be prefilled so we can match
          your payment to your account.
        </p>
      </div>

      <div className="max-w-md">
        <article className="rounded-3xl border border-amber-200 bg-white p-8 shadow-lg shadow-amber-100/50 ring-2 ring-amber-200">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-800">
            Marriage reading
          </p>
          <p className="mt-4 text-sm leading-relaxed text-stone-600">
            Pricing is confirmed in WhatsApp — we don&apos;t show public rate cards here.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-stone-700">
            <li>• Written report — love vs arranged focus</li>
            <li>• One chart, plain language delivery</li>
          </ul>
          <div className="mt-8">
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center rounded-full bg-[#25D366] px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#20bd5a]"
            >
              Continue on WhatsApp
            </a>
            <p className="mt-3 text-center text-xs text-stone-500">
              Opens WhatsApp to +91 9358214529
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}
