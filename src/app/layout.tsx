import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";

import AppProviders from "@/components/providers";
import { PRACTITIONER } from "@/lib/site/practitioner";

import "./globals.css";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const sans = DM_Sans({
  variable: "--font-sans-ui",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const site =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

const metadataBaseUrl = site ? new URL(site) : new URL("http://localhost:3000");

const ogTitle = `${PRACTITIONER.honorificAndName} — Love & arranged marriage, read plainly`;

const ogDescription = `Personal Vedic (jyotiṣa) readings by ${PRACTITIONER.shortName}. Marriage partnering, timelines, calm language families can share — book or ask for rates in dashboard chat. Signed-in chat includes three introductory minutes.`;

const defaultMetaDescription = `${PRACTITIONER.shortName} — love marriage vs arranged, from your chart in plain English. Booking and pricing in chat; short free window when you sign in.`;

export const metadata: Metadata = {
  metadataBase: metadataBaseUrl,
  title: {
    default: `${PRACTITIONER.shortName} · Love marriage or arranged?`,
    template: `%s · ${PRACTITIONER.siteTitleSuffix}`,
  },
  description: defaultMetaDescription,
  applicationName: PRACTITIONER.practiceName,
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: metadataBaseUrl,
    siteName: PRACTITIONER.shortName,
    title: ogTitle,
    description: ogDescription,
  },
  twitter: {
    card: "summary",
    title: ogTitle,
    description: ogDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} h-full antialiased`}
    >
      <body className="min-h-dvh font-[family-name:var(--font-sans-ui)]">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
