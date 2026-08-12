import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../..');
const site = 'https://www.kenturnerlaw.com';
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1].trim());
const publicPaths = new Set(urls.map((value) => new URL(value).pathname));
const records = [];
let errors = 0;

const strip = (value) => value
  .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
  .replace(/<!--([\s\S]*?)-->/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&[a-z0-9#]+;/gi, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const attr = (html, element, name, value, wanted) => {
  const tags = [...html.matchAll(new RegExp(`<${element}\\b[^>]*>`, 'gi'))].map((match) => match[0]);
  const tag = tags.find((candidate) => new RegExp(`\\b${name}=["']${value}["']`, 'i').test(candidate));
  return tag?.match(new RegExp(`\\b${wanted}=(["'])(.*?)\\1`, 'i'))?.[2] || '';
};

for (const url of urls) {
  const parsed = new URL(url);
  const relative = parsed.pathname === '/' ? 'index.html' : `${parsed.pathname.slice(1)}index.html`;
  const file = path.join(root, relative);
  const pageErrors = [];
  const warnings = [];
  if (!fs.existsSync(file)) {
    pageErrors.push('sitemap target is missing');
    records.push({ path: parsed.pathname, title: '', description: '', errors: pageErrors, warnings });
    errors += pageErrors.length;
    continue;
  }

  const html = fs.readFileSync(file, 'utf8');
  const markup = html.replace(/<!--([\s\S]*?)-->/g, ' ');
  const title = strip(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '');
  const description = attr(html, 'meta', 'name', 'description', 'content');
  const canonical = attr(html, 'link', 'rel', 'canonical', 'href');
  const robots = attr(html, 'meta', 'name', 'robots', 'content');
  const expectedCanonical = `${site}${parsed.pathname}`;
  const headings = [...markup.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)]
    .map((match) => ({ level: Number(match[1]), text: strip(match[2]) }))
    .filter((heading) => heading.text);
  const h1s = headings.filter((heading) => heading.level === 1);
  const imageTags = [...markup.matchAll(/<(?:amp-)?img\b[^>]*>/gi)].map((match) => match[0]);
  const missingAlt = imageTags.filter((tag) => !/\balt=(?:["'][^"']*["']|[^\s>]+)/i.test(tag));
  const schemaScripts = [...html.matchAll(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];

  if (!title) pageErrors.push('missing title');
  if (!description) pageErrors.push('missing meta description');
  if (canonical !== expectedCanonical) pageErrors.push(`canonical is ${canonical || 'missing'}; expected ${expectedCanonical}`);
  if (h1s.length !== 1) pageErrors.push(`expected exactly one meaningful H1; found ${h1s.length}`);
  if (/noindex|none/i.test(robots)) pageErrors.push(`public sitemap URL has restrictive robots directive: ${robots}`);
  if (missingAlt.length) pageErrors.push(`${missingAlt.length} image(s) missing alt attributes`);
  if (description && (description.length < 70 || description.length > 170)) warnings.push(`meta description length is ${description.length}`);
  if (title.length > 65) warnings.push(`title length is ${title.length}`);

  let previous = 0;
  for (const heading of headings) {
    if (previous && heading.level > previous + 1) warnings.push(`heading jumps H${previous} to H${heading.level} at “${heading.text}”`);
    previous = heading.level;
  }

  for (const script of schemaScripts) {
    try { JSON.parse(script[1]); } catch { pageErrors.push('invalid JSON-LD'); }
  }

  const main = html.match(/<main\b[\s\S]*?<\/main>/i)?.[0] || '';
  const words = strip(main).split(/\s+/).filter(Boolean).length;
  if (words < 120) warnings.push(`thin main content: approximately ${words} words`);

  for (const match of html.matchAll(/<a\b[^>]*\bhref=["']([^"'#?]+)[^"']*["']/gi)) {
    const href = match[1];
    if (!href.startsWith('/')) continue;
    const pathname = new URL(href, site).pathname;
    if (!publicPaths.has(pathname) && !fs.existsSync(path.join(root, pathname.replace(/^\//, '')))) {
      warnings.push(`internal link target is not public or present: ${pathname}`);
    }
  }

  records.push({ path: parsed.pathname, title, description, errors: [...new Set(pageErrors)], warnings: [...new Set(warnings)] });
  errors += new Set(pageErrors).size;
}

const duplicate = (field, label) => {
  const groups = new Map();
  for (const record of records) {
    const value = record[field];
    if (!value) continue;
    groups.set(value, [...(groups.get(value) || []), record]);
  }
  for (const group of groups.values()) {
    if (group.length < 2) continue;
    for (const record of group) record.errors.push(`duplicate ${label}`);
    errors += group.length;
  }
};
duplicate('title', 'title');
duplicate('description', 'meta description');

console.log('# Public-page SEO audit');
console.log(`\nInventory: ${records.length} URLs from sitemap.xml.\n`);
for (const record of records) {
  const status = record.errors.length ? 'FAIL' : record.warnings.length ? 'WARN' : 'PASS';
  console.log(`- ${status} ${record.path} — ${record.title || '(untitled)'}`);
  for (const error of record.errors) console.log(`  - ERROR: ${error}`);
  for (const warning of record.warnings) console.log(`  - WARN: ${warning}`);
}
console.log(`\n${errors ? `${errors} blocking SEO error(s)` : 'No blocking SEO errors'} across ${records.length} public pages.`);
if (errors) process.exitCode = 1;
