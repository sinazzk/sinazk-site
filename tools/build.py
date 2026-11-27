#!/usr/bin/env python3
"""Build the static pages in public/ from the page fragments in src/pages/.

Each fragment is the page's <main> content. This script wraps it in the shared
<head>, header, footer and scripts, and writes public/<path>/index.html.
Run from the repo root:  python3 tools/build.py
Nothing here runs on the server; commit the generated files in public/.
"""
import html, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'src', 'pages')
OUT = os.path.join(ROOT, 'public')
SITE = 'https://sinazk.com'
CV = '/cv'
VERSION = '20261127c'  # bump to bust caches when CSS/JS change

PAGES = [
    dict(src='index.html', out='index.html', path='/',
         title='Sina Zibakerdar · Human-Centred Product Designer',
         description='Sina Zibakerdar is a human-centred product designer who designs learning platforms, collaboration tools and AI-powered workflows. Case studies, CV and contact.',
         og='/assets/img/og/home.jpg', css=['home'], js=['/assets/hero-stage/hero-stage.js', '/assets/js/home.js'],
         extra_css=['/assets/hero-stage/hero-stage.css'], nav='home'),
    dict(src='about.html', out='about/index.html', path='/about/',
         title='About · Sina Zibakerdar, Product Designer',
         description='Sina Zibakerdar trained as an architect, studied User Experience Engineering at Goldsmiths in London, and now leads product design at TopTech in Tehran.',
         og='/assets/img/og/about.jpg', css=['about'], nav='about'),
    dict(src='404.html', out='404.html', path='/404.html',
         title='Page not found · Sina Zibakerdar',
         description='This page isn’t in the drawings. It may have moved, or it never existed.',
         og='/assets/img/og/home.jpg', css=['notfound'], nav='', robots='noindex'),
]

CASES = {
    'superreach': dict(name='SuperReach', line='Designing an AI-coached learning platform for sales &amp; recruitment teams', thumb='/assets/img/home/superreach-card-800.webp',
        title='SuperReach case study · Sina Zibakerdar',
        description='Designing an AI-coached learning platform for sales and recruitment teams: field research, AI roleplay calls with instant coaching, and a token-based design system.',
        project='SUPERREACH', client='SuperReach', role='Design lead', year='2024',
        sheets=['Research', 'Problems', 'AI features', 'Scaling', 'Outcome'], next='sola'),
    'office-culture-dj': dict(name='Office Culture DJ', line='Bringing back the hallway chat for a remote design studio', thumb='/assets/img/home/ocdj-card-800.webp',
        title='Office Culture DJ case study · Sina Zibakerdar',
        description='Bringing back the hallway chat: a three-month service design study of a remote design studio, and a Slack presence space, tested with 8 employees using existing tools as stand-ins.',
        project='OFFICE CULTURE DJ', client='Reason', role='UX research', year='2023',
        sheets=['Context', 'Research', 'Pain points', 'Connections', 'Design', 'Results'], next='cryptoland'),
    'cryptoland': dict(name='Cryptoland', line='Onboarding and trading flows for a centralised crypto exchange', thumb='/assets/img/work/1fe9beac-28a0-4d13-9d21-eeb7f2e9de5b-1200.webp',
        title='Cryptoland case study · Sina Zibakerdar',
        description='Redesigning onboarding, KYC and trading for a crypto exchange with tens of thousands of users, across web and mobile.',
        project='CRYPTOLAND', client='Dadehpardaz', role='Product design', year='2021',
        sheets=['Context', 'Research', 'Design', 'Outcome'], next='proda'),
    'proda': dict(name='Proda', line='Field app for telecom tower inspection and repair', thumb='/assets/img/work/2925ab6f-1660-4211-9ebe-5fa36edb23df-786.webp',
        title='Proda case study · Sina Zibakerdar',
        description='An internal app that guides technicians through inspecting and repairing mobile network towers, and gives supervisors what they need to act.',
        project='PRODA', client='NAK – MCI', role='Product design', year='2020',
        sheets=['Context', 'Problem', 'Solution', 'Outcome'], next='sok-sok'),
    'sok-sok': dict(name='SOK SOK', line='Location-based social app, awarded a development grant', thumb='/assets/img/work/projects-soksok-1200.webp',
        title='SOK SOK case study · Sina Zibakerdar',
        description='A location-based messaging app: pin a message to a place, and only your friend standing there can read it. Awarded a development grant.',
        project='SOK SOK', client='T-Lab, TUIC', role='Product design', year='2019',
        sheets=['Context', 'Problem', 'Solution'], next='superreach'),
    'sola': dict(name='Sola', line='Conversation design for an AI WhatsApp career coach', thumb='/assets/img/home/sola-card-800.webp',
        title='Sola case study · Sina Zibakerdar',
        description='Conversation design for Sola, an AI career coach on WhatsApp that helps young people land a first job. Bain & Company for The King’s Trust.',
        project='SOLA · GET HIRED', client='Bain &amp; Co', role='UX/UI · CxD', year='2025',
        sheets=['Context', 'Journey', 'Conversation', 'Voice', 'Interface', 'Guardrails', 'Testing'], next='office-culture-dj', robots='noindex, nofollow', css=['case', 'sola']),
}

