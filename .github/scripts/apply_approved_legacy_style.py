from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[2]
EXCLUDED_PREFIXES = ("publish/", "test/", "handbook/")
EXCLUDED_FILES = {"test.html", "coms.html"}

STYLE_OVERRIDE = '''
/* KT-SITEWIDE-METALLIC-LEATHER-START */
:root{--kt-black:#050505;--kt-gold:#d7b85a;--kt-gold-light:#f5e4a1;--kt-gold-dark:#8f6b1f;--kt-cream:#f4efe2;--kt-leather:url('/img/leather-macro-shot.svg')}
html{background:#000}
body{font-family:'Playfair Display SC',Georgia,serif;line-height:1.6;color:#f7f3e8;-webkit-font-smoothing:antialiased;background-color:#050505;background-image:linear-gradient(115deg,rgba(255,255,255,.025),transparent 34%),linear-gradient(rgba(0,0,0,.12),rgba(0,0,0,.22)),var(--kt-leather);background-size:auto,auto,420px auto;background-repeat:repeat;background-attachment:fixed}
p,li,div{color:#f7f3e8}a{color:#e7ca71}a:hover,a:focus{color:#fff1b8}h1,h2,h3,h4,h5,h6{font-family:'Playfair Display SC',Georgia,serif}h2,h3{color:#d7b85a;line-height:1.25;text-shadow:0 1px 0 #000,0 0 12px rgba(215,184,90,.12)}
.ampstart-headerbar{min-height:58px;background-color:#050505;background-image:linear-gradient(rgba(0,0,0,.16),rgba(0,0,0,.25)),var(--kt-leather);background-size:auto,420px auto;color:#fff;border-bottom:1px solid #8f6b1f;box-shadow:0 3px 12px rgba(0,0,0,.78),inset 0 1px 0 rgba(255,255,255,.05)}
.ampstart-navbar-trigger{color:#d7b85a;text-shadow:0 1px 0 #000,0 0 7px rgba(215,184,90,.15)}
.kt-upper-brand{color:#e4c36a;font-family:'Playfair Display SC',Georgia,serif;font-weight:400;text-transform:uppercase;letter-spacing:.18em;text-decoration:none;font-size:.92rem;background:linear-gradient(180deg,#fff4bd 0%,#e4c36a 32%,#9a6f19 60%,#f2dc8a 82%,#b98725 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 1px 0 rgba(255,255,255,.16),0 2px 4px rgba(0,0,0,.5)}
.ampstart-headerbar-home-link{color:#e3c665;background:none;-webkit-text-fill-color:currentColor;border:1px solid #9a6f19;padding:.48rem .65rem;box-shadow:inset 0 1px 0 rgba(255,244,188,.15),inset 0 -1px 0 rgba(62,38,4,.85),0 3px 8px rgba(0,0,0,.45);text-shadow:0 1px 0 #000;font-size:.78rem}
.ampstart-sidebar{background-color:#050505;background-image:linear-gradient(rgba(4,4,4,.68),rgba(4,4,4,.76)),var(--kt-leather);background-size:auto,420px auto;color:#fff;border-right:1px solid #8f6b1f;box-shadow:10px 0 30px rgba(0,0,0,.65)}
.kt-sidebar-parent{color:#e6c869;text-shadow:0 1px 0 #000}.kt-sidebar-sub{border-left-color:rgba(215,184,90,.35)}.kt-sidebar-sub a{color:#f2eee4}.kt-sidebar-sub a:hover,.kt-sidebar-sub a:focus,.kt-sidebar-parent:hover,.kt-sidebar-parent:focus{color:#fff1b8}
body.kt-home .ampstart-image-fullpage-hero{min-height:0;margin:58px 0 1.4rem;background:none;overflow:visible}body.kt-home .ampstart-image-fullpage-hero>amp-img{display:none}body.kt-home .ampstart-image-fullpage-hero>figcaption.absolute{position:relative;top:auto;right:auto;bottom:auto;left:auto}body.kt-home .ampstart-image-fullpage-hero>figcaption>header{padding:2.5rem 1rem 2.65rem;text-align:center;border-bottom:1px solid #9a6f19;background-color:#050505;background-image:linear-gradient(115deg,rgba(255,255,255,.025),transparent 34%),linear-gradient(rgba(0,0,0,.12),rgba(0,0,0,.22)),var(--kt-leather);background-size:auto,auto,420px auto;box-shadow:0 8px 22px rgba(0,0,0,.48)}
body.kt-home .ampstart-fullpage-hero-heading{margin:0 auto;max-width:760px}body.kt-home .ampstart-fullpage-hero-heading>amp-img{display:none}body.kt-home .ampstart-fullpage-hero-heading>span.h1{display:block;color:#e4c36a;font-size:clamp(2.35rem,8vw,4.6rem);font-weight:400;line-height:1.06;margin:.35rem 0 1rem;text-transform:uppercase;letter-spacing:.12em;background:linear-gradient(180deg,#fff4bd 0%,#e4c36a 32%,#9a6f19 60%,#f2dc8a 82%,#b98725 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 1px 0 rgba(255,255,255,.22),0 2px 5px rgba(0,0,0,.55)}
.kt-crisis-copy{display:block;color:#f4efe2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:1rem;letter-spacing:.02em;margin:0 auto 1.35rem;text-transform:none}.kt-crisis-call,.ampstart-fullpage-hero-cta{display:block;max-width:430px;margin:.85rem auto;padding:.95rem 1rem;text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-weight:800;letter-spacing:.06em}.kt-crisis-call{color:#090703;border:1px solid #68440f;background:linear-gradient(180deg,#fff0a3 0%,#e6c45e 15%,#b98525 47%,#e4c15d 66%,#8b5f18 100%);box-shadow:0 7px 15px rgba(0,0,0,.65),inset 0 1px 0 rgba(255,255,221,.78),inset 0 -2px 0 rgba(73,44,5,.58)}body.kt-home .ampstart-fullpage-hero-cta{color:#e4c36a;border:1px solid #a67824;background-color:#050505;background-image:linear-gradient(180deg,rgba(255,231,142,.035),rgba(0,0,0,.15)),var(--kt-leather);background-size:auto,420px auto;box-shadow:0 7px 15px rgba(0,0,0,.58),inset 0 0 0 1px rgba(255,224,125,.16),inset 0 1px 0 rgba(255,245,196,.13)}
details.kt-acc,details[class*='acc']{margin:0 0 .9rem;background:#060606;border:1px solid #8e651e;box-shadow:0 5px 13px rgba(0,0,0,.58),inset 0 0 0 1px rgba(255,222,118,.08)}details.kt-acc>summary,details[class*='acc']>summary{position:relative;display:flex;align-items:center;min-height:58px;padding:1rem 1.05rem;color:#e4c36a;font-family:'Playfair Display SC',Georgia,serif;font-size:1.08rem;line-height:1.35;letter-spacing:.075em;background-color:#050505;background-image:linear-gradient(rgba(0,0,0,.14),rgba(0,0,0,.24)),var(--kt-leather);background-size:auto,420px auto;border:0;text-shadow:0 1px 0 #000,0 0 5px rgba(232,198,99,.15);list-style:none}details.kt-acc>summary::-webkit-details-marker,details[class*='acc']>summary::-webkit-details-marker{display:none}details.kt-acc>summary::marker,details[class*='acc']>summary::marker{content:''}details.kt-acc>summary:after,details[class*='acc']>summary:after{content:'';position:absolute;right:1rem;top:50%;width:0;height:0;transform:translateY(-50%);border-top:6px solid transparent;border-bottom:6px solid transparent;border-left:9px solid #d7b85a;filter:drop-shadow(0 1px 0 #000)}details.kt-acc[open]>summary:after,details[class*='acc'][open]>summary:after{transform:translateY(-50%) rotate(90deg)}details.kt-acc>summary amp-img,details[class*='acc']>summary amp-img{display:none}details.kt-acc>article,details[class*='acc']>article{padding:1.2rem 1.35rem;color:#f4efe2;border-top:1px solid rgba(142,101,30,.72);background-color:#050505;background-image:linear-gradient(rgba(0,0,0,.12),rgba(0,0,0,.20)),var(--kt-leather);background-size:auto,420px auto}.kt-acc-hint{color:#d7b85a;text-align:center;margin:.6rem 0 1rem;font-size:.95rem}
button,.button,.btn,[class*='button'],input[type='submit']{border-color:#a8822e;box-shadow:inset 0 1px 0 rgba(255,245,190,.14),0 2px 7px rgba(0,0,0,.35)}main p,main li,main dd,main blockquote{color:#f4efe2}main h2,main h3,main h4,main dt,main li>strong:first-child{color:#d7b85a}fieldset{border-color:rgba(167,130,46,.55);background:rgba(5,5,5,.72)}hr{border-color:rgba(215,184,90,.3)}blockquote{border-left-color:#a8822e}
@media(max-width:520px){.ampstart-headerbar{padding-left:.65rem;padding-right:.65rem}.kt-upper-brand{font-size:.78rem;letter-spacing:.12em}.ampstart-headerbar-home-link{font-size:.68rem;padding:.42rem .45rem}body.kt-home .ampstart-image-fullpage-hero>figcaption>header{padding:2rem .85rem 2.25rem}body.kt-home .ampstart-fullpage-hero-heading>span.h1{letter-spacing:.075em}}
/* KT-SITEWIDE-METALLIC-LEATHER-END */
'''

