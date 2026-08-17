import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dir = path.join(root, 'child-support-calculator');
const htmlPath = path.join(dir, 'index.html');
const cssPath = path.join(dir, 'calculator.css');
const guidelinesPath = path.join(dir, 'guidelines.js');
const calculatorPath = path.join(dir, 'calculator.js');
const bundlePath = path.join(dir, 'calculator-amp.js');

const css = fs.readFileSync(cssPath, 'utf8');
const guidelines = fs.readFileSync(guidelinesPath, 'utf8');
const calculator = fs.readFileSync(calculatorPath, 'utf8');

// The calculator source itself is AMP/WorkerDOM-safe. Keep the generated bundle
// identical to the maintained source instead of rewriting behavior during build.
fs.writeFileSync(bundlePath, `${guidelines}\n${calculator}`);

let html = fs.readFileSync(htmlPath, 'utf8');
html = html.replace(/<html(?:\s+amp)?\s+lang="en">/i, '<html amp lang="en">');
html = html.replace(/<meta name="viewport"[^>]*>/i, '<meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">');
html = html.replace(/\s*<link rel="stylesheet" href="\/child-support-calculator\/calculator\.css">\s*/i, '\n');
html = html.replace(/\s*<script src="\/child-support-calculator\/guidelines\.js"><\/script>\s*<script src="\/child-support-calculator\/calculator\.js"><\/script>\s*/i, '\n');

const ampRuntime = '<script async src="https://cdn.ampproject.org/v0.js"></script>';
const ampScriptExtension = '<script async custom-element="amp-script" src="https://cdn.ampproject.org/v0/amp-script-0.1.js"></script>';
const ampFormExtension = '<script async custom-element="amp-form" src="https://cdn.ampproject.org/v0/amp-form-0.1.js"></script>';

if (!html.includes('https://cdn.ampproject.org/v0.js')) {
  html = html.replace(/(<meta charset="utf-8">)/i, `$1\n  ${ampRuntime}`);
}
if (!/custom-element=["']amp-script["']/i.test(html)) {
  html = html.replace(/<\/head>/i, `  ${ampScriptExtension}\n</head>`);
}
if (!/custom-element=["']amp-form["']/i.test(html)) {
  html = html.replace(/<\/head>/i, `  ${ampFormExtension}\n</head>`);
}

const boilerplate = '<style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>';
if (!html.includes('amp-boilerplate')) {
  html = html.replace(/<\/head>/i, `  ${boilerplate}\n  <style amp-custom>${css}</style>\n</head>`);
}

const calculatorScriptOpen = '<amp-script layout="container" sandbox="allow-forms" src="https://www.kenturnerlaw.com/child-support-calculator/calculator-amp.js">';
const calculatorScriptPattern = /<amp-script\b[^>]*\bsrc=["']https:\/\/www\.kenturnerlaw\.com\/child-support-calculator\/calculator-amp\.js["'][^>]*>/i;
const alreadyWrapped = calculatorScriptPattern.test(html);

if (alreadyWrapped) {
  html = html.replace(calculatorScriptPattern, calculatorScriptOpen);
} else {
  html = html.replace(/(?=<form\b[^>]*\bid=["']calculator["'][^>]*>)/i, `${calculatorScriptOpen}\n  `);
}

html = html.replace(
  /<form\b[^>]*\bid=["']calculator["'][^>]*>/i,
  '<form id="calculator" method="get" action="/child-support-calculator/" target="_top">',
);

function liveTaxCard(side) {
  return `<div class="math-card live-tax-card" aria-live="polite">
              <h3>Live tax and net-income estimate</h3>
              <div class="math-row"><span>Federal tax / month</span><strong id="liveFederal${side}">$0</strong></div>
              <div class="math-row"><span>Social Security / month</span><strong id="liveSS${side}">$0</strong></div>
              <div class="math-row"><span>Medicare / month</span><strong id="liveMedicare${side}">$0</strong></div>
              <div class="math-row total"><span>Total estimated taxes / month</span><strong id="liveTaxes${side}">$0</strong></div>
              <div class="math-row total"><span>Estimated net income / month</span><strong id="liveNet${side}">$0</strong></div>
            </div>`;
}

for (const side of ['A', 'B']) {
  if (!html.includes(`id="liveTaxes${side}"`)) {
    const alimonyLabel = new RegExp(`(<label>Court-ordered alimony actually paid[\\s\\S]*?<input id="alimony${side}"[\\s\\S]*?<\\/label>)`, 'i');
    if (!alimonyLabel.test(html)) {
      throw new Error(`Could not locate Parent ${side} alimony field for live tax card`);
    }
    html = html.replace(alimonyLabel, `$1\n            ${liveTaxCard(side)}`);
  }
}

html = html.replace(
  /<p class="help">Enter Parent A's overnights\. Parent B updates automatically so the total is 365\.<\/p>/i,
  "<p class=\"help\">Enter either parent's overnights. The other parent updates automatically so the total is always 365.</p>",
);
html = html.replace(
  /<input id="overnightsB"[^>]*>/i,
  '<input id="overnightsB" inputmode="numeric" type="number" min="0" max="365" step="1" value="183">',
);

html = html.replace(
  /<button class="calculate"(?:\s+id="calculateSupport")?\s+type="(?:submit|button)">(?:Calculate estimated support|Calculate &amp; show the math)<\/button>/i,
  '<button class="calculate" id="calculateSupport" type="button">Calculate &amp; show the math</button>',
);
html = html.replace(
  /<button class="reset"(?:\s+id="resetCalculator")?\s+type="(?:reset|button)">Clear calculator<\/button>/i,
  '<button class="reset" id="resetCalculator" type="button">Clear calculator</button>',
);
html = html.replace(/<p class="result-actions"><button type="button" id="print">Print estimate<\/button> <a /, '<p class="result-actions"><a ');

if (!alreadyWrapped) {
  html = html.replace('</section>\n\n  <section class="details">', '</section>\n  </amp-script>\n\n  <section class="details">');
}

fs.writeFileSync(htmlPath, html);
console.log('Built AMP child support calculator with live tax estimates and two-way overnight syncing.');
