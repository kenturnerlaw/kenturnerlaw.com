/**
 * Credential caching was removed because Cache API entries are not an
 * appropriate secret store. Keep explicit failures for any stale call sites.
 */
export async function saveOAuthCredentials() {
  throw new Error('Credential caching is disabled. Use Cloudflare Pages secrets.');
}

export async function loadOAuthCredentials() {
  return null;
}
