'use strict';

/**
 * Turn a GitHub issue body (from /publish) into content/posts/{slug}.json.
 * Invoked by .github/workflows/publish-from-issue.yml
 * Uses the Actions GITHUB_TOKEN — no personal token required.
 */

const fs = require('fs');
const path = require('path');
const {
  ROOT,
  CONTENT_DIR,
  CATEGORIES,
  COUNTIES,
  slugify,
  todayISO,
  ensureDir,
} = require('./lib');

function extractPayload(body) {
  const text = String(body || '');
  const start = text.indexOf('<!-- ktl-publish');
  if (start === -1) {
    throw new Error('Issue is missing the <!-- ktl-publish --> block.');
  }
  const jsonStart = text.indexOf('{', start);
  const end = text.indexOf('-->', jsonStart);
  if (jsonStart === -1 || end === -1) {
    throw new Error('Could not parse publish payload from issue body.');
  }
  return JSON.parse(text.slice(jsonStart, end).trim());
}

function validate(payload) {
  const title = String(payload.title || '').trim();
  const body = String(payload.body || '').trim();
  const type = String(payload.type || 'answer').trim().toLowerCase();
  const category = String(payload.category || '').trim();
  const county = String(payload.county || '').trim();
  let slug = String(payload.slug || '').trim() || slugify(title);

  if (!title || !body) throw new Error('Title and text are required.');
  if (!['answer', 'update'].includes(type)) throw new Error('Type must be answer or update.');
  if (category && !CATEGORIES.includes(category)) throw new Error(`Unknown category: ${category}`);
  if (county && !COUNTIES.includes(county)) throw new Error(`Unknown county: ${county}`);
  if (!slug) throw new Error('Could not derive slug.');

  return { title, body, type, category, county, slug };
}

function main() {
  const issueBody = process.env.ISSUE_BODY || '';
  const payload = validate(extractPayload(issueBody));
  const now = todayISO();
  ensureDir(CONTENT_DIR);

  const filePath = path.join(CONTENT_DIR, `${payload.slug}.json`);
  let datePublished = now;
  if (fs.existsSync(filePath)) {
    try {
      const existing = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (existing.datePublished) datePublished = existing.datePublished;
    } catch (_) {
      /* replace corrupt file */
    }
  }

  const post = {
    type: payload.type,
    title: payload.title,
    body: payload.body,
    category: payload.category || '',
    county: payload.county || '',
    slug: payload.slug,
    datePublished,
    dateModified: now,
  };

  fs.writeFileSync(filePath, `${JSON.stringify(post, null, 2)}\n`, 'utf8');

  const urlPath =
    payload.type === 'update'
      ? `/updates/${payload.slug}/`
      : `/florida-criminal-defense-answers/${payload.slug}/`;

  const result = {
    ok: true,
    slug: payload.slug,
    path: urlPath,
    url: `https://www.kenturnerlaw.com${urlPath}`,
    file: path.relative(ROOT, filePath),
  };

  fs.writeFileSync(path.join(ROOT, 'publish-issue-result.json'), `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(err.message || err);
    process.exit(1);
  }
}

module.exports = { extractPayload, validate };
