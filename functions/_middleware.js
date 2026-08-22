const BLOCKED_PATHS = new Set(['/.env', '/.env.prod']);

export async function onRequest(context) {
  const { pathname } = new URL(context.request.url);

  if (BLOCKED_PATHS.has(pathname)) {
    return new Response('Not Found\n', {
      status: 404,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    });
  }

  return context.next();
}
