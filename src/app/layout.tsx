import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";

import AppProviders from "@/components/providers";

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

export const metadata: Metadata = {
  metadataBase: site ? new URL(site) : new URL("http://localhost:3000"),
  title: "AstroMarriage · Love marriage or arranged?",
  description:
    "Simple marriage readings — love vs arranged, real feedback, from ₹249. Chat with an astrologer; first 3 minutes free.",
  openGraph: {
    title: "AstroMarriage",
    description:
      "Love marriage vs arranged — plain answers. ₹249 reading. Astrologer chat: first 3 minutes free.",
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
