/**
 * GET /api/setup/github-app-install?installation_id=...
 * Browser page reads localStorage pending creds and POSTs to finalize.
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
  const installationId = url.searchParams.get('installation_id') || '';

  if (!installationId) {
    return Response.redirect(`${origin}/publish/?error=setup_install`, 302);
  }

  return html(`<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Finishing connect…</title>
</head><body style="font-family:Georgia,serif;background:#050505;color:#fff;padding:24px">
<p id="msg">Finishing connect…</p>
<script>
(async function () {
  var msg = document.getElementById('msg');
  var installationId = ${JSON.stringify(installationId)};
  var raw = null;
  try { raw = localStorage.getItem('ktl_pending_app'); } catch (e) {}
  if (!raw) {
    location.replace(${JSON.stringify(`${origin}/publish/?error=setup_expired`)});
    return;
  }
  var pending;
  try { pending = JSON.parse(raw); } catch (e) {
    location.replace(${JSON.stringify(`${origin}/publish/?error=setup_expired`)});
    return;
  }
  try {
    var res = await fetch('/api/setup/finalize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        installationId: installationId,
        appId: pending.appId,
        slug: pending.slug,
        privateKey: pending.privateKey,
        clientId: pending.clientId,
        clientSecret: pending.clientSecret
      })
    });
    var data = await res.json().catch(function () { return {}; });
    if (!res.ok) {
      location.replace(${JSON.stringify(`${origin}/publish/?error=setup_save&detail=`)} + encodeURIComponent(data.error || res.status));
      return;
    }
    try { localStorage.removeItem('ktl_pending_app'); } catch (e) {}
    location.replace(${JSON.stringify(`${origin}/publish/?connected=1`)});
  } catch (e) {
    msg.textContent = 'Could not finish connect. Go back to /publish and tap Connect again.';
  }
})();
</script>
</body></html>`);
}
