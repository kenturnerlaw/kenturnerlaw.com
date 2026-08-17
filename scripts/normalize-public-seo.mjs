import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const site = 'https://www.kenturnerlaw.com';
const authorPath = '/ken-turner/';
const authorUrl = `${site}${authorPath}`;
const authorId = `${authorUrl}#person`;
const firmId = `${site}/#law-firm`;
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1].trim());
const descriptionOverrides = new Map([
  ['/florida-legal-answers/', 'Browse plain-English Florida legal answers covering criminal defense, family law, traffic tickets, court procedures, and client resources.'],
  ['/updates/', 'Read recent Florida legal updates and practical information from Ken Turner Law, with links to related criminal defense and family law resources.'],
  ['/criminal-defense-naples/', 'Naples criminal defense attorney Ken Turner represents clients in Collier County DUI, drug, felony, misdemeanor, traffic, and probation cases.'],
  ['/divorce/', 'Naples divorce attorney Ken Turner represents clients in Collier and Lee Counties in divorce, parenting, support, property, alimony, and enforcement matters.'],
]);

const areaServedOverrides = new Map([
  ['/', ['Naples', 'Collier County', 'Fort Myers', 'Lee County', 'LaBelle', 'Hendry County', 'Miami', 'Miami-Dade County']],
  ['/criminal-defense-naples/', ['Naples', 'Collier County']],
  ['/divorce/', ['Naples', 'Collier County', 'Fort Myers', 'Lee County']],
]);

const explicitlyAuthored = new Set([
  '/what-do-i-do-when-i-get-a-traffic-ticket/',
  '/dont-pay-your-traffic-ticket-yet/',
  '/negative-consequences-of-paying-a-traffic-ticket/',
  '/why-do-i-need-an-attorney-for-a-traffic-ticket/',
]);

function replaceAttribute(tag, name, value) {
  if (new RegExp(`\\b${name}=`, 'i').test(tag)) {
    return tag.replace(new RegExp(`\\b${name}=(["']).*?\\1`, 'i'), `${name}="${value}"`);
  }
  return tag.replace(/\s*\/?\s*>$/, (ending) => ` ${name}="${value}"${ending.includes('/') ? ' />' : '>'}`);
}

function hasType(node, type) {
  const value = node?.['@type'];
  return value === type || (Array.isArray(value) && value.includes(type));
}

function normalizeSchemaNode(node, pathname) {
  if (Array.isArray(node)) {
    for (const child of node) normalizeSchemaNode(child, pathname);
    return;
  }
  if (!node || typeof node !== 'object') return;

  if (hasType(node, 'WebSite')) delete node.potentialAction;

  if (hasType(node, 'Person') && String(node.name || '').trim().toLowerCase() === 'ken turner') {
    node['@id'] = authorId;
    node.url = authorUrl;
    node.jobTitle = node.jobTitle || 'Attorney';
    node.worksFor = { '@id': firmId };
  }

  if (hasType(node, 'Attorney') || hasType(node, 'LegalService')) {
    delete node.openingHours;
    if (pathname !== '/reviews/') {
      delete node.aggregateRating;
      delete node.review;
    }

    // Keep one consistent business identity everywhere Google crawls the site.
    node['@id'] = firmId;
    node.name = 'The Ken Turner Law Firm, LLC';
    node.alternateName = 'Ken Turner Law';
    node.url = site;
    node.telephone = '+1-239-400-3733';
    node.address = {
      '@type': 'PostalAddress',
      streetAddress: '3080 Tamiami Trl E, Ste 301',
      addressLocality: 'Naples',
      addressRegion: 'FL',
      postalCode: '34112',
      addressCountry: 'US',
    };

    const served = areaServedOverrides.get(pathname);
    if (served) node.areaServed = served;
  }

  for (const value of Object.values(node)) {
    if (value && typeof value === 'object') normalizeSchemaNode(value, pathname);
  }
}

