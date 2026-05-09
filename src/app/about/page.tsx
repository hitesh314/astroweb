import type { Metadata } from "next";
import Image from "next/image";

import MarketingHeader from "@/components/marketing-header";
import { PRACTITIONER } from "@/lib/site/practitioner";

export const metadata: Metadata = {
  title: "About",
  description: `About ${PRACTITIONER.shortName} — background, practice, and how readings are approached.`,
};

export default function AboutPage() {
  return (
    <div className="min-h-dvh bg-[#fdfcf9] text-stone-900">
      <MarketingHeader />

      <main className="mx-auto max-w-xl px-5 py-14">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-stone-950">
          About me
        </h1>
        <p className="mt-2 text-sm text-stone-500">{PRACTITIONER.subtitle}</p>

        <div className="relative mx-auto mt-10 max-w-xs">
          <div className="overflow-hidden rounded-[2rem] bg-gradient-to-b from-amber-100/50 to-stone-100 p-1 shadow-lg shadow-amber-100/40 ring-1 ring-amber-900/10">
            <div className="overflow-hidden rounded-[1.65rem] ring-1 ring-white/65">
              <Image
                src={PRACTITIONER.portraitSrc}
                alt={PRACTITIONER.portraitAlt}
                width={480}
                height={720}
                className="h-auto w-full object-cover object-top"
                priority
                sizes="(max-width: 768px) 90vw, 20rem"
              />
            </div>
          </div>
        </div>

        <p className="mt-10 text-[0.9375rem] leading-relaxed text-stone-700">
          {PRACTITIONER.aboutLead}
        </p>
        <div className="mt-6 space-y-4 text-[0.9375rem] leading-relaxed text-stone-600">
          {PRACTITIONER.aboutParagraphs.map((para, i) => (
            <p
              key={i}
              className={
                para.startsWith("Warmly")
                  ? "whitespace-pre-line pt-3 text-stone-700 font-medium"
                  : ""
              }
            >
              {para}
            </p>
          ))}
        </div>
      </main>
    </div>
  );
}
