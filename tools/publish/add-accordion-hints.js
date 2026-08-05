'use strict';

const fs = require('fs');
const path = require('path');
const { ROOT } = require('./lib');

const HINT = '<p class="kt-acc-hint" role="note">Tap a heading to expand it.</p>';
const HINT_CSS = `
/* Mobile accordion expand hint */
.kt-acc-hint{color:#fff;font-size:.95rem;line-height:1.4;margin:.35rem 0 .85rem;padding:0 .15rem;opacity:.95}
`;

const SKIP = new Set(['test', 'node_modules', '.git', 'publish', 'tools', 'functions', 'content']);

function walkHtml(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    if (!path.relative(ROOT, dir) && SKIP.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkHtml(full, out);
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

function ensureCss(html) {
  if (html.includes('.kt-acc-hint{')) return html;
  if (html.includes('details.kt-acc{')) {
    return html.replace('details.kt-acc{', `${HINT_CSS.trim()}\ndetails.kt-acc{`);
  }
  if (html.includes('</style>')) {
    return html.replace('</style>', `${HINT_CSS}</style>`);
  }
  return html;
}

function injectHint(html) {
  if (!html.includes('details class="kt-acc"') && !html.includes("details class='kt-acc'")) {
    return { html, changed: false };
  }
  if (html.includes('kt-acc-hint')) {
    const withCss = ensureCss(html);
    return { html: withCss, changed: withCss !== html };
  }

  // Insert immediately before the first accordion details element
  const replaced = html.replace(
    /(<details class="kt-acc")/,
    `${HINT}\n$1`,
  );
  if (replaced === html) return { html, changed: false };
  return { html: ensureCss(replaced), changed: true };
}

function main() {
  const files = walkHtml(ROOT);
  let changedCount = 0;
  for (const file of files) {
    const rel = path.relative(ROOT, file);
    if (rel.startsWith('test') || rel === 'test.html' || rel === 'coms.html') continue;
    const original = fs.readFileSync(file, 'utf8');
    const { html, changed } = injectHint(original);
    if (changed) {
      fs.writeFileSync(file, html, 'utf8');
      changedCount += 1;
      console.log(`Hint added: ${rel}`);
    }
  }
  console.log(`Accordion hint pass complete. Updated ${changedCount} file(s).`);
}

main();
