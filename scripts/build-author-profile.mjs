import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const site = 'https://www.kenturnerlaw.com';
const authorPath = '/ken-turner/';
const authorUrl = `${site}${authorPath}`;
const sitemapPath = path.join(root, 'sitemap.xml');
const sitemapTextPath = path.join(root, 'sitemap.txt');
const output = path.join(root, 'ken-turner', 'index.html');

const explicitlyAuthored = new Set([
  '/what-do-i-do-when-i-get-a-traffic-ticket/',
  '/dont-pay-your-traffic-ticket-yet/',
  '/negative-consequences-of-paying-a-traffic-ticket/',
  '/why-do-i-need-an-attorney-for-a-traffic-ticket/',
]);

function text(value = '') {
  return String(value)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function esc(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fileFor(pathname) {
  return path.join(root, pathname === '/' ? 'index.html' : `${pathname.replace(/^\//, '')}index.html`);
}

function titleFor(html, pathname) {
  const h1 = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) return text(h1[1]);
  const title = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  if (title) return text(title[1]).replace(/\s+\|\s+Ken Turner Law.*$/i, '');
  return pathname;
}

function descriptionFor(html) {
  const match = html.match(/<meta\b[^>]*\bname=["']description["'][^>]*\bcontent=["']([^"']*)["'][^>]*>/i)
    || html.match(/<meta\b[^>]*\bcontent=["']([^"']*)["'][^>]*\bname=["']description["'][^>]*>/i);
  return match ? text(match[1]) : '';
}

function isAuthored(html, pathname) {
  if (explicitlyAuthored.has(pathname)) return true;
  if (/<meta\b[^>]*\bname=["']author["'][^>]*\bcontent=["']Ken Turner["']/i.test(html)) return true;
  if (/\bBy\s+(?:<a\b[^>]*>)?Ken Turner\b/i.test(html)) return true;
  return false;
}

function sectionFor(pathname) {
  if (pathname.includes('traffic-ticket') || pathname.includes('/traffic-') || explicitlyAuthored.has(pathname)) return 'Florida Traffic Tickets';
  if (pathname.includes('family-law') || pathname.includes('child-') || pathname.includes('/divorce')) return 'Florida Family Law';
  if (pathname.includes('/updates/')) return 'Legal Updates';
  return 'Florida Criminal Defense';
}

function ensureSitemap(urls) {
  const all = [...new Set([...urls, authorUrl])].sort();
  fs.writeFileSync(
    sitemapPath,
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      all.map((url) => `  <url><loc>${url}</loc></url>`).join('\n') +
      '\n</urlset>\n',
  );
  fs.writeFileSync(sitemapTextPath, `${all.join('\n')}\n`);
}

const sitemap = fs.readFileSync(sitemapPath, 'utf8');
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1].trim());
const entries = [];

for (const value of urls) {
  const url = new URL(value);
  if (url.pathname === '/' || url.pathname === authorPath) continue;
  const file = fileFor(url.pathname);
  if (!fs.existsSync(file)) continue;
  const html = fs.readFileSync(file, 'utf8');
  if (!isAuthored(html, url.pathname)) continue;
  entries.push({
    pathname: url.pathname,
    title: titleFor(html, url.pathname),
    description: descriptionFor(html),
    section: sectionFor(url.pathname),
  });
}

entries.sort((a, b) => a.section.localeCompare(b.section) || a.title.localeCompare(b.title));
const groups = new Map();
for (const entry of entries) {
  if (!groups.has(entry.section)) groups.set(entry.section, []);
  groups.get(entry.section).push(entry);
}

const articleSections = [...groups.entries()].map(([section, items]) => `
<section class="author-section">
  <h2>${esc(section)}</h2>
  <div class="author-list">
    ${items.map((item) => `<article><h3><a href="${esc(item.pathname)}">${esc(item.title)}</a></h3>${item.description ? `<p>${esc(item.description)}</p>` : ''}</article>`).join('\n    ')}
  </div>
</section>`).join('\n');

const person = {
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  '@id': `${authorUrl}#profile`,
  url: authorUrl,
  name: 'Ken Turner | Florida Attorney',
  description: 'Attorney Ken Turner writes about Florida criminal defense, traffic tickets, divorce, parenting, child support, and court procedure.',
  mainEntity: {
    '@type': 'Person',
    '@id': `${authorUrl}#person`,
    name: 'Ken Turner',
    url: authorUrl,
    jobTitle: 'Attorney',
    image: `${site}/img/kenturner.jpg`,
    worksFor: { '@id': `${site}/#law-firm` },
    knowsAbout: [
      'Florida criminal defense',
      'DUI defense',
      'Florida traffic tickets',
      'Florida divorce',
      'Florida child custody',
      'Florida child support',
      'Florida court procedure',
    ],
  },
};

const firm = {
  '@context': 'https://schema.org',
  '@type': 'LegalService',
  '@id': `${site}/#law-firm`,
  name: 'The Ken Turner Law Firm, LLC',
  alternateName: 'Ken Turner Law',
  url: site,
  telephone: '+1-239-400-3733',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '3080 Tamiami Trl E, Ste 301',
    addressLocality: 'Naples',
    addressRegion: 'FL',
    postalCode: '34112',
    addressCountry: 'US',
  },
};

const html = `<!doctype html>
<html amp lang="en">
<head>
  <meta charset="utf-8">
  <script async src="https://cdn.ampproject.org/v0.js"></script>
  <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
  <meta name="robots" content="index,follow">
  <link rel="canonical" href="${authorUrl}">
  <title>Ken Turner | Florida Criminal Defense & Family Law Attorney</title>
  <meta name="description" content="Read Florida legal information written by attorney Ken Turner, including criminal defense, traffic ticket, divorce, child custody, child support, and court-procedure resources.">
  <meta property="og:type" content="profile">
  <meta property="og:title" content="Ken Turner | Florida Attorney">
  <meta property="og:description" content="Florida legal information and articles written by attorney Ken Turner.">
  <meta property="og:url" content="${authorUrl}">
  <meta property="og:image" content="${site}/img/kenturner.jpg">
  <script type="application/ld+json">${JSON.stringify(person)}</script>
  <script type="application/ld+json">${JSON.stringify(firm)}</script>
  <style amp-custom>
    *{box-sizing:border-box}body{margin:0;background:#050505;color:#f7f1e4;font-family:Arial,Helvetica,sans-serif;line-height:1.65}a{color:#efd078}.top{padding:16px 18px;background:#030303;border-bottom:1px solid #6d5423}.top a{text-decoration:none;font-weight:800}.top .call{float:right}main{max-width:940px;margin:auto;padding:38px 18px 70px}.eyebrow{color:#d8b65a;font-size:.78rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase}h1,h2,h3{font-family:Georgia,'Times New Roman',serif}h1{margin:.25rem 0 1rem;color:#e4c36a;font-size:clamp(2.3rem,7vw,4.6rem);line-height:1.04}.lead{max-width:760px;font-size:1.1rem}.profile-card{margin:26px 0;padding:24px;border:1px solid #6d5423;background:#101010}.profile-card h2{margin:0 0 10px;color:#efd078}.facts{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:20px}.fact{padding:14px;background:#171717;border-left:3px solid #b88a30}.author-section{margin-top:38px;padding-top:26px;border-top:1px solid #6d5423}.author-section h2{color:#efd078}.author-list{display:grid;grid-template-columns:1fr 1fr;gap:16px}.author-list article{padding:18px;background:#111;border:1px solid #40351f}.author-list h3{margin:0 0 8px;font-size:1.08rem}.author-list p{margin:0;color:#ddd;font-size:.92rem}.cta{display:inline-block;margin-top:18px;padding:12px 16px;border:1px solid #d8b65a;text-decoration:none;font-weight:800}@media(max-width:700px){.facts,.author-list{grid-template-columns:1fr}.top .call{float:none;display:block;margin-top:6px}}
  </style>
  <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;animation:none}</style></noscript>
</head>
<body>
<header class="top"><a href="/">Ken Turner Law</a><a class="call" href="tel:+12394003733">Call (239) 400-FREE</a></header>
<main>
  <p class="eyebrow">Attorney & Author</p>
  <h1>Ken Turner</h1>
  <p class="lead">Ken Turner is a Florida attorney who represents clients in criminal defense matters and family-law cases. This page collects legal information written by Ken Turner so readers and search engines can identify the author behind the firm's educational material.</p>
  <section class="profile-card">
    <h2>Practice and experience</h2>
    <p>Ken Turner handles criminal defense matters including DUI, drug charges, felonies, misdemeanors, traffic offenses, and violations of probation. He also represents clients in divorce, parenting, child-support, and related family-law matters.</p>
    <div class="facts"><div class="fact"><strong>Criminal defense</strong><br>Naples, Fort Myers, LaBelle, and Miami</div><div class="fact"><strong>Family law</strong><br>Collier and Lee Counties</div><div class="fact"><strong>Office</strong><br>3080 Tamiami Trl E, Ste 301, Naples, FL 34112</div><div class="fact"><strong>Phone</strong><br><a href="tel:+12394003733">(239) 400-3733</a></div></div>
    <a class="cta" href="https://client.kenturnerlaw.com/schedule">Schedule a Call</a>
  </section>
  <section class="author-section"><h2>Legal information written by Ken Turner</h2><p>These are existing resources published on Ken Turner Law and attributed to Ken Turner.</p></section>
  ${articleSections || '<section class="author-section"><p>Authored resources are being indexed.</p></section>'}
</main>
</body>
</html>`;

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, html);
ensureSitemap(urls);
console.log(`Built Ken Turner author profile with ${entries.length} attributed resource(s).`);
