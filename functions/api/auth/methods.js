/**
 * GET /api/auth/methods
 * Tells the login page whether SMS and/or password sign-in are available.
 */
function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

export async function onRequestGet(context) {
  const { env } = context;
  const sms = Boolean(
    env.TWILIO_ACCOUNT_SID &&
      env.TWILIO_AUTH_TOKEN &&
      env.TWILIO_VERIFY_SERVICE_SID &&
      env.PUBLISH_PHONE,
  );
  const password = Boolean(env.PUBLISH_PASSWORD);
  return json(200, {
    sms,
    password,
    ready: sms || password,
  });
}