for _slug in CASES:
    PAGES.append(dict(src=_slug + '.html', out='work/%s/index.html' % _slug, path='/work/%s/' % _slug,
                      title=CASES[_slug]['title'], description=CASES[_slug]['description'],
                      og='/assets/img/og/%s.jpg' % _slug, css=CASES[_slug].get('css', ['case']), robots=CASES[_slug].get('robots'), js=['/assets/js/case.js'], nav='work', case=_slug))

FONT_PRELOADS = ['space-grotesk-400', 'space-grotesk-500']


def head(p):
    url = SITE + p['path']
    t, d = html.escape(p['title']), html.escape(p['description'])
    css = ['/assets/css/site.css'] + p.get('extra_css', []) + ['/assets/css/%s.css' % c for c in p.get('css', [])]
    lines = [
        '<!doctype html>', '<html lang="en">', '<head>',
        '<meta charset="utf-8">',
        '<meta name="viewport" content="width=device-width, initial-scale=1">',
        '<title>%s</title>' % t,
        '<meta name="description" content="%s">' % d,
    ] + (['<meta name="robots" content="%s">' % p['robots']] if p.get('robots') else []) + [
        '<link rel="canonical" href="%s">' % url,
        '<meta name="theme-color" content="#F7F6F2">',
        '<meta property="og:type" content="website">',
        '<meta property="og:site_name" content="Sina Zibakerdar">',
        '<meta property="og:title" content="%s">' % t,
        '<meta property="og:description" content="%s">' % d,
        '<meta property="og:url" content="%s">' % url,
        '<meta property="og:image" content="%s%s">' % (SITE, p['og']),
        '<meta property="og:image:width" content="1200">',
        '<meta property="og:image:height" content="630">',
        '<meta name="twitter:card" content="summary_large_image">',
        '<link rel="icon" href="/favicon.ico" sizes="any">',
        '<link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32">',
        '<link rel="apple-touch-icon" href="/apple-touch-icon.png">',
    ]
    for f in FONT_PRELOADS:
        lines.append('<link rel="preload" href="/assets/fonts/%s.woff2" as="font" type="font/woff2" crossorigin>' % f)
    for c in css:
        lines.append('<link rel="stylesheet" href="%s?v=%s">' % (c, VERSION))
    lines.append('<script src="/assets/js/site.js?v=%s" defer></script>' % VERSION)
    for j in p.get('js', []):
        lines.append('<script src="%s?v=%s" defer></script>' % (j, VERSION))
    if not p.get('robots'):
        lines.append('<script src="/assets/js/clarity.js?v=%s" defer></script>' % VERSION)
    lines.append('</head>')
    return '\n'.join(lines)


def header(p):
    home = p.get('nav') == 'home'
    cur = lambda k: ' aria-current="page"' if p.get('nav') == k else ''
    return '''<a class="skip t-pm" href="#main">Skip to content</a>
<header class="site-header">
  <nav aria-label="Main" class="site-nav">
    <a href="%s" class="site-home"><img src="/assets/img/logo-64.png" width="64" height="64" alt=""><span class="t-pm site-name">Sina Zibakerdar</span></a>
    <div class="t-pm site-links">
      <a href="%s" class="nl"%s>Work</a>
      <a href="/about/" class="nl"%s>About</a>
      <a href="%s" target="_blank" rel="noopener" class="nl nav-cv">CV</a>
      <a href="%s" class="btn btn-dark btn-sm">Get in touch</a>
    </div>
  </nav>
</header>''' % ('#top' if home else '/', '#work' if home else '/#work', cur('work'), cur('about'), CV, '#contact' if home else '/#contact')


FOOTER = '''<footer class="site-footer">
  <div class="site-footer-in t-ps">
    <span>© 2026 Sina Zibakerdar · Product Designer</span>
    <div>
      <a href="https://www.linkedin.com/in/sinazk/" class="nl" rel="me noopener" target="_blank">LinkedIn</a>
      <a href="https://dribbble.com/sinazk" class="nl" rel="me noopener" target="_blank">Dribbble</a>
      <a href="https://www.instagram.com/sinazzk/" class="nl" rel="me noopener" target="_blank">Instagram</a>
    </div>
  </div>
</footer>
<div class="xhair" aria-hidden="true">
  <span class="xh-pill"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L20 20"/></svg></span>
  <div class="xh-rot"><div class="xhair-in">
  <span class="xh" style="left:0;top:10px;width:7px;height:1.5px"></span>
  <span class="xh" style="right:0;top:10px;width:7px;height:1.5px"></span>
  <span class="xh" style="left:10px;top:0;width:1.5px;height:7px"></span>
  <span class="xh" style="left:10px;bottom:0;width:1.5px;height:7px"></span>
  <span class="xh" style="left:9.5px;top:9.5px;width:2.5px;height:2.5px;border-radius:4px;background:var(--color-bg-inverse)"></span>
</div></div>
</div>'''


