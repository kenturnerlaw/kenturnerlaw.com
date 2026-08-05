'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {
  ROOT,
  CONTENT_DIR,
  slugify,
  bodyToSections,
  metaDescription,
  ensureDir,
} = require('./lib');
const { build } = require('./build');

const TMP_SLUG = '__publish-system-selftest__';
const TMP_FILE = path.join(CONTENT_DIR, `${TMP_SLUG}.json`);

function cleanup() {
  if (fs.existsSync(TMP_FILE)) fs.unlinkSync(TMP_FILE);
  const dirs = [
    path.join(ROOT, 'florida-criminal-defense-answers', TMP_SLUG),
    path.join(ROOT, 'updates', TMP_SLUG),
  ];
  for (const d of dirs) {
    if (fs.existsSync(d)) fs.rmSync(d, { recursive: true, force: true });
  }
}

function testSlugify() {
  assert.strictEqual(slugify('Should I Talk to Police?'), 'should-i-talk-to-police');
  assert.strictEqual(slugify("Don't Pay Yet!"), 'dont-pay-yet');
}

function testSections() {
  const short = bodyToSections('One paragraph only.');
  assert.strictEqual(short.length, 1);
  assert.strictEqual(short[0].heading, null);

  const headed = bodyToSections('Intro line.\n\n## First\n\nAlpha.\n\n## Second\n\nBeta.');
  assert.ok(headed.some((s) => s.heading === 'First'));
  assert.ok(headed.some((s) => s.heading === 'Second'));
}

function testMeta() {
  const d = metaDescription('Title', 'A short answer about Florida bond practice.', 'Collier');
  assert.ok(d.includes('Collier'));
  assert.ok(d.length <= 160);
}

function testBuildRoundTrip() {
  ensureDir(CONTENT_DIR);
  fs.writeFileSync(
    TMP_FILE,
    JSON.stringify(
      {
        type: 'answer',
        title: 'Publish System Self Test Question?',
        body:
          'This is a temporary self-test answer used only during tooling checks.\n\n## Why it matters\n\nLonger material stays behind an accordion so the first mobile view stays short.\n\n## Next step\n\nCall counsel about the facts of the case.',
        category: 'Arrest and court',
        county: 'Collier',
        slug: TMP_SLUG,
        datePublished: '2026-08-05',
        dateModified: '2026-08-05',
      },
      null,
      2,
    ),
  );

  build();

  const page = path.join(ROOT, 'florida-criminal-defense-answers', TMP_SLUG, 'index.html');
  assert.ok(fs.existsSync(page), 'generated AMP page missing');
  const html = fs.readFileSync(page, 'utf8');
  assert.ok(html.includes('<html amp'));
  assert.ok(html.includes('rel="canonical"'));
  assert.ok(html.includes('BreadcrumbList'));
  assert.ok(html.includes('Tap a heading to expand it.'));
  assert.ok(html.includes('datePublished'));
  assert.ok(fs.existsSync(path.join(ROOT, 'search', 'index.json')));
  assert.ok(fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8').includes(TMP_SLUG));

  cleanup();
  build();
  assert.ok(!fs.existsSync(page), 'orphan generated page was not removed');
}

function main() {
  cleanup();
  try {
    testSlugify();
    testSections();
    testMeta();
    testBuildRoundTrip();
    console.log('Publish tooling tests passed.');
  } catch (err) {
    cleanup();
    try {
      build();
    } catch (_) {
      /* ignore */
    }
    console.error(err);
    process.exit(1);
  }
}

main();
