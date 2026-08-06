/**
 * /api/publish
 * GET lists posts, POST creates/updates, DELETE removes a post.
 */
import { json, readCookie, openSession, oauthCredentials, github, DEFAULT_REPO } from './auth/_shared.js';

const PRACTICE_AREAS = new Set(['criminal-defense', 'family-law', 'traffic', 'general', 'updates']);
const CATEGORIES = new Set([
  'Police encounters','Searches','Arrest and court','DUI','Drug charges','Domestic violence','Traffic',
  'Divorce','Child custody','Child support','Parenting plans','Paternity','Modification','Relocation',
  'Family law','General'
]);
const COUNTIES = new Set(['Collier', 'Lee', 'Hendry', 'Miami-Dade']);

function slugify(title) {
  return String(title || '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
}
function nowISO() { return new Date().toISOString(); }
function decodeContent(value) {
  return decodeURIComponent(escape(atob(String(value || '').replace(/\n/g, ''))));
}
async function authContext(context) {
  const { request, env } = context;
  const { clientSecret, configured } = await oauthCredentials(env);
  if (!configured) return { response: json(503, { error: 'Sign in is not connected yet.', needsSetup: true }) };
  const session = await openSession(clientSecret, readCookie(request));
  if (!session) return { response: json(401, { error: 'Sign in required.' }) };
  return {
    token: session.accessToken,
    repo: env.GITHUB_REPO || DEFAULT_REPO,
    branch: env.GITHUB_BRANCH || 'main'
  };
}
function pathFor(post) {
  if (post.practiceArea === 'updates' || post.type === 'update') return `/updates/${post.slug}/`;
  if (post.practiceArea === 'family-law') return `/florida-family-law-answers/${post.slug}/`;
  if (post.practiceArea === 'traffic') return `/florida-traffic-ticket-answers/${post.slug}/`;
  if (post.practiceArea === 'general') return `/florida-legal-answers/${post.slug}/`;
  return `/florida-criminal-defense-answers/${post.slug}/`;
}

export async function onRequestGet(context) {
  const auth = await authContext(context);
  if (auth.response) return auth.response;
  try {
    const files = await github(auth.token, 'GET', `/repos/${auth.repo}/contents/content/posts?ref=${auth.branch}`);
    const posts = [];
    for (const file of Array.isArray(files) ? files : []) {
      if (!file.name.endsWith('.json')) continue;
      const item = await github(auth.token, 'GET', `/repos/${auth.repo}/contents/${file.path}?ref=${auth.branch}`);
      const post = JSON.parse(decodeContent(item.content));
      post.sha = item.sha;
      post.url = `https://www.kenturnerlaw.com${pathFor(post)}`;
      posts.push(post);
    }
    posts.sort((a, b) => String(b.dateModified || b.datePublished || '').localeCompare(String(a.dateModified || a.datePublished || '')));
    return json(200, { posts });
  } catch (err) {
    return json(502, { error: `Could not load articles: ${err.message}` });
  }
}

export async function onRequestPost(context) {
  const auth = await authContext(context);
  if (auth.response) return auth.response;
  let payload;
  try { payload = await context.request.json(); }
  catch (_) { return json(400, { error: 'Invalid JSON body.' }); }

  const title = String(payload.title || '').trim();
  const body = String(payload.body || '').trim();
  const category = String(payload.category || '').trim();
  const county = String(payload.county || '').trim();
  const practiceArea = String(payload.practiceArea || (category === 'Family law' ? 'family-law' : 'criminal-defense')).trim();
  const originalSlug = String(payload.originalSlug || '').trim();
  const slug = originalSlug || String(payload.slug || '').trim() || slugify(title);
  if (!title || !body) return json(400, { error: 'Headline and article text are required.' });
  if (!PRACTICE_AREAS.has(practiceArea)) return json(400, { error: 'Unknown practice area.' });
  if (category && !CATEGORIES.has(category)) return json(400, { error: 'Unknown category.' });
  if (county && !COUNTIES.has(county)) return json(400, { error: 'Unknown county.' });
  if (!slug) return json(400, { error: 'Could not derive URL.' });

  const contentPath = `content/posts/${slug}.json`;
  let datePublished = nowISO();
  let sha;
  try {
    const existing = await github(auth.token, 'GET', `/repos/${auth.repo}/contents/${contentPath}?ref=${auth.branch}`);
    sha = existing.sha;
    const decoded = JSON.parse(decodeContent(existing.content));
    if (decoded.datePublished) datePublished = decoded.datePublished;
  } catch (err) {
    if (err.status !== 404) return json(502, { error: `GitHub read failed: ${err.message}` });
  }

  const post = {
    type: practiceArea === 'updates' ? 'update' : 'answer',
    practiceArea, title, body, category: category || '', county: county || '', slug,
    datePublished, dateModified: nowISO()
  };
  const encoded = btoa(unescape(encodeURIComponent(`${JSON.stringify(post, null, 2)}\n`)));
  try {
    await github(auth.token, 'PUT', `/repos/${auth.repo}/contents/${contentPath}`, {
      message: `${sha ? 'Edit' : 'Publish'} article: ${title}`,
      content: encoded, branch: auth.branch, ...(sha ? { sha } : {})
    });
  } catch (err) {
    return json(502, { error: `GitHub write failed: ${err.message}` });
  }
  const path = pathFor(post);
  return json(200, { ok: true, slug, path, url: `https://www.kenturnerlaw.com${path}` });
}

export async function onRequestDelete(context) {
  const auth = await authContext(context);
  if (auth.response) return auth.response;
  let payload;
  try { payload = await context.request.json(); }
  catch (_) { return json(400, { error: 'Invalid JSON body.' }); }
  const slug = String(payload.slug || '').trim();
  if (!slug || slugify(slug) !== slug) return json(400, { error: 'Invalid article URL.' });
  const contentPath = `content/posts/${slug}.json`;
  try {
    const existing = await github(auth.token, 'GET', `/repos/${auth.repo}/contents/${contentPath}?ref=${auth.branch}`);
    await github(auth.token, 'DELETE', `/repos/${auth.repo}/contents/${contentPath}`, {
      message: `Delete article: ${slug}`, sha: existing.sha, branch: auth.branch
    });
    return json(200, { ok: true });
  } catch (err) {
    return json(err.status === 404 ? 404 : 502, { error: err.status === 404 ? 'Article not found.' : `Delete failed: ${err.message}` });
  }
}
