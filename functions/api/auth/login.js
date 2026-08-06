import {
  json,
  passwordsMatch,
  sealSession,
  sessionCookie,
  PUBLISH_PASSWORD,
} from './_shared.js';

/**
 * POST /api/auth/login
 * Body: { password }
 */
export async function onRequestPost(context) {
  const { request } = context;
  let payload;
  try {
    payload = await request.json();
  } catch (_) {
    return json(400, { error: 'Invalid request.' });
  }

  if (!passwordsMatch(payload.password, PUBLISH_PASSWORD)) {
    return json(401, { error: 'Wrong password.' });
  }

  const sealed = await sealSession(PUBLISH_PASSWORD);
  return json(200, { ok: true }, { 'Set-Cookie': sessionCookie(sealed) });
}
