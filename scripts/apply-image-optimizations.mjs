import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const skip = new Set(['.git', '.github', 'node_modules', 'functions', 'tools', 'publish', 'content']);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    if (dir === root && skip.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.name === 'index.html') files.push(full);
  }
  return files;
}

let changed = 0;
for (const file of walk(root)) {
  const before = fs.readFileSync(file, 'utf8');
  let html = before
    .replaceAll('dark-pebbled-leather-v2.jpg', 'dark-pebbled-leather-v2.webp')
    .replaceAll('hero.png', 'hero-optimized.webp')
    .replaceAll('herologo-gold-310.webp', 'herologo-gold-220.webp');

  if (file === path.join(root, 'index.html')) {
    html = html.replace(
      /<link rel="preload" fetchpriority="high" as="image" href="img\/centered-crop\.png" type="image\/png" imagesizes="100vw">/,
      '<link rel="preload" fetchpriority="high" as="image" href="img/hero-optimized.webp" type="image/webp" imagesizes="100vw">',
    );
    html = html.replace(
      '<amp-img width="1440" height="720" layout="responsive" src="img/hero-optimized.webp" alt="">',
      '<amp-img width="1440" height="720" layout="responsive" src="img/hero-optimized.webp" data-hero alt="">',
    );
  }

  if (html !== before) {
    fs.writeFileSync(file, html);
    changed += 1;
    console.log(`Optimized references: ${path.relative(root, file)}`);
  }
}

const themeScript = path.join(root, 'scripts', 'apply-sitewide-theme.mjs');
if (fs.existsSync(themeScript)) {
  const before = fs.readFileSync(themeScript, 'utf8');
  const after = before.replaceAll('dark-pebbled-leather-v2.jpg', 'dark-pebbled-leather-v2.webp');
  if (after !== before) fs.writeFileSync(themeScript, after);
}

console.log(`Image optimization complete: ${changed} page(s) updated.`);
