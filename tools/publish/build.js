'use strict';

const fs = require('fs');
const path = require('path');
const {
  ROOT,
  SITE,
  GENERATED_MARKER,
  ensureDir,
  listPosts,
  postPath,
  postDir,
  escapeHtml,
  escapeAttr,
  formatDisplayDate,
  plainParagraphs,
  todayISO,
} = require('./lib');
const { renderPostPage, renderUpdatesIndex } = require('./templates');

const ANSWERS_INDEX = path.join(ROOT, 'florida-criminal-defense-answers', 'index.html');
const BLOG_INDEX = path.join(ROOT, 'blog', 'index.html');
const SITEMAP = path.join(ROOT, 'sitemap.xml');
const SEARCH_INDEX = path.join(ROOT, 'search', 'index.json');
const LLMS = path.join(ROOT, 'llms.txt');
const UPDATES_INDEX = path.join(ROOT, 'updates', 'index.html');

const MANAGED_START = '<!-- kt-managed-posts:start -->';
const MANAGED_END = '<!-- kt-managed-posts:end -->';

function writeFile(file, content) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, content, 'utf8');
}

function removeOrphanGenerated(posts) {
  const keep = new Set(posts.map((p) => path.resolve(postDir(p))));
  const roots = [
    path.join(ROOT, 'florida-criminal-defense-answers'),
    path.join(ROOT, 'updates'),
  ];

  for (const root of roots) {
    if (!fs.existsSync(root)) continue;
    for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const indexFile = path.join(root, entry.name, 'index.html');
      if (!fs.existsSync(indexFile)) continue;
      const html = fs.readFileSync(indexFile, 'utf8');
      if (!html.includes(GENERATED_MARKER)) continue;
      const resolved = path.resolve(indexFile);
      if (!keep.has(resolved)) {
        fs.rmSync(path.join(root, entry.name), { recursive: true, force: true });
        console.log(`Removed orphan generated page: ${path.relative(ROOT, path.join(root, entry.name))}`);
      }
    }
  }
}

function generatePages(posts) {
  for (const post of posts) {
    const file = postDir(post);
    writeFile(file, renderPostPage(post));
    console.log(`Wrote ${path.relative(ROOT, file)}`);
  }
  writeFile(UPDATES_INDEX, renderUpdatesIndex(posts));
  console.log('Wrote updates/index.html');
}

function upsertManagedBlock(html, inner) {
  const block = `${MANAGED_START}\n${inner}\n${MANAGED_END}`;
  if (html.includes(MANAGED_START) && html.includes(MANAGED_END)) {
    return html.replace(
      new RegExp(`${MANAGED_START}[\\s\\S]*?${MANAGED_END}`),
      block,
    );
  }
  return null;
}

function updateAnswersIndex(posts) {
  if (!fs.existsSync(ANSWERS_INDEX)) return;
  let html = fs.readFileSync(ANSWERS_INDEX, 'utf8');
  const answers = posts.filter((p) => p.type === 'answer');

  const list = answers.length
    ? `<ul>${answers
        .map(
          (p) =>
            `<li><a href="${escapeAttr(postPath(p))}">${escapeHtml(p.title)}</a>${p.county ? ` <span class="small">(${escapeHtml(p.county)} County)</span>` : ''}</li>`,
        )
        .join('')}</ul>`
    : '<p class="small">New answers published from the mobile publisher will appear here.</p>';

  const section = `<section class="card" id="published-answers"><h2>Recently published answers</h2>${list}</section>`;

  const replaced = upsertManagedBlock(html, section);
  if (replaced) {
    html = replaced;
  } else if (html.includes('</main>')) {
    html = html.replace(
      '</main>',
      `${MANAGED_START}\n${section}\n${MANAGED_END}\n</main>`,
    );
  }

  // Keep "Updated" date current when posts exist
  if (answers.length) {
    const latest = answers[0].dateModified || answers[0].datePublished;
    html = html.replace(
      /Florida legal information • Updated [^<]+/,
      `Florida legal information • Updated ${formatDisplayDate(latest)}`,
    );
  }

  writeFile(ANSWERS_INDEX, html);
  console.log('Updated florida-criminal-defense-answers/index.html');
}

