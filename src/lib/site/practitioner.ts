/**
 * Site identity — private practice persona (adjust name/copy/photo to match the real practitioner).
 * Portrait: `public/KavitaRaoPhoto.png` (swap file or `portraitSrc` as needed).
 */

export const PRACTITIONER = {
  /** Public display name — long form for hero / metadata */
  honorificAndName: "Pandita Kavita Rao",
  shortName: "Kavita Rao",
  initials: "KR",
  /** One-line authority */
  subtitle: "Jyotiṣa · marriage & partnering · plain language readings",
  practiceName: "Kavita Rao Jyotiṣ readings",
  siteTitleSuffix: "Kavita Rao",
  portraitSrc: "/KavitaRaoPhoto.png",
  portraitAlt:
    "Pandita Kavita Rao at her desk with chart books, lamp, and prayer beads",

  /** “About” body — conversational first person reads more like a private site */
  aboutLead:
    "I am Pandita Kavita Rao. For over twenty-two years I have read birth charts privately for families across India and the diaspora — mostly marriages, timings, and the quiet worry of “what if parents disagree?”",

  aboutParagraphs: [
    "I trained in traditional Sanskrit brāhmaṇa lineages alongside careful software charting so nothing is skimmed from a generic app. Parents bring my notes to local pandit consultations; younger clients forward paragraphs to sisters abroad. Fear-mongering is not my style.",
    "This small site is where you can book that focused written reading on love versus arranged partnering — the same care I reserve for longstanding clients — or open chat first if you want to clarify birth-time accuracy and arrangements before committing.",
    "Warmly,\nKavita",
  ] as const,

  otpBrandLine: "Kavita Rao readings",
  razorpayDisplayName: "Kavita Rao — readings",
} as const;
