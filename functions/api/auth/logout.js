import { clearSessionCookie, siteOrigin } from './_shared.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const origin = siteOrigin(request, env);
  return new Response(null, {
    status: 302,
    headers: {
      Location: `${origin}/publish/`,
      'Set-Cookie': clearSessionCookie(),
    },
  });
}

export async function onRequestPost() {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Set-Cookie': clearSessionCookie(),
      'Cache-Control': 'no-store',
    },
  });
}
