'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const SITE = 'https://www.kenturnerlaw.com';
const CONTENT = path.join(ROOT, 'content', 'posts');

const HUBS = {
  'criminal-defense': { dir: 'florida-criminal-defense-answers', title: 'Florida Criminal Defense Answers' },
  'family-law': { dir: 'florida-family-law-answers', title: 'Florida Family Law Answers' },
  traffic: { dir: 'florida-traffic-ticket-answers', title: 'Florida Traffic Ticket Answers' },
  general: { dir: 'florida-legal-answers', title: 'Florida Legal Answers' },
  updates: { dir: 'updates', title: 'Legal Updates' },
};

function hubFor(post) {
  return HUBS[post.practiceArea] || HUBS['criminal-defense'];
}

function pagePath(post) {
  const hub = hubFor(post);
  return path.join(ROOT, hub.dir, post.slug, 'index.html');
}

function urlFor(post) {
  const hub = hubFor(post);
  return `${SITE}/${hub.dir}/${post.slug}/`;
}

function plainText(body) {
  return String(body || '')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .replace(/[*_#>-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function firstAnswer(body) {
  const text = plainText(body);
  if (!text) return '';
  return text.length > 1000 ? `${text.slice(0, 997).trim()}...` : text;
}

function description(post) {
  let value = post.seoDescription || firstAnswer(post.body) || post.title;
  if (post.county && !value.toLowerCase().includes(post.county.toLowerCase())) {
    value = `${value} ${post.county} County, Florida.`;
  }
  return value.length > 155 ? `${value.slice(0, 152).trim()}...` : value;
}

function schema(post) {
  const hub = hubFor(post);
  const url = urlFor(post);
  const desc = description(post);
  const published = post.datePublished;
  const modified = post.dateModified || published;
  const article = {
    '@context': 'https://schema.org',
    '@type': post.practiceArea === 'updates' ? 'BlogPosting' : 'Article',
    headline: post.title,
    description: desc,
    datePublished: published,
    dateModified: modified,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    author: { '@type': 'Person', name: 'Ken Turner', url: `${SITE}/` },
    publisher: {
      '@type': 'LegalService',
      name: 'Ken Turner Law',
      url: `${SITE}/`,
      telephone: '+1-239-400-3733',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '3080 Tamiami Trail East, Suite 301',
        addressLocality: 'Naples',
        addressRegion: 'FL',
        addressCountry: 'US',
      },
    },
    articleSection: post.category || hub.title,
    about: [post.category, post.county ? `${post.county} County, Florida` : null].filter(Boolean),
  };
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: hub.title, item: `${SITE}/${hub.dir}/` },
      { '@type': 'ListItem', position: 3, name: post.title, item: url },
    ],
  };
  const result = [article, breadcrumb];
  if (post.practiceArea !== 'updates') {
    const answer = firstAnswer(post.body);
    if (answer) {
      result.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [{
          '@type': 'Question',
          name: post.title,
          acceptedAnswer: { '@type': 'Answer', text: answer },
        }],
      });
    }
  }
  return result;
}

function removeManagedSeo(html) {
  return html.replace(/\n?<!-- kt-auto-seo:start -->[\s\S]*?<!-- kt-auto-seo:end -->\n?/g, '\n');
}

function enhance(post) {
  const file = pagePath(post);
  if (!fs.existsSync(file)) throw new Error(`Generated page not found: ${path.relative(ROOT, file)}`);
  let html = removeManagedSeo(fs.readFileSync(file, 'utf8'));
  const url = urlFor(post);
  const desc = description(post);
  const published = post.datePublished || '';
  const modified = post.dateModified || published;
  const block = `<!-- kt-auto-seo:start -->\n<meta name="author" content="Ken Turner">\n<meta property="og:site_name" content="Ken Turner Law">\n<meta property="og:locale" content="en_US">\n<meta property="article:published_time" content="${published}">\n<meta property="article:modified_time" content="${modified}">\n<meta property="article:section" content="${String(post.category || hubFor(post).title).replace(/"/g, '&quot;')}">\n<meta name="twitter:card" content="summary">\n<meta name="twitter:title" content="${String(post.title).replace(/"/g, '&quot;')}">\n<meta name="twitter:description" content="${desc.replace(/"/g, '&quot;')}">\n<link rel="alternate" hreflang="en-us" href="${url}">\n${schema(post).map((item) => `<script type="application/ld+json">${JSON.stringify(item)}</script>`).join('\n')}\n<!-- kt-auto-seo:end -->`;
  if (!html.includes('</head>')) throw new Error(`Missing </head>: ${path.relative(ROOT, file)}`);
  html = html.replace('</head>', `${block}\n</head>`);
  fs.writeFileSync(file, html, 'utf8');
}

function main() {
  if (!fs.existsSync(CONTENT)) {
    console.log('No published content directory.');
    return;
  }
  const posts = fs.readdirSync(CONTENT)
    .filter((name) => name.endsWith('.json'))
    .map((name) => JSON.parse(fs.readFileSync(path.join(CONTENT, name), 'utf8')));
  for (const post of posts) enhance(post);
  console.log(`Enhanced SEO for ${posts.length} published article(s).`);
}

main();
