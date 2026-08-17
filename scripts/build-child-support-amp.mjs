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
let calculator = fs.readFileSync(calculatorPath, 'utf8');

// amp-script runs in WorkerDOM, so avoid window-only APIs while preserving the calculation.
calculator = calculator
  .replace('if(combined>10000&&!window.confirm("Combined estimated monthly net income is more than $10,000. The statutory calculation continues above the guideline table, but higher-income cases should be reviewed by an attorney. Continue with the estimate?"))return;\n', '')
  .replace('$("calculator").addEventListener("reset",()=>setTimeout(()=>{$("result").hidden=true;updateOvernights();},0));', '$("resetCalculator").addEventListener("click",()=>{$("calculator").reset();$("result").hidden=true;$("overnightsB").value=183;});')
  .replace('$("calculator").addEventListener("submit",(event)=>{\n  event.preventDefault();', '$("calculateSupport").addEventListener("click",()=>{')
  .replace('$("print").addEventListener("click",()=>window.print());\n', '')
  .replace('$("result").focus();', '');

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
  // Normalize the existing wrapper instead of creating a nested amp-script.
  html = html.replace(calculatorScriptPattern, calculatorScriptOpen);
} else {
  // Older/non-AMP source: begin the WorkerDOM scope immediately before the calculator form.
  html = html.replace(/(?=<form\b[^>]*\bid=["']calculator["'][^>]*>)/i, `${calculatorScriptOpen}\n  `);
}

// Keep the calculator form AMP-valid on every rebuild. The button is type=button,
// so this action is a standards/AMP fallback rather than the calculation trigger.
html = html.replace(
  /<form\b[^>]*\bid=["']calculator["'][^>]*>/i,
  '<form id="calculator" method="get" action="/child-support-calculator/" target="_top">',
);

html = html.replace(/<button class="calculate"(?:\s+id="calculateSupport")?\s+type="submit">Calculate estimated support<\/button>/i, '<button class="calculate" id="calculateSupport" type="button">Calculate estimated support</button>');
html = html.replace(/<button class="calculate"\s+type="button">Calculate estimated support<\/button>/i, '<button class="calculate" id="calculateSupport" type="button">Calculate estimated support</button>');
html = html.replace(/<button class="reset"(?:\s+id="resetCalculator")?\s+type="reset">Clear calculator<\/button>/i, '<button class="reset" id="resetCalculator" type="button">Clear calculator</button>');
html = html.replace(/<button class="reset"\s+type="button">Clear calculator<\/button>/i, '<button class="reset" id="resetCalculator" type="button">Clear calculator</button>');
html = html.replace(/<p class="result-actions"><button type="button" id="print">Print estimate<\/button> <a /, '<p class="result-actions"><a ');

if (!alreadyWrapped) {
  // Close only the wrapper this build inserted; existing AMP source already has its own close.
  html = html.replace('</section>\n\n  <section class="details">', '</section>\n  </amp-script>\n\n  <section class="details">');
}

fs.writeFileSync(htmlPath, html);
console.log('Built AMP child support calculator and amp-script bundle.');
