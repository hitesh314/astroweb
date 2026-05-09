"use client";

import { useEffect, useRef, useState } from "react";
import { StreamChat } from "stream-chat";
import type { Channel as StreamChannel } from "stream-chat";
import {
  Channel,
  ChannelHeader,
  Chat,
  MessageComposer,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";

import "stream-chat-react/dist/css/index.css";

import { PRACTITIONER } from "@/lib/site/practitioner";
import { parseConsultChannelClientUserId, streamMessagingLocalId } from "@/lib/stream/consult-channel";

type BootstrapPayload = {
  apiKey: string;
  token: string;
  userId: string;
  userName: string;
};

function consultChannelPickerLabel(cid: string | undefined): string {
  const clientUid = parseConsultChannelClientUserId(cid ?? "");
  if (!clientUid) return cid ?? "Channel";
  return `Customer ${clientUid.slice(0, 8)}…`;
}

function shortTimestamp(iso: string | undefined): string {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

/** Full Stream Chat window — same light theme as dashboard chat. */
function AdminConsultChatWindow({
  client,
  activeChannel,
}: {
  client: StreamChat;
  activeChannel: StreamChannel;
}) {
  const headerTitle =
    `${consultChannelPickerLabel(streamMessagingLocalId(activeChannel))}` +
    ` · ${PRACTITIONER.shortName} consultation`;

  return (
    <div className="stream-chat-scope flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white text-stone-900">
      <Chat client={client} theme="str-chat__theme-light">
        <Channel channel={activeChannel}>
          <Window>
            <ChannelHeader title={headerTitle} />
            <MessageList />
            <MessageComposer audioRecordingEnabled focus />
          </Window>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
}

export default function AdminConsultInbox() {
  const [client, setClient] = useState<StreamChat | null>(null);
  const [channels, setChannels] = useState<StreamChannel[]>([]);
  const [activeChannel, setActiveChannel] = useState<StreamChannel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<StreamChat | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setError(null);
      try {
        const res = await fetch("/api/stream/admin-inbox-bootstrap", { credentials: "include" });
        const data = (await res.json()) as BootstrapPayload & { error?: string; hint?: string };

        if (!res.ok || !data.apiKey || !data.token || !data.userId) {
          if (res.status === 403) {
            setError("You do not have access to this inbox.");
            return;
          }
          setError(data.hint ?? data.error ?? `Could not open inbox (${res.status}).`);
          return;
        }

        const streamClient = new StreamChat(data.apiKey);
        clientRef.current = streamClient;
        await streamClient.connectUser({ id: data.userId, name: data.userName }, data.token);

        const list = await streamClient.queryChannels(
          {
            type: "messaging",
            members: { $in: [data.userId] },
          },
          { last_message_at: -1 },
          { limit: 80 },
        );

        const inbox = list.filter((ch) =>
          Boolean(parseConsultChannelClientUserId(streamMessagingLocalId(ch))),
        );

        let active: StreamChannel | null = inbox[0] ?? null;
        if (active) {
          await active.watch({ state: true });
        }

        if (cancelled) {
          await streamClient.disconnectUser();
          clientRef.current = null;
          return;
        }

        setChannels(inbox);
        setActiveChannel(active);
        setClient(streamClient);
      } catch {
        setError("Could not load inbox.");
      }
    };

    void run();

    return () => {
      cancelled = true;
      if (clientRef.current) {
        void clientRef.current.disconnectUser();
        clientRef.current = null;
      }
    };
  }, []);

  const pickChannel = async (ch: StreamChannel) => {
    try {
      await ch.watch({ state: true });
      setActiveChannel(ch);
    } catch {
      setError("Could not open conversation.");
    }
  };

  if (error) {
    return (
      <div className="rounded-lg border border-stone-200 bg-white px-6 py-10 text-center text-sm text-stone-600 shadow-sm">
        <p className="font-medium text-stone-800">Inbox</p>
        <p className="mt-2">{error}</p>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex min-h-[20rem] items-center justify-center text-sm text-stone-500">
        Loading inbox…
      </div>
    );
  }

  return (
    <div className="stream-chat-admin-scope flex min-h-0 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
      <aside className="flex min-h-0 w-[min(17rem,100%)] shrink-0 flex-col border-r border-stone-200 bg-[#fdfcf9]">
        <div className="border-b border-stone-200 px-4 py-3 text-xs font-medium uppercase tracking-wide text-stone-500">
          Customers ({channels.length})
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {channels.length === 0 ? (
            <p className="px-4 py-6 text-sm text-stone-500">
              No consultation threads yet. When customers open dashboard chat you will appear as a member.
            </p>
          ) : (
            channels.map((ch) => {
              const localId = streamMessagingLocalId(ch);
              const activeLocal = activeChannel ? streamMessagingLocalId(activeChannel) : "";
              const picked = Boolean(activeLocal && localId === activeLocal);
              const lastIso = ch.data?.last_message_at as string | undefined;
              return (
                <button
                  key={ch.cid ?? localId}
                  type="button"
                  onClick={() => void pickChannel(ch)}
                  className={`block w-full border-b border-stone-200 px-4 py-3 text-left text-sm transition-colors hover:bg-amber-50/80 ${
                    picked
                      ? "border-l-2 border-l-amber-500 bg-amber-50/90 text-stone-900"
                      : "border-l-2 border-l-transparent text-stone-700"
                  }`}
                >
                  <span className="font-medium">{consultChannelPickerLabel(localId)}</span>
                  <span className="mt-0.5 block text-xs text-stone-500">
                    {shortTimestamp(lastIso)}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white">
        {!activeChannel ? (
          <div className="flex min-h-[28rem] flex-1 items-center justify-center text-sm text-stone-500">
            Select a customer to open the chat window.
          </div>
        ) : (
          <AdminConsultChatWindow client={client} activeChannel={activeChannel} />
        )}
      </div>
    </div>
  );
}
