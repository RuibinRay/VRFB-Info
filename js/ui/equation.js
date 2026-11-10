/**
 * Clickable equations: every symbol is a button; pressing one explains what it
 * means, its unit and a typical value.
 *   renderEquation(el, { parts, vars, note }, { hint })
 * parts: array of plain HTML strings and [html, key] pairs for the clickable symbols.
 * vars:  { key: { n: name, u: unit, d: description } }
 */
export function renderEquation(el, spec, opts = {}) {
  el.classList.add('eq-live');
  const line = spec.parts.map(p => Array.isArray(p) ? `<button type="button" class="eq-sym" data-k="${p[1]}" aria-pressed="false">${p[0]}</button>` : p).join('');
  el.innerHTML = `<div class="eq-live__line">${line}</div>${spec.note ? `<div class="eq-live__hint">${spec.note}</div>` : ''}<div class="eq-live__info" aria-live="polite"><span class="muted">${opts.hint || 'Select a symbol to see what it means.'}</span></div>`;
  const info = el.querySelector('.eq-live__info');
  el.querySelectorAll('.eq-sym').forEach(btn => btn.addEventListener('click', () => {
    const v = spec.vars[btn.dataset.k]; if (!v) return;
    el.querySelectorAll('.eq-sym').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.k === btn.dataset.k)));
    info.innerHTML = `<b>${btn.innerHTML}</b> — ${v.n}${v.u ? `<span class="unit">[${v.u}]</span>` : ''}<br>${v.d || ''}`;
  }));
}
