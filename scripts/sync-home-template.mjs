import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const homePath = path.join(root, 'index.html');
const sitemapPath = path.join(root, 'sitemap.xml');
const calculatorPagePath = path.join(root, 'child-support-calculator', 'index.html');

const TEMPLATE_START = '/* KT-HOME-TEMPLATE-START */';
const TEMPLATE_END = '/* KT-HOME-TEMPLATE-END */';
const SITE_URL = 'https://www.kenturnerlaw.com';

const OBSOLETE_THEME_BLOCKS = [
  ['/* KT-LEATHER-STAMPED-THEME-V2-START */', '/* KT-LEATHER-STAMPED-THEME-V2-END */'],
  ['/* KT-CANONICAL-SITE-CHROME-START */', '/* KT-CANONICAL-SITE-CHROME-END */'],
];

// Standalone pages can be valid AMP without using the public article/header shell.
// They are intentionally excluded so their purpose-built UI is not overwritten
// and so they cannot block publishing of the rest of the site.
const THEME_SYNC_EXCLUSIONS = new Set([
  'child-support-calculator/index.html',
  'cv/index.html',
]);

function ensureCalculatorMenuItem(source, variant = 'site') {
  if (variant === 'standalone') {
    const item = '    <li><a class="side-parent" href="/child-support-calculator/">Child Support Calculator</a></li>';
    if (source.includes(item)) return source;
    const anchor = '    <li><a class="side-parent" href="/reviews/">Reviews</a></li>';
    if (!source.includes(anchor)) throw new Error('Standalone calculator Reviews menu item not found');
    return source.replace(anchor, `${item}\n${anchor}`);
  }

  const item = '      <li class="kt-sidebar-section"><a href="/child-support-calculator/" class="ampstart-nav-link kt-sidebar-parent">Child Support Calculator</a></li>';
  if (source.includes(item)) return source;
  const anchor = '      <li class="kt-sidebar-section"><a href="/reviews/" class="ampstart-nav-link kt-sidebar-parent">Reviews</a></li>';
  if (!source.includes(anchor)) throw new Error('Homepage Reviews menu item not found');
  return source.replace(anchor, `${item}\n${anchor}`);
}

function ensureAuthorMenuItem(source, variant = 'site') {
  if (variant === 'standalone') {
    const item = '    <li><a class="side-parent" href="/ken-turner/">About Ken Turner</a></li>';
    if (source.includes(item)) return source;
    const anchor = '    <li><a class="side-parent" href="/reviews/">Reviews</a></li>';
    if (!source.includes(anchor)) throw new Error('Standalone calculator Reviews menu item not found for author link');
    return source.replace(anchor, `${item}\n${anchor}`);
  }

  const item = '      <li class="kt-sidebar-section"><a href="/ken-turner/" class="ampstart-nav-link kt-sidebar-parent">About Ken Turner</a></li>';
  if (source.includes(item)) return source;
  const anchor = '      <li class="kt-sidebar-section"><a href="/reviews/" class="ampstart-nav-link kt-sidebar-parent">Reviews</a></li>';
  if (!source.includes(anchor)) throw new Error('Homepage Reviews menu item not found for author link');
  return source.replace(anchor, `${item}\n${anchor}`);
}

function extractManagedTemplate(home) {
  const start = home.indexOf(TEMPLATE_START);
  const end = home.indexOf(TEMPLATE_END);
  if (start === -1 || end === -1 || end < start) {
    throw new Error('Managed homepage template block not found');
  }
  return home.slice(start, end + TEMPLATE_END.length);
}

function removeMarkedBlock(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker);
  if (start === -1 && end === -1) return source;
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`Incomplete obsolete theme block: ${startMarker}`);
  }
  return source.slice(0, start) + source.slice(end + endMarker.length);
}

function removeObsoleteThemeBlocks(source) {
  for (const [start, end] of OBSOLETE_THEME_BLOCKS) {
    source = removeMarkedBlock(source, start, end);
  }
  return source;
}

