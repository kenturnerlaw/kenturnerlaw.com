/**
 * Filled automatically when you tap "Enable publishing" once on /publish
 * and approve the GitHub App for this private repo.
 * Do not paste tokens into Cursor chat.
 */
export const APP_ID = '';
export const INSTALLATION_ID = '';
export const PRIVATE_KEY = '';
export const APP_SLUG = '';

export function isGitHubAppConfigured() {
  return Boolean(APP_ID && INSTALLATION_ID && PRIVATE_KEY);
}
