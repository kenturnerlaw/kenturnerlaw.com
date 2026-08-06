import { json, readCookie, openSession, oauthCredentials } from '../auth/_shared.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const { clientSecret, configured } = oauthCredentials(env);
  const session = configured ? await openSession(clientSecret, readCookie(request)) : null;
  return json(200, {
    signedIn: Boolean(session),
    login: session ? session.login : '',
    oauthConfigured: configured,
  });
}
