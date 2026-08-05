'use strict';

const fs = require('fs');
const path = require('path');
const {
  CONTENT_DIR,
  CATEGORIES,
  COUNTIES,
  ensureDir,
  slugify,
  todayISO,
  writeJson,
} = require('./lib');
const { build } = require('./build');

function usage() {
  console.log(`Usage:
  node tools/publish/add.js --title "Question or title" --body "Answer text" [--type answer|update] [--category "..."] [--county "..."] [--slug custom-slug]

Types: answer (default) | update
Categories: ${CATEGORIES.join(' | ')}
Counties: ${COUNTIES.join(' | ')}
`);
}

function argValue(args, name) {
  const i = args.indexOf(name);
  if (i === -1) return '';
  return args[i + 1] || '';
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    usage();
    process.exit(0);
  }

  const title = argValue(args, '--title').trim();
  const body = argValue(args, '--body').trim();
  const type = (argValue(args, '--type') || 'answer').trim().toLowerCase();
  const category = argValue(args, '--category').trim();
  const county = argValue(args, '--county').trim();
  let slug = argValue(args, '--slug').trim() || slugify(title);

  if (!title || !body) {
    usage();
    console.error('Error: --title and --body are required.');
    process.exit(1);
  }
  if (!['answer', 'update'].includes(type)) {
    console.error('Error: --type must be answer or update.');
    process.exit(1);
  }
  if (category && !CATEGORIES.includes(category)) {
    console.error(`Error: unknown category. Use one of: ${CATEGORIES.join(', ')}`);
    process.exit(1);
  }
  if (county && !COUNTIES.includes(county)) {
    console.error(`Error: unknown county. Use one of: ${COUNTIES.join(', ')}`);
    process.exit(1);
  }
  if (!slug) {
    console.error('Error: could not derive a URL slug from the title.');
    process.exit(1);
  }

  ensureDir(CONTENT_DIR);
  const file = path.join(CONTENT_DIR, `${slug}.json`);
  const now = todayISO();
  let datePublished = now;
  if (fs.existsSync(file)) {
    const existing = JSON.parse(fs.readFileSync(file, 'utf8'));
    datePublished = existing.datePublished || now;
  }

  const post = {
    type,
    title,
    body,
    category: category || '',
    county: county || '',
    slug,
    datePublished,
    dateModified: now,
  };

  writeJson(file, post);
  console.log(`Saved content/posts/${slug}.json`);
  build();
  console.log(`Published path: ${type === 'update' ? `/updates/${slug}/` : `/florida-criminal-defense-answers/${slug}/`}`);
}

main();
