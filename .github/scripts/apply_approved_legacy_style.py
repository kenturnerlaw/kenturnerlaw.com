from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[2]

# Public site pages only. Administrative/dev surfaces remain untouched.
EXCLUDED_PREFIXES = ("publish/", "test/", "handbook/")
EXCLUDED_FILES = {"test.html", "coms.html"}

STYLE_OVERRIDE = '''
/* KT-SITEWIDE-METALLIC-LEATHER-START */
:root{--kt-black:#050505;--kt-black-2:#0b0b0b;--kt-gold:#d7b85a;--kt-gold-light:#f5e4a1;--kt-gold-dark:#8f6b1f;--kt-cream:#f4efe2}
html{background:#000}
body{font-family:'Playfair Display SC',Georgia,serif;line-height:1.6;color:#f7f3e8;-webkit-font-smoothing:antialiased;background-color:#050505;background-image:linear-gradient(rgba(3,3,3,.70),rgba(3,3,3,.70)),url('/img/dark-leather.webp'),radial-gradient(ellipse at 20% 0%,rgba(255,255,255,.035),transparent 28%);background-repeat:repeat;background-attachment:fixed}
p,li,div{color:#f7f3e8}
a{color:#e7ca71}
a:hover,a:focus{color:#fff1b8}
h1,h2,h3,h4,h5,h6{font-family:'Playfair Display SC',Georgia,serif}
h1{color:#f7f3e8;line-height:1.14;letter-spacing:.025em;text-shadow:0 1px 0 #000,0 0 18px rgba(215,184,90,.08)}
h2,h3{color:#d7b85a;line-height:1.25;text-shadow:0 1px 0 #000,0 0 12px rgba(215,184,90,.12)}
.small,.subtext,.supporting-text{font-size:.86rem;color:#eee8da}
.ampstart-headerbar{background:linear-gradient(180deg,#111 0,#050505 52%,#000 100%);color:#fff;border-bottom:1px solid #8f6b1f;box-shadow:0 2px 12px rgba(0,0,0,.72),inset 0 1px 0 rgba(255,255,255,.045)}
.ampstart-navbar-trigger{color:#d7b85a;text-shadow:0 1px 0 #000,0 0 7px rgba(215,184,90,.15)}
.ampstart-headerbar-home-link{color:#e3c665;background:linear-gradient(180deg,#fff4bd 0,#dfc15f 35%,#9d7829 52%,#e4ca72 72%,#b58e35 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;text-shadow:none}
.ampstart-sidebar{background-color:#050505;background-image:linear-gradient(rgba(4,4,4,.82),rgba(4,4,4,.82)),url('/img/dark-leather.webp');color:#fff;border-right:1px solid #8f6b1f;box-shadow:10px 0 30px rgba(0,0,0,.65)}
.kt-sidebar-parent{color:#e6c869;text-shadow:0 1px 0 #000}
.kt-sidebar-sub{border-left-color:rgba(215,184,90,.35)}
.kt-sidebar-sub a{color:#f2eee4}
.kt-sidebar-sub a:hover,.kt-sidebar-sub a:focus,.kt-sidebar-parent:hover,.kt-sidebar-parent:focus{color:#fff1b8}
details.kt-acc,details[class*='acc'],.panel,.card,.box,.ampstart-card{background:linear-gradient(145deg,rgba(18,18,18,.92),rgba(4,4,4,.96));border:1px solid rgba(167,130,46,.58);box-shadow:inset 0 1px 0 rgba(255,255,255,.035),0 5px 18px rgba(0,0,0,.28)}
details.kt-acc>summary,details[class*='acc']>summary{color:#e4c36a;border-bottom-color:rgba(167,130,46,.42)}
button,.button,.btn,[class*='button'],input[type='submit']{border-color:#a8822e;background-image:linear-gradient(180deg,rgba(226,195,100,.18),rgba(90,65,16,.18));box-shadow:inset 0 1px 0 rgba(255,245,190,.14),0 2px 7px rgba(0,0,0,.35)}
fieldset{border-color:rgba(167,130,46,.55);background:rgba(5,5,5,.72)}
hr{border-color:rgba(215,184,90,.3)}
blockquote{border-left-color:#a8822e}
/* KT-SITEWIDE-METALLIC-LEATHER-END */
'''


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
    new_pattern = r'/\* KT-SITEWIDE-METALLIC-LEATHER-START \*/.*?/\* KT-SITEWIDE-METALLIC-LEATHER-END \*/'
    if re.search(new_pattern, html, flags=re.S):
        return re.sub(new_pattern, STYLE_OVERRIDE.strip(), html, count=1, flags=re.S)

    old_pattern = r'/\* Approved August 3, 2026: typography and shared menu only\. \*/.*?\.kt-sidebar-action\{margin-top:1\.45rem\}'
    if re.search(old_pattern, html, flags=re.S):
        return re.sub(old_pattern, STYLE_OVERRIDE.strip(), html, count=1, flags=re.S)

    match = re.search(r'<style\s+amp-custom(?:=["\'][^"\']*["\'])?\s*>', html, flags=re.I)
    if not match:
        return html
    close = html.find('</style>', match.end())
    if close == -1:
        return html
    return html[:close] + STYLE_OVERRIDE + html[close:]


changed = []
for path, relative, original in public_amp_pages():
    html = apply_style_only(original)
    if html != original:
        path.write_text(html, encoding='utf-8')
        changed.append(relative)

print(f"Updated styling on {len(changed)} public AMP pages; navigation, lettering, content, metadata and functionality untouched")
for item in changed:
    print(item)
