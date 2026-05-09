/** Default: +91 9358214529 (digits only for wa.me). Override with NEXT_PUBLIC_WHATSAPP_PAY_NUMBER. */
const DEFAULT_WHATSAPP_DIGITS = "919358214529";

function payDigits(): string {
  const d = process.env.NEXT_PUBLIC_WHATSAPP_PAY_NUMBER?.replace(/\D/g, "") ?? "";
  return d.length >= 10 ? d : DEFAULT_WHATSAPP_DIGITS;
}

export function whatsappWaMeHref(message: string): string {
  return `https://wa.me/${payDigits()}?text=${encodeURIComponent(message)}`;
}

const MARRIAGE_READING_MSG = [
  "Hi — I'm interested in the AstroMarriage marriage reading (love vs arranged).",
  "",
  "Please share what's included and how to pay.",
  "Thanks!",
].join("\n");

/** Marriage reading — payment coordinated on WhatsApp (no rupee amounts in the prefilled text). */
export function whatsappMarriageReadingHref(ctx?: {
  email?: string | null;
  name?: string | null;
}): string {
  let msg = MARRIAGE_READING_MSG;
  if (ctx?.name?.trim()) msg += `\n\nName: ${ctx.name.trim()}`;
  if (ctx?.email?.trim()) msg += `\nDashboard email: ${ctx.email.trim()}`;
  return whatsappWaMeHref(msg);
}

export function whatsappPlansInquiryHref(): string {
  return whatsappWaMeHref("Hi — I'm interested in AstroMarriage plans / pricing.");
}

export function whatsappPlanInterestHref(planName: string): string {
  const name = planName.trim() || "AstroMarriage";
  return whatsappWaMeHref(
    `Hi — I'm interested in the "${name}" AstroMarriage plan.\n\nPlease share pricing and how to pay.`,
  );
}