function updateBlog(posts) {
  if (!fs.existsSync(BLOG_INDEX)) return;
  let html = fs.readFileSync(BLOG_INDEX, 'utf8');
  const updates = posts.filter((p) => p.type === 'update').slice(0, 12);
  const answers = posts.filter((p) => p.type === 'answer').slice(0, 8);

  const updateLinks = updates.length
    ? updates
        .map((p) => `<p><a href="${escapeAttr(postPath(p))}">${escapeHtml(p.title)}</a></p>`)
        .join('')
    : '<p class="small">No updates published yet.</p>';
  const answerLinks = answers.length
    ? answers
        .map((p) => `<p><a href="${escapeAttr(postPath(p))}">${escapeHtml(p.title)}</a></p>`)
        .join('')
    : '';

  const inner = `<h2>Legal Updates</h2>${updateLinks}<p><a href="/updates/">All legal updates</a></p>${
    answerLinks ? `<h2>Recently Published Answers</h2>${answerLinks}` : ''
  }`;

  const replaced = upsertManagedBlock(html, inner);
  if (replaced) {
    html = replaced;
  } else if (html.includes('</main>')) {
    html = html.replace('</main>', `${MANAGED_START}\n${inner}\n${MANAGED_END}\n</main>`);
  }
  writeFile(BLOG_INDEX, html);
  console.log('Updated blog/index.html');
}

function collectStaticUrls() {
  const urls = new Set([`${SITE}/`]);
  const skip = new Set([
    'node_modules',
    '.git',
    '.github',
    'content',
    'tools',
    'functions',
    'publish',
    'test',
    'handbook',
    'img',
    'images',
    'assets',
    'search',
  ]);

  function walk(dir, base = '') {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.')) continue;
      if (!base && skip.has(entry.name)) continue;
      const rel = path.join(base, entry.name);
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full, rel);
      } else if (entry.name === 'index.html') {
        const urlPath = base ? `/${base.replace(/\\/g, '/')}/` : '/';
        if (urlPath.includes('/test/')) continue;
        urls.add(`${SITE}${urlPath}`);
      }
    }
  }

  walk(ROOT);
  urls.add(`${SITE}/updates/`);
  return [...urls].sort();
}

function updateSitemap(posts) {
  const urls = collectStaticUrls();
  const today = todayISO();
  const postDates = new Map(
    posts.map((p) => [`${SITE}${postPath(p)}`, p.dateModified || p.datePublished || today]),
  );

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((loc) => {
      const lastmod = postDates.get(loc) || today;
      let priority = '0.70';
      if (loc === `${SITE}/`) priority = '1.00';
      else if (loc.includes('/florida-criminal-defense-answers/') && loc.endsWith('/florida-criminal-defense-answers/'))
        priority = '0.90';
      else if (loc.includes('/florida-criminal-defense-answers/')) priority = '0.80';
      else if (loc.includes('/updates/')) priority = loc.endsWith('/updates/') ? '0.75' : '0.70';
      return `  <url><loc>${loc}</loc><lastmod>${lastmod}</lastmod><priority>${priority}</priority></url>`;
    }),
    '</urlset>',
    '',
  ].join('\n');

  writeFile(SITEMAP, xml);
  console.log(`Updated sitemap.xml (${urls.length} URLs)`);
}

