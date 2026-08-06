import { oauthCredentials, siteOrigin } from './_shared.js';

/**
 * GET /api/auth/login
 * Normal Sign in with GitHub (OAuth).
 */
export async function onRequestGet(context) {
  const { request, env } = context;
  const { clientId, configured } = oauthCredentials(env);
  const origin = siteOrigin(request, env);

  if (!configured || !clientId) {
    return Response.redirect(`${origin}/publish/?setup=1`, 302);
  }

  const state = crypto.randomUUID();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${origin}/api/auth/callback`,
    state,
  });

  return new Response(null, {
    status: 302,
    headers: {
      Location: `https://github.com/login/oauth/authorize?${params}`,
      'Set-Cookie': `kt_oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
    },
  });
}
