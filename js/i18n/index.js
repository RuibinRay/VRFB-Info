/**
 * Runtime internationalisation shared by every page.
 *
 * Language = forced (static pillar pages) → ?lang= query → localStorage('vrfb-lang')
 *            → navigator.language → 'en'.
 * Dictionaries: ./en.js, ./es.js, ./zh.js (navigation, homepage) plus optional
 * bundles named in init({ extra }) such as ./labs.en.js or ./learn.en.js, which
 * are merged under their own key (t('labs.sim.title')).
 * Elements carrying data-i18n get their innerHTML from the dictionary.
 */
export const LANGS = { en: { short: 'EN', name: 'English', html: 'en' }, es: { short: 'ES', name: 'Español', html: 'es' }, zh: { short: '中文', name: '中文', html: 'zh-CN' } };
let dict = {}, lang = 'en', root = '', staticPage = false;

export function detect() {
  const q = new URLSearchParams(location.search).get('lang');
  if (q && LANGS[q]) { try { localStorage.setItem('vrfb-lang', q); } catch {} return q; }
  try { const s = localStorage.getItem('vrfb-lang'); if (s && LANGS[s]) return s; } catch {}
  const n = (navigator.language || 'en').toLowerCase();
  if (n.startsWith('es')) return 'es';
  if (n.startsWith('zh')) return 'zh';
  return 'en';
}

/**
 * opts.extra  bundles to load, e.g. ['labs', 'learn']
 * opts.lang   force a language (static per-language pages pass their own)
 * opts.root   relative path from the page to the site root ('' or '../' or '../../')
 */
export async function init(opts = {}) {
  if (Array.isArray(opts)) opts = { extra: opts };
  root = opts.root || '';
  staticPage = !!(opts.lang && LANGS[opts.lang]);   // per-language static page: keep its own <title> and lang
  lang = staticPage ? opts.lang : detect();
  const [base, ...bundles] = await Promise.all([import(`./${lang}.js`), ...(opts.extra || []).map(n => import(`./${n}.${lang}.js`))]);
  dict = { ...base.default };
  (opts.extra || []).forEach((n, i) => { dict[n] = bundles[i].default; });
  if (!opts.lang) document.documentElement.lang = LANGS[lang].html;
  document.body.dataset.lang = lang;
  applyDom();
  return lang;
}

export const getLang = () => lang;
export const getRoot = () => root;
export function t(key, fallback = '') { return key.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), dict) ?? fallback; }
/** t() with {placeholders} replaced from an object. */
export function tf(key, vars = {}, fallback = '') { return String(t(key, fallback)).replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : `{${k}}`)); }
const q = () => (lang === 'en' ? '' : `?lang=${lang}`);
export function pillarPath(slug) { return `${root}pillars/${lang === 'en' ? '' : lang + '/'}${slug}.html`; }
/** Root-level app pages (lab, simulator, sizing, compare, project, learn). */
export function pagePath(name, hash = '') { return `${root}${name}.html${q()}${hash}`; }
export function homePath() { return `${root || './'}${q()}`; }
export function setLang(code) { if (!LANGS[code]) return; try { localStorage.setItem('vrfb-lang', code); } catch {} const u = new URL(location.href); u.searchParams.set('lang', code); location.replace(u.toString()); }
/** Locale-aware number formatting. */
export function num(v, digits = 0) { return Number(v).toLocaleString(LANGS[lang].html, { minimumFractionDigits: digits, maximumFractionDigits: digits }); }

export function applyDom(scope = document) {
  scope.querySelectorAll('[data-i18n]').forEach(el => { const v = t(el.dataset.i18n); if (v) el.innerHTML = v; });
  scope.querySelectorAll('[data-i18n-attr]').forEach(el => { el.dataset.i18nAttr.split(',').forEach(pair => { const [attr, key] = pair.split(':'); const v = t(key); if (v) el.setAttribute(attr, v); }); });
  scope.querySelectorAll('[data-pillar]').forEach(el => { el.setAttribute('href', pillarPath(el.dataset.pillar) + (el.dataset.hash || '')); });
  scope.querySelectorAll('[data-page]').forEach(el => { el.setAttribute('href', pagePath(el.dataset.page, el.dataset.hash || '')); });
  scope.querySelectorAll('.chapter[data-chapter]').forEach(el => { const v = t(`chapters.${el.dataset.chapter}.title`); if (v) el.dataset.title = v; });
  if (scope === document && !staticPage) {
    const key = document.body.dataset.titleKey || 'meta.title';
    const title = t(key); if (title) document.title = key === 'meta.title' ? title : `${title} — ${t('meta.site', 'VRFB')}`;
    const desc = t(document.body.dataset.descKey || 'meta.description'); const m = document.querySelector('meta[name="description"]'); if (desc && m) m.setAttribute('content', String(desc).replace(/<[^>]+>/g, ''));
  }
}
