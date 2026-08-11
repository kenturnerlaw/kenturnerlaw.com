import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const targets = ['scripts/clean-home-template.mjs', 'index.html'];

function replaceRequired(source, from, to, label) {
  if (!source.includes(from)) throw new Error(`Missing ${label}`);
  return source.replace(from, to);
}

for (const relative of targets) {
  const file = path.join(root, relative);
  let s = fs.readFileSync(file, 'utf8');

  s = replaceRequired(
    s,
    "body.kt-home-rebuild .kt-home-hero{position:relative;overflow:hidden;border-bottom:2px solid #9f7427;",
    "body.kt-home-rebuild .kt-home-hero{position:relative;overflow:hidden;border-bottom:1px solid rgba(255,255,255,.08);",
    `${relative}: homepage hero gold outline`
  );

  s = replaceRequired(
    s,
    "body:not(.kt-home-rebuild) .ampstart-image-fullpage-hero{max-width:1060px;margin:18px auto 28px;border:1px solid #9b7326;box-shadow:0 18px 40px rgba(0,0,0,.72),inset 0 0 0 1px rgba(255,224,125,.10);",
    "body:not(.kt-home-rebuild) .ampstart-image-fullpage-hero{max-width:1060px;margin:18px auto 28px;border:0;box-shadow:0 18px 40px rgba(0,0,0,.72);",
    `${relative}: interior hero gold outline`
  );

  s = replaceRequired(
    s,
    "body:not(.kt-home-rebuild) .ampstart-fullpage-hero-cta{display:block;max-width:620px;margin:28px auto 0;padding:16px 22px;border:2px solid #b8892f;",
    "body:not(.kt-home-rebuild) .ampstart-fullpage-hero-cta{display:block;max-width:620px;margin:28px auto 0;padding:16px 22px;border:1px solid rgba(255,255,255,.18);border-radius:14px;",
    `${relative}: hero CTA gold outline`
  );

  s = replaceRequired(
    s,
    "details.kt-acc{margin:0 0 15px;border:1px solid #987126;background-color:#040404;background-image:linear-gradient(rgba(0,0,0,.15),rgba(0,0,0,.28)),var(--kt-leather);background-size:auto,460px 460px;box-shadow:0 8px 22px rgba(0,0,0,.58),inset 0 0 0 1px rgba(255,222,118,.07);overflow:hidden}",
    "details.kt-acc{margin:0 0 17px;border:0;background:transparent;box-shadow:none;overflow:visible}",
    `${relative}: accordion outer gold frame`
  );

  const oldSummary = "details.kt-acc>summary{list-style:none;cursor:pointer;position:relative;display:flex;align-items:center;min-height:112px;margin:0;padding:20px 62px 20px 26px;color:var(--kt-gold);-webkit-text-fill-color:var(--kt-gold);font-family:'Playfair Display SC',Georgia,serif;font-size:clamp(1rem,2.25vw,1.35rem);font-weight:700;line-height:1.28;letter-spacing:.075em;text-align:left;background-color:#050505;background-image:linear-gradient(90deg,rgba(0,0,0,.18),rgba(0,0,0,.42)),var(--kt-leather);background-repeat:no-repeat,repeat;background-position:center,center;background-size:100% 100%,460px 460px;border:0;text-shadow:0 -1px 0 var(--kt-shadow),0 1px 0 var(--kt-gold-light),1px 2px 0 var(--kt-gold-edge),0 4px 4px #000}";
  const newSummary = "details.kt-acc>summary{list-style:none;cursor:pointer;position:relative;display:flex;align-items:center;min-height:94px;margin:0;padding:18px 60px 18px 24px;color:var(--kt-gold);-webkit-text-fill-color:var(--kt-gold);font-family:'Playfair Display SC',Georgia,serif;font-size:clamp(1rem,2.1vw,1.28rem);font-weight:700;line-height:1.28;letter-spacing:.07em;text-align:left;background-color:#090909;background-image:radial-gradient(ellipse at 50% -15%,rgba(255,255,255,.16),transparent 45%),linear-gradient(180deg,rgba(255,255,255,.075) 0%,rgba(255,255,255,.02) 24%,rgba(0,0,0,.10) 58%,rgba(0,0,0,.38) 100%),var(--kt-leather);background-repeat:no-repeat,no-repeat,repeat;background-position:center;background-size:100% 100%,100% 100%,460px 460px;border:1px solid rgba(210,214,220,.15);border-radius:16px;text-shadow:0 -1px 0 var(--kt-shadow),0 1px 0 var(--kt-gold-light),1px 2px 0 var(--kt-gold-edge),0 4px 4px #000;box-shadow:inset 0 2px 2px rgba(255,255,255,.13),inset 0 -5px 8px rgba(0,0,0,.52),0 8px 14px rgba(0,0,0,.56),0 2px 2px rgba(0,0,0,.48);transform:translateY(0)}";
  s = replaceRequired(s, oldSummary, newSummary, `${relative}: accordion cushion face`);

  s = replaceRequired(
    s,
    "details.kt-acc[open]>summary:after{transform:translateY(-50%) rotate(90deg)}",
    "details.kt-acc[open]>summary{transform:translateY(2px);box-shadow:inset 0 2px 5px rgba(0,0,0,.52),inset 0 -1px 0 rgba(255,255,255,.08),0 3px 7px rgba(0,0,0,.42)}details.kt-acc[open]>summary:after{transform:translateY(-50%) rotate(90deg)}",
    `${relative}: pressed open state`
  );

  s = replaceRequired(
    s,
    "details.kt-acc>article,details.kt-acc>div{padding:22px 26px;color:#f7f1e4;background-color:#040404;background-image:linear-gradient(rgba(1,1,1,.48),rgba(1,1,1,.58)),var(--kt-leather);background-size:auto,460px 460px;border-top:1px solid rgba(201,149,55,.42)}",
    "details.kt-acc>article,details.kt-acc>div{margin:4px 10px 0;padding:22px 26px;color:#f7f1e4;background-color:#040404;background-image:linear-gradient(rgba(1,1,1,.50),rgba(1,1,1,.62)),var(--kt-leather);background-size:auto,460px 460px;border:0;border-radius:0 0 12px 12px;box-shadow:inset 0 1px 0 rgba(255,255,255,.04)}",
    `${relative}: expanded panel gold divider`
  );

  s = replaceRequired(
    s,
    "@media(max-width:600px){body:not(.kt-home-rebuild)>.center{padding:0 8px}body:not(.kt-home-rebuild) .ampstart-image-fullpage-hero{margin-top:9px}body:not(.kt-home-rebuild) .ampstart-fullpage-hero-heading .h1{font-size:2rem}body:not(.kt-home-rebuild) .ampstart-fullpage-hero-heading h1,body:not(.kt-home-rebuild) .ampstart-fullpage-hero-heading .h2{font-size:1.2rem}body:not(.kt-home-rebuild) .ampstart-fullpage-hero-heading .h5,body:not(.kt-home-rebuild) .ampstart-fullpage-hero-heading .h6{font-size:.72rem;line-height:1.45}body:not(.kt-home-rebuild) main{padding-left:10px;padding-right:10px}details.kt-acc>summary{min-height:104px;padding:17px 48px 17px 20px;font-size:.98rem;background-size:100% 100%,420px 420px}details.kt-acc>summary:after{right:15px}details.kt-acc>article,details.kt-acc>div{padding:18px}}",
    "@media(max-width:600px){body:not(.kt-home-rebuild)>.center{padding:0 8px}body:not(.kt-home-rebuild) .ampstart-image-fullpage-hero{margin-top:9px}body:not(.kt-home-rebuild) .ampstart-fullpage-hero-heading .h1{font-size:2rem}body:not(.kt-home-rebuild) .ampstart-fullpage-hero-heading h1,body:not(.kt-home-rebuild) .ampstart-fullpage-hero-heading .h2{font-size:1.2rem}body:not(.kt-home-rebuild) .ampstart-fullpage-hero-heading .h5,body:not(.kt-home-rebuild) .ampstart-fullpage-hero-heading .h6{font-size:.72rem;line-height:1.45}body:not(.kt-home-rebuild) main{padding-left:10px;padding-right:10px}details.kt-acc>summary{min-height:82px;padding:15px 46px 15px 18px;font-size:.98rem;border-radius:14px;background-size:100% 100%,100% 100%,420px 420px}details.kt-acc>summary:after{right:15px}details.kt-acc>article,details.kt-acc>div{margin-left:7px;margin-right:7px;padding:18px}}",
    `${relative}: mobile cushion sizing`
  );

  fs.writeFileSync(file, s);
  console.log(`Migrated cushioned leather controls in ${relative}`);
}
