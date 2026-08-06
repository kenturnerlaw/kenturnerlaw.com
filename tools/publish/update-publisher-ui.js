'use strict';

const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, '../../publish/index.html');
let html = fs.readFileSync(file, 'utf8');

const VERSION = '2.2.0';
const VERSION_LABEL = `Publisher v${VERSION} • SEO/AMP/Menu update`;

const darkCss = `
*{box-sizing:border-box}
body{margin:0;background:#050505 url('/dark-leather.webp');color:#fff;font-family:Arial,Helvetica,sans-serif;line-height:1.45;padding:max(14px,env(safe-area-inset-top)) 14px 48px;min-height:100vh}
.wrap{max-width:720px;margin:auto}
.panel{background:rgba(7,7,7,.94);border:1px solid #8b6b2e;padding:18px;margin:0 0 16px;box-shadow:0 8px 28px rgba(0,0,0,.35)}
h1,h2{font-family:Georgia,"Times New Roman",serif;margin:.2rem 0 1rem;color:#e4c36a}
h1{font-size:1.7rem}h2{font-size:1.25rem}
label{display:block;font-weight:700;margin:14px 0 5px;color:#fff}
input,textarea,select{width:100%;font:inherit;font-size:16px;padding:12px;border:1px solid #8b6b2e;background:#111;color:#fff;border-radius:2px}
input::placeholder,textarea::placeholder{color:#aaa}
select option{background:#111;color:#fff}
textarea{min-height:260px;resize:vertical}
.row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.toolbar{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}
.toolbar button{width:auto;margin:0;padding:8px 11px;background:#171717;color:#e4c36a;border:1px solid #8b6b2e}
.actions{display:flex;gap:10px;flex-wrap:wrap}.actions button{flex:1;min-width:130px}
button,.btn{display:block;width:100%;padding:13px;border:1px solid #e4c36a;background:#e4c36a;color:#050505;font:inherit;font-weight:700;cursor:pointer;text-decoration:none;text-align:center;margin-top:14px}
.secondary{background:#171717;color:#fff;border-color:#8b6b2e}.danger{background:#8b1e1e;color:#fff;border-color:#b33}
.hidden{display:none!important}.status{min-height:1.4em;margin-top:10px}.ok{color:#7ee08f}.err{color:#ff8d8d}.hint,.meta{font-size:.9rem;color:#c7c7c7}
.article{border-top:1px solid #57451f;padding:14px 0}.article:first-child{border-top:0}.article-title{font-family:Georgia,"Times New Roman",serif;font-size:1.08rem;font-weight:700;color:#e4c36a}
.article-actions{display:flex;gap:8px;flex-wrap:wrap}.article-actions button,.article-actions a{width:auto;margin:8px 0 0;padding:8px 10px;font-size:.9rem}
.search{margin-bottom:10px}.publisher-version{text-align:center;color:#c8ad65;font-size:.82rem;margin:16px 0 0;letter-spacing:.02em}
@media(max-width:560px){.row{grid-template-columns:1fr}.panel{padding:15px}body{padding-left:10px;padding-right:10px}}
`;

html = html.replace(/<style>[\s\S]*?<\/style>/, `<style>${darkCss}</style>`);

const versionMarkup = `<p id="publisher-version" class="publisher-version" data-version="${VERSION}">${VERSION_LABEL}</p>`;
if (html.includes('id="publisher-version"')) {
  html = html.replace(/<p id="publisher-version"[\s\S]*?<\/p>/, versionMarkup);
} else {
  html = html.replace('</div>\n<script>', `${versionMarkup}\n</div>\n<script>`);
}

fs.writeFileSync(file, html, 'utf8');
console.log(`Updated publisher UI to version ${VERSION}.`);
