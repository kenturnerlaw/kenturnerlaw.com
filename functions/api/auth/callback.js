/**
 * Legacy OAuth callback — login is username/password now.
 */
import { siteOrigin } from './_shared.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  return Response.redirect(`${siteOrigin(request, env)}/publish/`, 302);
}
