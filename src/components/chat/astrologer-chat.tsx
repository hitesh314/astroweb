"use client";

import { useEffect, useRef, useState } from "react";
import { StreamChat } from "stream-chat";
import {
  Channel,
  Chat,
  ChannelHeader,
  MessageComposer,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";

import type { Channel as StreamChannel } from "stream-chat";

import "stream-chat-react/dist/css/index.css";

import { PRACTITIONER } from "@/lib/site/practitioner";

type BootstrapPayload = {
  apiKey: string;
  token: string;
  userId: string;
  userName: string;
  channelId: string;
};

export default function AstrologerChat() {
  const [client, setClient] = useState<StreamChat | null>(null);
  const [activeChannel, setActiveChannel] = useState<StreamChannel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<StreamChat | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setError(null);
      try {
        const res = await fetch("/api/stream/chat-bootstrap", { credentials: "include" });
        const data = (await res.json()) as BootstrapPayload & { error?: string; hint?: string };
        if (!res.ok || !data.apiKey || !data.token || !data.userId || !data.channelId) {
          setError(data.hint ?? data.error ?? `Could not start chat (${res.status}).`);
          return;
        }

        // Prefer `new StreamChat()` over `getInstance()` in React: the SDK singleton survives
        // Strict Mode's mount→disconnect→remount cycle, and a previous mount's disconnect
        // can asynchronously reset TokenManager after the remount already called connectUser.
        const streamClient = new StreamChat(data.apiKey);
        clientRef.current = streamClient;
        await streamClient.connectUser({ id: data.userId, name: data.userName }, data.token);
        if (cancelled) {
          await streamClient.disconnectUser();
          clientRef.current = null;
          return;
        }

        const ch = streamClient.channel("messaging", data.channelId);
        await ch.watch();
        if (cancelled) {
          await streamClient.disconnectUser();
          clientRef.current = null;
          return;
        }

        setClient(streamClient);
        setActiveChannel(ch);
      } catch {
        setError("Could not load chat.");
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

  if (error) {
    return (
      <div className="flex h-full flex-col justify-center px-6 py-10 text-center text-sm text-stone-600">
        <p className="font-medium text-stone-800">Chat unavailable</p>
        <p className="mt-2 text-stone-600">{error}</p>
      </div>
    );
  }

  if (!client || !activeChannel) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-stone-500">
        Connecting to chat…
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col text-stone-900">
      <Chat client={client} theme="str-chat__theme-light">
        <Channel channel={activeChannel}>
          <Window>
            <ChannelHeader title={`${PRACTITIONER.shortName} · consultation`} />
            <MessageList />
            <MessageComposer audioRecordingEnabled focus />
          </Window>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
}
