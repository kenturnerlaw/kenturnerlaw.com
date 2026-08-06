import { json, oauthConfigured, readCookie, openSession } from './_shared.js';

/**
 * GET /api/auth/me
 */
export async function onRequestGet(context) {
  const { request, env } = context;

  if (!oauthConfigured(env)) {
    return json(200, { signedIn: false, configured: false });
  }

  const session = await openSession(env, readCookie(request));
  if (!session) return json(200, { signedIn: false, configured: true });

  return json(200, {
    signedIn: true,
    configured: true,
    login: session.login || '',
  });
}