function replaceOrAppendManagedTemplate(source, template) {
  const start = source.indexOf(TEMPLATE_START);
  const end = source.indexOf(TEMPLATE_END);

  if (start !== -1 || end !== -1) {
    if (start === -1 || end === -1 || end < start) {
      throw new Error('Target has an incomplete managed template block');
    }
    return source.slice(0, start) + template + source.slice(end + TEMPLATE_END.length);
  }

  const style = source.match(/<style\s+amp-custom(?:=["'][^"']*["'])?\s*>[\s\S]*?<\/style>/i);
  if (!style || style.index == null) throw new Error('Target amp-custom style block not found');
  const closeOffset = style[0].toLowerCase().lastIndexOf('</style>');
  const insertAt = style.index + closeOffset;
  return source.slice(0, insertAt) + `\n\n${template}\n` + source.slice(insertAt);
}

function extractHomeMarkup(home) {
  const header = home.match(/<header class="ampstart-headerbar kt-home-header fixed left-0 right-0 top-0">[\s\S]*?<\/header>/i);
  const sidebar = home.match(/<amp-sidebar\b[^>]*id="header-sidebar"[^>]*>[\s\S]*?<\/amp-sidebar>/i);
  const floatingText = home.match(/<a\b[^>]*class="[^"]*\bkt-floating-text\b[^"]*"[^>]*>[\s\S]*?<\/a>/i);
  if (!header || !sidebar || !floatingText) throw new Error('Homepage header/sidebar/floating text link not found');
  return { header: header[0], sidebar: sidebar[0], floatingText: floatingText[0] };
}

