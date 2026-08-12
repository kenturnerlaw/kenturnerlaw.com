from pathlib import Path

home = Path('index.html')
s = home.read_text()

replacements = [
    (
        "body:not(.kt-home-rebuild) .ampstart-image-fullpage-hero{max-width:1060px;margin:18px auto 28px;border:0;box-shadow:0 18px 40px rgba(0,0,0,.72);overflow:hidden;background-color:#050505;background-image:linear-gradient(rgba(0,0,0,.12),rgba(0,0,0,.22)),var(--kt-leather);background-size:auto,auto}",
        "body:not(.kt-home-rebuild) .ampstart-image-fullpage-hero{max-width:1060px;margin:18px auto 28px;border:0;box-shadow:0 18px 40px rgba(0,0,0,.72);overflow:hidden;background-color:#020202;background-image:var(--kt-leather);background-size:auto;background-repeat:repeat;background-position:center top}",
        "legacy hero background",
    ),
    (
        "body:not(.kt-home-rebuild) .ampstart-image-fullpage-hero>amp-img{opacity:.18}",
        "body:not(.kt-home-rebuild) .ampstart-image-fullpage-hero>amp-img{display:none}",
        "legacy hero image",
    ),
    (
        "body:not(.kt-home-rebuild) .ampstart-image-fullpage-hero:after{content:\"\";position:absolute;inset:0;pointer-events:none;background:linear-gradient(90deg,rgba(0,0,0,.44) 0%,rgba(0,0,0,.27) 52%,rgba(0,0,0,.12) 100%),linear-gradient(0deg,rgba(5,5,5,.48) 0%,transparent 35%);box-shadow:inset 0 0 55px rgba(0,0,0,.55)}",
        "body:not(.kt-home-rebuild) .ampstart-image-fullpage-hero:after{content:\"\";position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at 42% 0%,rgba(255,255,255,.035) 0%,rgba(255,255,255,.01) 22%,transparent 44%),linear-gradient(180deg,rgba(0,0,0,.03),rgba(0,0,0,.18))}",
        "legacy hero wash",
    ),
    (
        "body:not(.kt-home-rebuild) .ampstart-fullpage-hero-cta{display:block;max-width:620px;margin:28px auto 0;padding:16px 22px;border:1px solid rgba(255,255,255,.18);border-radius:14px;color:var(--kt-gold);background-color:#050505;background-image:linear-gradient(rgba(0,0,0,.08),rgba(0,0,0,.24)),var(--kt-leather);background-size:auto,auto;box-shadow:inset 0 0 0 1px rgba(255,224,125,.16),0 8px 20px rgba(0,0,0,.65)}",
        "body:not(.kt-home-rebuild) .ampstart-fullpage-hero-cta{display:block;max-width:620px;margin:28px auto 0;padding:16px 22px;border:1px solid rgba(255,255,255,.24);border-radius:999px;color:#fff;-webkit-text-fill-color:#fff;background-color:#080808;background-image:linear-gradient(180deg,rgba(255,255,255,.07),rgba(255,255,255,.015) 28%,rgba(0,0,0,.24)),var(--kt-leather);background-size:100% 100%,auto;background-repeat:no-repeat,repeat;text-shadow:none;box-shadow:inset 0 1px 0 rgba(255,255,255,.24),inset 0 -3px 5px rgba(0,0,0,.34),0 7px 16px rgba(0,0,0,.54)}",
        "legacy hero CTA",
    ),
]

for old, new, label in replacements:
    count = s.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected 1 match, found {count}')
    s = s.replace(old, new, 1)

marker = '/* Shared footer */'
if marker not in s:
    raise SystemExit('shared footer marker not found')
if '/* Interior page compatibility */' in s:
    raise SystemExit('interior compatibility block already exists')

