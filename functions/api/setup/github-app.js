/**
 * GET /api/setup/github-app?code=...
 * Completes GitHub App Manifest conversion, then sends user to Install.
 */

import { siteOrigin } from '../auth/_shared.js';

function cookie(name, value, maxAge = 3600) {
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const origin = siteOrigin(request, env);

  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  if (!code) {
    return Response.redirect(`${origin}/publish/?error=setup_code`, 302);
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
    return Response.redirect(`${origin}/publish/?error=setup_convert`, 302);
  }

  const appId = String(data.id || '');
  const slug = String(data.slug || '');
  const pem = String(data.pem || '');
  const clientId = String(data.client_id || '');
  const clientSecret = String(data.client_secret || '');
  if (!appId || !pem || !slug || !clientId || !clientSecret) {
    return Response.redirect(`${origin}/publish/?error=setup_incomplete`, 302);
  }

  const headers = new Headers({
    Location: `https://github.com/apps/${slug}/installations/new`,
  });
  headers.append('Set-Cookie', cookie('ktl_app_id', appId));
  headers.append('Set-Cookie', cookie('ktl_app_slug', slug));
  headers.append('Set-Cookie', cookie('ktl_client_id', clientId));
  headers.append('Set-Cookie', cookie('ktl_client_secret', clientSecret));

  const pemB64 = btoa(unescape(encodeURIComponent(pem)));
  const pemParts = pemB64.match(/.{1,1800}/g) || [pemB64];
  headers.append('Set-Cookie', cookie('ktl_app_pem_n', String(pemParts.length)));
  pemParts.forEach((part, i) => {
    headers.append('Set-Cookie', cookie(`ktl_app_pem_${i}`, part));
  });

  return new Response(null, { status: 302, headers });
}
