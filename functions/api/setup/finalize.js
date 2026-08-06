/**
 * POST /api/setup/finalize
 * Body: pending GitHub App creds + installationId → write credentials file.
 */

import { installationAccessToken, githubFetch } from '../../lib/github-app-auth.js';
import { json } from '../auth/_shared.js';

const REPO = 'kenturnerlaw/kenturnerlaw.com';
const BRANCH = 'main';
const CRED_PATH = 'functions/github-app-credentials.js';

function credentialsFile({
  appId,
  installationId,
  privateKey,
  slug,
  clientId,
  clientSecret,
}) {
  return `/**
 * Auto-written on first Connect for /publish.
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

export async function onRequestPost(context) {
  const { request } = context;
  let payload;
  try {
    payload = await request.json();
  } catch (_) {
    return json(400, { error: 'Invalid request.' });
  }

  const appId = String(payload.appId || '').trim();
  const installationId = String(payload.installationId || '').trim();
  const privateKey = String(payload.privateKey || '').trim();
  const slug = String(payload.slug || '').trim();
  const clientId = String(payload.clientId || '').trim();
  const clientSecret = String(payload.clientSecret || '').trim();

  if (!appId || !installationId || !privateKey || !clientId || !clientSecret) {
    return json(400, { error: 'Missing connect data. Tap Connect again.' });
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
  } catch (err) {
    return json(502, { error: err.message || 'Could not save connect credentials.' });
  }

  return json(200, { ok: true });
}
