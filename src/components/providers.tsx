"use client";

import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "sonner";

import AnalyticsScripts from "@/components/analytics-scripts";

import PostHogProvider from "./posthog-provider";

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PostHogProvider>
      {children}
      <Toaster richColors closeButton />
      <Analytics />
      <AnalyticsScripts />
    </PostHogProvider>
  );
}
