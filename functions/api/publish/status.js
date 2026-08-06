import { json, readCookie, openSession } from '../auth/_shared.js';
import { isGitHubAppConfigured } from '../../github-app-credentials.js';
import { GITHUB_TOKEN as CONFIG_TOKEN } from '../../publish-config.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const signedIn = await openSession(readCookie(request));
  const writeReady = isGitHubAppConfigured() || Boolean(String(env.GITHUB_TOKEN || CONFIG_TOKEN || '').trim());
  return json(200, { signedIn, writeReady });
}
