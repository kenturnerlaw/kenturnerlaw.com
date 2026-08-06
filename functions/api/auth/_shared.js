import { PUBLISH_PASSWORD } from '../../publish-config.js';

const COOKIE = 'kt_session';

export function json(status, body, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...headers,
    },
  });
}

function bytesToHex(bytes) {
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function hexToBytes(hex) {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i += 1) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

async function importKey(secret) {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

export function passwordsMatch(provided, expected) {
  const a = String(provided || '');
  const b = String(expected || '');
  if (!a || !b || a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function sealSession(password) {
  const body = btoa(`ok|${Math.floor(Date.now() / 1000) + 60 * 60 * 12}`);
  const key = await importKey(password);
  const sigBuf = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body));
  return `${body}.${bytesToHex(new Uint8Array(sigBuf))}`;
}

export async function openSession(token) {
  if (!token || !PUBLISH_PASSWORD) return false;
  const [body, sig] = String(token).split('.');
  if (!body || !sig) return false;
  const key = await importKey(PUBLISH_PASSWORD);
  const ok = await crypto.subtle.verify(
    'HMAC',
    key,
    hexToBytes(sig),
    new TextEncoder().encode(body),
  );
  if (!ok) return false;
  try {
    const decoded = atob(body);
    const exp = Number(decoded.split('|')[1] || 0);
    return exp > Math.floor(Date.now() / 1000);
  } catch (_) {
    return false;
  }
}

export function sessionCookie(value) {
  return `${COOKIE}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 60 * 12}`;
}

export function clearSessionCookie() {
  return `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export function readCookie(request) {
  const raw = request.headers.get('Cookie') || '';
  const match = raw.match(/(?:^|;\s*)kt_session=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

export { PUBLISH_PASSWORD, COOKIE };
