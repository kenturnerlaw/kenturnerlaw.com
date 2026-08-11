from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[2]
EXCLUDED_PREFIXES = ("publish/", "test/", "handbook/")
EXCLUDED_FILES = {"test.html", "coms.html"}

START = '/* KT-CANONICAL-SITE-CHROME-START */'
END = '/* KT-CANONICAL-SITE-CHROME-END */'

STYLE_OVERRIDE = r'''
/* KT-CANONICAL-SITE-CHROME-START */
:root{--kt-v2-leather:url('/img/dark-pebbled-leather-v2.webp');--kt-v2-gold:#c99537;--kt-v2-gold-light:#f7dea0;--kt-v2-gold-edge:#65400e;--kt-v2-shadow:#2a1603}
.fixed{position:fixed}.left-0{left:0}.right-0{right:0}.top-0{top:0}.flex{display:flex}.items-center{align-items:center}.justify-start{justify-content:flex-start}.items-start{align-items:flex-start}.px3{padding-left:1.5rem;padding-right:1.5rem}.m0{margin:0}.p0{padding:0}.list-reset{list-style:none}

/* One canonical top banner on every public AMP page. */
.ampstart-headerbar.kt-home-header{height:4.25rem;min-height:4.25rem;padding:0 .8rem;display:grid;grid-template-columns:3rem 1fr auto;gap:.5rem;align-items:center;z-index:999;background-color:#020202;background-image:linear-gradient(rgba(0,0,0,.44),rgba(0,0,0,.58)),var(--kt-v2-leather);background-size:auto,cover;background-repeat:no-repeat;background-position:center;border-bottom:1px solid rgba(255,255,255,.08);box-shadow:0 3px 12px rgba(0,0,0,.72)}
.ampstart-headerbar.kt-home-header .ampstart-navbar-trigger{cursor:pointer;font-size:1.75rem;line-height:1;padding:.65rem .4rem;text-align:center;color:#d8dade;-webkit-text-fill-color:#d8dade;text-shadow:0 -1px 0 rgba(0,0,0,.82),0 1px 0 rgba(255,255,255,.30)}
.kt-home-brand{min-width:0;text-align:center;text-decoration:none;line-height:1.05;letter-spacing:.1em;text-transform:uppercase}
.kt-home-brand strong{display:block;font-family:Georgia,'Times New Roman',serif;font-size:1rem;font-weight:700;color:#d7d9dc;background:linear-gradient(180deg,#f4f5f6 0%,#d9dbde 28%,#a9adb2 52%,#eceeef 72%,#b7bbc0 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;-webkit-text-stroke:.2px rgba(76,80,86,.72);filter:none;text-shadow:0 -1px 0 rgba(0,0,0,.58),0 1px 0 rgba(255,255,255,.20)}
.kt-home-brand small{display:block;margin-top:.22rem;color:#f4efe2;-webkit-text-fill-color:#f4efe2;font-family:Arial,sans-serif;font-size:.56rem;font-weight:400;letter-spacing:.16em;text-shadow:none}
.kt-header-call{padding:.65rem .85rem;border:1px solid rgba(255,255,255,.24);border-radius:999px;color:#fff;-webkit-text-fill-color:#fff;font-family:Arial,sans-serif;font-size:.72rem;font-weight:700;line-height:1;text-decoration:none;white-space:nowrap;background-color:#080808;background-image:linear-gradient(180deg,rgba(255,255,255,.16),rgba(255,255,255,.04) 28%,rgba(0,0,0,.30)),var(--kt-v2-leather);background-size:auto,cover;background-position:center;text-shadow:none;box-shadow:inset 0 1px 0 rgba(255,255,255,.24),inset 0 -2px 4px rgba(0,0,0,.28),0 4px 10px rgba(0,0,0,.40)}
.ampstart-headerbar.kt-home-header+amp-sidebar+*,.ampstart-headerbar.kt-home-header+:not(amp-sidebar){margin-top:4.25rem}

/* One canonical menu on every public AMP page. */
.ampstart-sidebar{background-color:#020202;background-image:linear-gradient(rgba(0,0,0,.46),rgba(0,0,0,.58)),var(--kt-v2-leather);background-size:auto,440px 440px;color:#fff;min-width:300px;width:300px;border-right:1px solid #8f6b1f;box-shadow:10px 0 30px rgba(0,0,0,.72)}
.ampstart-sidebar-header{line-height:3.5rem;min-height:3.5rem}.kt-sidebar-menu{padding-bottom:1rem}.ampstart-sidebar .kt-sidebar-section{margin:0 0 1.15rem}
.kt-sidebar-parent{display:block;color:#c99537;-webkit-text-fill-color:#c99537;text-decoration:none;font-weight:700;letter-spacing:.01em;text-shadow:0 -1px 0 #2a1603,0 1px 0 #f7dea0,1px 2px 0 #65400e,0 4px 4px #000}
.kt-sidebar-sub{list-style:none;margin:.5rem 0 0 .65rem;padding:0 0 0 .75rem;border-left:1px solid rgba(201,149,55,.48)}.kt-sidebar-sub li{margin:0 0 .45rem;padding:0}.kt-sidebar-sub a{color:#f2eee4;-webkit-text-fill-color:#f2eee4;text-decoration:none;font-size:.88rem;line-height:1.3;text-shadow:none}.kt-sidebar-action{margin-top:1.45rem}

/* One canonical accordion system everywhere. */
.kt-acc-hint{color:#e8cd78;-webkit-text-fill-color:#e8cd78;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:.92rem;font-weight:700;letter-spacing:.04em;margin:.55rem 0 1rem;text-shadow:none}
details.kt-acc,details[class*='kt-acc'],amp-accordion>section{margin:0 0 15px;border:1px solid #987126;background-color:#030303;background-image:linear-gradient(rgba(0,0,0,.36),rgba(0,0,0,.46)),var(--kt-v2-leather);background-size:auto,460px 460px;box-shadow:0 8px 22px rgba(0,0,0,.58),inset 0 0 0 1px rgba(255,222,118,.06);overflow:hidden}
details.kt-acc>summary,details[class*='kt-acc']>summary,amp-accordion>section>header,amp-accordion>section>h2{list-style:none;cursor:pointer;position:relative;display:flex;align-items:center;min-height:92px;margin:0;padding:18px 58px 18px 24px;color:var(--kt-v2-gold);-webkit-text-fill-color:var(--kt-v2-gold);font-family:'Playfair Display SC',Georgia,serif;font-size:clamp(1rem,2vw,1.22rem);font-weight:700;line-height:1.3;letter-spacing:.065em;text-align:left;background-color:#030303;background-image:linear-gradient(90deg,rgba(0,0,0,.32),rgba(0,0,0,.55)),var(--kt-v2-leather);background-repeat:no-repeat,repeat;background-position:center;background-size:100% 100%,460px 460px;border:0;text-shadow:0 -1px 0 var(--kt-v2-shadow),0 1px 0 rgba(247,222,160,.72),1px 2px 0 rgba(101,64,14,.78),0 3px 4px #000}
details.kt-acc>summary::-webkit-details-marker,details[class*='kt-acc']>summary::-webkit-details-marker{display:none}details.kt-acc>summary::marker,details[class*='kt-acc']>summary::marker{content:''}
details.kt-acc>summary:after,details[class*='kt-acc']>summary:after{content:'›';position:absolute;right:20px;top:50%;transform:translateY(-52%);color:#f0d36f;-webkit-text-fill-color:#f0d36f;font-family:Georgia,serif;font-size:2rem;font-weight:700;line-height:1;text-shadow:0 -1px 0 #2a1603,0 1px 0 #f7dea0,1px 2px 0 #65400e,0 4px 4px #000}
details.kt-acc[open]>summary:after,details[class*='kt-acc'][open]>summary:after{transform:translateY(-52%) rotate(90deg)}
details.kt-acc>summary amp-img,details[class*='kt-acc']>summary amp-img{display:none}
details.kt-acc>article,details.kt-acc>div,details[class*='kt-acc']>article,details[class*='kt-acc']>div,amp-accordion>section>article,amp-accordion>section>div{padding:22px 26px;color:#f7f1e4;background-color:#030303;background-image:linear-gradient(rgba(0,0,0,.52),rgba(0,0,0,.60)),var(--kt-v2-leather);background-size:auto,460px 460px;border-top:1px solid rgba(201,149,55,.42)}
details.kt-acc p,details.kt-acc li,details[class*='kt-acc'] p,details[class*='kt-acc'] li{font-family:Arial,Helvetica,sans-serif;font-size:1rem;line-height:1.7;color:#f7f1e4;-webkit-text-fill-color:#f7f1e4;text-transform:none;letter-spacing:normal;text-shadow:none}
details.kt-acc h2,details.kt-acc h3,details.kt-acc h4,details[class*='kt-acc'] h2,details[class*='kt-acc'] h3,details[class*='kt-acc'] h4{color:#e4c36a;-webkit-text-fill-color:#e4c36a}
details.kt-acc a,details[class*='kt-acc'] a{color:#efd078;-webkit-text-fill-color:#efd078;font-weight:700}

@media(min-width:48rem){.ampstart-headerbar.kt-home-header{grid-template-columns:4rem 1fr 9rem;padding:0 1.25rem}.kt-home-brand strong{font-size:1.25rem}.kt-header-call{text-align:center;font-size:.8rem}}
@media(max-width:600px){details.kt-acc>summary,details[class*='kt-acc']>summary,amp-accordion>section>header,amp-accordion>section>h2{min-height:82px;padding:15px 46px 15px 18px;font-size:.98rem;background-size:100% 100%,420px 420px}details.kt-acc>summary:after,details[class*='kt-acc']>summary:after{right:14px}details.kt-acc>article,details.kt-acc>div,details[class*='kt-acc']>article,details[class*='kt-acc']>div,amp-accordion>section>article,amp-accordion>section>div{padding:18px}}
/* KT-CANONICAL-SITE-CHROME-END */
'''


