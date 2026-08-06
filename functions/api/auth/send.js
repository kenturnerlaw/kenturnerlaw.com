import {
  json,
  normalizePhone,
  phonesMatch,
  smsConfigured,
  twilioAuthHeader,
} from './_shared.js';

/**
 * POST /api/auth/send
 * Body: { phone }
 * Sends an SMS verification code to the allowed publish phone number.
 */
export async function onRequestPost(context) {
  const { request, env } = context;

  if (!smsConfigured(env)) {
    return json(503, {
      error:
        'Text-message login is not set up yet. Use password sign-in, or add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID, and PUBLISH_PHONE in Cloudflare.',
    });
  }

  let payload;
  try {
    payload = await request.json();
  } catch (_) {
    return json(400, { error: 'Invalid JSON body.' });
  }

  const phone = normalizePhone(payload.phone);
  if (!phone) return json(400, { error: 'Enter a valid phone number.' });
  if (!phonesMatch(phone, env.PUBLISH_PHONE)) {
    // Same message either way — do not reveal whether the number is registered.
    return json(200, { ok: true, message: 'If that number is authorized, a code was sent.' });
  }

  const body = new URLSearchParams({
    To: phone,
    Channel: 'sms',
  });

  const res = await fetch(
    `https://verify.twilio.com/v2/Services/${env.TWILIO_VERIFY_SERVICE_SID}/Verifications`,
    {
      method: 'POST',
      headers: {
        Authorization: twilioAuthHeader(env),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    },
  );

  if (!res.ok) {
    const text = await res.text();
    return json(502, {
      error: `Could not send text code. Check Twilio Verify setup. (${res.status})`,
      detail: text.slice(0, 200),
    });
  }

  return json(200, { ok: true, message: 'Code sent. Check your texts.' });
}