CONTACT = '''<!-- CONTACT -->
<section id="contact" class="contact bp" aria-labelledby="contact-title">
  <div class="wrap contact-in reveal">
    <h2 id="contact-title" class="t-h3">{heading}</h2>
    <div class="mailwrap">
      <a href="mailto:hi@sinazk.com" class="mail" aria-label="Email hi@sinazk.com"><span class="ch" aria-hidden="true" style="--i:0">h</span><span class="ch" aria-hidden="true" style="--i:1">i</span><span class="at" aria-hidden="true">@</span><span class="ch" aria-hidden="true" style="--i:3">s</span><span class="ch" aria-hidden="true" style="--i:4">i</span><span class="ch" aria-hidden="true" style="--i:5">n</span><span class="ch" aria-hidden="true" style="--i:6">a</span><span class="ch" aria-hidden="true" style="--i:7">z</span><span class="ch" aria-hidden="true" style="--i:8">k</span><span class="ch" aria-hidden="true" style="--i:9">.</span><span class="ch" aria-hidden="true" style="--i:10">c</span><span class="ch" aria-hidden="true" style="--i:11">o</span><span class="ch" aria-hidden="true" style="--i:12">m</span></a>
      <canvas class="hline" aria-hidden="true"></canvas>
    </div>
    <div class="mlabel" aria-hidden="true" style="top:112px">SHEET {sheet} · CONTACT</div>
  </div>
</section>'''


def tblock(c):
    """The drawing title block in the corner of a case study; case.js keeps it in step with the page."""
    bars = ''.join('<span class="tb-bar%s"></span>' % (' cur' if i == 0 else '') for i in range(len(c['sheets'])))
    return '''<aside class="tblock" aria-hidden="true">
  <div class="tb-row"><div class="tb-cell grow"><span class="tb-k">PROJECT</span><span class="tb-v strong">%s</span></div><div class="tb-cell" style="width:64px"><span class="tb-k">SHEET</span><span class="tb-v big"><span data-tb-no>01</span>/%02d</span></div></div>
  <div class="tb-row"><div class="tb-cell grow"><span class="tb-k">CLIENT</span><span class="tb-v">%s</span></div><div class="tb-cell grow"><span class="tb-k">ROLE</span><span class="tb-v">%s</span></div><div class="tb-cell" style="width:44px"><span class="tb-k">YEAR</span><span class="tb-v">%s</span></div></div>
  <div class="tb-row"><div class="tb-cell last"><span class="tb-k">NOW VIEWING</span><span class="tb-v accent" data-tb-name>%s</span><div class="tb-bars">%s</div></div></div>
</aside>''' % (c['project'], len(c['sheets']), c['client'], c['role'], c['year'], c['sheets'][0], bars)


def next_band(slug):
    """The dark band at the end of a case study linking to the next one."""
    n = CASES[slug]
    return '''<a href="/work/%s/" class="next">
  <div class="wrap next-in">
    <div class="next-copy"><span class="t-cap">NEXT CASE STUDY</span><span class="t-h4">%s <span class="arrow" aria-hidden="true">→</span></span><span class="t-pm">%s</span></div>
    <img src="%s" width="800" height="450" alt="" loading="lazy" decoding="async">
  </div>
</a>''' % (slug, n['name'], n['line'], n['thumb'])


def build():
    for p in PAGES:
        heading = ('Hiring for a product designer? Let’s talk.' if p['src'] == 'index.html'
                   else 'Hiring for a product designer, or building something complex? Let’s talk.')
        body = open(os.path.join(SRC, p['src']), encoding='utf-8').read().strip('\n')
        body = re.sub(r'\{\{CONTACT (\d\d)\}\}', lambda m: CONTACT.replace('{sheet}', m.group(1)).replace('{heading}', heading), body).replace('{{CV}}', CV)
        if p.get('case'):
            c = CASES[p['case']]
            body += '\n' + next_band(c['next']) + '\n' + tblock(c)
        doc = '\n'.join([head(p), '<body>', header(p), '<main id="main" tabindex="-1">', body, '</main>', FOOTER, '</body>', '</html>', ''])
        out = os.path.join(OUT, p['out'])
        os.makedirs(os.path.dirname(out), exist_ok=True)
        open(out, 'w', encoding='utf-8').write(doc)
        print('wrote', os.path.relpath(out, ROOT))

    urls = ['  <url><loc>%s</loc></url>' % html.escape(SITE + page['path'])
            for page in PAGES if not page.get('robots')]
    sitemap = ['<?xml version="1.0" encoding="UTF-8"?>',
               '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
               *urls, '</urlset>', '']
    with open(os.path.join(OUT, 'sitemap.xml'), 'w', encoding='utf-8') as file:
        file.write('\n'.join(sitemap))


if __name__ == '__main__':
    build()
