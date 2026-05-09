import type { Metadata } from "next";

import AdminChatInner from "./chat-inner";

export const metadata: Metadata = {
  title: "Inbox — all messages · Admin",
};

export default function AdminChatPage() {
  return (
    <div className="rounded-2xl border border-stone-200/80 bg-[#fdfcf9] p-6 shadow-sm text-stone-900 ring-1 ring-stone-900/[0.04]">
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-stone-900">
            Inbox — all customer messages
          </h1>
        </div>
        <AdminChatInner />
      </div>
    </div>
  );
}
