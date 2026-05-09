"use client";

import Script from "next/script";

/** Google Ads (gtag) — conversion linker / measurement. Public ID from Google Ads setup. */
const GOOGLE_ADS_AW_ID = "AW-18151357028";

/**
 * Single gtag.js load for all routes (root layout via AppProviders).
 * - Google Ads: always configured with GOOGLE_ADS_AW_ID.
 * - GA4: optional when NEXT_PUBLIC_GA_MEASUREMENT_ID (G-xxxx) is set.
 */
export default function AnalyticsScripts() {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();

  const gtagSrcId = gaId || GOOGLE_ADS_AW_ID;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gtagSrcId}`}
        strategy="afterInteractive"
      />
      <Script id="google-tags-init" strategy="afterInteractive">{`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
${gaId ? `gtag('config', '${gaId}', { anonymize_ip: true });` : ""}
gtag('config', '${GOOGLE_ADS_AW_ID}');
      `}</Script>
    </>
  );
}
