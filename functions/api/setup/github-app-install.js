/**
 * GET /api/setup/github-app-install?installation_id=...
 * After Install, persist App credentials into the private repo and finish.
 */

import { json, readCookie, openSession } from '../auth/_shared.js';
import { installationAccessToken, githubFetch } from '../../lib/github-app-auth.js';

const SITE = 'https://www.kenturnerlaw.com';
const REPO = 'kenturnerlaw/kenturnerlaw.com';
const BRANCH = 'main';
const CRED_PATH = 'functions/github-app-credentials.js';

function readAllCookies(request) {
  const raw = request.headers.get('Cookie') || '';
  const out = {};
  raw.split(/;\s*/).forEach((part) => {
    const i = part.indexOf('=');
    if (i === -1) return;
    out[part.slice(0, i)] = decodeURIComponent(part.slice(i + 1));
  });
  return out;
}

function clearCookie(name) {
  return `${name}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

function credentialsFile({ appId, installationId, privateKey, slug }) {
  return `/**
 * Auto-written by /publish Enable publishing (GitHub App).
 * Private repo only.
 */
export const APP_ID = ${JSON.stringify(String(appId))};
export const INSTALLATION_ID = ${JSON.stringify(String(installationId))};
export const APP_SLUG = ${JSON.stringify(String(slug || ''))};
export const PRIVATE_KEY = ${JSON.stringify(String(privateKey))};

export function isGitHubAppConfigured() {
  return Boolean(APP_ID && INSTALLATION_ID && PRIVATE_KEY);
}
`;
}

export async function onRequestGet(context) {
  const { request } = context;
  const headersOut = new Headers();

  if (!(await openSession(readCookie(request)))) {
    return Response.redirect(`${SITE}/publish/`, 302);
  }

  const url = new URL(request.url);
  const installationId = url.searchParams.get('installation_id');
  if (!installationId) {
    return json(400, { error: 'Missing installation_id.' });
  }

  const cookies = readAllCookies(request);
  const appId = cookies.ktl_app_id || '';
  const slug = cookies.ktl_app_slug || '';
  const n = Number(cookies.ktl_app_pem_n || '0');
  let privateKey = '';
  if (n > 0) {
    let pemB64 = '';
    for (let i = 0; i < n; i += 1) pemB64 += cookies[`ktl_app_pem_${i}`] || '';
    try {
      privateKey = decodeURIComponent(escape(atob(pemB64)));
    } catch (_) {
      privateKey = '';
    }
  }

  // Clear setup cookies either way
  ['ktl_app_id', 'ktl_app_slug', 'ktl_app_pem_n'].forEach((name) => {
    headersOut.append('Set-Cookie', clearCookie(name));
  });
  for (let i = 0; i < Math.max(n, 8); i += 1) {
    headersOut.append('Set-Cookie', clearCookie(`ktl_app_pem_${i}`));
  }

  if (!appId || !privateKey) {
    headersOut.set('Content-Type', 'application/json; charset=utf-8');
    return new Response(JSON.stringify({ error: 'Setup expired. Tap Enable publishing again.' }), {
      status: 400,
      headers: headersOut,
    });
  }

  try {
    const token = await installationAccessToken({
      appId,
      privateKey,
      installationId,
    });

    const content = credentialsFile({
      appId,
      installationId,
      privateKey,
      slug,
    });
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
      message: 'Enable phone publishing (GitHub App credentials)',
      content: encoded,
      branch: BRANCH,
      ...(sha ? { sha } : {}),
    });
  } catch (err) {
    headersOut.set('Content-Type', 'application/json; charset=utf-8');
    return new Response(JSON.stringify({ error: err.message || 'Failed to save GitHub App credentials.' }), {
      status: 502,
      headers: headersOut,
    });
  }

  headersOut.set('Location', `${SITE}/publish/?enabled=1`);
  return new Response(null, { status: 302, headers: headersOut });
}