function ensureAmpSidebarExtension(source) {
  if (/custom-element=["']amp-sidebar["']/i.test(source)) return source;
  const runtime = /<script\s+async\s+src=["']https:\/\/cdn\.ampproject\.org\/v0\.js["']\s*><\/script>/i;
  const match = source.match(runtime);
  if (!match || match.index == null) throw new Error('AMP runtime script not found');
  const insertAt = match.index + match[0].length;
  const extension = '<script async custom-element="amp-sidebar" src="https://cdn.ampproject.org/v0/amp-sidebar-0.1.js"></script>';
  return source.slice(0, insertAt) + extension + source.slice(insertAt);
}

function ensurePrivacyEnhancedAmpYoutube(source) {
  return source.replace(/<amp-youtube\b[^>]*>/gi, (tag) => {
    if (/\bcredentials\s*=\s*["'][^"']*["']/i.test(tag)) {
      return tag.replace(/\scredentials\s*=\s*(["'])[^"']*\1/i, ' credentials="omit"');
    }
    return tag.replace(/<amp-youtube\b/i, '<amp-youtube credentials="omit"');
  });
}

function plainText(value = '') {
  return String(value)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#(?:39|x27);/gi, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function pageName(source, pathname) {
  const h1 = source.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) return plainText(h1[1]);
  const title = source.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  if (title) return plainText(title[1]).replace(/\s+[|–—-]\s+Ken Turner Law.*$/i, '');
  return pathname.split('/').filter(Boolean).pop().replace(/-/g, ' ');
}

function breadcrumbParent(pathname) {
  const nestedSections = [
    ['/florida-criminal-defense-answers/', 'Florida Criminal Defense Answers'],
    ['/florida-family-law-answers/', 'Florida Family Law Answers'],
    ['/florida-traffic-ticket-answers/', 'Florida Traffic Ticket Answers'],
  ];
  for (const [path, name] of nestedSections) {
    if (pathname.startsWith(path) && pathname !== path) return { path, name };
  }

  const criminalPages = new Set([
    '/arrested/', '/criminal-defense-fort-myers/', '/criminal-defense-labelle/',
    '/criminal-defense-miami/', '/criminal-defense-naples/', '/drug-charges/',
    '/dui/', '/felony-charges/', '/misdemeanor-charges/', '/suspended-license/',
    '/traffic-offenses/', '/violation-of-probation/',
  ]);
  if (criminalPages.has(pathname)) return { path: '/criminal-defense/', name: 'Criminal Defense' };

  const familyPages = new Set([
    '/best-interests-of-the-child-florida/', '/child-custody/',
    '/child-support-calculator/', '/divorce/', '/domestic-violence/',
    '/unbundled-legal-services-florida/',
  ]);
  if (familyPages.has(pathname)) return { path: '/florida-family-law-answers/', name: 'Florida Family Law' };

  const trafficPages = new Set([
    '/dont-pay-your-traffic-ticket-yet/', '/negative-consequences-of-paying-a-traffic-ticket/',
    '/traffic-tickets/', '/what-do-i-do-when-i-get-a-traffic-ticket/',
    '/why-do-i-need-an-attorney-for-a-traffic-ticket/',
  ]);
  if (trafficPages.has(pathname)) return { path: '/florida-traffic-ticket-answers/', name: 'Florida Traffic Tickets' };

  return null;
}

function ensureBreadcrumbSchema(source, relative) {
  const pathname = `/${relative.replace(/index\.html$/, '')}`.replace(/\/+/g, '/');
  const currentUrl = `${SITE_URL}${pathname}`;
  const items = [{ name: 'Home', item: `${SITE_URL}/` }];
  const parent = breadcrumbParent(pathname);
  if (parent) items.push({ name: parent.name, item: `${SITE_URL}${parent.path}` });
  items.push({ name: pageName(source, pathname), item: currentUrl });

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${currentUrl}#breadcrumb`,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  };
  const script = `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
  const jsonLdScripts = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi;
  let replaced = false;
  source = source.replace(jsonLdScripts, (existing) => {
    if (!/"@type"\s*:\s*"BreadcrumbList"/.test(existing)) return existing;
    replaced = true;
    return script;
  });
  if (replaced) return source;
  if (!/<\/head>/i.test(source)) throw new Error(`Closing head tag not found for breadcrumb schema: ${relative}`);
  return source.replace(/<\/head>/i, `  ${script}\n</head>`);
}

function replaceHeaderAndSidebar(source, header, sidebar, floatingText) {
  const existingSidebar = /<amp-sidebar\b[^>]*id="header-sidebar"[^>]*>[\s\S]*?<\/amp-sidebar>/i;
  source = source.replace(existingSidebar, '');
  source = source.replace(/<a\b[^>]*class="[^"]*\bkt-floating-text\b[^"]*"[^>]*>[\s\S]*?<\/a>\s*/i, '');

  // Consume all whitespace left around the old chrome and restore exactly one
  // newline after the canonical header/sidebar. This makes repeated syncs stable.
  const ampHeader = /<header\b[^>]*class="[^"]*ampstart-headerbar[^"]*"[^>]*>[\s\S]*?<\/header>\s*/i;
  if (ampHeader.test(source)) {
    return source.replace(ampHeader, `${header}\n${sidebar}\n${floatingText}\n`);
  }

  const simpleTopHeader = /<header\b[^>]*class=["']top["'][^>]*>[\s\S]*?<\/header>\s*/i;
  if (simpleTopHeader.test(source)) {
    return source.replace(simpleTopHeader, `${header}\n${sidebar}\n${floatingText}\n`);
  }

  const siteHeader = /<header\b[^>]*class=["'][^"']*\bsite-header\b[^"']*["'][^>]*>[\s\S]*?<\/header>\s*/i;
  if (siteHeader.test(source)) {
    return source.replace(siteHeader, `${header}\n${sidebar}\n${floatingText}\n`);
  }

  throw new Error('Expected public-site header not found');
}

function publicTargetsFromSitemap() {
  const sitemap = fs.readFileSync(sitemapPath, 'utf8');
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1].trim());
  if (!urls.length) throw new Error('No public URLs found in sitemap.xml');

  const targets = [];
  for (const url of urls) {
    const pathname = new URL(url).pathname.replace(/^\/+|\/+$/g, '');
    const relative = pathname ? `${pathname}/index.html` : 'index.html';
    if (relative === 'index.html') continue;
    const file = path.join(root, relative);
    if (!fs.existsSync(file)) throw new Error(`Sitemap target does not exist: ${relative}`);
    targets.push(relative);
  }
  return [...new Set(targets)];
}

let home = fs.readFileSync(homePath, 'utf8');
const homeWithCalculatorMenu = ensureCalculatorMenuItem(home);
if (homeWithCalculatorMenu !== home) {
  fs.writeFileSync(homePath, homeWithCalculatorMenu);
  home = homeWithCalculatorMenu;
  console.log('Added Child Support Calculator as a top-level homepage menu item.');
}
const homeWithAuthorMenu = ensureAuthorMenuItem(home);
if (homeWithAuthorMenu !== home) {
  fs.writeFileSync(homePath, homeWithAuthorMenu);
  home = homeWithAuthorMenu;
  console.log('Added About Ken Turner as a top-level homepage menu item.');
}
const homeWithPrivateYoutube = ensurePrivacyEnhancedAmpYoutube(home);
if (homeWithPrivateYoutube !== home) {
  fs.writeFileSync(homePath, homeWithPrivateYoutube);
  home = homeWithPrivateYoutube;
  console.log('Enabled AMP YouTube privacy-enhanced mode on the homepage.');
}

if (fs.existsSync(calculatorPagePath)) {
  let calculator = fs.readFileSync(calculatorPagePath, 'utf8');
  const calculatorWithMenu = ensureCalculatorMenuItem(calculator, 'standalone');
  if (calculatorWithMenu !== calculator) {
    fs.writeFileSync(calculatorPagePath, calculatorWithMenu);
    calculator = calculatorWithMenu;
    console.log('Added Child Support Calculator as a top-level item in the standalone calculator menu.');
  }
  const calculatorWithAuthorMenu = ensureAuthorMenuItem(calculator, 'standalone');
  if (calculatorWithAuthorMenu !== calculator) {
    fs.writeFileSync(calculatorPagePath, calculatorWithAuthorMenu);
    console.log('Added About Ken Turner to the standalone calculator menu.');
  }
}

const template = extractManagedTemplate(home);
const { header, sidebar, floatingText } = extractHomeMarkup(home);
const targets = publicTargetsFromSitemap();

let synced = 0;
let skippedNonAmp = 0;
let skippedStandalone = 0;
for (const relative of targets) {
  const file = path.join(root, relative);
  let html = fs.readFileSync(file, 'utf8');
  html = ensureBreadcrumbSchema(html, relative);

  if (THEME_SYNC_EXCLUSIONS.has(relative)) {
    fs.writeFileSync(file, html);
    skippedStandalone += 1;
    console.log(`Added breadcrumb schema while preserving standalone public page theme: ${relative}`);
    continue;
  }

  // The sitemap can legitimately contain public non-AMP tools/pages. Theme sync
  // applies only to AMP pages; non-AMP pages must not abort the publishing job.
  if (!/<html\s+amp(?:\s|>)/i.test(html)) {
    skippedNonAmp += 1;
    console.log(`Skipped non-AMP public page during AMP theme sync: ${relative}`);
    continue;
  }

  html = removeObsoleteThemeBlocks(html);
  html = replaceOrAppendManagedTemplate(html, template);
  html = ensureAmpSidebarExtension(html);
  html = ensurePrivacyEnhancedAmpYoutube(html);
  html = replaceHeaderAndSidebar(html, header, sidebar, floatingText);
  fs.writeFileSync(file, html);
  synced += 1;
  console.log(`Synced managed homepage theme/header/menu to ${relative} without replacing page-specific CSS`);
}

console.log(`Managed theme coverage complete: ${synced} public AMP pages plus homepage source; skipped ${skippedNonAmp} non-AMP public page(s) and ${skippedStandalone} standalone tool(s).`);
