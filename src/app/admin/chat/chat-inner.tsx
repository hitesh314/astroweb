"use client";

import dynamic from "next/dynamic";

const AdminConsultInbox = dynamic(() => import("@/components/chat/admin-consult-inbox"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[20rem] items-center justify-center text-sm text-stone-500">
      Loading inbox…
    </div>
  ),
});

export default function AdminChatInner() {
  return <AdminConsultInbox />;
}
