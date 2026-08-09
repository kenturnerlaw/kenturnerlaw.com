/**
 * Resolve GitHub OAuth client id/secret.
 * Credentials must come from encrypted Cloudflare Pages secrets.
 */
export async function resolveOAuthCredentials(env) {
  const clientId = String((env && env.GITHUB_OAUTH_CLIENT_ID) || '').trim();
  const clientSecret = String((env && env.GITHUB_OAUTH_CLIENT_SECRET) || '').trim();
  return {
    clientId,
    clientSecret,
    configured: Boolean(clientId && clientSecret),
  };
}
