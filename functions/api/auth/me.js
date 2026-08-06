import { json, readCookie, openSession } from './_shared.js';

export async function onRequestGet(context) {
  const { request } = context;
  const signedIn = await openSession(readCookie(request));
  return json(200, { signedIn: Boolean(signedIn) });
}
