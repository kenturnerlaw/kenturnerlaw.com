import {
  json,
  normalizePhone,
  phonesMatch,
  smsConfigured,
  twilioAuthHeader,
  createSessionToken,
  sessionCookie,
} from './_shared.js';

/**
 * POST /api/auth/verify
 * Body: { phone, code }
 * Verifies SMS code and sets an HttpOnly session cookie.
 */
export async function onRequestPost(context) {
  const { request, env } = context;

  if (!smsConfigured(env)) {
    return json(503, {
      error: 'Text-message login is not set up yet. Use password sign-in.',
    });
  }

  let payload;
  try {
    payload = await request.json();
  } catch (_) {
    return json(400, { error: 'Invalid JSON body.' });
  }

  const phone = normalizePhone(payload.phone);
  const code = String(payload.code || '').replace(/\s/g, '');
  if (!phone || !code) return json(400, { error: 'Phone and code are required.' });
  if (!phonesMatch(phone, env.PUBLISH_PHONE)) {
    return json(401, { error: 'Invalid code.' });
  }

  const body = new URLSearchParams({
    To: phone,
    Code: code,
  });

  const res = await fetch(
    `https://verify.twilio.com/v2/Services/${env.TWILIO_VERIFY_SERVICE_SID}/VerificationCheck`,
    {
      method: 'POST',
      headers: {
        Authorization: twilioAuthHeader(env),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    },
  );

  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.status !== 'approved') {
    return json(401, { error: 'Invalid or expired code.' });
  }

  const token = await createSessionToken(env, phone);
  return json(
    200,
    { ok: true, message: 'Signed in.' },
    { 'Set-Cookie': sessionCookie(token) },
  );
}
