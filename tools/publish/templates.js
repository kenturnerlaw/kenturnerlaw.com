'use strict';

const {
  SITE,
  GENERATED_MARKER,
  escapeHtml,
  escapeAttr,
  formatDisplayDate,
  metaDescription,
  pageTitle,
  postPath,
  relatedLinks,
  bodyToSections,
} = require('./lib');

const SIDEBAR = `<amp-sidebar class="px3 ampstart-sidebar" id="header-sidebar" layout="nodisplay">
  <div class="flex items-center justify-start ampstart-sidebar-header">
    <div class="ampstart-navbar-trigger items-start" on="tap:header-sidebar.toggle" role="button" tabindex="0" aria-label="close sidebar">✕</div>
  </div>
  <nav class="ampstart-nav ampstart-sidebar-nav" aria-label="Site navigation">
    <ul class="m0 list-reset p0 kt-sidebar-menu">
      <li class="kt-sidebar-section"><a href="/" class="ampstart-nav-link kt-sidebar-parent">Home</a></li>
      <li class="kt-sidebar-section"><a href="/practice-areas/" class="ampstart-nav-link kt-sidebar-parent">Practice Areas</a></li>
      <li class="kt-sidebar-section">
        <a href="/criminal-defense/" class="ampstart-nav-link kt-sidebar-parent">Criminal Defense</a>
        <ul class="kt-sidebar-sub">
          <li><a href="/arrested/">Arrested?</a></li>
          <li><a href="/dui/">DUI</a></li>
          <li><a href="/drug-charges/">Drug Charges</a></li>
          <li><a href="/domestic-violence/">Domestic Violence</a></li>
          <li><a href="/felony-charges/">Felony Charges</a></li>
          <li><a href="/misdemeanor-charges/">Misdemeanor Charges</a></li>
          <li><a href="/traffic-offenses/">Traffic Offenses</a></li>
          <li><a href="/suspended-license/">Suspended License</a></li>
          <li><a href="/violation-of-probation/">Violation of Probation</a></li>
        </ul>
      </li>
      <li class="kt-sidebar-section"><span class="kt-sidebar-parent">Traffic Tickets</span><ul class="kt-sidebar-sub"><li><a href="/why-do-i-need-an-attorney-for-a-traffic-ticket/">Why Do I Need an Attorney?</a></li><li><a href="/what-do-i-do-when-i-get-a-traffic-ticket/">What Do I Do When I Get a Traffic Ticket?</a></li><li><a href="/dont-pay-your-traffic-ticket-yet/">Don't Pay Your Traffic Ticket Yet</a></li><li><a href="/negative-consequences-of-paying-a-traffic-ticket/">Negative Consequences of Paying a Traffic Ticket</a></li></ul></li>
      <li class="kt-sidebar-section"><a href="/florida-criminal-defense-answers/" class="ampstart-nav-link kt-sidebar-parent">Florida Criminal Defense Answers</a></li>
      <li class="kt-sidebar-section">
        <span class="kt-sidebar-parent">Family Law</span>
        <ul class="kt-sidebar-sub">
          <li><a href="/divorce/">Divorce</a></li>
          <li><a href="/child-custody/">Child Custody</a></li>
          <li><a href="/best-interests-of-the-child-florida/">Best Interests of the Child</a></li>
          <li><a href="/unbundled-legal-services-florida/">Unbundled Legal Services</a></li>
        </ul>
      </li>
      <li class="kt-sidebar-section"><a href="/reviews/" class="ampstart-nav-link kt-sidebar-parent">Reviews</a></li>
      <li class="kt-sidebar-section"><a href="/blog/" class="ampstart-nav-link kt-sidebar-parent">Blog</a></li>
      <li class="kt-sidebar-section kt-sidebar-action"><a href="https://kenturnerlaw.as.me/" target="_blank" rel="noopener" class="ampstart-nav-link kt-sidebar-parent">Phone Appointment</a></li>
      <li class="kt-sidebar-section"><a href="/clients/" class="ampstart-nav-link kt-sidebar-parent">Client Resources</a></li>
    </ul>
  </nav>
</amp-sidebar>`;