HOME_OLD_HERO = '''<span class="h1 block caps my1">Ken Turner Law</span>
                <span class="block caps h3">Criminal Defense Attorney</span>
                <span class="block caps h5">DUI | Drug Charges | Traffic Offenses</span>
                <span class="block caps h5">Suspended License | Violation of Probation</span>
                <span class="block caps h6">Misdemeanor Charges | Felony Charges | Risk Protection Orders</span>
                <span class="block caps h3">Family Law Attorney</span>
                <span class="block caps h5">Divorce | Child Custody | Domestic Violence</span> 
                
              <a class="ampstart-btn inline-block ampstart-fullpage-hero-cta h3 m3 text-decoration-none" href="https://kenturnerlaw.as.me/" target=_blank title="Free Consultation Self Scheduler" rel="noopener">BOOK PHONE APPOINTMENT</a>'''

HOME_NEW_HERO = '''<span class="h1 block caps my1">ARRESTED?</span>
                <span class="kt-crisis-copy">Call immediately. Criminal defense representation available 24/7.</span>
                <a class="kt-crisis-call" href="tel:+12394003733">CALL (239)400-FREE</a>
                <a class="ampstart-btn inline-block ampstart-fullpage-hero-cta h3 m3 text-decoration-none" href="https://kenturnerlaw.as.me/" target=_blank title="Free Consultation Self Scheduler" rel="noopener">BOOK PHONE APPOINTMENT</a>'''


