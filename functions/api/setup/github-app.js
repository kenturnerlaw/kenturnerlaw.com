import { siteOrigin } from '../auth/_shared.js';

/**
 * Self-service GitHub App creation is disabled. App credentials must be
 * configured by an administrator as encrypted Cloudflare Pages secrets.
 */
export async function onRequestGet(context) {
  const origin = siteOrigin(context.request, context.env);
  return Response.redirect(`${origin}/publish/?error=admin_configuration_required`, 302);
}