def public_amp_pages():
    candidates = [ROOT / 'index.html'] + list(ROOT.glob('**/index.html'))
    seen = set()
    for path in candidates:
        relative = path.relative_to(ROOT).as_posix()
        if relative in seen or relative in EXCLUDED_FILES:
            continue
        seen.add(relative)
        if any(relative.startswith(prefix) for prefix in EXCLUDED_PREFIXES):
            continue
        html = path.read_text(encoding='utf-8', errors='ignore')
        if re.search(r'<html\b[^>]*\bamp\b', html, flags=re.I) and re.search(r'<style\s+amp-custom', html, flags=re.I):
            yield path, relative, html


def replace_or_insert_style(html: str) -> str:
    # Remove this canonical block if already present.
    html = re.sub(re.escape(START) + r'.*?' + re.escape(END), '', html, flags=re.S)
    # Also remove the older sitewide override so it cannot fight the canonical rules.
    html = re.sub(r'/\* KT-SITEWIDE-METALLIC-LEATHER-START \*/.*?/\* KT-SITEWIDE-METALLIC-LEATHER-END \*/', '', html, flags=re.S)
    match = re.search(r'<style\s+amp-custom(?:=["\'][^"\']*["\'])?\s*>', html, flags=re.I)
    if not match:
        return html
    close = html.find('</style>', match.end())
    if close == -1:
        return html
    return html[:close] + '\n' + STYLE_OVERRIDE + '\n' + html[close:]


