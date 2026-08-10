import { readFile, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";

const START = "/* KT-LEATHER-STAMPED-THEME-V2-START */";
const END = "/* KT-LEATHER-STAMPED-THEME-V2-END */";

const theme = `${START}
:root{--kt-v2-leather:url('/img/dark-pebbled-leather-v2.webp');--kt-v2-gold:#c99537;--kt-v2-gold-light:#f7dea0;--kt-v2-gold-edge:#65400e;--kt-v2-shadow:#2a1603}
html{background:#020202}
body{color:#f7f1e4;background-color:#030303;background-image:linear-gradient(rgba(0,0,0,.08),rgba(0,0,0,.14)),var(--kt-v2-leather);background-size:auto,520px 520px;background-repeat:repeat;background-attachment:fixed}
p,li,dd,blockquote,main article{color:#f7f1e4}
.ampstart-headerbar{background-color:#030303;background-image:linear-gradient(rgba(0,0,0,.22),rgba(0,0,0,.34)),var(--kt-v2-leather);background-size:auto,420px 420px;border-bottom:1px solid #9b7326;box-shadow:0 2px 12px rgba(0,0,0,.72),inset 0 1px 0 rgba(255,255,255,.045)}
.ampstart-sidebar{background-color:#030303;background-image:linear-gradient(rgba(0,0,0,.2),rgba(0,0,0,.3)),var(--kt-v2-leather);background-size:auto,440px 440px;border-right:1px solid #8f6b1f;box-shadow:10px 0 30px rgba(0,0,0,.7)}
h1,h2,h3,h4,h5,h6,.ampstart-headerbar-home-link,.ampstart-navbar-trigger,.kt-sidebar-parent,.kt-sidebar-sub a,.ampstart-btn,.button,.btn,input[type='submit'],summary,amp-accordion>section>header,amp-accordion>section>h2,.ampstart-footer small{color:var(--kt-v2-gold);-webkit-text-fill-color:var(--kt-v2-gold);filter:none;text-shadow:0 -1px 0 var(--kt-v2-shadow),0 1px 0 var(--kt-v2-gold-light),1px 2px 0 var(--kt-v2-gold-edge),0 4px 4px #000}
.ampstart-headerbar-home-link{background:none;-webkit-background-clip:border-box;background-clip:border-box}
.kt-sidebar-sub{border-left-color:rgba(201,149,55,.48)}
.ampstart-btn,.button,.btn,input[type='submit']{border:1px solid #9b7326;background-color:#050505;background-image:linear-gradient(rgba(0,0,0,.14),rgba(0,0,0,.28)),var(--kt-v2-leather);background-size:auto,360px 360px;box-shadow:inset 0 0 0 1px rgba(255,224,125,.12),0 5px 14px rgba(0,0,0,.58)}
details.kt-acc,details[class*='acc'],.panel,.card,.box,.ampstart-card,amp-accordion>section{background-color:#040404;background-image:linear-gradient(rgba(0,0,0,.18),rgba(0,0,0,.26)),var(--kt-v2-leather);background-size:auto,460px 460px;border-color:#8e651e;box-shadow:0 6px 18px rgba(0,0,0,.58),inset 0 0 0 1px rgba(255,222,118,.08)}
details>summary,amp-accordion>section>header,amp-accordion>section>h2{background-color:transparent}
details.kt-acc>summary:after,details[class*='acc']>summary:after{content:'›';color:#f0d36f;font-family:Georgia,serif;font-size:2rem;font-weight:700;line-height:1;text-shadow:0 -1px 0 #2a1603,0 1px 0 #f7dea0,1px 2px 0 #65400e,0 4px 4px #000}
details.kt-acc[open]>summary:after,details[class*='acc'][open]>summary:after{content:'›';transform:rotate(90deg)}
fieldset{border-color:rgba(167,130,46,.65);background:rgba(3,3,3,.55)}
hr{border-color:rgba(201,149,55,.45)}
blockquote{border-left-color:#9b7326}
.ampstart-footer{border-top:1px solid #8f6b1f;background-color:rgba(0,0,0,.42)}
${END}`;

const files = execFileSync("rg", ["-l", "KT-SITEWIDE-METALLIC-LEATHER-START", "--glob", "*.html", "."], { encoding: "utf8" })
  .trim()
  .split("\n")
  .filter(Boolean)
  .sort();

for (const file of files) {
  const source = await readFile(file, "utf8");
  const existing = new RegExp(`${START.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s\\S]*?${END.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`);
  let updated;
  if (existing.test(source)) {
    updated = source.replace(existing, theme);
  } else {
    const anchor = "/* KT-SITEWIDE-METALLIC-LEATHER-END */";
    if (!source.includes(anchor)) throw new Error(`Theme anchor missing in ${file}`);
    updated = source.replace(anchor, `${anchor}\n${theme}`);
  }
  await writeFile(file, updated);
}

console.log(`Applied stamped leather theme to ${files.length} AMP pages.`);
