import { oauthConfigured, siteOrigin } from './_shared.js';

/**
 * GET /api/auth/login
 * Starts normal GitHub OAuth sign-in.
 */
export async function onRequestGet(context) {
  const { request, env } = context;

  if (!oauthConfigured(env)) {
    return new Response(
      'Sign-in is not configured yet. Add GITHUB_OAUTH_CLIENT_ID and GITHUB_OAUTH_CLIENT_SECRET in Cloudflare Pages environment variables.',
      { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
    );
  }

  const origin = siteOrigin(request, env);
  const state = crypto.randomUUID();
  const params = new URLSearchParams({
    client_id: env.GITHUB_OAUTH_CLIENT_ID,
    redirect_uri: `${origin}/api/auth/callback`,
    scope: 'repo',
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
