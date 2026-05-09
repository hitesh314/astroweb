import "server-only";

import { createRemoteJWKSet, jwtVerify } from "jose";

const jwks = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

export type GoogleIdClaims = {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
};

export async function verifyGoogleIdToken(
  idToken: string,
  googleClientId: string,
): Promise<GoogleIdClaims> {
  const { payload } = await jwtVerify(idToken, jwks, {
    issuer: ["https://accounts.google.com", "accounts.google.com"],
    audience: googleClientId,
  });

  const sub = typeof payload.sub === "string" ? payload.sub : "";
  const email = typeof payload.email === "string" ? payload.email : "";
  if (!sub || !email) {
    throw new Error("Google ID token missing sub or email");
  }
  if (payload.email_verified !== true) {
    throw new Error("Google email is not verified");
  }

  return {
    sub,
    email,
    name: typeof payload.name === "string" ? payload.name : undefined,
    picture: typeof payload.picture === "string" ? payload.picture : undefined,
  };
}
