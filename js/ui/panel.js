import { COMPONENTS } from '../data/components.js';

export function createPanel(root) {
  const title = root.querySelector('#panel-title'), kicker = root.querySelector('#panel-kicker'), body = root.querySelector('#panel-body');
  function open(id) {
    const c = COMPONENTS[id]; if (!c) return;
    kicker.textContent = c.kicker; title.innerHTML = `<span class="panel__swatch" style="background:${c.color}"></span>${c.name}`;
    body.innerHTML = `<p>${c.role}</p>
      <h4>Specification</h4><dl>${c.specs.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>
      ${c.facts?.length ? `<h4>Worth knowing</h4>${c.facts.map(f => `<p>${f}</p>`).join('')}` : ''}
      <h4>Sources</h4><p class="panel__refs">${c.refs.map(r => `<a href="pillars/references.html#ref-${r}">[${r}]</a>`).join(' ')} · <a href="pillars/anatomy.html#${id}">Read more in Anatomy →</a></p>`;
    root.classList.add('is-open'); root.setAttribute('aria-hidden', 'false');
  }
  function close() { root.classList.remove('is-open'); root.setAttribute('aria-hidden', 'true'); }
  root.querySelector('#panel-close').addEventListener('click', close);
  window.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  return { open, close, isOpen: () => root.classList.contains('is-open') };
}
