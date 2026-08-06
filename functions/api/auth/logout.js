import { json, clearSessionCookie, siteOrigin } from './_shared.js';

export async function onRequestPost() {
  return json(200, { ok: true }, { 'Set-Cookie': clearSessionCookie() });
}

export async function onRequestGet(context) {
  const { request, env } = context;
  return new Response(null, {
    status: 302,
    headers: {
      Location: `${siteOrigin(request, env)}/publish/`,
      'Set-Cookie': clearSessionCookie(),
    },
  });
}
