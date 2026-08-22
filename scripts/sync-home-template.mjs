import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const homePath = path.join(root, 'index.html');
const sitemapPath = path.join(root, 'sitemap.xml');
const calculatorPagePath = path.join(root, 'child-support-calculator', 'index.html');

const TEMPLATE_START = '/* KT-HOME-TEMPLATE-START */';
const TEMPLATE_END = '/* KT-HOME-TEMPLATE-END */';

const OBSOLETE_THEME_BLOCKS = [
  ['/* KT-LEATHER-STAMPED-THEME-V2-START */', '/* KT-LEATHER-STAMPED-THEME-V2-END */'],
  ['/* KT-CANONICAL-SITE-CHROME-START */', '/* KT-CANONICAL-SITE-CHROME-END */'],
];

// Standalone tools can be valid AMP without using the public article/header shell.
// They are intentionally excluded so their purpose-built UI is not overwritten
// and so they cannot block publishing of the rest of the site.
const THEME_SYNC_EXCLUSIONS = new Set([
  'child-support-calculator/index.html',
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

  if (THEME_SYNC_EXCLUSIONS.has(relative)) {
    skippedStandalone += 1;
    console.log(`Skipped standalone public tool during homepage theme sync: ${relative}`);
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
