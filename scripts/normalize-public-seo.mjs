import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const site = 'https://www.kenturnerlaw.com';
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1].trim());
const descriptionOverrides = new Map([
  ['/florida-legal-answers/', 'Browse plain-English Florida legal answers covering criminal defense, family law, traffic tickets, court procedures, and client resources.'],
  ['/updates/', 'Read recent Florida legal updates and practical information from Ken Turner Law, with links to related criminal defense and family law resources.'],
]);

function replaceAttribute(tag, name, value) {
  if (new RegExp(`\\b${name}=`, 'i').test(tag)) {
    return tag.replace(new RegExp(`\\b${name}=(["']).*?\\1`, 'i'), `${name}="${value}"`);
  }
  return tag.replace(/\s*\/?\s*>$/, (ending) => ` ${name}="${value}"${ending.includes('/') ? ' />' : '>'}`);
}

for (const value of urls) {
  const url = new URL(value);
  const relative = url.pathname === '/' ? 'index.html' : `${url.pathname.slice(1)}index.html`;
  const file = path.join(root, relative);
  let html = fs.readFileSync(file, 'utf8');

  html = html.replace(/<link\b[^>]*\brel=["']canonical["'][^>]*>/i, (tag) => replaceAttribute(tag, 'href', `${site}${url.pathname}`));
  html = html.replace(/<meta\b[^>]*\bproperty=["']og:url["'][^>]*>/i, (tag) => replaceAttribute(tag, 'content', `${site}${url.pathname}`));
  const descriptionOverride = descriptionOverrides.get(url.pathname);
  if (descriptionOverride) {
    html = html.replace(/<meta\b[^>]*\bname=["']description["'][^>]*>/i, (tag) => replaceAttribute(tag, 'content', descriptionOverride));
    html = html.replace(/<meta\b[^>]*\bproperty=["']og:description["'][^>]*>/i, (tag) => replaceAttribute(tag, 'content', descriptionOverride));
  }

  html = html.replace(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi, (script, json) => {
    try {
      const data = JSON.parse(json);
      if (data['@type'] === 'WebSite') delete data.potentialAction;
      if (data['@type'] === 'Attorney' || data['@type'] === 'LegalService') {
        delete data.openingHours;
        if (url.pathname !== '/reviews/') {
          delete data.aggregateRating;
          delete data.review;
        }
      }
      return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
    } catch {
      return script;
    }
  });

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
