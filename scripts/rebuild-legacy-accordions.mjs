import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const start = '/* KT-HOMEPAGE-LEGACY-ALIGNMENT-START */';
const end = '/* KT-HOMEPAGE-LEGACY-ALIGNMENT-END */';

const files = [
  'index.html',
  'arrested/index.html',
  'child-custody/index.html',
  'clients/index.html',
  'criminal-defense/index.html',
  'criminal-defense-fort-myers/index.html',
  'criminal-defense-labelle/index.html',
  'criminal-defense-miami/index.html',
  'criminal-defense-naples/index.html',
  'divorce/index.html',
  'domestic-violence/index.html',
  'drug-charges/index.html',
  'dui/index.html',
  'felony-charges/index.html',
  'florida-criminal-defense-answers/index.html',
  'misdemeanor-charges/index.html',
  'reviews/index.html',
  'suspended-license/index.html',
  'test/index.html',
  'traffic-offenses/index.html',
  'violation-of-probation/index.html',
];

const css = `${start}
/* Bring legacy disclosure pages into the same leather, stamped-gold system as the home page. */
body:not(.kt-home-rebuild){background-color:#030303;background-image:linear-gradient(rgba(0,0,0,.10),rgba(0,0,0,.17)),var(--kt-v2-leather);background-size:auto,520px 520px}
body:not(.kt-home-rebuild)>.center{padding:0 18px}
body:not(.kt-home-rebuild) .ampstart-image-fullpage-hero{max-width:1060px;margin:18px auto 28px;border:1px solid #9b7326;box-shadow:0 18px 40px rgba(0,0,0,.72),inset 0 0 0 1px rgba(255,224,125,.10);overflow:hidden;background:#030303}
body:not(.kt-home-rebuild) .ampstart-image-fullpage-hero:after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,rgba(0,0,0,.08),rgba(0,0,0,.28));box-shadow:inset 0 0 55px rgba(0,0,0,.55)}
body:not(.kt-home-rebuild) .ampstart-image-fullpage-hero>figcaption{z-index:2}
body:not(.kt-home-rebuild) .ampstart-fullpage-hero-heading{max-width:820px;margin-left:auto;margin-right:auto}
body:not(.kt-home-rebuild) .ampstart-fullpage-hero-heading .h1{font-size:clamp(2rem,5vw,4.5rem);line-height:1.05;letter-spacing:.08em}
body:not(.kt-home-rebuild) .ampstart-fullpage-hero-heading h1,
body:not(.kt-home-rebuild) .ampstart-fullpage-hero-heading .h2{font-size:clamp(1.25rem,3vw,2.35rem);line-height:1.2}
body:not(.kt-home-rebuild) .ampstart-fullpage-hero-cta{display:block;max-width:620px;margin:28px auto 0;padding:16px 22px;border:2px solid #b8892f;background-color:#050505;background-image:linear-gradient(rgba(0,0,0,.08),rgba(0,0,0,.24)),var(--kt-v2-leather);background-size:auto,380px 380px;box-shadow:inset 0 0 0 1px rgba(255,224,125,.16),0 8px 20px rgba(0,0,0,.65)}
body:not(.kt-home-rebuild) main{max-width:980px;margin:0 auto;padding:0 18px 38px}
body:not(.kt-home-rebuild) main>article.px3{padding:0}
body:not(.kt-home-rebuild) .kt-acc-hint{text-align:center;color:#e8cd78;font-weight:700;letter-spacing:.05em;margin:8px 0 18px}
body:not(.kt-home-rebuild) details.kt-acc{margin:0 0 15px;border:1px solid #987126;background-color:#040404;background-image:linear-gradient(rgba(0,0,0,.15),rgba(0,0,0,.28)),var(--kt-v2-leather);background-size:auto,460px 460px;box-shadow:0 8px 22px rgba(0,0,0,.58),inset 0 0 0 1px rgba(255,222,118,.07);overflow:hidden}
body:not(.kt-home-rebuild) details.kt-acc>summary{display:flex;align-items:center;min-height:112px;margin:0;padding:20px 62px 20px clamp(155px,34vw,350px);font-size:clamp(1rem,2.25vw,1.35rem);line-height:1.28;letter-spacing:.075em;text-align:left;color:var(--kt-v2-gold);-webkit-text-fill-color:var(--kt-v2-gold);background-color:#050505;background-image:linear-gradient(90deg,rgba(0,0,0,.02) 0,rgba(0,0,0,.18) 23%,rgba(2,2,2,.88) 55%,rgba(2,2,2,.96) 100%),url('/img/old-hero.jpg'),var(--kt-v2-leather);background-repeat:no-repeat,no-repeat,repeat;background-position:center,left center,center;background-size:100% 100%,auto 100%,460px 460px;border:0;text-shadow:0 -1px 0 var(--kt-v2-shadow),0 1px 0 var(--kt-v2-gold-light),1px 2px 0 var(--kt-v2-gold-edge),0 4px 4px #000}
body:not(.kt-home-rebuild) details.kt-acc>summary:after{right:22px;top:50%;transform:translateY(-50%);color:#f0d36f}
body:not(.kt-home-rebuild) details.kt-acc[open]>summary:after{transform:translateY(-50%) rotate(90deg)}
body:not(.kt-home-rebuild) details.kt-acc>article,
body:not(.kt-home-rebuild) details.kt-acc>div{padding:22px 26px;background:rgba(2,2,2,.74);border-top:1px solid rgba(201,149,55,.42)}
body:not(.kt-home-rebuild) details.kt-acc p{font-family:Arial,Helvetica,sans-serif;font-size:1rem;line-height:1.7;color:#f7f1e4;text-transform:none;letter-spacing:normal}
body:not(.kt-home-rebuild) details.kt-acc a{color:#efd078;font-weight:700}
.kt-home-rebuild details.kt-acc{overflow:hidden}
.kt-home-rebuild details.kt-acc>summary{display:flex;align-items:center;min-height:112px;padding:20px 62px 20px clamp(155px,34vw,350px);text-align:left;background-color:#050505;background-image:linear-gradient(90deg,rgba(0,0,0,.02) 0,rgba(0,0,0,.18) 23%,rgba(2,2,2,.88) 55%,rgba(2,2,2,.96) 100%),url('/img/old-hero.jpg'),var(--kt-v2-leather);background-repeat:no-repeat,no-repeat,repeat;background-position:center,left center,center;background-size:100% 100%,auto 100%,460px 460px}
.kt-home-rebuild details.kt-acc>summary:after{right:22px;top:50%;transform:translateY(-50%)}
.kt-home-rebuild details.kt-acc[open]>summary:after{transform:translateY(-50%) rotate(90deg)}
@media(max-width:600px){
  body:not(.kt-home-rebuild)>.center{padding:0 8px}
  body:not(.kt-home-rebuild) .ampstart-image-fullpage-hero{margin-top:9px}
  body:not(.kt-home-rebuild) .ampstart-fullpage-hero-heading .h1{font-size:2rem}
  body:not(.kt-home-rebuild) .ampstart-fullpage-hero-heading h1,
  body:not(.kt-home-rebuild) .ampstart-fullpage-hero-heading .h2{font-size:1.2rem}
  body:not(.kt-home-rebuild) .ampstart-fullpage-hero-heading .h5,
  body:not(.kt-home-rebuild) .ampstart-fullpage-hero-heading .h6{font-size:.72rem;line-height:1.45}
  body:not(.kt-home-rebuild) main{padding-left:10px;padding-right:10px}
  body:not(.kt-home-rebuild) details.kt-acc>summary{min-height:104px;padding:17px 48px 17px 132px;font-size:.98rem;background-position:center,-24px center,center;background-size:100% 100%,auto 100%,420px 420px}
  body:not(.kt-home-rebuild) details.kt-acc>summary:after{right:15px}
  body:not(.kt-home-rebuild) details.kt-acc>article,
  body:not(.kt-home-rebuild) details.kt-acc>div{padding:18px}
  .kt-home-rebuild details.kt-acc>summary{min-height:104px;padding:17px 48px 17px 132px;background-position:center,-24px center,center;background-size:100% 100%,auto 100%,420px 420px}
  .kt-home-rebuild details.kt-acc>summary:after{right:15px}
}
${end}`;

for (const relative of files) {
  const file = path.join(root, relative);
  let html = fs.readFileSync(file, 'utf8');
  html = html.replace(new RegExp(`${start.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${end.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\n?`, 'g'), '');
  html = html.replace(/<summary\b[\s\S]*?<\/summary>/gi, (summary) => summary
    .replace(/\s*<amp-img\b[\s\S]*?<\/amp-img>\s*(?:&nbsp;\s*)*/gi, '')
    .replace(/>\s*(?:&nbsp;\s*)+/i, '>'));
  if (!/<style\s+amp-custom\b/i.test(html)) throw new Error(`Missing AMP custom style in ${relative}`);
  html = html.replace(/(<style\s+amp-custom\b[^>]*>[\s\S]*?)(<\/style>)/i, `$1${css}\n$2`);
  fs.writeFileSync(file, html);
  console.log(`Rebuilt ${relative}`);
}
