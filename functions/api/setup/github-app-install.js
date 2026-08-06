/**
 * GET /api/setup/github-app-install?installation_id=...
 * Record installation; OAuth keys were already saved during app creation.
 * Best-effort: also write credentials into the private repo.
 */

import { siteOrigin } from '../auth/_shared.js';
import { loadOAuthCredentials, saveOAuthCredentials } from '../../lib/oauth-store.js';
import { installationAccessToken, githubFetch } from '../../lib/github-app-auth.js';

const REPO = 'kenturnerlaw/kenturnerlaw.com';
const BRANCH = 'main';
const CRED_PATH = 'functions/github-app-credentials.js';

function credentialsFile(creds) {
  return `/**
 * Auto-written on Connect for /publish.
 * Private repo only.
 */
export const APP_ID = ${JSON.stringify(String(creds.appId))};
export const INSTALLATION_ID = ${JSON.stringify(String(creds.installationId))};
export const APP_SLUG = ${JSON.stringify(String(creds.slug || ''))};
export const PRIVATE_KEY = ${JSON.stringify(String(creds.privateKey))};
export const CLIENT_ID = ${JSON.stringify(String(creds.clientId))};
export const CLIENT_SECRET = ${JSON.stringify(String(creds.clientSecret))};

export function isOAuthConfigured() {
  return Boolean(CLIENT_ID && CLIENT_SECRET);
}

export function isGitHubAppConfigured() {
  return Boolean(APP_ID && INSTALLATION_ID && PRIVATE_KEY);
}
`;
}

async function bestEffortGitWrite(creds) {
  if (!creds.appId || !creds.privateKey || !creds.installationId) return;
  const token = await installationAccessToken({
    appId: creds.appId,
    privateKey: creds.privateKey,
    installationId: creds.installationId,
  });
  const content = credentialsFile(creds);
  const encoded = btoa(unescape(encodeURIComponent(content)));
  let sha;
  try {
    const existing = await githubFetch(
      token,
      'GET',
      `/repos/${REPO}/contents/${CRED_PATH}?ref=${BRANCH}`,
    );
    sha = existing.sha;
  } catch (err) {
    if (err.status !== 404) throw err;
  }
  await githubFetch(token, 'PUT', `/repos/${REPO}/contents/${CRED_PATH}`, {
    message: 'Connect Sign in with GitHub for /publish',
    content: encoded,
    branch: BRANCH,
    ...(sha ? { sha } : {}),
  });
}

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

  // Preferred path: credentials already on the server from app creation.
  let cached = await loadOAuthCredentials();
  if (cached && cached.clientId && cached.clientSecret) {
    const merged = { ...cached, installationId };
    try {
      await saveOAuthCredentials(merged);
    } catch (_) {
      /* still try to finish */
    }
    try {
      await bestEffortGitWrite(merged);
    } catch (_) {
      /* OAuth can work from cache without the git file */
    }
    return Response.redirect(`${origin}/publish/?connected=1`, 302);
  }

  // Fallback: localStorage → finalize (older Safari / different edge).
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
    msg.textContent = 'Could not finish connect. Go back to /publish and tap Sign in with GitHub again.';
  }
})();
</script>
</body></html>`);
}
