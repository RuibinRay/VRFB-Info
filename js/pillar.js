/**
 * Pillar (chapter) pages. The article is static HTML generated per language by
 * tools/gen_pages.py; this module adds the shared chrome, the learning level,
 * glossary tooltips, lesson kits, clickable equations and the scroll-spy.
 */
import { init, t } from './i18n/index.js';
import { mountChrome } from './ui/chrome.js';
import { initGlossary, autoLink } from './ui/glossary.js';
import { renderKit } from './learn/kit.js';

const body = document.body, root = body.dataset.root || '../', slug = body.dataset.slug || '';
const lang = (document.documentElement.lang || 'en').slice(0, 2);
await init({ lang, root, extra: ['learn'] });
mountChrome({ active: slug, langHref: (code) => `${root}pillars/${code === 'en' ? '' : code + '/'}${slug}.html` });
initGlossary(t('learn.glossary', {}));

document.querySelectorAll('.kit[data-lesson]').forEach(el => renderKit(el, el.dataset.lesson, { context: 'pillar' }));
document.querySelectorAll('.article > section').forEach(sec => { sec.querySelectorAll(':scope > p, :scope > ul').forEach(p => autoLink(p, 3)); });

// TOC scroll-spy
const links = [...document.querySelectorAll('.toc a[href^="#"]')];
const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
if (sections.length && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => { entries.forEach(e => { if (e.isIntersecting) links.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === '#' + e.target.id)); }); }, { rootMargin: '-20% 0px -70% 0px' });
  sections.forEach(s => io.observe(s));
}
// arriving with a #hash before the kits were rendered: settle on the target again
if (location.hash) requestAnimationFrame(() => document.querySelector(location.hash)?.scrollIntoView());
