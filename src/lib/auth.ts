export const AUTH_COOKIE = "wpf_auth";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // 1 year

function toHex(buf: ArrayBuffer) {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmac(secret: string, message: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return toHex(sig);
}

/** Builds a signed cookie value: "<expiryEpochSeconds>.<hmacHex>" */
export async function createAuthToken(secret: string): Promise<string> {
  const expiry = Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS;
  const payload = String(expiry);
  const sig = await hmac(secret, payload);
  return `${payload}.${sig}`;
}

export async function verifyAuthToken(token: string | undefined, secret: string): Promise<boolean> {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expiry = Number(payload);
  if (!Number.isFinite(expiry) || expiry < Math.floor(Date.now() / 1000)) return false;
  const expected = await hmac(secret, payload);
  return expected === sig;
}

export const AUTH_COOKIE_MAX_AGE = MAX_AGE_SECONDS;
