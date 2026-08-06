/**
 * Durable-enough OAuth credential store for Cloudflare Pages Functions.
 * Saved during Connect so Sign in with GitHub does not depend on a git write.
 */

const CRED_URL = 'https://www.kenturnerlaw.com/__internal/ktl-publish-oauth';

export async function saveOAuthCredentials(creds) {
  const body = JSON.stringify({
    appId: String(creds.appId || ''),
    installationId: String(creds.installationId || ''),
    slug: String(creds.slug || ''),
    privateKey: String(creds.privateKey || ''),
    clientId: String(creds.clientId || ''),
    clientSecret: String(creds.clientSecret || ''),
    savedAt: Date.now(),
  });
  await caches.default.put(
    CRED_URL,
    new Response(body, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=31536000',
      },
    }),
  );
}

export async function loadOAuthCredentials() {
  const res = await caches.default.match(CRED_URL);
  if (!res) return null;
  try {
    const data = await res.json();
    if (!data || !data.clientId || !data.clientSecret) return null;
    return data;
  } catch (_) {
    return null;
  }
}
