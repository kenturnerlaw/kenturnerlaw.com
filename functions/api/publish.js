/**
 * POST /api/publish
 * Legacy endpoint. Mobile /publish now opens a GitHub issue instead
 * (no personal token required). Kept so old clients get a clear message.
 */

import { json, readCookie, openSession } from './auth/_shared.js';

export async function onRequestPost(context) {
  const { request } = context;

  if (!(await openSession(readCookie(request)))) {
    return json(401, { error: 'Sign in required.' });
  }

  return json(409, {
    error:
      'Use Post on /publish — it opens GitHub for one Confirm tap. No GitHub token setup.',
  });
}
