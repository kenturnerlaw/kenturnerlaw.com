'use strict';

const fs = require('fs');
const path = require('path');
const { ROOT, GENERATED_MARKER, listPosts, postDir } = require('./lib');

const REQUIRED = [
  '<html amp',
  'cdn.ampproject.org/v0.js',
  'rel="canonical"',
  'amp-boilerplate',
  'amp-sidebar',
];

function checkFile(file) {
  const html = fs.readFileSync(file, 'utf8');
  const errors = [];
  for (const needle of REQUIRED) {
    if (!html.includes(needle)) errors.push(`missing ${needle}`);
  }
  if (!html.includes('Call (239) 400-FREE')) errors.push('missing shared phone banner');
  if (!html.includes('header-sidebar')) errors.push('missing sidebar id');
  if (html.includes('<script>') && !html.includes('application/ld+json') && !html.includes('application/json')) {
    // custom JS not allowed in AMP except amp components / ld+json
  }
  if (/<script(?![^>]*application\/(?:ld\+)?json)[^>]*>/i.test(html.replace(/<script async[^>]*src="https:\/\/cdn\.ampproject\.org\/[^"]+"[^>]*><\/script>/g, ''))) {
    // Strip amp CDN scripts then look for leftover custom scripts
    const stripped = html
      .replace(/<script async[^>]*src="https:\/\/cdn\.ampproject\.org\/[^"]+"[^>]*><\/script>/gi, '')
      .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/gi, '')
      .replace(/<script type="application\/json">[\s\S]*?<\/script>/gi, '');
    if (/<script[\s>]/i.test(stripped)) errors.push('contains non-AMP custom script');
  }
  return errors;
}

function main() {
  const posts = listPosts();
  const files = [
    path.join(ROOT, 'updates', 'index.html'),
    ...posts.map((p) => postDir(p)),
  ].filter((f) => fs.existsSync(f));

  // Also validate any generated marker pages under answers/
  const answersRoot = path.join(ROOT, 'florida-criminal-defense-answers');
  if (fs.existsSync(answersRoot)) {
    for (const entry of fs.readdirSync(answersRoot, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const f = path.join(answersRoot, entry.name, 'index.html');
      if (fs.existsSync(f) && fs.readFileSync(f, 'utf8').includes(GENERATED_MARKER)) {
        if (!files.includes(f)) files.push(f);
      }
    }
  }

  let failed = 0;
  for (const file of files) {
    const errors = checkFile(file);
    if (errors.length) {
      failed += 1;
      console.error(`FAIL ${path.relative(ROOT, file)}: ${errors.join('; ')}`);
    } else {
      console.log(`OK   ${path.relative(ROOT, file)}`);
    }
  }

  if (!files.length) {
    console.log('No generated AMP pages to validate yet (content/posts is empty).');
    return;
  }

  if (failed) {
    process.exit(1);
  }
  console.log(`Validated ${files.length} AMP page(s).`);
}

main();
