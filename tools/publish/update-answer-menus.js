'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const GENERATED_ROOTS = [
  'florida-criminal-defense-answers',
  'florida-family-law-answers',
  'florida-traffic-ticket-answers',
  'florida-legal-answers',
  'updates',
];

const GENERATED_NAV = `<nav class="answer-nav" aria-label="Legal answers">
  <a href="/florida-criminal-defense-answers/">Criminal Defense Answers</a>
  <a href="/florida-family-law-answers/">Family Law Answers</a>
  <a href="/florida-traffic-ticket-answers/">Traffic Ticket Answers</a>
  <a href="/florida-legal-answers/">General Legal Answers</a>
  <a href="/updates/">Legal Updates</a>
</nav>`;

const SIDEBAR_ITEMS = `
      <li class="kt-sidebar-section">
        <span class="kt-sidebar-parent">Legal Answers</span>
        <ul class="kt-sidebar-sub">
          <li><a href="/florida-criminal-defense-answers/">Criminal Defense Answers</a></li>
          <li><a href="/florida-family-law-answers/">Family Law Answers</a></li>
          <li><a href="/florida-traffic-ticket-answers/">Traffic Ticket Answers</a></li>
          <li><a href="/florida-legal-answers/">General Legal Answers</a></li>
          <li><a href="/updates/">Legal Updates</a></li>
        </ul>
      </li>`;

function updateFile(file, updater) {
  if (!fs.existsSync(file)) return false;
  const before = fs.readFileSync(file, 'utf8');
  const after = updater(before);
  if (after === before) return false;
  fs.writeFileSync(file, after, 'utf8');
  console.log(`Updated menu: ${path.relative(ROOT, file)}`);
  return true;
}

function updateGenerated(html) {
  if (!html.includes('kt-generated-v2') && !html.includes('<p class="kicker">Answer Center</p>')) return html;
  if (html.includes('class="answer-nav"')) return html;
  return html.replace('</header><main', `</header>${GENERATED_NAV}<main`);
}

function updateExistingSidebar(html) {
  if (html.includes('/florida-family-law-answers/')) return html;

  const criminalItem = /<li class="kt-sidebar-section"><a href="\/florida-criminal-defense-answers\/"[^>]*>Florida Criminal Defense Answers<\/a><\/li>/;
  if (criminalItem.test(html)) {
    return html.replace(criminalItem, SIDEBAR_ITEMS.trim());
  }

  const reviewsItem = '<li class="kt-sidebar-section"><a href="/reviews/"';
  const index = html.indexOf(reviewsItem);
  if (index !== -1) return `${html.slice(0, index)}${SIDEBAR_ITEMS}\n      ${html.slice(index)}`;
  return html;
}

for (const rootName of GENERATED_ROOTS) {
  const root = path.join(ROOT, rootName);
  if (!fs.existsSync(root)) continue;
  const stack = [root];
  while (stack.length) {
    const dir = stack.pop();
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.name === 'index.html') updateFile(full, updateGenerated);
    }
  }
}

for (const rel of ['index.html', 'practice-areas/index.html', 'blog/index.html']) {
  updateFile(path.join(ROOT, rel), updateExistingSidebar);
}
