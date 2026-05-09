/**
 * Search themes: high-intent phrases for metadata keywords and ad “search themes”.
 * Keep each entry a short query cluster (not full sentences).
 */
export const SEARCH_THEMES = [
  "love marriage astrology",
  "arranged marriage horoscope",
  "love vs arranged marriage astrology",
  "vedic astrology marriage reading",
  "jyotish marriage counseling",
  "kundli marriage compatibility",
  "marriage timing vedic chart",
  "birth time accuracy marriage reading",
  "private astrologer consultation online",
  "indian astrologer diaspora",
  "marriage partnering astrology",
  "plain English astrology reading",
  "family marriage pressure astrology",
  "written marriage pathway report astrology",
  "online astrology chat consultation",
] as const;

export const searchThemesKeywords: string[] = [...SEARCH_THEMES];
