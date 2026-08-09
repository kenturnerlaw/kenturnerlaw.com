from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[2]

TARGETS = [
    "index.html",
    "criminal-defense/index.html",
    "arrested/index.html",
    "dui/index.html",
    "drug-charges/index.html",
    "domestic-violence/index.html",
    "felony-charges/index.html",
    "misdemeanor-charges/index.html",
    "traffic-offenses/index.html",
    "suspended-license/index.html",
    "violation-of-probation/index.html",
    "criminal-defense-naples/index.html",
    "criminal-defense-fort-myers/index.html",
    "criminal-defense-labelle/index.html",
    "criminal-defense-miami/index.html",
    "divorce/index.html",
    "child-custody/index.html",
    "reviews/index.html",
    "clients/index.html",
]

STYLE_OVERRIDE = '''
/* KT-SITEWIDE-METALLIC-LEATHER-START */
:root{--kt-black:#050505;--kt-black-2:#0b0b0b;--kt-gold:#d7b85a;--kt-gold-light:#f5e4a1;--kt-gold-dark:#8f6b1f;--kt-cream:#f4efe2}
html{background:#000}
body{font-family:'Playfair Display SC',Georgia,serif;line-height:1.6;color:#f7f3e8;-webkit-font-smoothing:antialiased;background-color:#050505;background-image:radial-gradient(ellipse at 20% 0%,rgba(255,255,255,.035),transparent 28%),radial-gradient(ellipse at 80% 100%,rgba(255,255,255,.025),transparent 32%),repeating-linear-gradient(27deg,rgba(255,255,255,.012) 0,rgba(255,255,255,.012) 1px,transparent 1px,transparent 4px),repeating-linear-gradient(153deg,rgba(0,0,0,.28) 0,rgba(0,0,0,.28) 1px,transparent 1px,transparent 5px)}
body:before{content:'';position:fixed;inset:0;pointer-events:none;z-index:-1;background:linear-gradient(115deg,rgba(255,255,255,.018),transparent 24%,rgba(255,255,255,.012) 47%,transparent 67%),radial-gradient(circle at 50% 15%,rgba(215,184,90,.035),transparent 30%)}
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
.ampstart-sidebar{background-color:#050505;background-image:repeating-linear-gradient(26deg,rgba(255,255,255,.012) 0,rgba(255,255,255,.012) 1px,transparent 1px,transparent 4px),linear-gradient(180deg,#0d0d0d,#020202);color:#fff;border-right:1px solid #8f6b1f;box-shadow:10px 0 30px rgba(0,0,0,.65)}
.kt-sidebar-parent{color:#e6c869;text-shadow:0 1px 0 #000}
.kt-sidebar-sub{border-left-color:rgba(215,184,90,.35)}
.kt-sidebar-sub a{color:#f2eee4}
.kt-sidebar-sub a:hover,.kt-sidebar-sub a:focus,.kt-sidebar-parent:hover,.kt-sidebar-parent:focus{color:#fff1b8}
button,.button,.btn,[class*='button'],input[type='submit']{border-color:#a8822e}
hr{border-color:rgba(215,184,90,.3)}
blockquote{border-left-color:#a8822e}
/* KT-SITEWIDE-METALLIC-LEATHER-END */
'''


def apply_style_only(html: str) -> str:
    new_pattern = r'/\* KT-SITEWIDE-METALLIC-LEATHER-START \*/.*?/\* KT-SITEWIDE-METALLIC-LEATHER-END \*/'
    if re.search(new_pattern, html, flags=re.S):
        return re.sub(new_pattern, STYLE_OVERRIDE.strip(), html, count=1, flags=re.S)

    old_pattern = r'/\* Approved August 3, 2026: typography and shared menu only\. \*/.*?\.kt-sidebar-action\{margin-top:1\.45rem\}'
    if re.search(old_pattern, html, flags=re.S):
        return re.sub(old_pattern, STYLE_OVERRIDE.strip(), html, count=1, flags=re.S)

    match = re.search(r'<style\s+amp-custom(?:=["\'][^"\']*["\'])?\s*>', html, flags=re.I)
    if not match:
        raise ValueError("amp-custom style block not found")
    close = html.find('</style>', match.end())
    if close == -1:
        raise ValueError("amp-custom closing tag not found")
    return html[:close] + STYLE_OVERRIDE + html[close:]


changed = []
for relative in TARGETS:
    path = ROOT / relative
    if not path.exists():
        raise FileNotFoundError(relative)
    original = path.read_text(encoding='utf-8')
    html = apply_style_only(original)
    if html != original:
        path.write_text(html, encoding='utf-8')
        changed.append(relative)

print(f"Updated styling on {len(changed)} pages; navigation and lettering markup untouched")
for item in changed:
    print(item)
