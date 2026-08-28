'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const SKIP_DIRS = new Set([
  '.git', '.github', 'node_modules', 'functions', 'tools', 'publish', 'content',
]);

const BOILERPLATE = '<style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>';

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    if (dir === ROOT && SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name === 'index.html') out.push(full);
  }
  return out;
}

function isAmp(html) {
  return /<html\b[^>]*(?:\samp(?:\s|>|=)|⚡)/i.test(html);
}

function repair(file) {
  let html = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
  if (!isAmp(html)) return false;
  const before = html;

  const doctype = html.search(/<!doctype\s+html>/i);
  if (doctype >= 0) html = html.slice(doctype);
  else html = `<!doctype html>\n${html}`;

  html = html.replace(/<html\b([^>]*)>/i, (match, attrs) => {
    const cleaned = attrs.replace(/\s(?:amp|⚡)(?:=(?:""|'')|\b)?/gi, '').trim();
    return `<html amp${cleaned ? ` ${cleaned}` : ''}>`;
  });

  html = html.replace(/\s*!important\b/gi, '');

  // AMP permits each extension loader only once. Keep the first loader for a
  // custom element and remove later copies that older page templates added.
  const loadedExtensions = new Set();
  html = html.replace(
    /<script\b[^>]*\bcustom-element\s*=\s*(?:["']([^"']+)["']|([^\s>]+))[^>]*>\s*<\/script>/gi,
    (script, quotedName, bareName) => {
      const extension = (quotedName || bareName || '').toLowerCase();
      if (!extension || !loadedExtensions.has(extension)) {
        loadedExtensions.add(extension);
        return script;
      }
      return '';
    },
  );

  html = html.replace(/<noscript>\s*<style\b[^>]*amp-boilerplate[^>]*>[\s\S]*?<\/style>\s*<\/noscript>/gi, '');
  html = html.replace(/<style\b[^>]*amp-boilerplate[^>]*>[\s\S]*?<\/style>/gi, '');

  html = html.replace(/\s*<\/head>/i, `\n${BOILERPLATE}\n</head>`);

  html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, (script) => {
    if (/\btype\s*=\s*["']application\/(?:ld\+json|json)["']/i.test(script)) return script;
    if (/\bsrc\s*=\s*(?:["']https:\/\/cdn\.ampproject\.org\/|https:\/\/cdn\.ampproject\.org\/)/i.test(script)) return script;
    return '';
  });

  if (html !== before) {
    fs.writeFileSync(file, html, 'utf8');
    console.log(`Repaired AMP: ${path.relative(ROOT, file)}`);
    return true;
  }
  return false;
}

const files = walk(ROOT);
let changed = 0;
for (const file of files) if (repair(file)) changed += 1;
console.log(`AMP repair complete: ${changed} file(s) changed, ${files.length} index page(s) inspected.`);