const PAGE_CSS = `*{box-sizing:border-box}body{margin:0;padding-top:3.5rem;background:#050505 url('/dark-leather.webp');color:#fff;font-family:'Playfair Display SC',Georgia,serif;line-height:1.75}a{color:#e4c36a;text-decoration:none}a:hover,a:focus{text-decoration:underline}.ampstart-headerbar{display:flex;align-items:center;position:fixed;left:0;right:0;top:0;min-height:3.5rem;padding:0 2rem 0 1rem;background:#000;color:#fff;z-index:999;box-shadow:0 0 5px 2px rgba(0,0,0,.1)}.ampstart-navbar-trigger{font-size:1.75rem;line-height:3.5rem;cursor:pointer}.ampstart-headerbar-home-link{margin-left:auto;margin-right:auto;color:#e4c36a;text-decoration:none;font-size:1.125rem;line-height:3.5rem;font-weight:700}.ampstart-sidebar{background:#000;color:#fff;min-width:300px;width:300px;padding:0 1.5rem 1.5rem}.ampstart-sidebar-header{display:flex;align-items:center;min-height:3.5rem}.kt-sidebar-menu{list-style:none;margin:0;padding:0 0 1rem}.kt-sidebar-section{margin:0 0 1.15rem}.kt-sidebar-parent{display:block;color:#fff;font-weight:700}.kt-sidebar-sub{list-style:none;margin:.55rem 0 0 .65rem;padding:0 0 0 .75rem;border-left:1px solid rgba(255,255,255,.28)}.kt-sidebar-sub li{margin:0 0 .55rem}.kt-sidebar-sub a{color:#fff;font-size:.95rem;line-height:1.25;opacity:.9}.kt-sidebar-action{margin-top:1.45rem}main,footer{max-width:900px;margin:auto;padding:20px}main{padding-top:28px}h1{font-size:2.1rem;line-height:1.16;color:#e4c36a;text-transform:uppercase;letter-spacing:.03em;margin:.35rem 0 1rem}h2{color:#efd98c;text-transform:uppercase;letter-spacing:.035em;margin-top:1.5rem}.card{background:rgba(8,8,8,.92);border:1px solid #8b6b2e;padding:18px;margin:16px 0}.small{color:#fff;font-size:.9rem}.card h2:first-child{margin-top:0}.breadcrumbs{font-size:.85rem;margin:0 0 1rem;color:#fff}.breadcrumbs a{color:#e4c36a}.kt-acc-hint{color:#fff;font-size:.95rem;margin:0 0 .85rem;opacity:.95}details.kt-acc{border:0;margin:0;background:transparent}details.kt-acc>summary{list-style:none;cursor:pointer;position:relative;background:#111;color:#efd98c;padding:17px;margin:0;font-size:1.05rem;border:1px solid #6f5526}details.kt-acc+details.kt-acc>summary{border-top:0}details.kt-acc>summary::-webkit-details-marker{display:none}details.kt-acc>summary::marker{content:''}details.kt-acc>summary:after{display:inline-block;content:"+";position:absolute;right:15px;top:.55rem;color:#fff}details.kt-acc[open]>summary:after{content:"–"}details.kt-acc>div{padding:18px;background:#080808;color:#fff}footer{border-top:1px solid #6f5526;color:#fff;margin-top:38px}.ampstart-sidebar .kt-sidebar-parent{display:block;color:#e4c36a;font-size:1rem;line-height:1.35;font-weight:700;text-decoration:none}.ampstart-sidebar .kt-sidebar-sub{list-style:none;margin:.5rem 0 0 .65rem;padding:0 0 0 .75rem;border-left:1px solid rgba(255,255,255,.28)}.ampstart-sidebar .kt-sidebar-sub li{margin:0 0 .45rem;color:#fff}.ampstart-sidebar .kt-sidebar-sub a{color:#fff;font-size:.88rem;line-height:1.3;font-weight:400;text-decoration:none;opacity:.95}main h1,main h2,main h3,main h4{color:#e4c36a}main p,main li,main .lede,main .small,main .subtext{color:#fff}@media(max-width:600px){h1{font-size:1.7rem}main,footer{padding:16px}main{padding-top:20px}}`;

