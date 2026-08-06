import {
  CLIENT_ID,
  CLIENT_SECRET,
  isOAuthConfigured,
} from '../../github-app-credentials.js';

const COOKIE = 'kt_session';
const DEFAULT_REPO = 'kenturnerlaw/kenturnerlaw.com';

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

export function siteOrigin(request, env) {
  return (env && env.SITE_ORIGIN) || 'https://www.kenturnerlaw.com';
}

export function oauthCredentials(env) {
  const clientId = String((env && env.GITHUB_OAUTH_CLIENT_ID) || CLIENT_ID || '').trim();
  const clientSecret = String((env && env.GITHUB_OAUTH_CLIENT_SECRET) || CLIENT_SECRET || '').trim();
  return {
    clientId,
    clientSecret,
    configured: Boolean(clientId && clientSecret),
  };
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

export async function sealSession(secret, payload) {
  const body = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  const key = await importKey(secret);
  const sigBuf = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body));
  return `${body}.${bytesToHex(new Uint8Array(sigBuf))}`;
}

export async function openSession(secret, token) {
  if (!token || !secret) return null;
  const [body, sig] = String(token).split('.');
  if (!body || !sig) return null;
  const key = await importKey(secret);
  const ok = await crypto.subtle.verify(
    'HMAC',
    key,
    hexToBytes(sig),
    new TextEncoder().encode(body),
  );
  if (!ok) return null;
  try {
    const payload = JSON.parse(decodeURIComponent(escape(atob(body))));
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    if (!payload.accessToken) return null;
    return payload;
  } catch (_) {
    return null;
  }
}

export function sessionCookie(value) {
  return `${COOKIE}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 60 * 12}`;
}

export function clearSessionCookie() {
  return `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export function readCookie(request, name = COOKIE) {
  const raw = request.headers.get('Cookie') || '';
  const match = raw.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : '';
}

export async function github(token, method, apiPath, body) {
  const res = await fetch(`https://api.github.com${apiPath}`, {
    method,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'User-Agent': 'kenturnerlaw-publish',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch (_) {
    data = { message: text };
  }
  if (!res.ok) {
    const err = new Error(data.message || `GitHub API ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export async function assertRepoPush(token, env) {
  const repo = (env && env.GITHUB_REPO) || DEFAULT_REPO;
  const info = await github(token, 'GET', `/repos/${repo}`);
  if (!info.permissions || !info.permissions.push) {
    throw new Error('GitHub account cannot publish to this repository.');
  }
  return info;
}

export { COOKIE, DEFAULT_REPO, isOAuthConfigured };