function plainText(value = '') {
  return String(value)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function pageTitle(html) {
  const h1 = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) return plainText(h1[1]);
  const title = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  return title ? plainText(title[1]).replace(/\s+\|\s+Ken Turner Law.*$/i, '') : 'Florida Legal Information';
}

function pageDescription(html) {
  const match = html.match(/<meta\b[^>]*\bname=["']description["'][^>]*\bcontent=["']([^"']*)["'][^>]*>/i)
    || html.match(/<meta\b[^>]*\bcontent=["']([^"']*)["'][^>]*\bname=["']description["'][^>]*>/i);
  return match ? plainText(match[1]) : '';
}

function hasArticleSchema(html) {
  return /<script\s+type=["']application\/ld\+json["'][^>]*>[\s\S]*?["']@type["']\s*:\s*["'](?:Article|BlogPosting)["'][\s\S]*?<\/script>/i.test(html);
}

function ensureAuthorMeta(html) {
  if (/<meta\b[^>]*\bname=["']author["'][^>]*>/i.test(html)) {
    return html.replace(/<meta\b[^>]*\bname=["']author["'][^>]*>/i, (tag) => replaceAttribute(tag, 'content', 'Ken Turner'));
  }
  return html.replace(/<meta\s+charset=[^>]+>/i, (tag) => `${tag}\n<meta name="author" content="Ken Turner">`);
}

function ensureExplicitArticleSchema(html, pathname) {
  if (!explicitlyAuthored.has(pathname) || hasArticleSchema(html)) return html;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: pageTitle(html),
    description: pageDescription(html),
    author: {
      '@type': 'Person',
      '@id': authorId,
      name: 'Ken Turner',
      url: authorUrl,
      jobTitle: 'Attorney',
      worksFor: { '@id': firmId },
    },
    publisher: { '@id': firmId },
    mainEntityOfPage: `${site}${pathname}`,
  };
  return html.replace('</head>', `<script type="application/ld+json">${JSON.stringify(schema)}</script>\n</head>`);
}

function normalizeHomepageConversion(html) {
  html = html.replace(
    /<p class=["']kt-free-consultation["']>\s*Free Consultation\s*<\/p>/i,
    '<p class="kt-free-consultation">Stress Free Consultation</p>',
  );

  html = html.replace(
    /<p class=ampstart-dropcap>Everyone should be able to afford an attorney\.[\s\S]*?Even in the most basic matters, having legal representation can make sure that your case gets handled correctly and mistakes are avoided\.<\/p>/i,
    '<p class=ampstart-dropcap>Legal problems can be stressful, expensive, and disruptive. My goal is to make experienced legal representation accessible and practical while giving clients clear information about what is happening, what comes next, and what choices are available. Florida court cases are governed by statutes, rules, evidence, deadlines, and procedures that can affect liberty, family relationships, finances, and future opportunities. Preparation and timely legal advice can prevent avoidable mistakes and help protect your options.</p>',
  );

  html = html.replace(
    /I am prepared to settle because I am prepared to go to trial\. I'll be the first to admit that I am not easy to get on the phone \(that is why I have implemented the client phone scheduler so that you can see my availability\)\. I am not out playing golf or sitting at happy hour slapping other attorneys on the back; I am preparing, thinking, drafting, researching, and getting ready\./i,
    'I am prepared to settle because I am prepared to go to trial. I use a phone scheduler so you can see my availability and choose a time that works for you while I continue preparing, researching, drafting, and working on client matters.',
  );

  html = html.replace(
    /\s*<p>The Public Defenders in the Twentieth Circuit are some of the best lawyers you will ever meet\.[\s\S]*?they represent people who are indigent and may have many cases\.<\/p>/i,
    '',
  );

  return html;
}

for (const value of urls) {
  const url = new URL(value);
  const relative = url.pathname === '/' ? 'index.html' : `${url.pathname.slice(1)}index.html`;
  const file = path.join(root, relative);
  if (!fs.existsSync(file)) {
    console.log(`Skipped missing sitemap target during SEO normalization: ${relative}`);
    continue;
  }
  let html = fs.readFileSync(file, 'utf8');

  html = html.replace(/<link\b[^>]*\brel=["']canonical["'][^>]*>/i, (tag) => replaceAttribute(tag, 'href', `${site}${url.pathname}`));
  html = html.replace(/<meta\b[^>]*\bproperty=["']og:url["'][^>]*>/i, (tag) => replaceAttribute(tag, 'content', `${site}${url.pathname}`));
  const descriptionOverride = descriptionOverrides.get(url.pathname);
  if (descriptionOverride) {
    html = html.replace(/<meta\b[^>]*\bname=["']description["'][^>]*>/i, (tag) => replaceAttribute(tag, 'content', descriptionOverride));
    html = html.replace(/<meta\b[^>]*\bproperty=["']og:description["'][^>]*>/i, (tag) => replaceAttribute(tag, 'content', descriptionOverride));
  }

  if (explicitlyAuthored.has(url.pathname)) html = ensureAuthorMeta(html);

  html = html.replace(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi, (script, json) => {
    try {
      const data = JSON.parse(json);
      normalizeSchemaNode(data, url.pathname);
      return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
    } catch {
      return script;
    }
  });

  html = ensureExplicitArticleSchema(html, url.pathname);

  // Turn visible authorship into a crawlable author relationship without nesting links on repeat runs.
  html = html.replace(/By Ken Turner(?!<\/a>)/g, '<a class="kt-author-link" href="/ken-turner/">By Ken Turner</a>');

  // Keep the homepage focused on getting a prospective client to call or schedule.
  if (url.pathname === '/') {
    html = normalizeHomepageConversion(html);
    html = html.replace(/<section class=["']kt-defense-lead["'][\s\S]*?<\/section>/i, (section) => {
      if (section.includes('/criminal-defense-naples/') && section.includes('/divorce/')) return section;
      return section.replace(
        /(<p\b[^>]*>[\s\S]*?<\/p>)/i,
        `$1\n<p class="kt-local-service-links">Naples legal services: <a href="/criminal-defense-naples/">Naples Criminal Defense Attorney</a> · <a href="/divorce/">Naples Divorce Attorney</a></p>`,
      );
    });
  }

  // Add concise Naples/Collier context near the primary heading on the Naples criminal page.
  if (url.pathname === '/criminal-defense-naples/' && !html.includes('kt-naples-local-context')) {
    html = html.replace(
      /(<h1\b[^>]*>[\s\S]*?Naples[\s\S]*?<\/h1>)/i,
      `$1\n<p class="kt-naples-local-context">Ken Turner represents people facing criminal charges in Naples and throughout Collier County. The Naples criminal defense practice includes <a href="/dui/">DUI</a>, <a href="/drug-charges/">drug charges</a>, <a href="/felony-charges/">felony charges</a>, <a href="/misdemeanor-charges/">misdemeanor charges</a>, <a href="/traffic-offenses/">traffic offenses</a>, and <a href="/violation-of-probation/">violations of probation</a>.</p>`,
    );
  }

  const robots = /<meta\b[^>]*\bname=["']robots["'][^>]*>/i;
  if (robots.test(html)) {
    html = html.replace(robots, (tag) => replaceAttribute(tag, 'content', 'index,follow'));
  } else {
    html = html.replace(/<meta\s+charset=[^>]+>/i, (tag) => `${tag}\n<meta name="robots" content="index,follow">`);
  }

  // The Bing noscript image is a non-content tracking pixel.
  html = html.replace(/<img\b(?=[^>]*bat\.bing\.com\/action\/0)(?![^>]*\balt=)[^>]*>/gi, (tag) => replaceAttribute(tag, 'alt', ''));

  fs.writeFileSync(file, html);
  console.log(`Normalized public SEO metadata: ${relative}`);
}
