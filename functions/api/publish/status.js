import { json, readCookie, openSession } from '../auth/_shared.js';
import { isGitHubAppConfigured } from '../../github-app-credentials.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const session = await openSession(readCookie(request));
  const writeReady =
    isGitHubAppConfigured() || Boolean(String((env && env.GITHUB_TOKEN) || '').trim());
  return json(200, {
    signedIn: Boolean(session),
    login: session ? session.login : '',
    writeReady,
  });
}