function breadcrumbs(post) {
  const url = `${SITE}${postPath(post)}`;
  const items = [
    { name: 'Home', item: `${SITE}/` },
  ];
  if (post.type === 'update') {
    items.push({ name: 'Legal Updates', item: `${SITE}/updates/` });
  } else {
    items.push({
      name: 'Florida Criminal Defense Answers',
      item: `${SITE}/florida-criminal-defense-answers/`,
    });
  }
  items.push({ name: post.title, item: url });

  const nav = items
    .map((it, i) => {
      if (i === items.length - 1) return `<span>${escapeHtml(it.name)}</span>`;
      return `<a href="${escapeAttr(it.item.replace(SITE, '') || '/')}">${escapeHtml(it.name)}</a>`;
    })
    .join(' <span aria-hidden="true">›</span> ');

  const json = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.item,
    })),
  };

  return { nav, json };
}

function structuredData(post, desc) {
  const url = `${SITE}${postPath(post)}`;
  const article = {
    '@context': 'https://schema.org',
    '@type': post.type === 'update' ? 'BlogPosting' : 'Article',
    headline: post.title,
    datePublished: post.datePublished,
    dateModified: post.dateModified || post.datePublished,
    description: desc,
    author: {
      '@type': 'Person',
      name: 'Ken Turner',
      jobTitle: 'Florida Attorney',
      url: `${SITE}/`,
    },
    publisher: {
      '@type': 'LegalService',
      name: 'Ken Turner Law',
      url: `${SITE}/`,
      telephone: '+1-239-400-3733',
    },
    mainEntityOfPage: url,
    about: [post.category || 'Florida law', post.county ? `${post.county} County` : null].filter(Boolean),
  };

  if (post.type === 'answer') {
    const first = (bodyToSections(post.body).find((s) => !s.heading) || bodyToSections(post.body)[0] || {})
      .paragraphs;
    const answerText = (first || []).join(' ');
    if (answerText) {
      return [
        article,
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: post.title,
              acceptedAnswer: { '@type': 'Answer', text: answerText },
            },
          ],
        },
      ];
    }
  }
  return [article];
}

function renderBody(post) {
  const sections = bodyToSections(post.body);
  const parts = [];
  const open = sections.filter((s) => !s.heading);
  const folded = sections.filter((s) => s.heading);

  for (const s of open) {
    for (const p of s.paragraphs) {
      parts.push(`<p>${escapeHtml(p)}</p>`);
    }
  }

  if (folded.length) {
    parts.push('<p class="kt-acc-hint" role="note">Tap a heading to expand it.</p>');
    for (const s of folded) {
      const inner = s.paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('');
      parts.push(
        `<details class="kt-acc"><summary>${escapeHtml(s.heading)}</summary><div>${inner}</div></details>`,
      );
    }
  }

  return parts.join('');
}

