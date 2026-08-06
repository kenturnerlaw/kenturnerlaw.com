import {
  CLIENT_ID,
  CLIENT_SECRET,
} from '../github-app-credentials.js';
import { loadOAuthCredentials } from './oauth-store.js';

/**
 * Resolve GitHub OAuth client id/secret.
 * Prefer Cloudflare cache (written on Connect), then env, then repo file.
 */
export async function resolveOAuthCredentials(env) {
  const cached = await loadOAuthCredentials();
  const clientId = String(
    (env && env.GITHUB_OAUTH_CLIENT_ID) ||
      (cached && cached.clientId) ||
      CLIENT_ID ||
      '',
  ).trim();
  const clientSecret = String(
    (env && env.GITHUB_OAUTH_CLIENT_SECRET) ||
      (cached && cached.clientSecret) ||
      CLIENT_SECRET ||
      '',
  ).trim();
  return {
    clientId,
    clientSecret,
    configured: Boolean(clientId && clientSecret),
    cached,
  };
}
