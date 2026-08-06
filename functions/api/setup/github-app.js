/**
 * GET /api/setup/github-app?code=...
 * Completes GitHub App Manifest conversion, then sends user to Install.
 */

import { json, readCookie, openSession } from '../auth/_shared.js';

const SITE = 'https://www.kenturnerlaw.com';
const REPO = 'kenturnerlaw/kenturnerlaw.com';

function cookie(name, value, maxAge = 3600) {
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

export async function onRequestGet(context) {
  const { request } = context;
  if (!(await openSession(readCookie(request)))) {
    return Response.redirect(`${SITE}/publish/`, 302);
  }

  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  if (!code) {
    return json(400, { error: 'Missing code from GitHub.' });
  }

  const res = await fetch(`https://api.github.com/app-manifests/${code}/conversions`, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'kenturnerlaw-publish',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return json(502, { error: data.message || 'GitHub App conversion failed.' });
  }

  const appId = String(data.id || '');
  const slug = String(data.slug || '');
  const pem = String(data.pem || '');
  if (!appId || !pem || !slug) {
    return json(502, { error: 'GitHub App response incomplete.' });
  }

  const headers = new Headers({
    Location: `https://github.com/apps/${slug}/installations/new?state=ktl`,
  });
  headers.append('Set-Cookie', cookie('ktl_app_id', appId));
  headers.append('Set-Cookie', cookie('ktl_app_slug', slug));
  // Store PEM as base64 chunks (cookie-safe).
  const pemB64 = btoa(unescape(encodeURIComponent(pem)));
  const pemParts = pemB64.match(/.{1,1800}/g) || [pemB64];
  headers.append('Set-Cookie', cookie('ktl_app_pem_n', String(pemParts.length)));
  pemParts.forEach((part, i) => {
    headers.append('Set-Cookie', cookie(`ktl_app_pem_${i}`, part));
  });

  return new Response(null, { status: 302, headers });
}
