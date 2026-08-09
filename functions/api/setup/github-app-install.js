import { siteOrigin } from '../auth/_shared.js';

/**
 * Legacy installation callback retained only to return users safely to the
 * publisher. It never accepts, stores, or writes credentials.
 */
export async function onRequestGet(context) {
  const origin = siteOrigin(context.request, context.env);
  return Response.redirect(`${origin}/publish/?error=admin_configuration_required`, 302);
}
