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
CV = 'https://drive.google.com/file/d/1TX_gvWSUKH6xAQ0qkMHym0XR-vtFZKS3/view?usp=sharing'
VERSION = '20261119b'  # bump to bust caches when CSS/JS change

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
]

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
<div class="xhair" aria-hidden="true"><div class="xhair-in">
  <span class="xh" style="left:0;top:10px;width:7px;height:1.5px"></span>
  <span class="xh" style="right:0;top:10px;width:7px;height:1.5px"></span>
  <span class="xh" style="left:10px;top:0;width:1.5px;height:7px"></span>
  <span class="xh" style="left:10px;bottom:0;width:1.5px;height:7px"></span>
  <span class="xh" style="left:9.5px;top:9.5px;width:2.5px;height:2.5px;border-radius:50%;background:var(--color-bg-inverse)"></span>
</div></div>'''


def build():
    for p in PAGES:
        body = open(os.path.join(SRC, p['src']), encoding='utf-8').read().strip('\n')
        body = body.replace('{{CV}}', CV)
        doc = '\n'.join([head(p), '<body>', header(p), '<main id="main" tabindex="-1">', body, '</main>', FOOTER, '</body>', '</html>', ''])
        out = os.path.join(OUT, p['out'])
        os.makedirs(os.path.dirname(out), exist_ok=True)
        open(out, 'w', encoding='utf-8').write(doc)
        print('wrote', os.path.relpath(out, ROOT))


if __name__ == '__main__':
    build()
