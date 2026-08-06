/**
 * Cloudflare Pages Function: POST /api/publish
 *
 * Auth: the iPhone sends a GitHub token (saved on the phone after one paste).
 * No Cloudflare password. No Cloudflare GITHUB_TOKEN required.
 *
 * Body: { title, body, type, category?, county?, token }
 */

const CATEGORIES = new Set([
  'Police encounters',
  'Searches',
  'Arrest and court',
  'DUI',
  'Drug charges',
  'Domestic violence',
  'Traffic',
  'Family law',
  'General',
]);

const COUNTIES = new Set(['Collier', 'Lee', 'Hendry', 'Miami-Dade']);
const DEFAULT_REPO = 'kenturnerlaw/kenturnerlaw.com';

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

function slugify(title) {
  return String(title || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

async function github(token, method, apiPath, body) {
  const res = await fetch(`https://api.github.com${apiPath}`, {
    method,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'User-Agent': 'kenturnerlaw-publish',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch (_) {
    data = { message: text };
  }
  if (!res.ok) {
    const msg = data.message || `GitHub API ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  return data;
}

async function assertCanPublish(token, repo) {
  if (!token || token.length < 20) {
    const err = new Error('Sign in with your GitHub access token.');
    err.status = 401;
    throw err;
  }
  try {
    const repoInfo = await github(token, 'GET', `/repos/${repo}`);
    if (!repoInfo.permissions || !repoInfo.permissions.push) {
      const err = new Error('That token cannot publish to this site.');
      err.status = 403;
      throw err;
    }
  } catch (err) {
    if (err.status === 401 || err.status === 403) throw err;
    if (err.status === 404) {
      const e = new Error('That token cannot access this repository.');
      e.status = 403;
      throw e;
    }
    throw err;
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const repo = env.GITHUB_REPO || DEFAULT_REPO;
  const branch = env.GITHUB_BRANCH || 'main';

  let payload;
  try {
    payload = await request.json();
  } catch (_) {
    return json(400, { error: 'Invalid JSON body.' });
  }

  const token = String(payload.token || '').trim();
  try {
    await assertCanPublish(token, repo);
  } catch (err) {
    return json(err.status || 401, { error: err.message });
  }

  const title = String(payload.title || '').trim();
  const body = String(payload.body || '').trim();
  const type = String(payload.type || 'answer').trim().toLowerCase();
  const category = String(payload.category || '').trim();
  const county = String(payload.county || '').trim();
  let slug = String(payload.slug || '').trim() || slugify(title);

  if (!title || !body) return json(400, { error: 'Title and text are required.' });
  if (!['answer', 'update'].includes(type)) return json(400, { error: 'Type must be answer or update.' });
  if (category && !CATEGORIES.has(category)) return json(400, { error: 'Unknown category.' });
  if (county && !COUNTIES.has(county)) return json(400, { error: 'Unknown county.' });
  if (!slug) return json(400, { error: 'Could not derive slug.' });

  const contentPath = `content/posts/${slug}.json`;
  const now = todayISO();

  let datePublished = now;
  let sha;
  try {
    const existing = await github(token, 'GET', `/repos/${repo}/contents/${contentPath}?ref=${branch}`);
    sha = existing.sha;
    if (existing.content) {
      const decoded = JSON.parse(atob(existing.content.replace(/\n/g, '')));
      if (decoded.datePublished) datePublished = decoded.datePublished;
    }
  } catch (err) {
    if (err.status !== 404) {
      return json(502, { error: `GitHub read failed: ${err.message}` });
    }
  }

  const post = {
    type,
    title,
    body,
    category: category || '',
    county: county || '',
    slug,
    datePublished,
    dateModified: now,
  };

  const encoded = btoa(unescape(encodeURIComponent(`${JSON.stringify(post, null, 2)}\n`)));
  try {
    await github(token, 'PUT', `/repos/${repo}/contents/${contentPath}`, {
      message: `Publish ${type}: ${title}`,
      content: encoded,
      branch,
      ...(sha ? { sha } : {}),
    });
  } catch (err) {
    return json(502, { error: `GitHub write failed: ${err.message}` });
  }

  try {
    await github(token, 'POST', `/repos/${repo}/actions/workflows/publish-content.yml/dispatches`, {
      ref: branch,
      inputs: { reason: `publish:${slug}` },
    });
  } catch (_) {
    /* content push may already trigger the workflow */
  }

  const path =
    type === 'update'
      ? `/updates/${slug}/`
      : `/florida-criminal-defense-answers/${slug}/`;

  return json(200, {
    ok: true,
    slug,
    path,
    url: `https://www.kenturnerlaw.com${path}`,
    message: 'Saved. The page will go live after GitHub Action + Cloudflare deploy.',
  });
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
