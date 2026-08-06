/**
 * POST /api/publish
 * Requires login session cookie from /api/auth/login.
 */

import { GITHUB_TOKEN as CONFIG_TOKEN } from '../publish-config.js';
import { json, readCookie, openSession } from './auth/_shared.js';

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
    const err = new Error(data.message || `GitHub API ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!(await openSession(readCookie(request)))) {
    return json(401, { error: 'Sign in required.' });
  }

  const token = String(env.GITHUB_TOKEN || CONFIG_TOKEN || '').trim();
  if (!token) {
    return json(503, {
      error:
        'Publish is locked until GITHUB_TOKEN is set once in Cloudflare Pages (Production env). Chat cannot receive tokens.',
    });
  }

  let payload;
  try {
    payload = await request.json();
  } catch (_) {
    return json(400, { error: 'Invalid JSON body.' });
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

  const repo = env.GITHUB_REPO || DEFAULT_REPO;
  const branch = env.GITHUB_BRANCH || 'main';
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
    /* push may already trigger workflow */
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
  });
}
