import { json, usersMatch, sealSession, sessionCookie, USERNAME, siteOrigin } from './_shared.js';

/**
 * GET /api/auth/login
 * Browser visits should go to the publish login page.
 */
export async function onRequestGet(context) {
  const { request, env } = context;
  return Response.redirect(`${siteOrigin(request, env)}/publish/`, 302);
}

/**
 * POST /api/auth/login
 * Body: { username, password }
 */
export async function onRequestPost(context) {
  const { request } = context;
  let payload;
  try {
    payload = await request.json();
  } catch (_) {
    return json(400, { error: 'Invalid request.' });
  }

  if (!usersMatch(payload.username, payload.password)) {
    return json(401, { error: 'Wrong username or password.' });
  }

  const sealed = await sealSession(USERNAME);
  return json(200, { ok: true, login: USERNAME }, { 'Set-Cookie': sessionCookie(sealed) });
}
