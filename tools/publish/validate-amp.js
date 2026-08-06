'use strict';

const fs = require('fs');
const path = require('path');
const amphtmlValidator = require('amphtml-validator');

const ROOT = path.resolve(__dirname, '../..');
const GENERATED_MARKERS = ['kt-generated-v2', 'kt-generated'];
const HUBS = [
  'florida-criminal-defense-answers',
  'florida-family-law-answers',
  'florida-traffic-ticket-answers',
  'florida-legal-answers',
  'updates',
];

function generatedFiles() {
  const files = [];
  for (const hub of HUBS) {
    const root = path.join(ROOT, hub);
    if (!fs.existsSync(root)) continue;
    const hubIndex = path.join(root, 'index.html');
    if (fs.existsSync(hubIndex)) files.push(hubIndex);
    for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const file = path.join(root, entry.name, 'index.html');
      if (!fs.existsSync(file)) continue;
      const html = fs.readFileSync(file, 'utf8');
      if (GENERATED_MARKERS.some((marker) => html.includes(marker))) files.push(file);
    }
  }
  return [...new Set(files)];
}

function seoErrors(html) {
  const required = [
    ['canonical', /<link\s+rel="canonical"\s+href="https:\/\/www\.kenturnerlaw\.com\//i],
    ['meta description', /<meta\s+name="description"\s+content="[^"]+"/i],
    ['robots index', /<meta\s+name="robots"\s+content="index,follow"/i],
    ['Open Graph title', /<meta\s+property="og:title"\s+content="[^"]+"/i],
    ['Open Graph description', /<meta\s+property="og:description"\s+content="[^"]+"/i],
    ['Open Graph URL', /<meta\s+property="og:url"\s+content="https:\/\/www\.kenturnerlaw\.com\//i],
    ['structured data', /<script\s+type="application\/ld\+json">/i],
  ];
  return required.filter(([, pattern]) => !pattern.test(html)).map(([label]) => `missing ${label}`);
}

async function main() {
  const files = generatedFiles();
  if (!files.length) {
    console.log('No generated AMP pages found.');
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
    console.error(`${failed} generated page(s) failed AMP or SEO validation.`);
    process.exit(1);
  }
  console.log(`Validated ${files.length} generated AMP page(s).`);
}

main().catch((error) => {
  console.error(error.stack || error.message || String(error));
  process.exit(1);
});