compatibility = '''/* Interior page compatibility */
body:not(.kt-home-rebuild) main h1{color:#e4c36a;-webkit-text-fill-color:#e4c36a}
.answer-nav{background-color:#050505;background-image:linear-gradient(180deg,rgba(255,255,255,.02),rgba(0,0,0,.16)),var(--kt-leather);background-size:100% 100%,auto;background-repeat:no-repeat,repeat;border-bottom:1px solid rgba(201,149,55,.45)}
.answer-nav a{color:#efd078;-webkit-text-fill-color:#efd078}
.page .crumbs,.page .kicker,.page .meta,.page article p{color:#f2eee4;-webkit-text-fill-color:#f2eee4}.page .crumbs a{color:#efd078}.page article{border-color:rgba(201,149,55,.38)}
body.kt-traffic-hub .hero{background-color:#020202;background-image:radial-gradient(ellipse at 42% 0%,rgba(255,255,255,.035),transparent 42%),var(--kt-leather);background-size:100% 100%,auto;background-repeat:no-repeat,repeat}
body.kt-traffic-hub .panel,body.kt-traffic-hub .card{background-color:#050505;background-image:linear-gradient(180deg,rgba(255,255,255,.02),rgba(0,0,0,.20)),var(--kt-leather);background-size:100% 100%,auto;background-repeat:no-repeat,repeat}
body.kt-traffic-hub .btn-primary,body.kt-traffic-hub .btn-secondary{color:#fff;-webkit-text-fill-color:#fff;border:1px solid rgba(255,255,255,.24);border-radius:999px;background-color:#080808;background-image:linear-gradient(180deg,rgba(255,255,255,.07),rgba(255,255,255,.015) 28%,rgba(0,0,0,.24)),var(--kt-leather);background-size:100% 100%,auto;background-repeat:no-repeat,repeat;text-shadow:none;box-shadow:inset 0 1px 0 rgba(255,255,255,.24),inset 0 -3px 5px rgba(0,0,0,.34),0 7px 16px rgba(0,0,0,.54)}

'''
s = s.replace(marker, compatibility + marker, 1)
home.write_text(s)

traffic = Path('traffic-tickets/index.html')
t = traffic.read_text()
if '<body class="kt-traffic-hub">' not in t:
    if t.count('</head><body>') != 1:
        raise SystemExit('traffic page body marker not unique')
    t = t.replace('</head><body>', '</head><body class="kt-traffic-hub">', 1)
traffic.write_text(t)

publisher = Path('tools/publish/build-v2.js')
j = publisher.read_text()
start = j.find('function hubIndex(h,posts){')
end = j.find('function collectUrls(){', start)
if start == -1 or end == -1:
    raise SystemExit('hubIndex boundaries not found')

new_hub = r'''function plainTitle(s){return String(s||'').replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&nbsp;/g,' ').replace(/\s+/g,' ').replace(/\s+\|\s+Ken Turner Law.*$/i,'').trim()}
function manualHubEntries(h,posts){const generated=new Set(posts.map(p=>path.resolve(outFile(p))));const root=path.join(ROOT,h.dir);if(!fs.existsSync(root))return[];return fs.readdirSync(root,{withFileTypes:true}).filter(e=>e.isDirectory()).map(e=>{const f=path.join(root,e.name,'index.html');if(!fs.existsSync(f)||generated.has(path.resolve(f)))return null;const html=fs.readFileSync(f,'utf8');if(html.includes(MARK))return null;const hm=html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);const tm=html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);const title=plainTitle((hm&&hm[1])||(tm&&tm[1])||e.name);return title?{title,url:`/${h.dir}/${e.name}/`}:null}).filter(Boolean).sort((a,b)=>a.title.localeCompare(b.title))}
function hubIndex(h,posts){const generated=posts.map(p=>`<article><h2><a href="${attr(urlPath(p))}">${esc(p.title)}</a></h2><p>${esc(dateTime(p.datePublished))}${p.county?' • '+esc(p.county)+' County':''}${p.category?' • '+esc(p.category):''}</p></article>`).join('\n');const manual=manualHubEntries(h,posts).map(x=>`<article><h2><a href="${attr(x.url)}">${esc(x.title)}</a></h2><p>Ken Turner Law legal answer</p></article>`).join('\n');const list=[generated,manual].filter(Boolean).join('\n')||'<p>No articles published yet.</p>';return `<!doctype html><html amp lang="en"><head><meta charset="utf-8"><script async src="https://cdn.ampproject.org/v0.js"></script><link rel="canonical" href="${SITE}/${h.dir}/"><meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1"><title>${esc(h.title)} | Ken Turner Law</title><meta name="description" content="${attr(h.intro)}"><style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;animation:none}</style></noscript><style amp-custom>${CSS}article{border-top:1px solid #ccc;padding:18px 0}article h2{margin:0 0 5px;font-size:1.5rem}article p{font:14px Arial,sans-serif;color:#555}</style></head><body><header class="top"><a href="/">Ken Turner Law</a><a class="call" href="tel:2394003733">Call (239) 400-3733</a></header><main class="page"><p class="kicker">Answer Center</p><h1>${esc(h.title)}</h1><p class="article">${esc(h.intro)}</p>${list}</main></body></html>`}
'''
j = j[:start] + new_hub + j[end:]
publisher.write_text(j)
