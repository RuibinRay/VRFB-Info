/**
 * Shared plumbing for the laboratory pages: language + chrome boot, input
 * helpers, number formatting, the three-level explanation block and the
 * CSV / Excel / PDF download bar.
 */
import { init as initI18n, t, tf, num, getLang, pagePath, pillarPath } from '../i18n/index.js';
import { mountChrome } from '../ui/chrome.js';
import { initGlossary, autoLink } from '../ui/glossary.js';
import { toCSV, toXLSX, download, MIME } from '../sim/exporters.js';
import { makeReport } from '../ui/report.js';

export { t, tf, num, getLang, pagePath, pillarPath, autoLink };

export async function boot(active) {
  await initI18n({ extra: ['labs', 'learn'] });
  mountChrome({ active });
  initGlossary(t('learn.glossary', {}));
  document.querySelectorAll('[data-autolink]').forEach(el => autoLink(el, 8));
  return (k, f = '') => t(`labs.${active}.${k}`, f);
}

/** Number input with label and unit. */
export function field(k, label, value, { unit = '', min, max, step = 'any', hint = '' } = {}) {
  const a = (n, v) => (v !== undefined ? ` ${n}="${v}"` : '');
  return `<label class="field"><span>${label}${unit ? ` <span class="muted">(${unit})</span>` : ''}</span><input type="number" data-k="${k}" value="${value}"${a('min', min)}${a('max', max)}${a('step', step)} inputmode="decimal">${hint ? `<span class="hint">${hint}</span>` : ''}</label>`;
}
/** Range slider with a live value. */
export function slider(k, label, value, { unit = '', min = 0, max = 100, step = 1 } = {}) {
  return `<div class="bigslider"><label for="s-${k}"><span>${label}</span><output data-val="${k}">${value}${unit}</output></label><input type="range" id="s-${k}" data-k="${k}" data-unit="${unit}" value="${value}" min="${min}" max="${max}" step="${step}"></div>`;
}
export function checkbox(k, label, checked = false) { return `<label class="toggle"><span>${label}</span><input type="checkbox" data-k="${k}"${checked ? ' checked' : ''}></label>`; }

/** Reads every [data-k] control in root: numbers (clamped to min/max), checkboxes as 0/1, selects as strings. */
export function readParams(root) {
  const o = {};
  root.querySelectorAll('[data-k]').forEach(el => {
    if (el.type === 'checkbox') { o[el.dataset.k] = el.checked ? 1 : 0; return; }
    if (el.tagName === 'SELECT') { const v = el.value; o[el.dataset.k] = isNaN(+v) || v === '' ? v : +v; return; }
    let v = parseFloat(el.value); if (!Number.isFinite(v)) v = parseFloat(el.defaultValue) || 0;
    if (el.min !== '' && v < +el.min) v = +el.min; if (el.max !== '' && v > +el.max) v = +el.max;
    o[el.dataset.k] = v;
    const out = root.querySelector(`[data-val="${el.dataset.k}"]`); if (out) out.textContent = `${el.value}${el.dataset.unit || ''}`;
  });
  return o;
}
export function setParams(root, values) { Object.entries(values).forEach(([k, v]) => { const el = root.querySelector(`[data-k="${k}"]`); if (!el) return; if (el.type === 'checkbox') el.checked = !!v; else el.value = v; }); }
export const out = (root, k, v) => { const el = root.querySelector(`[data-out="${k}"]`); if (el) el.textContent = v; };
export const readout = (k, label, key = false) => `<div class="readout${key ? ' is-key' : ''}"><b data-out="${k}">—</b><span>${label}</span></div>`;

/** Money with sensible magnitude suffixes; currency is US dollars throughout the site. */
export function money(v, digits = 2) {
  const a = Math.abs(v), sign = v < 0 ? '−' : '';
  if (a >= 1e9) return `${sign}$${num(a / 1e9, digits)} B`;
  if (a >= 1e6) return `${sign}$${num(a / 1e6, digits)} M`;
  if (a >= 1e4) return `${sign}$${num(a / 1e3, 0)} k`;
  return `${sign}$${num(a, 0)}`;
}
/** Engineering quantity with unit scaling: kW → MW → GW etc. */
export function scaled(v, units, digits = 1) { let i = 0, x = v; while (Math.abs(x) >= 1000 && i < units.length - 1) { x /= 1000; i++; } return `${num(x, Math.abs(x) >= 100 ? 0 : digits)} ${units[i]}`; }

/** Three paragraphs, one per learning level; the stylesheet shows the right ones. */
export function levelBlock(levels) {
  const tag = (cls, key) => `<span class="lv-tag lv-tag--${cls}">${t(`labs.common.${key}`)}</span><br>`;
  return `<div class="explain" data-autolink><p>${tag('b', 'beginner')}${levels.b}</p><p class="lv-i">${tag('i', 'intermediate')}${levels.i}</p><p class="lv-a">${tag('a', 'advanced')}${levels.a}</p></div>`;
}

const ICON = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 2v8M4.5 7 8 10.5 11.5 7M3 13.5h10"/></svg>';
/**
 * Download bar. build() returns { name, sheets: [{ name, rows }], report: { title, subtitle, blocks } }.
 * CSV gets the first sheet (or all sheets separated by a blank line), Excel all sheets, PDF the report.
 */
export function downloadBar(el, build) {
  const L = (k) => t(`labs.common.${k}`);
  el.classList.add('dl-row');
  el.innerHTML = `<span class="muted" style="font-size:0.82rem">${L('download')}:</span>` + ['xlsx', 'csv', 'pdf'].map(k => `<button type="button" class="btn btn--ghost btn--sm" data-dl="${k}">${ICON}${L(k)}</button>`).join('');
  const stamp = () => new Date().toISOString().slice(0, 10);
  el.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-dl]'); if (!b) return;
    const d = build(); const base = `${d.name}-${stamp()}`;
    b.disabled = true;
    try {
      if (b.dataset.dl === 'csv') download(`${base}.csv`, toCSV(d.sheets.flatMap((s, i) => [...(i ? [[]] : []), [`# ${s.name}`], ...s.rows])), MIME.csv);
      else if (b.dataset.dl === 'xlsx') download(`${base}.xlsx`, toXLSX(d.sheets), MIME.xlsx);
      else download(`${base}.pdf`, await makeReport({ footer: `${t('meta.site')} · ${location.origin}${location.pathname} · ${stamp()}`, ...d.report }), MIME.pdf);
    } finally { b.disabled = false; }
  });
}
