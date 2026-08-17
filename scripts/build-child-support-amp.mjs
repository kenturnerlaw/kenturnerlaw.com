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

const runtime = '<script async src="https://cdn.ampproject.org/v0.js"></script>\n  <script async custom-element="amp-script" src="https://cdn.ampproject.org/v0/amp-script-0.1.js"></script>\n  <script async custom-element="amp-form" src="https://cdn.ampproject.org/v0/amp-form-0.1.js"></script>';
if (!html.includes('https://cdn.ampproject.org/v0.js')) {
  html = html.replace(/(<meta charset="utf-8">)/i, `$1\n  ${runtime}`);
} else if (!html.includes('custom-element="amp-form"')) {
  html = html.replace(/(<script async custom-element="amp-script"[^>]*><\/script>)/i, '$1\n  <script async custom-element="amp-form" src="https://cdn.ampproject.org/v0/amp-form-0.1.js"></script>');
}

const boilerplate = '<style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>';
if (!html.includes('amp-boilerplate')) {
  html = html.replace(/<\/head>/i, `  ${boilerplate}\n  <style amp-custom>${css}</style>\n</head>`);
}

html = html.replace('<form id="calculator">', '<amp-script layout="container" src="https://www.kenturnerlaw.com/child-support-calculator/calculator-amp.js">\n  <form id="calculator" method="get" action="/child-support-calculator/" target="_top">');
html = html.replace('<form id="calculator" onsubmit="return false">', '<form id="calculator" method="get" action="/child-support-calculator/" target="_top">');
html = html.replace('<button class="calculate" type="submit">Calculate estimated support</button>', '<button class="calculate" id="calculateSupport" type="button">Calculate estimated support</button>');
html = html.replace('<button class="reset" type="reset">Clear calculator</button>', '<button class="reset" id="resetCalculator" type="button">Clear calculator</button>');
html = html.replace(/<p class="result-actions"><button type="button" id="print">Print estimate<\/button> <a /, '<p class="result-actions"><a ');
html = html.replace('</section>\n\n  <section class="details">', '</section>\n  </amp-script>\n\n  <section class="details">');

fs.writeFileSync(htmlPath, html);
console.log('Built AMP child support calculator and amp-script bundle.');
