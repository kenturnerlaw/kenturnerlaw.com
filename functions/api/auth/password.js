/**
 * POST /api/auth/password
 * Change password from the publish page (requires sign-in + write access).
 */

import {
  json,
  readCookie,
  openSession,
  passwordsMatch,
  PASSWORD,
  USERNAME,
  SESSION_SECRET,
} from './_shared.js';
import {
  APP_ID,
  INSTALLATION_ID,
  PRIVATE_KEY,
  isGitHubAppConfigured,
} from '../../github-app-credentials.js';
import { installationAccessToken, githubFetch } from '../../lib/github-app-auth.js';

const REPO = 'kenturnerlaw/kenturnerlaw.com';
const BRANCH = 'main';
const USERS_PATH = 'functions/publish-users.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  const session = await openSession(readCookie(request));
  if (!session) return json(401, { error: 'Sign in required.' });

  let payload;
  try {
    payload = await request.json();
  } catch (_) {
    return json(400, { error: 'Invalid request.' });
  }

  const currentPassword = String(payload.currentPassword || '');
  const newPassword = String(payload.newPassword || '');
  if (!passwordsMatch(currentPassword, PASSWORD)) {
    return json(401, { error: 'Current password is wrong.' });
  }
  if (newPassword.length < 8) {
    return json(400, { error: 'New password must be at least 8 characters.' });
  }

  const token = String((env && env.GITHUB_TOKEN) || '').trim();
  let writeToken = token;
  if (!writeToken && isGitHubAppConfigured()) {
    try {
      writeToken = await installationAccessToken({
        appId: APP_ID,
        privateKey: PRIVATE_KEY,
        installationId: INSTALLATION_ID,
      });
    } catch (err) {
      return json(503, { error: `Cannot save password yet: ${err.message}` });
    }
  }
  if (!writeToken) {
    return json(503, {
      error: 'Allow posting once first, then you can change the password here.',
      needsEnable: true,
    });
  }

  const content = `/**
 * Publish login (private repo).
 * Change password on /publish after sign-in, or tell Cursor to change it here.
 */
export const USERNAME = ${JSON.stringify(USERNAME)};
export const PASSWORD = ${JSON.stringify(newPassword)};
export const SESSION_SECRET = ${JSON.stringify(SESSION_SECRET)};
`;

  try {
    const encoded = btoa(unescape(encodeURIComponent(content)));
    let sha;
    try {
      const existing = await githubFetch(
        writeToken,
        'GET',
        `/repos/${REPO}/contents/${USERS_PATH}?ref=${BRANCH}`,
      );
      sha = existing.sha;
    } catch (err) {
      if (err.status !== 404) throw err;
    }
    await githubFetch(writeToken, 'PUT', `/repos/${REPO}/contents/${USERS_PATH}`, {
      message: 'Update publish login password',
      content: encoded,
      branch: BRANCH,
      ...(sha ? { sha } : {}),
    });
  } catch (err) {
    return json(502, { error: err.message || 'Could not save new password.' });
  }

  return json(200, { ok: true });
}
