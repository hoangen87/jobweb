// Portable session-token helpers built on the standard Web Crypto API
// (globalThis.crypto), so this module works identically in the Node.js
// runtime (API routes, server components) AND the Edge runtime
// (middleware) without relying on Node's "crypto" module or "Buffer".

const SESSION_COOKIE = "jhonsin_admin_session";
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const encoder = new TextEncoder();

function getSecret() {
  return process.env.SESSION_SECRET || "fallback-secret";
}

function base64UrlEncode(str: string) {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(str: string) {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(str.length / 4) * 4, "=");
  return atob(padded);
}

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function getKey() {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

async function sign(payload: string) {
  const key = await getKey();
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return toHex(sig);
}

export async function createSessionToken(username: string) {
  const payload = `${username}.${Date.now()}`;
  const sig = await sign(payload);
  return base64UrlEncode(`${payload}.${sig}`);
}

export async function verifySessionToken(
  token: string | undefined | null
): Promise<string | null> {
  if (!token) return null;
  try {
    const decoded = base64UrlDecode(token);
    const parts = decoded.split(".");
    if (parts.length !== 3) return null;
    const [username, ts, sig] = parts;
    const expected = await sign(`${username}.${ts}`);
    if (expected !== sig) return null;
    const age = Date.now() - Number(ts);
    if (!Number.isFinite(age) || age > SEVEN_DAYS_MS) return null;
    return username;
  } catch {
    return null;
  }
}

export function getSessionCookieName() {
  return SESSION_COOKIE;
}
