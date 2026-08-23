const BLOCKED_PATHS = new Set(['/.env', '/.env.prod']);

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const { pathname } = url;

  if (url.hostname === 'kenturnerlaw.com') {
    url.hostname = 'www.kenturnerlaw.com';
    return Response.redirect(url.toString(), 301);
  }

  if (pathname === '/index.html' || pathname.endsWith('/index.html')) {
    url.pathname = pathname.slice(0, -'index.html'.length) || '/';
    return Response.redirect(url.toString(), 301);
  }

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
