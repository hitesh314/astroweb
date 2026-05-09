export default function DashboardSubscriptionPage() {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-10 text-center text-stone-600">
      <p className="text-sm">
        Bind Stripe / Razorpay webhooks →{" "}
        <code className="rounded bg-stone-100 px-2 py-0.5 text-xs">
          subscriptions
        </code>{" "}
        table rows.
      </p>
    </div>
  );
}
