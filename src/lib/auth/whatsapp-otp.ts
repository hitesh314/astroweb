import { createHash, randomBytes, randomInt } from "node:crypto";

export function newOtpSalt(): string {
  return randomBytes(16).toString("base64url");
}

export function hashOtpCode(salt: string, code: string): string {
  return createHash("sha256").update(salt).update("|").update(code).digest("hex");
}

export function randomSixDigitOtp(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export function randomTempPassword(): string {
  return randomBytes(32).toString("base64url");
}