def canonical_sources():
    home = (ROOT / 'index.html').read_text(encoding='utf-8')
    header = re.search(r'(<header class="ampstart-headerbar kt-home-header fixed left-0 right-0 top-0">.*?</header>)', home, flags=re.S)
    sidebar = re.search(r'(<amp-sidebar\b[^>]*id="header-sidebar"[^>]*>.*?</amp-sidebar>)', home, flags=re.S)
    if not header or not sidebar:
        raise RuntimeError('Canonical homepage header/sidebar could not be located')
    menu = sidebar.group(1)
    menu = menu.replace('<span class="kt-sidebar-parent">Traffic Tickets</span>', '<a href="/traffic-tickets/" class="ampstart-nav-link kt-sidebar-parent">Traffic Tickets</a>')
    menu = menu.replace('>Phone Appointment</a>', '>Call Scheduling Tool</a>')
    menu = menu.replace('>Schedule a Call</a>', '>Call Scheduling Tool</a>')
    return header.group(1), menu


def ensure_sidebar_script(html: str) -> str:
    if 'custom-element="amp-sidebar"' in html:
        return html
    amp = re.search(r'<script\s+async\s+src=["\']?https://cdn\.ampproject\.org/v0\.js["\']?\s*></script>', html, flags=re.I)
    if amp:
        insert = '\n<script async custom-element="amp-sidebar" src="https://cdn.ampproject.org/v0/amp-sidebar-0.1.js"></script>'
        return html[:amp.end()] + insert + html[amp.end():]
    return html


def standardize_markup(html: str, header: str, sidebar: str) -> str:
    html = ensure_sidebar_script(html)
    # Remove any existing sidebar before reinserting it directly after the canonical header.
    html = re.sub(r'<amp-sidebar\b[^>]*id="header-sidebar"[^>]*>.*?</amp-sidebar>', '', html, count=1, flags=re.S | re.I)
    # Replace the first site header, whether legacy or current.
    pattern = r'<header\b[^>]*class="[^"]*ampstart-headerbar[^"]*"[^>]*>.*?</header>'
    if re.search(pattern, html, flags=re.S | re.I):
        html = re.sub(pattern, header, html, count=1, flags=re.S | re.I)
    elif '<body' in html:
        body_end = html.find('>', html.find('<body'))
        html = html[:body_end + 1] + '\n' + header + html[body_end + 1:]
    html = html.replace(header, header + '\n' + sidebar, 1)
    return html


canonical_header, canonical_sidebar = canonical_sources()
changed = []
for path, relative, original in public_amp_pages():
    html = standardize_markup(original, canonical_header, canonical_sidebar)
    html = replace_or_insert_style(html)
    # Sitewide scheduler terminology.
    html = html.replace('>Phone Appointment</a>', '>Call Scheduling Tool</a>')
    html = html.replace('>Schedule a Call</a>', '>Call Scheduling Tool</a>')
    # Keep the traffic-ticket page's body call action exactly as approved.
    if relative == 'traffic-tickets/index.html':
        html = html.replace('href="tel:+12394003733">Call (239) 400-FREE</a>', 'href="tel:+12397443434">Call Now (239) 744-3434</a>')
        html = html.replace('href="tel:+12394003733">Call Now (239) 400-FREE</a>', 'href="tel:+12397443434">Call Now (239) 744-3434</a>')
    if html != original:
        path.write_text(html, encoding='utf-8')
        changed.append(relative)

print(f'Unified canonical header/menu/accordion styling on {len(changed)} public AMP pages')
for item in changed:
    print(item)
