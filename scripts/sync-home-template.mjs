import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const homePath = path.join(root, 'index.html');
const targets = [
  'index.html',
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

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function extractBlock(source, start, end) {
  const match = source.match(new RegExp(`${escapeRe(start)}[\\s\\S]*?${escapeRe(end)}`));
  if (!match) throw new Error(`Missing source block ${start}`);
  return match[0];
}

function replaceBlock(source, start, end, replacement) {
  const re = new RegExp(`${escapeRe(start)}[\\s\\S]*?${escapeRe(end)}`);
  if (re.test(source)) return source.replace(re, replacement);
  const style = source.match(/<style\s+amp-custom(?:=["'][^"']*["'])?\s*>/i);
  if (!style) throw new Error('Missing amp-custom style');
  const close = source.indexOf('</style>', style.index + style[0].length);
  if (close < 0) throw new Error('Missing amp-custom closing tag');
  return source.slice(0, close) + '\n' + replacement + '\n' + source.slice(close);
}

function homepageAccordionChrome(chrome) {
  return chrome
    .replace('min-height:92px;margin:0;padding:18px 58px 18px 24px', 'min-height:112px;margin:0;padding:20px 62px 20px 26px')
    .replace('font-size:clamp(1rem,2vw,1.22rem)', 'font-size:clamp(1rem,2.25vw,1.35rem)')
    .replace("right:20px;top:50%;transform:translateY(-52%)", "right:22px;top:50%;transform:translateY(-50%)")
    .replace("transform:translateY(-52%) rotate(90deg)", "transform:translateY(-50%) rotate(90deg)")
    .replace('min-height:82px;padding:15px 46px 15px 18px;font-size:.98rem', 'min-height:104px;padding:17px 48px 17px 20px;font-size:.98rem')
    .replace('details.kt-acc>summary:after,details[class*=\'kt-acc\']>summary:after{right:14px}', 'details.kt-acc>summary:after,details[class*=\'kt-acc\']>summary:after{right:15px}');
}

function stripAccordionOverridesFromAlignment(source) {
  const start = '/* KT-HOMEPAGE-LEGACY-ALIGNMENT-START */';
  const end = '/* KT-HOMEPAGE-LEGACY-ALIGNMENT-END */';
  const re = new RegExp(`${escapeRe(start)}([\\s\\S]*?)${escapeRe(end)}`);
  const match = source.match(re);
  if (!match) return source;
  const cleaned = match[1]
    .split('\n')
    .filter((line) => !line.includes('details.kt-acc') && !line.includes('.kt-acc-hint'))
    .join('\n');
  return source.replace(re, `${start}${cleaned}${end}`);
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
  source = source.replace(currentHeader, `${header}\n${sidebar}`);
  return source;
}

function removeSummaryImages(source) {
  return source.replace(/<summary\b[\s\S]*?<\/summary>/gi, (summary) => summary
    .replace(/\s*<amp-img\b[\s\S]*?<\/amp-img>\s*(?:&nbsp;\s*)*/gi, '')
    .replace(/>\s*(?:&nbsp;\s*)+/i, '>'));
}

let home = fs.readFileSync(homePath, 'utf8');
home = stripAccordionOverridesFromAlignment(home);
const { header, sidebar } = extractHomeMarkup(home);
const themeStart = '/* KT-LEATHER-STAMPED-THEME-V2-START */';
const themeEnd = '/* KT-LEATHER-STAMPED-THEME-V2-END */';
const chromeStart = '/* KT-CANONICAL-SITE-CHROME-START */';
const chromeEnd = '/* KT-CANONICAL-SITE-CHROME-END */';
const theme = extractBlock(home, themeStart, themeEnd);
const chrome = homepageAccordionChrome(extractBlock(home, chromeStart, chromeEnd));

for (const relative of targets) {
  const file = path.join(root, relative);
  let html = fs.readFileSync(file, 'utf8');
  html = stripAccordionOverridesFromAlignment(html);
  html = replaceBlock(html, themeStart, themeEnd, theme);
  html = replaceBlock(html, chromeStart, chromeEnd, chrome);
  html = replaceHeaderAndSidebar(html, header, sidebar);
  html = removeSummaryImages(html);
  fs.writeFileSync(file, html);
  console.log(`Synced homepage template to ${relative}`);
}
