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

export function normalizePhone(input) {
  const digits = String(input || '').replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  if (String(input || '').trim().startsWith('+') && digits.length >= 10) {
    return `+${digits}`;
  }
  return '';
}

export function phonesMatch(a, b) {
  const na = normalizePhone(a);
  const nb = normalizePhone(b);
  return Boolean(na && nb && na === nb);
}

export function smsConfigured(env) {
  return Boolean(
    env.TWILIO_ACCOUNT_SID &&
      env.TWILIO_AUTH_TOKEN &&
      env.TWILIO_VERIFY_SERVICE_SID &&
      env.PUBLISH_PHONE,
  );
}

export function twilioAuthHeader(env) {
  const token = btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`);
  return `Basic ${token}`;
}

function bytesToHex(bytes) {
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function hmacHex(secret, message) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return bytesToHex(new Uint8Array(sig));
}

function sessionSecret(env) {
  return env.PUBLISH_SESSION_SECRET || env.PUBLISH_PASSWORD || env.GITHUB_TOKEN || '';
}

export async function createSessionToken(env, phone) {
  const secret = sessionSecret(env);
  if (!secret) throw new Error('No session secret configured');
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 12; // 12 hours
  const payload = `${normalizePhone(phone)}|${exp}`;
  const sig = await hmacHex(secret, payload);
  return `${payload}|${sig}`;
}

export async function verifySessionToken(env, token) {
  const secret = sessionSecret(env);
  if (!secret || !token) return false;
  const parts = String(token).split('|');
  if (parts.length !== 3) return false;
  const [phone, expStr, sig] = parts;
  const exp = Number(expStr);
  if (!phone || !exp || Number.isNaN(exp) || exp < Math.floor(Date.now() / 1000)) {
    return false;
  }
  const expected = await hmacHex(secret, `${phone}|${exp}`);
  if (expected.length !== sig.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i += 1) {
    mismatch |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  }
  if (mismatch !== 0) return false;
  return phonesMatch(phone, env.PUBLISH_PHONE) || !env.PUBLISH_PHONE;
}

export function sessionCookie(token) {
  return `kt_pub_session=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${60 * 60 * 12}`;
}

export function clearSessionCookie() {
  return 'kt_pub_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0';
}

export function readSessionCookie(request) {
  const raw = request.headers.get('Cookie') || '';
  const match = raw.match(/(?:^|;\s*)kt_pub_session=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
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
