import { json, clearSessionCookie } from './_shared.js';

export async function onRequestPost() {
  return json(200, { ok: true }, { 'Set-Cookie': clearSessionCookie() });
}

export async function onRequestGet(context) {
  return new Response(null, {
    status: 302,
    headers: {
      Location: 'https://www.kenturnerlaw.com/publish/',
      'Set-Cookie': clearSessionCookie(),
    },
  });
}
