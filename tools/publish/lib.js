'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const SITE = 'https://www.kenturnerlaw.com';
const CONTENT_DIR = path.join(ROOT, 'content', 'posts');
const GENERATED_MARKER = 'kt-generated';

const CATEGORIES = [
  'Police encounters',
  'Searches',
  'Arrest and court',
  'DUI',
  'Drug charges',
  'Domestic violence',
  'Traffic',
  'Family law',
  'General',
];

const COUNTIES = ['Collier', 'Lee', 'Hendry', 'Miami-Dade'];

const CATEGORY_LINKS = {
  'Police encounters': [
    { href: '/arrested/', label: 'What to do after an arrest' },
    { href: '/florida-criminal-defense-answers/should-i-talk-to-police/', label: 'Should I talk to police?' },
    { href: '/criminal-defense/', label: 'Criminal defense overview' },
  ],
  Searches: [
    { href: '/florida-criminal-defense-answers/should-i-consent-to-a-search/', label: 'Should I consent to a search?' },
    { href: '/florida-criminal-defense-answers/can-police-search-my-car/', label: 'Can police search my car?' },
    { href: '/drug-charges/', label: 'Drug charges' },
  ],
  'Arrest and court': [
    { href: '/arrested/', label: 'Arrested in Florida' },
    { href: '/florida-criminal-defense-answers/what-happens-at-first-appearance/', label: 'First appearance' },
    { href: '/florida-criminal-defense-answers/how-does-bond-work-in-florida/', label: 'How bond works' },
  ],
  DUI: [
    { href: '/dui/', label: 'Florida DUI guide' },
    { href: '/florida-criminal-defense-answers/what-happens-after-a-dui-arrest/', label: 'After a DUI arrest' },
    { href: '/suspended-license/', label: 'Suspended license' },
  ],
  'Drug charges': [
    { href: '/drug-charges/', label: 'Drug charges' },
    { href: '/criminal-defense/', label: 'Criminal defense overview' },
  ],
  'Domestic violence': [
    { href: '/domestic-violence/', label: 'Domestic violence' },
    { href: '/florida-criminal-defense-answers/what-is-a-no-contact-order/', label: 'No-contact orders' },
  ],
  Traffic: [
    { href: '/traffic-offenses/', label: 'Traffic offenses' },
    { href: '/dont-pay-your-traffic-ticket-yet/', label: "Don't pay your traffic ticket yet" },
    { href: '/why-do-i-need-an-attorney-for-a-traffic-ticket/', label: 'Why hire a traffic attorney' },
  ],
  'Family law': [
    { href: '/divorce/', label: 'Divorce' },
    { href: '/child-custody/', label: 'Time-sharing and parenting plans' },
    { href: '/best-interests-of-the-child-florida/', label: 'Best interests of the child' },
  ],
  General: [
    { href: '/florida-criminal-defense-answers/', label: 'Florida Criminal Defense Answers' },
    { href: '/criminal-defense/', label: 'Criminal defense overview' },
    { href: '/practice-areas/', label: 'Practice areas' },
  ],
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function formatDisplayDate(iso) {
  const d = new Date(`${iso}T12:00:00Z`);
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
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

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(str) {
  return escapeHtml(str).replace(/'/g, '&#39;');
}

function plainParagraphs(body) {
  return String(body || '')
    .replace(/\r\n/g, '\n')
    .trim()
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\n/g, ' ').trim())
    .filter(Boolean);
}

function metaDescription(title, body, county) {
  const first = plainParagraphs(body)[0] || title;
  let desc = first.replace(/\s+/g, ' ').trim();
  if (county) desc = `${desc} (${county} County, Florida)`;
  if (desc.length > 155) desc = `${desc.slice(0, 152).trim()}...`;
  return desc;
}

function pageTitle(title) {
  const t = String(title || '').trim();
  if (/ken turner law/i.test(t)) return t;
  return `${t} | Ken Turner Law`;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, data) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function listPosts() {
  ensureDir(CONTENT_DIR);
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => {
      const full = path.join(CONTENT_DIR, f);
      const post = JSON.parse(fs.readFileSync(full, 'utf8'));
      post._file = f;
      return post;
    })
    .sort((a, b) => String(b.datePublished || '').localeCompare(String(a.datePublished || '')));
}

function postPath(post) {
  if (post.type === 'update') return `/updates/${post.slug}/`;
  return `/florida-criminal-defense-answers/${post.slug}/`;
}

function postDir(post) {
  return path.join(ROOT, postPath(post).replace(/^\//, ''), 'index.html');
}

function relatedLinks(post) {
  const cat = post.category && CATEGORY_LINKS[post.category] ? post.category : 'General';
  const links = [...CATEGORY_LINKS[cat]];
  if (post.type === 'answer') {
    links.unshift({
      href: '/florida-criminal-defense-answers/',
      label: 'Florida Criminal Defense Answers',
    });
  } else {
    links.unshift({ href: '/updates/', label: 'Legal updates' });
    links.push({ href: '/blog/', label: 'Blog' });
  }
  const seen = new Set();
  return links.filter((l) => {
    if (seen.has(l.href)) return false;
    seen.add(l.href);
    return true;
  });
}

function bodyToSections(body) {
  const text = String(body || '').replace(/\r\n/g, '\n').trim();
  if (!text) return [];

  // Optional ## Heading sections for longer material
  if (/^##\s+/m.test(text)) {
    const parts = text.split(/^##\s+/m).filter(Boolean);
    return parts.map((part, idx) => {
      const lines = part.split('\n');
      const heading = idx === 0 && !text.startsWith('##') ? 'Overview' : lines.shift().trim();
      const paras = plainParagraphs(lines.join('\n'));
      return { heading: heading || 'Overview', paragraphs: paras };
    }).filter((s) => s.paragraphs.length);
  }

  const paras = plainParagraphs(text);
  if (paras.length <= 3) {
    return [{ heading: null, paragraphs: paras }];
  }

  // Longer plain text: first paragraph stays visible; rest become accordion sections
  const rest = paras.slice(1);
  const chunkSize = Math.max(1, Math.ceil(rest.length / Math.min(4, rest.length)));
  const sections = [];
  for (let i = 0; i < rest.length; i += chunkSize) {
    const chunk = rest.slice(i, i + chunkSize);
    const label = chunk[0].split(/[.?!]/)[0].slice(0, 48).trim() || `Section ${sections.length + 1}`;
    sections.push({ heading: label, paragraphs: chunk });
  }
  return [{ heading: null, paragraphs: [paras[0]] }, ...sections];
}

module.exports = {
  ROOT,
  SITE,
  CONTENT_DIR,
  GENERATED_MARKER,
  CATEGORIES,
  COUNTIES,
  CATEGORY_LINKS,
  todayISO,
  formatDisplayDate,
  slugify,
  escapeHtml,
  escapeAttr,
  plainParagraphs,
  metaDescription,
  pageTitle,
  ensureDir,
  readJson,
  writeJson,
  listPosts,
  postPath,
  postDir,
  relatedLinks,
  bodyToSections,
};
