/**
 * Filled automatically the first time you tap Sign in with GitHub on /publish
 * and approve the app for this private repo.
 */
export const APP_ID = '';
export const INSTALLATION_ID = '';
export const PRIVATE_KEY = '';
export const APP_SLUG = '';
export const CLIENT_ID = '';
export const CLIENT_SECRET = '';

export function isOAuthConfigured() {
  return Boolean(CLIENT_ID && CLIENT_SECRET);
}

export function isGitHubAppConfigured() {
  return Boolean(APP_ID && INSTALLATION_ID && PRIVATE_KEY);
}
