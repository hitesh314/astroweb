"use client";

import dynamic from "next/dynamic";

const AstrologerChat = dynamic(() => import("@/components/chat/astrologer-chat"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[28rem] items-center justify-center text-sm text-stone-500">
      Loading chat…
    </div>
  ),
});

export default function ChatInner() {
  return <AstrologerChat />;
}
