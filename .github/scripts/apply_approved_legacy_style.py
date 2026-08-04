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

SIDEBAR_SCRIPT = '<script async custom-element="amp-sidebar" src="https://cdn.ampproject.org/v0/amp-sidebar-0.1.js"></script>'

HEADER = '''<header class="ampstart-headerbar">
<div class="ampstart-navbar-trigger" on="tap:header-sidebar.toggle" role="button" tabindex="0" aria-label="Open site navigation">☰</div>
<a href="tel:239-400-3733" class="ampstart-headerbar-home-link">Call (239) 400-FREE</a>
</header>'''

SIDEBAR = '''<amp-sidebar class="ampstart-sidebar" id="header-sidebar" layout="nodisplay">
<div class="ampstart-sidebar-header"><div class="ampstart-navbar-trigger" on="tap:header-sidebar.toggle" role="button" tabindex="0" aria-label="Close sidebar">✕</div></div>
<nav class="ampstart-nav ampstart-sidebar-nav" aria-label="Site navigation">
<ul class="kt-sidebar-menu">
<li class="kt-sidebar-section"><a href="/" class="kt-sidebar-parent">Home</a></li>
<li class="kt-sidebar-section"><a href="/practice-areas/" class="kt-sidebar-parent">Practice Areas</a></li>
<li class="kt-sidebar-section"><a href="/criminal-defense/" class="kt-sidebar-parent">Criminal Defense</a><ul class="kt-sidebar-sub"><li><a href="/florida-criminal-defense-answers/">Florida Criminal Defense Answers</a></li><li><a href="/arrested/">Arrested?</a></li><li><a href="/dui/">DUI</a></li><li><a href="/drug-charges/">Drug Charges</a></li><li><a href="/domestic-violence/">Domestic Violence</a></li><li><a href="/felony-charges/">Felony Charges</a></li><li><a href="/misdemeanor-charges/">Misdemeanor Charges</a></li><li><a href="/traffic-offenses/">Traffic Offenses</a></li><li><a href="/suspended-license/">Suspended License</a></li><li><a href="/violation-of-probation/">Violation of Probation</a></li></ul></li>
<li class="kt-sidebar-section"><span class="kt-sidebar-parent">Family Law</span><ul class="kt-sidebar-sub"><li><a href="/divorce/">Divorce</a></li><li><a href="/child-custody/">Time-Sharing and Parenting Plans</a></li><li><a href="/best-interests-of-the-child-florida/">Best Interests of the Child</a></li></ul></li>
<li class="kt-sidebar-section"><a href="/reviews/" class="kt-sidebar-parent">Reviews</a></li>
<li class="kt-sidebar-section"><a href="/blog/" class="kt-sidebar-parent">Blog</a></li>
<li class="kt-sidebar-section kt-sidebar-action"><a href="tel:239-400-3733" class="kt-sidebar-parent">Call (239) 400-FREE</a></li>
</ul>
</nav>
</amp-sidebar>'''

STYLE_OVERRIDE = '''
/* Approved August 3, 2026: typography and shared menu only. */
body{font-family:'Playfair Display SC',Georgia,serif;line-height:1.6;color:#fff;-webkit-font-smoothing:antialiased}
p,li,div{color:#fff}
h1{color:#fff;line-height:1.14;letter-spacing:.025em}
h2,h3{color:#e4c36a;line-height:1.25}
.small,.subtext,.supporting-text{font-size:.86rem;color:#fff}
.ampstart-headerbar{display:flex;align-items:center;justify-content:flex-start;position:fixed;left:0;right:0;top:0;min-height:3.5rem;padding:0 2rem 0 1rem;background:#000;color:#fff;z-index:999;box-shadow:0 0 5px 2px rgba(0,0,0,.1)}
.ampstart-navbar-trigger{font-size:1.75rem;line-height:3.5rem;cursor:pointer}
.ampstart-headerbar-home-link{margin-left:auto;margin-right:auto;color:#fff;text-decoration:none}
.ampstart-sidebar{background:#000;color:#fff;min-width:300px;width:300px;padding:0 1.5rem 1.5rem}
.ampstart-sidebar-header{display:flex;align-items:center;min-height:3.5rem}
.ampstart-sidebar .ampstart-navbar-trigger{line-height:inherit}
.kt-sidebar-menu{list-style:none;margin:0;padding:0 0 1rem}
.kt-sidebar-section{margin:0 0 1.15rem}
.kt-sidebar-parent{display:block;color:#fff;text-decoration:none;font-weight:700;letter-spacing:.01em}
.kt-sidebar-sub{list-style:none;margin:.55rem 0 0 .65rem;padding:0 0 0 .75rem;border-left:1px solid rgba(255,255,255,.28)}
.kt-sidebar-sub li{margin:0 0 .55rem}
.kt-sidebar-sub a{color:#fff;text-decoration:none;font-size:.95rem;line-height:1.25;opacity:.9}
.kt-sidebar-action{margin-top:1.45rem}
'''


def remove_facebook(html: str) -> str:
    html = re.sub(r'<li\b[^>]*>.*?(?:facebook\.com|Facebook|facebook).*?</li>', '', html, flags=re.I | re.S)
    html = re.sub(r'<a\b[^>]*(?:facebook\.com|aria-label=["\'][^"\']*facebook)[^>]*>.*?</a>', '', html, flags=re.I | re.S)
    html = re.sub(r'<svg\b[^>]*>.*?<title>\s*Facebook\s*</title>.*?</svg>', '', html, flags=re.I | re.S)
    return html


def add_sidebar_script(html: str) -> str:
    if 'custom-element="amp-sidebar"' in html:
        return html
    amp_runtime = re.search(r'<script\s+async\s+src=["\']https://cdn\.ampproject\.org/v0\.js["\']\s*></script>', html, flags=re.I)
    if not amp_runtime:
        raise ValueError("AMP runtime script not found")
    return html[:amp_runtime.end()] + '\n' + SIDEBAR_SCRIPT + html[amp_runtime.end():]


def replace_header(html: str) -> str:
    pattern = r'<header\b[^>]*class=["\'][^"\']*ampstart-headerbar[^"\']*["\'][^>]*>.*?</header>'
    updated, count = re.subn(pattern, HEADER, html, count=1, flags=re.I | re.S)
    if count != 1:
        raise ValueError("Expected exactly one ampstart header")
    return updated


def replace_sidebar(html: str) -> str:
    pattern = r'<amp-sidebar\b[^>]*\bid\s*=\s*["\']?header-sidebar["\']?[^>]*>.*?</amp-sidebar>'
    if re.search(pattern, html, flags=re.I | re.S):
        return re.sub(pattern, SIDEBAR, html, count=1, flags=re.I | re.S)
    header_end = html.find('</header>')
    if header_end == -1:
        raise ValueError("Header closing tag not found")
    insert_at = header_end + len('</header>')
    return html[:insert_at] + '\n' + SIDEBAR + html[insert_at:]


def append_style_override(html: str) -> str:
    if 'Approved August 3, 2026: typography and shared menu only.' in html:
        return html
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
    html = original
    html = remove_facebook(html)
    html = add_sidebar_script(html)
    html = replace_header(html)
    html = replace_sidebar(html)
    html = append_style_override(html)
    if html != original:
        path.write_text(html, encoding='utf-8')
        changed.append(relative)

print(f"Updated {len(changed)} approved older pages")
for item in changed:
    print(item)
