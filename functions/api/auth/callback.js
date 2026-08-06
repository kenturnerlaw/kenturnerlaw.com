import {
  oauthConfigured,
  siteOrigin,
  readCookie,
  sealSession,
  sessionCookie,
  assertRepoPush,
  github,
} from './_shared.js';

/**
 * GET /api/auth/callback
 * Finishes GitHub OAuth and sets the session cookie.
 */
export async function onRequestGet(context) {
  const { request, env } = context;
  const origin = siteOrigin(request, env);
  const url = new URL(request.url);

  if (!oauthConfigured(env)) {
    return Response.redirect(`${origin}/publish/?error=not_configured`, 302);
  }

  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const expected = readCookie(request, 'kt_oauth_state');

  if (!code || !state || !expected || state !== expected) {
    return Response.redirect(`${origin}/publish/?error=state`, 302);
  }

  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: env.GITHUB_OAUTH_CLIENT_ID,
      client_secret: env.GITHUB_OAUTH_CLIENT_SECRET,
      code,
      redirect_uri: `${origin}/api/auth/callback`,
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    return Response.redirect(`${origin}/publish/?error=token`, 302);
  }

  try {
    await assertRepoPush(tokenData.access_token, env);
    const user = await github(tokenData.access_token, 'GET', '/user');
    const sealed = await sealSession(env, {
      accessToken: tokenData.access_token,
      login: user.login || '',
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 12,
    });

    return new Response(null, {
      status: 302,
      headers: {
        Location: `${origin}/publish/`,
        'Set-Cookie': [
          sessionCookie(sealed),
          'kt_oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
        ].join(', '),
      },
    });
  } catch (_) {
    return Response.redirect(`${origin}/publish/?error=forbidden`, 302);
  }
}
