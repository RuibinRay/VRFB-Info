/**
 * Site chrome shared by every page: top bar with grouped navigation, learning
 * level and language controls, and the footer. Rendered from the dictionary so
 * the same code serves English, Spanish and Mandarin.
 *
 *   mountChrome({ active: 'lab' })                          // root pages (runtime language)
 *   mountChrome({ active: 'chemistry', langHref: code => … }) // static per-language pages
 */
import { t, getLang, LANGS, setLang, pillarPath, pagePath, homePath, getRoot } from '../i18n/index.js';
import { initLevel, LEVELS } from './level.js';

const MARK = '<svg class="brand__mark" viewBox="0 0 32 32" fill="none" aria-hidden="true"><rect x="3" y="6" width="9" height="20" rx="2" stroke="#26d9e3" stroke-width="2"/><rect x="20" y="6" width="9" height="20" rx="2" stroke="#ff9b2f" stroke-width="2"/><path d="M12 12h8M12 20h8" stroke="#e8edf5" stroke-width="2"/></svg>';

/** Navigation model: [id, href] or [groupId, [[id, href], …]]. */
export function navModel() {
  return [
    ['home', homePath()],
    ['lab', pagePath('lab')],
    ['sims', [['simulator', pagePath('simulator')], ['sizing', pagePath('sizing')], ['compare', pagePath('compare')], ['project', pagePath('project')]]],
    ['course', [['learn', pagePath('learn')], ['chemistry', pillarPath('chemistry')], ['anatomy', pillarPath('anatomy')], ['engineering', pillarPath('engineering')], ['economics', pillarPath('economics')], ['applications', pillarPath('applications')], ['glossary', pagePath('learn', '#glossary')], ['assessment', pagePath('learn', '#assessment')]]],
    ['references', pillarPath('references')],
  ];
}

export function mountChrome({ active = '', langHref = null, footer = true } = {}) {
  const lang = getLang();
  const cur = (id) => (id === active ? ' aria-current="page"' : '');
  const items = navModel().map(([id, target]) => {
    if (typeof target === 'string') return `<a href="${target}"${cur(id)}>${t(`nav.${id}`, id)}</a>`;
    const open = target.some(([cid]) => cid === active);
    return `<div class="nav__group${open ? ' is-current' : ''}"><button type="button" class="nav__top" aria-expanded="false" aria-haspopup="true">${t(`nav.${id}`, id)}<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button><div class="nav__menu">${target.map(([cid, href]) => `<a href="${href}"${cur(cid)}>${t(`nav.${cid}`, cid)}${t(`nav.hint.${cid}`) ? `<small>${t(`nav.hint.${cid}`)}</small>` : ''}</a>`).join('')}</div></div>`;
  }).join('');
  const langs = Object.entries(LANGS).map(([code, l]) => langHref
    ? `<a href="${langHref(code)}" lang="${code}" data-lang="${code}" title="${l.name}" aria-current="${code === lang}">${l.short}</a>`
    : `<button type="button" data-set-lang="${code}" lang="${code}" title="${l.name}" aria-current="${code === lang}">${l.short}</button>`).join('');
  const levelSelect = `<label class="level-pick" title="${t('nav.level', 'Level')}"><span class="visually-hidden">${t('nav.level', 'Level')}</span><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 13h3V9H2zM6.5 13h3V6h-3zM11 13h3V3h-3z" fill="currentColor"/></svg><select data-level-select aria-label="${t('nav.level', 'Level')}">${LEVELS.map(l => `<option value="${l}">${t(`nav.${l}`, l)}</option>`).join('')}</select></label>`;

  let header = document.getElementById('topbar');
  if (!header) { header = document.createElement('header'); header.id = 'topbar'; document.body.prepend(header); }
  header.className = 'topbar';
  header.innerHTML = `
    <a class="brand" href="${homePath()}">${MARK}<span>VRFB<small>${t('hero.sub', 'The Science of Flow Energy')}</small></span></a>
    <nav class="nav" id="nav" aria-label="${t('nav.main', 'Main')}">${items}</nav>
    <div class="topbar__right">
      ${levelSelect}
      <div class="lang-switch" role="group" aria-label="${t('nav.language', 'Language')}">${langs}</div>
      <button class="nav-toggle" id="nav-toggle" aria-label="${t('nav.menu', 'Open navigation')}" aria-expanded="false">☰</button>
    </div>`;

  // dropdown groups: hover on desktop (CSS), click / keyboard everywhere
  const groups = [...header.querySelectorAll('.nav__group')];
  const closeAll = (except) => groups.forEach(g => { if (g !== except) { g.classList.remove('is-open'); g.querySelector('.nav__top').setAttribute('aria-expanded', 'false'); } });
  groups.forEach(g => {
    const btn = g.querySelector('.nav__top');
    btn.addEventListener('click', (e) => { e.stopPropagation(); const open = !g.classList.contains('is-open'); closeAll(g); g.classList.toggle('is-open', open); btn.setAttribute('aria-expanded', String(open)); });
    g.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeAll(); btn.focus(); } });
  });
  document.addEventListener('click', () => closeAll());
  const toggle = header.querySelector('#nav-toggle'), nav = header.querySelector('#nav');
  toggle.addEventListener('click', (e) => { e.stopPropagation(); const open = nav.classList.toggle('is-open'); toggle.setAttribute('aria-expanded', String(open)); });
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) nav.classList.remove('is-open'); else e.stopPropagation(); });
  document.addEventListener('click', () => nav.classList.remove('is-open'));

  header.querySelectorAll('[data-set-lang]').forEach(b => b.addEventListener('click', () => setLang(b.dataset.setLang)));
  header.querySelectorAll('a[data-lang]').forEach(a => a.addEventListener('click', () => { try { localStorage.setItem('vrfb-lang', a.dataset.lang); } catch {} }));
  initLevel();

  if (footer) {
    let f = document.getElementById('footer');
    if (!f) { f = document.createElement('footer'); f.id = 'footer'; document.body.appendChild(f); }
    f.className = 'footer';
    f.innerHTML = `<div class="footer__inner"><div><strong>${t('footer.tag', 'VRFB — The Science of Flow Energy')}</strong><p>${t('footer.note', '')}</p></div>
      <nav class="footer__links" aria-label="${t('footer.links', 'Site')}"><a href="${homePath()}">${t('nav.home')}</a><a href="${pagePath('lab')}">${t('nav.lab')}</a><a href="${pagePath('simulator')}">${t('nav.simulator')}</a><a href="${pagePath('sizing')}">${t('nav.sizing')}</a><a href="${pagePath('compare')}">${t('nav.compare')}</a><a href="${pagePath('project')}">${t('nav.project')}</a><a href="${pagePath('learn')}">${t('nav.learn')}</a><a href="${pillarPath('references')}">${t('footer.sources', 'Sources')}</a><a href="https://github.com/RuibinRay/VRFB-Info" rel="noopener">${t('footer.repo', 'GitHub')}</a></nav></div>`;
  }
  // scroll progress under the top bar
  const onScroll = () => { const h = document.documentElement; const p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight); header.style.setProperty('--progress', `${(p * 100).toFixed(1)}%`); };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  return header;
}
