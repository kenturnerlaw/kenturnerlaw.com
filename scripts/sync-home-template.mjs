import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const homePath = path.join(root, 'index.html');
const sitemapPath = path.join(root, 'sitemap.xml');

const TEMPLATE_START = '/* KT-HOME-TEMPLATE-START */';
const TEMPLATE_END = '/* KT-HOME-TEMPLATE-END */';

const OBSOLETE_THEME_BLOCKS = [
  ['/* KT-LEATHER-STAMPED-THEME-V2-START */', '/* KT-LEATHER-STAMPED-THEME-V2-END */'],
  ['/* KT-CANONICAL-SITE-CHROME-START */', '/* KT-CANONICAL-SITE-CHROME-END */'],
];

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
  if (!header || !sidebar) throw new Error('Homepage header/sidebar not found');
  return { header: header[0], sidebar: sidebar[0] };
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

function replaceHeaderAndSidebar(source, header, sidebar) {
  const existingSidebar = /<amp-sidebar\b[^>]*id="header-sidebar"[^>]*>[\s\S]*?<\/amp-sidebar>/i;
  source = source.replace(existingSidebar, '');

  // Consume all whitespace left around the old chrome and restore exactly one
  // newline after the canonical header/sidebar. This makes repeated syncs stable.
  const ampHeader = /<header\b[^>]*class="[^"]*ampstart-headerbar[^"]*"[^>]*>[\s\S]*?<\/header>\s*/i;
  if (ampHeader.test(source)) {
    return source.replace(ampHeader, `${header}\n${sidebar}\n`);
  }

  const simpleTopHeader = /<header\b[^>]*class=["']top["'][^>]*>[\s\S]*?<\/header>\s*/i;
  if (simpleTopHeader.test(source)) {
    return source.replace(simpleTopHeader, `${header}\n${sidebar}\n`);
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

const home = fs.readFileSync(homePath, 'utf8');
const template = extractManagedTemplate(home);
const { header, sidebar } = extractHomeMarkup(home);
const targets = publicTargetsFromSitemap();

let synced = 0;
for (const relative of targets) {
  const file = path.join(root, relative);
  let html = fs.readFileSync(file, 'utf8');

  if (!/<html\s+amp(?:\s|>)/i.test(html)) {
    throw new Error(`Public sitemap target is not AMP: ${relative}`);
  }

  html = removeObsoleteThemeBlocks(html);
  html = replaceOrAppendManagedTemplate(html, template);
  html = ensureAmpSidebarExtension(html);
  html = replaceHeaderAndSidebar(html, header, sidebar);
  fs.writeFileSync(file, html);
  synced += 1;
  console.log(`Synced managed homepage theme/header/menu to ${relative} without replacing page-specific CSS`);
}

console.log(`Managed theme coverage complete: ${synced} public AMP pages plus homepage source.`);
