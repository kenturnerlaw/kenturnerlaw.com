import { json, usersMatch, sealSession, sessionCookie, USERNAME } from './_shared.js';

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
