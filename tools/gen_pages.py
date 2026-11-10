#!/usr/bin/env python3
"""Generates the pillar (chapter) pages in every language from one template.

    python3 tools/gen_pages.py

English pages land in pillars/, Spanish in pillars/es/, Mandarin in pillars/zh/.
Article content lives in tools/content_<lang>.py; helpers in tools/helpers.py.

The top bar, footer, learning-level control, glossary tooltips and the lesson
kits are added in the browser by js/pillar.js, so they stay identical to the
rest of the site. This script only places an empty lesson kit at the end of the
section each lesson belongs to (LESSON_AT mirrors js/learn/course.js).
"""
import importlib, pathlib, re, sys
ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'tools'))

LANGS = [('en', ''), ('es', 'es/'), ('zh', 'zh/')]          # (code, sub-directory)

# pillar slug -> {section id: lesson id}. Keep in step with js/learn/course.js.
LESSON_AT = {
    'chemistry': {'why-vanadium': 'chem-states', 'half-reactions': 'chem-reactions', 'nernst': 'chem-nernst', 'electrolyte': 'chem-electrolyte', 'side-reactions': 'chem-side'},
    'anatomy': {'overview': 'anat-cell', 'components': 'anat-membrane', 'balance-of-plant': 'anat-bop'},
    'engineering': {'power-vs-energy': 'eng-power-energy', 'efficiency': 'eng-efficiency', 'thermal': 'eng-flow'},
    'economics': {'cost-structure': 'econ-capex', 'lcos-tool': 'econ-lcos', 'comparison': 'econ-compare'},
    'applications': {'dispatch-tool': 'app-dispatch'},
}

def level_toggle(ui):
    btn = lambda k: f'<button type="button" data-level-set="{k}">{ui[k]}</button>'
    return (f'<div class="level" role="group" aria-label="{ui["reading_level"]}">{btn("beginner")}{btn("intermediate")}{btn("advanced")}</div>'
            f'<p class="level-note">{ui["level_note"]}</p>')

def add_kits(slug, body):
    """Appends an empty lesson kit to the end of each mapped <section>."""
    for sec, lesson in LESSON_AT.get(slug, {}).items():
        m = re.search(r'<section id="%s">' % re.escape(sec), body)
        if not m:
            raise SystemExit(f'section #{sec} not found in {slug}')
        end = body.index('</section>', m.end())
        body = body[:end] + f'  <div class="kit" data-lesson="{lesson}"></div>\n' + body[end:]
    return body

def page(mod, p, sub):
    ui, lang = mod.UI, mod.LANG
    root = '../' + '../' * sub.count('/')
    slug = p['slug']
    home = f'{root}?lang={lang}' if lang != 'en' else root
    toc_html = ''.join(f'<li><a href="#{i}">{t}</a></li>' for i, t in p['toc'])
    pnav = ''.join(f'<a href="{s}.html" style="--c:{c}"><small>{ui["pillar"]} {n}</small>{t}</a>' for s, n, t, c in mod.PILLARS if s != slug)
    scr = ''.join(f'<script type="module" src="{root}js/calc/{s}.js"></script>' for s in p.get('scripts', ()))
    desc = re.sub(r'<[^>]+>', '', (p.get('desc') or p['lede']))[:155].replace('"', '&quot;')
    body = add_kits(slug, p['body'])
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
  <link rel="stylesheet" href="{root}css/labs.css">
  <style>:root {{ --accent: {p['accent']}; }}</style>
</head>
<body class="page" data-level="beginner" data-lang="{lang}" data-root="{root}" data-slug="{slug}">
  <header class="topbar" id="topbar"><a class="brand" href="{home}"><span>VRFB<small>{ui['brand_sub']}</small></span></a></header>
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
{body}
        <nav class="pillar-nav" aria-label="{ui['other_pillars']}">{pnav}</nav>
      </article>
    </div>
  </main>
  <footer class="footer" id="footer"><div class="footer__inner"><span>{ui['footer_tag']}</span><span><a href="references.html">{ui['footer_sources']}</a> · <a href="{home}">{ui['footer_back']}</a></span></div></footer>
  <script type="module" src="{root}js/pillar.js"></script>
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
