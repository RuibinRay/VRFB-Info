/**
 * Runtime internationalisation for the homepage.
 * Language = ?lang= query → localStorage('vrfb-lang') → navigator.language → 'en'.
 * Dictionaries live in ./en.js, ./es.js, ./zh.js. Elements carrying data-i18n get
 * their innerHTML from the dictionary; data-pillar links point at the language's
 * pillar directory. Pillar pages are static per language (pillars/, pillars/es/, pillars/zh/).
 */
export const LANGS = { en: { short: 'EN', name: 'English', html: 'en' }, es: { short: 'ES', name: 'Español', html: 'es' }, zh: { short: '中文', name: '中文', html: 'zh-CN' } };
let dict = null, lang = 'en';

export function detect() {
  const q = new URLSearchParams(location.search).get('lang');
  if (q && LANGS[q]) { try { localStorage.setItem('vrfb-lang', q); } catch {} return q; }
  try { const s = localStorage.getItem('vrfb-lang'); if (s && LANGS[s]) return s; } catch {}
  const n = (navigator.language || 'en').toLowerCase();
  if (n.startsWith('es')) return 'es';
  if (n.startsWith('zh')) return 'zh';
  return 'en';
}

export async function init() {
  lang = detect();
  dict = (await import(`./${lang}.js`)).default;
  document.documentElement.lang = LANGS[lang].html;
  document.body.dataset.lang = lang;
  applyDom();
  return lang;
}

export const getLang = () => lang;
export function t(key, fallback = '') { return key.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), dict) ?? fallback; }
export function pillarPath(slug) { return `pillars/${lang === 'en' ? '' : lang + '/'}${slug}.html`; }
export function setLang(code) { if (!LANGS[code]) return; try { localStorage.setItem('vrfb-lang', code); } catch {} const u = new URL(location.href); u.searchParams.set('lang', code); location.replace(u.toString()); }

export function applyDom(root = document) {
  root.querySelectorAll('[data-i18n]').forEach(el => { const v = t(el.dataset.i18n); if (v) el.innerHTML = v; });
  root.querySelectorAll('[data-i18n-attr]').forEach(el => { el.dataset.i18nAttr.split(',').forEach(pair => { const [attr, key] = pair.split(':'); const v = t(key); if (v) el.setAttribute(attr, v); }); });
  root.querySelectorAll('[data-pillar]').forEach(el => { el.setAttribute('href', pillarPath(el.dataset.pillar) + (el.dataset.hash || '')); });
  root.querySelectorAll('.chapter[data-chapter]').forEach(el => { const v = t(`chapters.${el.dataset.chapter}.title`); if (v) el.dataset.title = v; });
  root.querySelectorAll('.lang-switch [data-set-lang]').forEach(b => { b.setAttribute('aria-current', String(b.dataset.setLang === lang)); b.addEventListener('click', () => setLang(b.dataset.setLang)); });
  const title = t('meta.title'); if (title) document.title = title;
  const desc = t('meta.description'); const m = document.querySelector('meta[name="description"]'); if (desc && m) m.setAttribute('content', desc);
}
