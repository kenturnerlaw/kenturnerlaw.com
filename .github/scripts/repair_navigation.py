from pathlib import Path
import re

SIDEBAR = '''<amp-sidebar id="header-sidebar" class="kt-sidebar" layout="nodisplay" side="left">
<button class="kt-close-menu" on="tap:header-sidebar.close" aria-label="Close menu">Close</button>
<nav aria-label="Site navigation">
<a href="/">Home</a><a href="/practice-areas/">Practice Areas</a><a href="/criminal-defense/">Criminal Defense</a>
<div class="kt-subnav"><a href="/florida-criminal-defense-answers/">Florida Criminal Defense Answers</a><a href="/arrested/">Arrested?</a><a href="/dui/">DUI</a><a href="/drug-charges/">Drug Charges</a><a href="/domestic-violence/">Domestic Violence</a><a href="/felony-charges/">Felony Charges</a><a href="/misdemeanor-charges/">Misdemeanor Charges</a><a href="/traffic-offenses/">Traffic Offenses</a><a href="/suspended-license/">Suspended License</a><a href="/violation-of-probation/">Violation of Probation</a></div>
<span class="kt-menu-label">Family Law</span><div class="kt-subnav"><a href="/divorce/">Divorce</a><a href="/child-custody/">Time-Sharing and Parenting Plans</a><a href="/best-interests-of-the-child-florida/">Best Interests of the Child</a></div>
<a href="/reviews/">Reviews</a><a href="/blog/">Blog</a><a href="tel:+12394003733">Call (239) 400-FREE</a><a href="/ken-turner.vcf">Save Contact</a>
</nav></amp-sidebar>'''

HEADER = '''<header class="kt-mobile-header"><button class="kt-menu-button" on="tap:header-sidebar.open" aria-label="Open menu">☰</button><a class="kt-mobile-brand" href="/"><amp-img src="/favicon-32x32.png?v=6" width="32" height="32" alt="Ken Turner Law logo"></amp-img><span>Ken Turner Law</span></a><a class="kt-mobile-call" href="tel:+12394003733" aria-label="Call Ken Turner Law">Call</a></header>'''

CSS = '''.kt-mobile-header{display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:58px;padding:7px 12px;border-bottom:1px solid #6f5526;background:#070707;position:sticky;top:0;z-index:10}.kt-mobile-brand{display:flex;align-items:center;gap:8px;color:#efd98c;text-decoration:none;font-size:.9rem;letter-spacing:.04em;text-transform:uppercase}.kt-menu-button,.kt-mobile-call{display:inline-flex;align-items:center;justify-content:center;min-width:44px;min-height:44px;border:1px solid #8b6b2e;border-radius:4px;background:#111;color:#efd98c;text-decoration:none;font:inherit}.kt-sidebar{background:#080808;color:#fff;width:min(86vw,330px);padding:18px}.kt-close-menu{display:block;margin-left:auto;border:1px solid #8b6b2e;background:#111;color:#efd98c;padding:8px 11px;font-size:1rem}.kt-sidebar nav{padding-top:14px}.kt-sidebar nav>a,.kt-sidebar nav>span{display:block;padding:12px 3px;border-bottom:1px solid #292929;color:#efd98c;text-decoration:none}.kt-subnav{padding-left:14px}.kt-subnav a{display:block;padding:10px 3px;border-bottom:1px solid #222;color:#fff;text-decoration:none;font-size:.94rem}.kt-menu-label{font-weight:700}.destrier{text-align:center;margin-top:12px;font-size:.7rem;letter-spacing:.22em;color:#8d8d8d}'''


def ensure_amp_sidebar(html: str, path: Path) -> str:
    if '<html amp' not in html.lower() and '<html ⚡' not in html.lower():
        raise RuntimeError(f'{path} is not AMP')
    if 'custom-element="amp-sidebar"' not in html and 'custom-element=amp-sidebar' not in html:
        runtime = re.search(r'<script[^>]+src=["\']?https://cdn\.ampproject\.org/v0\.js["\']?[^>]*></script>', html, re.I)
        if not runtime:
            raise RuntimeError(f'AMP runtime missing in {path}')
        html = html[:runtime.end()] + '\n<script async custom-element="amp-sidebar" src="https://cdn.ampproject.org/v0/amp-sidebar-0.1.js"></script>' + html[runtime.end():]
    return html


def repair_new_page(path: Path) -> None:
    html = path.read_text(encoding='utf-8')
    html = ensure_amp_sidebar(html, path)
    if '.kt-mobile-header{' not in html:
        html = re.sub(r'(<style amp-custom(?:="")?>)', r'\1' + CSS, html, count=1, flags=re.I)
    html = re.sub(r'<amp-sidebar\b[^>]*>.*?</amp-sidebar>', '', html, flags=re.I | re.S)
    html = re.sub(r'<header\b[^>]*>.*?</header>', '', html, count=1, flags=re.I | re.S)
    html = re.sub(r'<nav class="(?:site-menu|kt-resource-links)".*?</nav>', '', html, flags=re.I | re.S)
    html = re.sub(r'(<body\b[^>]*>)', r'\1\n' + HEADER + '\n' + SIDEBAR, html, count=1, flags=re.I)
    if '~ destrier ~' not in html.lower():
        html = html.replace('</footer>', '<div class="destrier">~ destrier ~</div></footer>', 1)
    for required in ('id="header-sidebar"', '/florida-criminal-defense-answers/', '/best-interests-of-the-child-florida/'):
        if required not in html:
            raise RuntimeError(f'{required} missing from {path}')
    path.write_text(html, encoding='utf-8')


def repair_home(path: Path) -> None:
    html = path.read_text(encoding='utf-8')
    existing = re.search(r'<amp-sidebar\b[^>]*\bid=["\']?header-sidebar["\']?[^>]*>.*?</amp-sidebar>', html, re.I | re.S)
    if not existing:
        raise RuntimeError('Homepage sidebar not found')
    html = html[:existing.start()] + SIDEBAR + html[existing.end():]
    mission = re.search(r'<h2(?P<attrs>[^>]*)\bid\s*=\s*["\']?(?:Misson|Mission)["\']?(?P<rest>[^>]*)>(?P<body>.*?)</h2>', html, re.I | re.S)
    if mission:
        attrs = re.sub(r'\s*\bid\s*=\s*["\']?(?:Misson|Mission)["\']?', '', mission.group('attrs') + mission.group('rest'), flags=re.I)
        replacement = f'<header{attrs} id="Mission">{mission.group("body")}</header>'
        html = html[:mission.start()] + replacement + html[mission.end():]
    if '/best-interests-of-the-child-florida/' not in html or '/florida-criminal-defense-answers/' not in html:
        raise RuntimeError('Homepage navigation verification failed')
    path.write_text(html, encoding='utf-8')


targets = [Path('best-interests-of-the-child-florida/index.html')]
targets += sorted(Path('florida-criminal-defense-answers').rglob('index.html'))
for target in targets:
    repair_new_page(target)
repair_home(Path('index.html'))
print(f'Repaired {len(targets) + 1} pages')
