"use client";

import posthog from "posthog-js";
import { Suspense, useEffect } from "react";

/** Client-only PostHog — set NEXT_PUBLIC_POSTHOG_KEY + optional NEXT_PUBLIC_POSTHOG_HOST */

function Inner() {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return;
    const host =
      process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com";
    posthog.init(key, {
      api_host: host,
      capture_pageleave: true,
      capture_pageview: true,
      persistence: "localStorage+cookie",
    });
  }, []);
  return null;
}

export default function PostHogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={null}>
        <Inner />
      </Suspense>
      {children}
    </>
  );
}
