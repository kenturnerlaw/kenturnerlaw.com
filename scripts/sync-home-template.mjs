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

const TEMPLATE_START = '/* KT-HOME-TEMPLATE-START */';
const TEMPLATE_END = '/* KT-HOME-TEMPLATE-END */';

function extractManagedTemplate(home) {
  const start = home.indexOf(TEMPLATE_START);
  const end = home.indexOf(TEMPLATE_END);
  if (start === -1 || end === -1 || end < start) {
    throw new Error('Managed homepage template block not found');
  }
  return home.slice(start, end + TEMPLATE_END.length);
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

  const closeStyle = source.search(/<\/style>/i);
  if (closeStyle === -1) throw new Error('Target amp-custom closing style tag not found');
  return source.slice(0, closeStyle) + `\n\n${template}\n` + source.slice(closeStyle);
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

const home = fs.readFileSync(homePath, 'utf8');
const template = extractManagedTemplate(home);
const { header, sidebar } = extractHomeMarkup(home);

for (const relative of targets) {
  const file = path.join(root, relative);
  let html = fs.readFileSync(file, 'utf8');
  html = replaceOrAppendManagedTemplate(html, template);
  html = replaceHeaderAndSidebar(html, header, sidebar);
  fs.writeFileSync(file, html);
  console.log(`Synced managed homepage theme/header/menu to ${relative} without replacing page-specific CSS`);
}
