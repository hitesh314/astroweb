import { PRACTITIONER } from "@/lib/site/practitioner";

import ChatInner from "./chat-inner";

export default function DashboardChatPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900">Consultation chat</h1>
      </div>

      <div className="stream-chat-scope overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <ChatInner />
      </div>
    </div>
  );
}
