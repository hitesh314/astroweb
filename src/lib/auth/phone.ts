export function normalizeE164Phone(raw: string): string {
  const s = raw.replace(/[\s-]/g, "");
  if (!s.startsWith("+")) {
    throw new Error(
      'Use international format starting with "+" and country code (e.g. +919876543210).',
    );
  }
  if (s.length < 8 || s.length > 16) {
    throw new Error("That phone number does not look valid.");
  }
  return s;
}
