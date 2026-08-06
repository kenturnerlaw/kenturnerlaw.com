import { json, clearSessionCookie } from './_shared.js';

export async function onRequestPost() {
  return json(200, { ok: true }, { 'Set-Cookie': clearSessionCookie() });
}