def public_amp_pages():
    candidates = [ROOT / "index.html"] + list(ROOT.glob("**/index.html"))
    seen = set()
    for path in candidates:
        relative = path.relative_to(ROOT).as_posix()
        if relative in seen or relative in EXCLUDED_FILES:
            continue
        seen.add(relative)
        if any(relative.startswith(prefix) for prefix in EXCLUDED_PREFIXES):
            continue
        html = path.read_text(encoding="utf-8")
        if re.search(r'<html\b[^>]*\bamp\b', html, flags=re.I) and re.search(r'<style\s+amp-custom', html, flags=re.I):
            yield path, relative, html


def apply_style_only(html: str) -> str:
    pattern = r'/\* KT-SITEWIDE-METALLIC-LEATHER-START \*/.*?/\* KT-SITEWIDE-METALLIC-LEATHER-END \*/'
    if re.search(pattern, html, flags=re.S):
        return re.sub(pattern, STYLE_OVERRIDE.strip(), html, count=1, flags=re.S)
    match = re.search(r'<style\s+amp-custom(?:=["\'][^"\']*["\'])?\s*>', html, flags=re.I)
    if not match:
        return html
    close = html.find('</style>', match.end())
    if close == -1:
        return html
    return html[:close] + STYLE_OVERRIDE + html[close:]


def apply_homepage_only(html: str) -> str:
    html = re.sub(r'<body(\s*)>', '<body class="kt-home">', html, count=1)
    trigger = '<div class="ampstart-navbar-trigger pr0" on="tap:header-sidebar.toggle" role="button" tabindex="0">☰</div>'
    if 'class="kt-upper-brand"' not in html and trigger in html:
        html = html.replace(trigger, trigger + '\n      <a href="/" class="kt-upper-brand">KEN TURNER LAW</a>', 1)
    html = html.replace('Call (239) 400-FREE', '(239)400-FREE', 1)
    html = html.replace('href="tel:239-400-3733"', 'href="tel:+12394003733"', 1)
    if HOME_OLD_HERO in html:
        html = html.replace(HOME_OLD_HERO, HOME_NEW_HERO, 1)
    return html


changed = []
for path, relative, original in public_amp_pages():
    html = apply_style_only(original)
    if relative == 'index.html':
        html = apply_homepage_only(html)
    if html != original:
        path.write_text(html, encoding='utf-8')
        changed.append(relative)

print(f"Updated approved leather/brass design on {len(changed)} public AMP pages")
print("Preserved page content, navigation, links, metadata, and AMP behavior; homepage hero intentionally restyled in place")
for item in changed:
    print(item)
