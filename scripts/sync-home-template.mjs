import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const homePath = path.join(root, 'index.html');
const targets = [
  'arrested/index.html',
  'child-custody/index.html',
  'clients/index.html',
  'criminal-defense/index.html',
  'criminal-defense-fort-myers/index.html',
  'criminal-defense-labelle/index.html',
  'criminal-defense-miami/index.html',
  'criminal-defense-naples/index.html',
  'divorce/index.html',
  'domestic-violence/index.html',
  'drug-charges/index.html',
  'dui/index.html',
  'felony-charges/index.html',
  'misdemeanor-charges/index.html',
  'reviews/index.html',
  'suspended-license/index.html',
  'traffic-offenses/index.html',
  'violation-of-probation/index.html',
];

function extractAmpCustom(source) {
  const match = source.match(/<style\s+amp-custom(?:=["'][^"']*["'])?\s*>([\s\S]*?)<\/style>/i);
  if (!match) throw new Error('Homepage amp-custom CSS not found');
  return match[1];
}

function replaceAmpCustom(source, css) {
  const re = /(<style\s+amp-custom(?:=["'][^"']*["'])?\s*>)[\s\S]*?(<\/style>)/i;
  if (!re.test(source)) throw new Error('Target amp-custom CSS not found');
  return source.replace(re, `$1\n${css}\n$2`);
}

function extractHomeMarkup(home) {
  const header = home.match(/<header class="ampstart-headerbar kt-home-header fixed left-0 right-0 top-0">[\s\S]*?<\/header>/i);
  const sidebar = home.match(/<amp-sidebar\b[^>]*id="header-sidebar"[^>]*>[\s\S]*?<\/amp-sidebar>/i);
  if (!header || !sidebar) throw new Error('Homepage header/sidebar not found');
  return { header: header[0], sidebar: sidebar[0] };
}

function replaceHeaderAndSidebar(source, header, sidebar) {
  source = source.replace(/<amp-sidebar\b[^>]*id="header-sidebar"[^>]*>[\s\S]*?<\/amp-sidebar>/i, '');
  const currentHeader = /<header\b[^>]*class="[^"]*ampstart-headerbar[^"]*"[^>]*>[\s\S]*?<\/header>/i;
  if (!currentHeader.test(source)) throw new Error('Expected site header not found');
  return source.replace(currentHeader, `${header}\n${sidebar}`);
}

function removeSummaryImages(source) {
  return source.replace(/<summary\b[\s\S]*?<\/summary>/gi, (summary) => summary
    .replace(/\s*<amp-img\b[\s\S]*?<\/amp-img>\s*(?:&nbsp;\s*)*/gi, '')
    .replace(/>\s*(?:&nbsp;\s*)+/i, '>'));
}

const home = fs.readFileSync(homePath, 'utf8');
const homeCss = extractAmpCustom(home);
const { header, sidebar } = extractHomeMarkup(home);

for (const relative of targets) {
  const file = path.join(root, relative);
  let html = fs.readFileSync(file, 'utf8');
  html = replaceAmpCustom(html, homeCss);
  html = replaceHeaderAndSidebar(html, header, sidebar);
  html = removeSummaryImages(html);
  fs.writeFileSync(file, html);
  console.log(`Synced exact homepage CSS/header/menu to ${relative}`);
}