function updateSearchIndex(posts) {
  const items = [];

  // Existing answer pages (hand-authored + generated)
  const answersRoot = path.join(ROOT, 'florida-criminal-defense-answers');
  if (fs.existsSync(answersRoot)) {
    for (const entry of fs.readdirSync(answersRoot, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const file = path.join(answersRoot, entry.name, 'index.html');
      if (!fs.existsSync(file)) continue;
      const html = fs.readFileSync(file, 'utf8');
      const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
      const descMatch = html.match(/name="description" content="([^"]*)"/i);
      items.push({
        title: (titleMatch ? titleMatch[1] : entry.name).replace(/ \| Ken Turner Law$/, ''),
        url: `/florida-criminal-defense-answers/${entry.name}/`,
        type: 'answer',
        description: descMatch ? descMatch[1] : '',
      });
    }
  }

  for (const post of posts) {
    const url = postPath(post);
    if (items.some((i) => i.url === url)) {
      const existing = items.find((i) => i.url === url);
      existing.title = post.title;
      existing.description = plainParagraphs(post.body)[0] || '';
      existing.type = post.type;
      existing.category = post.category || '';
      existing.county = post.county || '';
      existing.datePublished = post.datePublished;
      existing.dateModified = post.dateModified || post.datePublished;
      continue;
    }
    items.push({
      title: post.title,
      url,
      type: post.type,
      category: post.category || '',
      county: post.county || '',
      description: plainParagraphs(post.body)[0] || '',
      datePublished: post.datePublished,
      dateModified: post.dateModified || post.datePublished,
    });
  }

  // Core practice pages
  const core = [
    ['/', 'Ken Turner Law'],
    ['/criminal-defense/', 'Criminal Defense'],
    ['/dui/', 'DUI'],
    ['/drug-charges/', 'Drug Charges'],
    ['/domestic-violence/', 'Domestic Violence'],
    ['/arrested/', 'Arrested'],
    ['/traffic-offenses/', 'Traffic Offenses'],
    ['/divorce/', 'Divorce'],
    ['/child-custody/', 'Child Custody'],
    ['/best-interests-of-the-child-florida/', 'Best Interests of the Child'],
    ['/updates/', 'Legal Updates'],
    ['/florida-criminal-defense-answers/', 'Florida Criminal Defense Answers'],
  ];
  for (const [url, title] of core) {
    if (!items.some((i) => i.url === url)) {
      items.push({ title, url, type: 'page', description: '' });
    }
  }

  writeFile(
    SEARCH_INDEX,
    `${JSON.stringify({ generated: todayISO(), count: items.length, items }, null, 2)}\n`,
  );
  console.log(`Updated search/index.json (${items.length} items)`);
}

function updateLlms(posts) {
  if (!fs.existsSync(LLMS)) return;
  let text = fs.readFileSync(LLMS, 'utf8');
  const answers = posts.filter((p) => p.type === 'answer').slice(0, 10);
  const updates = posts.filter((p) => p.type === 'update').slice(0, 8);

  const lines = [];
  if (updates.length) {
    lines.push('## Recent legal updates');
    lines.push('');
    for (const p of updates) {
      lines.push(`- [${p.title}](${SITE}${postPath(p)})`);
    }
    lines.push('');
  }
  if (answers.length) {
    lines.push('## Recently published answers');
    lines.push('');
    for (const p of answers) {
      lines.push(`- [${p.title}](${SITE}${postPath(p)})`);
    }
    lines.push('');
  }

  const start = '<!-- kt-managed-posts:start -->';
  const end = '<!-- kt-managed-posts:end -->';
  // llms.txt is markdown; use HTML comments still ok in many parsers, but use markers as text
  const block = `${start}\n${lines.join('\n')}${end}`;
  if (text.includes(start) && text.includes(end)) {
    text = text.replace(new RegExp(`${start}[\\s\\S]*?${end}`), block);
  } else {
    text = `${text.trim()}\n\n${block}\n`;
  }

  // Ensure updates hub is listed once
  if (!text.includes(`${SITE}/updates/`)) {
    text = text.replace(
      '## Primary legal resources\n',
      `## Primary legal resources\n\n- [Legal Updates](${SITE}/updates/)\n`,
    );
  }

  writeFile(LLMS, text.endsWith('\n') ? text : `${text}\n`);
  console.log('Updated llms.txt');
}

function build() {
  const posts = listPosts();
  console.log(`Building ${posts.length} published content file(s)...`);
  removeOrphanGenerated(posts);
  generatePages(posts);
  updateAnswersIndex(posts);
  updateBlog(posts);
  updateSitemap(posts);
  updateSearchIndex(posts);
  updateLlms(posts);
  console.log('Publish build complete.');
}

if (require.main === module) {
  build();
}

module.exports = { build };
