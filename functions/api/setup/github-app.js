/**
 * GET /api/setup/github-app?code=...
 * Exchange manifest code, stash creds in localStorage (Safari-safe), go to Install.
 */

import { siteOrigin } from '../auth/_shared.js';

function html(body) {
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
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
    return Response.redirect(
      `${origin}/publish/?error=setup_convert&detail=${encodeURIComponent(data.message || res.status)}`,
      302,
    );
  }

  const appId = String(data.id || '');
  const slug = String(data.slug || '');
  const pem = String(data.pem || '');
  const clientId = String(data.client_id || '');
  const clientSecret = String(data.client_secret || '');
  if (!appId || !pem || !slug || !clientId || !clientSecret) {
    return Response.redirect(`${origin}/publish/?error=setup_incomplete`, 302);
  }

  const pending = {
    appId,
    slug,
    privateKey: pem,
    clientId,
    clientSecret,
  };

  // localStorage survives GitHub redirects on iPhone Safari; cookies often do not.
  return html(`<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Connecting…</title>
</head><body style="font-family:Georgia,serif;background:#050505;color:#fff;padding:24px">
<p>Connecting publish… continue on the next GitHub screen.</p>
<script>
try {
  localStorage.setItem('ktl_pending_app', ${JSON.stringify(JSON.stringify(pending))});
} catch (e) {}
location.replace(${JSON.stringify(`https://github.com/apps/${slug}/installations/new`)});
</script>
</body></html>`);
}
