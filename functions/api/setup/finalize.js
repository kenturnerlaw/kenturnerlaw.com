import { json } from '../auth/_shared.js';

/**
 * Legacy credential-ingestion endpoint. Permanently disabled so secrets can
 * never be accepted from a browser or committed to GitHub again.
 */
export async function onRequestPost() {
  return json(410, {
    error: 'Credential setup is disabled. Configure encrypted Cloudflare Pages secrets.',
  });
}
