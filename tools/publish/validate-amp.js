'use strict';

const fs = require('fs');
const path = require('path');
const amphtmlValidator = require('amphtml-validator');

const ROOT = path.resolve(__dirname, '../..');
const SKIP_DIRS = new Set(['.git', '.github', 'node_modules', 'functions', 'tools', 'publish', 'content']);
const GENERATED_MARKERS = ['kt-generated-v2', 'kt-generated'];
const AMP_ONLY = process.argv.includes('--amp-only') || process.env.AMP_ONLY === '1';

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    if (dir === ROOT && SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.name === 'index.html') files.push(full);
  }
  return files;
}

function isAmp(html) {
  return /<html\b[^>]*(?:\samp(?:\s|>|=)|⚡)/i.test(html);
}

function seoErrors(html) {
  if (AMP_ONLY) return [];
  if (!GENERATED_MARKERS.some((marker) => html.includes(marker))) return [];
  const intentionallyNoIndex = /<meta\s+name="robots"\s+content="noindex,follow"/i.test(html);
  const required = [
    ['canonical', /<link\s+rel="canonical"\s+href="https:\/\/www\.kenturnerlaw\.com\//i],
    ['meta description', /<meta\s+name="description"\s+content="[^"]+"/i],
    ['robots directive', intentionallyNoIndex
      ? /<meta\s+name="robots"\s+content="noindex,follow"/i
      : /<meta\s+name="robots"\s+content="index,follow"/i],
    ['Open Graph title', /<meta\s+property="og:title"\s+content="[^"]+"/i],
    ['Open Graph description', /<meta\s+property="og:description"\s+content="[^"]+"/i],
    ['Open Graph URL', /<meta\s+property="og:url"\s+content="https:\/\/www\.kenturnerlaw\.com\//i],
    ['structured data', /<script\s+type="application\/ld\+json">/i],
  ];
  return required.filter(([, pattern]) => !pattern.test(html)).map(([label]) => `missing ${label}`);
}

async function main() {
  const files = walk(ROOT).filter((file) => isAmp(fs.readFileSync(file, 'utf8')));
  if (!files.length) {
    console.log('No AMP pages found.');
    return;
  }

  const validator = await amphtmlValidator.getInstance();
  let failed = 0;

  for (const file of files) {
    const html = fs.readFileSync(file, 'utf8');
    const result = validator.validateString(html);
    const errors = result.errors
      .filter((item) => item.severity === 'ERROR')
      .map((item) => `AMP line ${item.line}, col ${item.col}: ${item.message}`);
    errors.push(...seoErrors(html));

    if (errors.length) {
      failed += 1;
      console.error(`FAIL ${path.relative(ROOT, file)}`);
      for (const error of errors) console.error(`  - ${error}`);
    } else {
      console.log(`OK   ${path.relative(ROOT, file)}`);
    }
  }

  if (failed) {
    console.error(`${failed} AMP page(s) failed validation.`);
    process.exit(1);
  }
  console.log(`Validated ${files.length} AMP page(s) sitewide${AMP_ONLY ? ' (AMP only)' : ''}.`);
}

main().catch((error) => {
  console.error(error.stack || error.message || String(error));
  process.exit(1);
});