function renderPostPage(post) {
  const pathUrl = postPath(post);
  const url = `${SITE}${pathUrl}`;
  const desc = metaDescription(post.title, post.body, post.county);
  const title = pageTitle(post.title);
  const crumbs = breadcrumbs(post);
  const schemas = structuredData(post, desc);
  const related = relatedLinks(post)
    .map((l) => `<a href="${escapeAttr(l.href)}">${escapeHtml(l.label)}</a>`)
    .join(' • ');
  const countyNote = post.county
    ? ` • ${escapeHtml(post.county)} County`
    : '';
  const catNote = post.category ? ` • ${escapeHtml(post.category)}` : '';
  const kind = post.type === 'update' ? 'Legal update' : 'Florida legal information';
  const modified = post.dateModified || post.datePublished;

  return `<!doctype html>
<!-- ${GENERATED_MARKER}: do not edit by hand; source content/posts/${escapeHtml(post.slug)}.json -->
<html amp lang="en">
<head>
<meta charset="utf-8">
<script async src="https://cdn.ampproject.org/v0.js"></script>
<script async custom-element="amp-sidebar" src="https://cdn.ampproject.org/v0/amp-sidebar-0.1.js"></script>
<link rel="canonical" href="${escapeAttr(url)}">
<meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
<meta name="author" content="Ken Turner">
<meta name="robots" content="index,follow">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeAttr(desc)}">
<meta property="og:type" content="article">
<meta property="og:title" content="${escapeAttr(title)}">
<meta property="og:description" content="${escapeAttr(desc)}">
<meta property="og:url" content="${escapeAttr(url)}">
<meta property="article:published_time" content="${escapeAttr(post.datePublished)}">
<meta property="article:modified_time" content="${escapeAttr(modified)}">
${schemas.map((s) => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join('\n')}
<script type="application/ld+json">${JSON.stringify(crumbs.json)}</script>
<style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style>
<noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
<style amp-custom>${PAGE_CSS}</style>
</head>
<body>
<header class="ampstart-headerbar"><div class="ampstart-navbar-trigger" on="tap:header-sidebar.toggle" role="button" tabindex="0" aria-label="Open site navigation">☰</div><a href="tel:239-400-3733" class="ampstart-headerbar-home-link">Call (239) 400-FREE</a></header>
${SIDEBAR}
<main>
<nav class="breadcrumbs" aria-label="Breadcrumb">${crumbs.nav}</nav>
<p class="small">${escapeHtml(kind)} • By Ken Turner • Updated ${escapeHtml(formatDisplayDate(modified))}${catNote}${countyNote}</p>
<h1>${escapeHtml(post.title)}</h1>
${renderBody(post)}
<section class="card"><h2>Related resources</h2><p>${related}</p></section>
<section class="card"><h2>Speak with counsel</h2><p><a href="tel:+12394003733">Call (239) 400-FREE</a> or email <a href="mailto:ken@kenturnerlaw.com">ken@kenturnerlaw.com</a>.</p></section>
</main>
<footer><p class="small">Legal information, not legal advice. Viewing this page does not create an attorney-client relationship. Published ${escapeHtml(post.datePublished)}. Modified ${escapeHtml(modified)}.</p></footer>
</body>
</html>
`;
}

function renderUpdatesIndex(posts) {
  const updates = posts.filter((p) => p.type === 'update');
  const items = updates.length
    ? updates
        .map(
          (p) =>
            `<div class="card"><h2><a href="${escapeAttr(postPath(p))}">${escapeHtml(p.title)}</a></h2><p class="small">${escapeHtml(formatDisplayDate(p.datePublished))}${p.county ? ` • ${escapeHtml(p.county)} County` : ''}${p.category ? ` • ${escapeHtml(p.category)}` : ''}</p><p>${escapeHtml((require('./lib').plainParagraphs(p.body)[0] || '').slice(0, 220))}</p></div>`,
        )
        .join('\n')
    : '<div class="card"><p>Short legal updates will appear here after they are published from the mobile publish page.</p></div>';

  const url = `${SITE}/updates/`;
  return `<!doctype html>
<!-- ${GENERATED_MARKER}: updates index -->
<html amp lang="en">
<head>
<meta charset="utf-8">
<script async src="https://cdn.ampproject.org/v0.js"></script>
<script async custom-element="amp-sidebar" src="https://cdn.ampproject.org/v0/amp-sidebar-0.1.js"></script>
<link rel="canonical" href="${url}">
<meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
<title>Legal Updates | Ken Turner Law</title>
<meta name="description" content="Short Florida legal updates from attorney Ken Turner on criminal defense, traffic, and family law.">
<meta property="og:type" content="website"><meta property="og:title" content="Legal Updates | Ken Turner Law"><meta property="og:description" content="Short Florida legal updates from attorney Ken Turner."><meta property="og:url" content="${url}">
<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Legal Updates',
    url,
    publisher: { '@type': 'LegalService', name: 'Ken Turner Law', url: SITE },
  })}</script>
<style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style>
<noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
<style amp-custom>${PAGE_CSS}</style>
</head>
<body>
<header class="ampstart-headerbar"><div class="ampstart-navbar-trigger" on="tap:header-sidebar.toggle" role="button" tabindex="0" aria-label="Open site navigation">☰</div><a href="tel:239-400-3733" class="ampstart-headerbar-home-link">Call (239) 400-FREE</a></header>
${SIDEBAR}
<main>
<p class="small">Florida legal information • Ken Turner Law</p>
<h1>Legal Updates</h1>
<p class="lede">Short, current notes from Ken Turner. Tap a title to read the full update.</p>
${items}
</main>
<footer><p class="small">Legal information, not legal advice.</p></footer>
</body>
</html>
`;
}

module.exports = {
  SIDEBAR,
  renderPostPage,
  renderUpdatesIndex,
};
