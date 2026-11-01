#!/usr/bin/env python3
"""Generates the pillar pages in every language from one template.

    python3 tools/gen_pages.py

English pages land in pillars/, Spanish in pillars/es/, Mandarin in pillars/zh/.
Content lives in tools/content_<lang>.py; helpers in tools/helpers.py.
"""
import importlib, pathlib, sys
ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'tools'))

LANGS = [('en', ''), ('es', 'es/'), ('zh', 'zh/')]          # (code, sub-directory)
SWITCHER = [('en', 'EN', 'English'), ('es', 'ES', 'Español'), ('zh', '中文', '中文')]
NAV_ORDER = ['home', 'chemistry', 'anatomy', 'engineering', 'economics', 'applications', 'references']

def level_toggle(ui):
    return (f'<div class="level" role="group" aria-label="{ui["reading_level"]}"><button type="button" data-level="beginner">{ui["beginner"]}</button><button type="button" data-level="advanced">{ui["advanced"]}</button></div>'
            f'<p class="level-note">{ui["level_note"]}</p>')

def switcher(lang, slug, sub):
    """Links to the same page in the other languages; pillar.js stores the choice."""
    items = []
    for code, short, full in SWITCHER:
        target_sub = dict(LANGS)[code]
        href = ('../' * sub.count('/')) + target_sub + f'{slug}.html'
        cur = ' aria-current="true"' if code == lang else ''
        items.append(f'<a href="{href}" lang="{code}" data-lang="{code}" title="{full}"{cur}>{short}</a>')
    return '<div class="lang-switch" role="group">' + ''.join(items) + '</div>'

def page(mod, p, sub):
    ui, lang = mod.UI, mod.LANG
    root = '../' + '../' * sub.count('/')
    slug = p['slug']
    home = f'{root}?lang={lang}' if lang != 'en' else root
    nav_items = []
    for key in NAV_ORDER:
        href = home if key == 'home' else f'{key}.html'
        cur = ' aria-current="page"' if key == slug else ''
        nav_items.append(f'<a href="{href}"{cur}>{ui["nav"][key]}</a>')
    toc_html = ''.join(f'<li><a href="#{i}">{t}</a></li>' for i, t in p['toc'])
    pnav = ''.join(f'<a href="{s}.html" style="--c:{c}"><small>{ui["pillar"]} {n}</small>{t}</a>' for s, n, t, c in mod.PILLARS if s != slug)
    scr = ''.join(f'<script type="module" src="{root}js/calc/{s}.js"></script>' for s in p.get('scripts', ()))
    desc = (p.get('desc') or p['lede'])[:150].replace('"', '&quot;')
    return f'''<!doctype html>
<html lang="{mod.HTML_LANG}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>{p['title']} — {ui['site_title']}</title>
  <meta name="description" content="{desc}">
  <meta name="theme-color" content="#070a10">
  <link rel="icon" href="{root}assets/favicon.svg" type="image/svg+xml">
  <link rel="alternate" hreflang="en" href="{root}pillars/{slug}.html">
  <link rel="alternate" hreflang="es" href="{root}pillars/es/{slug}.html">
  <link rel="alternate" hreflang="zh" href="{root}pillars/zh/{slug}.html">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="{root}css/main.css">
  <style>:root {{ --accent: {p['accent']}; }}</style>
</head>
<body class="page" data-level="beginner" data-lang="{lang}">
  <header class="topbar">
    <a class="brand" href="{home}">
      <svg class="brand__mark" viewBox="0 0 32 32" fill="none" aria-hidden="true"><rect x="3" y="6" width="9" height="20" rx="2" stroke="#26d9e3" stroke-width="2"/><rect x="20" y="6" width="9" height="20" rx="2" stroke="#ff9b2f" stroke-width="2"/><path d="M12 12h8M12 20h8" stroke="#e8edf5" stroke-width="2"/></svg>
      <span>VRFB<small>{ui['brand_sub']}</small></span>
    </a>
    <nav class="nav" id="nav" aria-label="{ui['pillar']}">{''.join(nav_items)}</nav>
    <div class="topbar__right">
      {switcher(lang, slug, sub)}
      <button class="nav-toggle" id="nav-toggle" aria-label="Menu" aria-expanded="false">☰</button>
    </div>
  </header>
  <main>
    <section class="page-hero">
      <div class="page-hero__bg"></div>
      <div class="eyebrow">{p['kicker']}</div>
      <h1>{p['title']}</h1>
      <p class="lede">{p['lede']}</p>
      {level_toggle(ui) if p.get('toggle', True) else ''}
    </section>
    <div class="page-body">
      <aside class="toc" aria-label="{ui['on_this_page']}"><div class="eyebrow">{ui['on_this_page']}</div><ol>{toc_html}</ol></aside>
      <article class="article">
{p['body']}
        <nav class="pillar-nav" aria-label="{ui['other_pillars']}">{pnav}</nav>
      </article>
    </div>
  </main>
  <footer class="footer"><div class="footer__inner"><span>{ui['footer_tag']}</span><span><a href="references.html">{ui['footer_sources']}</a> · <a href="{home}">{ui['footer_back']}</a></span></div></footer>
  <script src="{root}js/pillar.js"></script>
  {scr}
</body>
</html>
'''

if __name__ == '__main__':
    for lang, sub in LANGS:
        try:
            mod = importlib.import_module(f'content_{lang}')
        except ModuleNotFoundError:
            print(f'skip {lang}: tools/content_{lang}.py not found'); continue
        out = ROOT / 'pillars' / sub
        out.mkdir(parents=True, exist_ok=True)
        for p in mod.PAGES:
            (out / f"{p['slug']}.html").write_text(page(mod, p, sub), encoding='utf-8')
        print(f'{lang}: wrote {len(mod.PAGES)} pages to pillars/{sub}')
