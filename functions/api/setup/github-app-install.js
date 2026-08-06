/**
 * GET /api/setup/github-app-install?installation_id=...
 * Saves OAuth + App credentials to the private repo, then starts Sign in.
 */

import { installationAccessToken, githubFetch } from '../../lib/github-app-auth.js';
import { siteOrigin } from '../auth/_shared.js';

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

function credentialsFile({
  appId,
  installationId,
  privateKey,
  slug,
  clientId,
  clientSecret,
}) {
  return `/**
 * Auto-written on first Sign in with GitHub for /publish.
 * Private repo only.
 */
export const APP_ID = ${JSON.stringify(String(appId))};
export const INSTALLATION_ID = ${JSON.stringify(String(installationId))};
export const APP_SLUG = ${JSON.stringify(String(slug || ''))};
export const PRIVATE_KEY = ${JSON.stringify(String(privateKey))};
export const CLIENT_ID = ${JSON.stringify(String(clientId))};
export const CLIENT_SECRET = ${JSON.stringify(String(clientSecret))};

export function isOAuthConfigured() {
  return Boolean(CLIENT_ID && CLIENT_SECRET);
}

export function isGitHubAppConfigured() {
  return Boolean(APP_ID && INSTALLATION_ID && PRIVATE_KEY);
}
`;
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const origin = siteOrigin(request, env);
  const headersOut = new Headers();

  const url = new URL(request.url);
  const installationId = url.searchParams.get('installation_id');
  if (!installationId) {
    return Response.redirect(`${origin}/publish/?error=setup_install`, 302);
  }

  const cookies = readAllCookies(request);
  const appId = cookies.ktl_app_id || '';
  const slug = cookies.ktl_app_slug || '';
  const clientId = cookies.ktl_client_id || '';
  const clientSecret = cookies.ktl_client_secret || '';
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

  [
    'ktl_app_id',
    'ktl_app_slug',
    'ktl_client_id',
    'ktl_client_secret',
    'ktl_app_pem_n',
  ].forEach((name) => headersOut.append('Set-Cookie', clearCookie(name)));
  for (let i = 0; i < Math.max(n, 8); i += 1) {
    headersOut.append('Set-Cookie', clearCookie(`ktl_app_pem_${i}`));
  }

  if (!appId || !privateKey || !clientId || !clientSecret) {
    headersOut.set('Location', `${origin}/publish/?error=setup_expired`);
    return new Response(null, { status: 302, headers: headersOut });
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
      clientId,
      clientSecret,
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
      message: 'Connect Sign in with GitHub for /publish',
      content: encoded,
      branch: BRANCH,
      ...(sha ? { sha } : {}),
    });
  } catch (_) {
    headersOut.set('Location', `${origin}/publish/?error=setup_save`);
    return new Response(null, { status: 302, headers: headersOut });
  }

  // After Cloudflare deploys credentials, Sign in with GitHub works.
  // Send user to login now; if deploy is still propagating they can tap again.
  headersOut.set('Location', `${origin}/api/auth/login`);
  return new Response(null, { status: 302, headers: headersOut });
}
