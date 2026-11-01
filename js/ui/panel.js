import { COMPONENTS } from '../data/components.js';

/**
 * Component information panel. `opts.t` translates headings, `opts.pillarPath`
 * builds links into the current language's pillar pages, and `opts.components`
 * (optional) overrides the English specifications with a translated set.
 */
export function createPanel(root, opts = {}) {
  const t = opts.t || ((k, f) => f);
  const pillarPath = opts.pillarPath || (slug => `pillars/${slug}.html`);
  const title = root.querySelector('#panel-title'), kicker = root.querySelector('#panel-kicker'), body = root.querySelector('#panel-body');
  function open(id) {
    const base = COMPONENTS[id]; if (!base) return;
    const c = { ...base, ...((opts.components && opts.components[id]) || {}) };
    kicker.textContent = c.kicker; title.innerHTML = `<span class="panel__swatch" style="background:${c.color}"></span>${c.name}`;
    body.innerHTML = `<p>${c.role}</p>
      <h4>${t('panel.spec', 'Specification')}</h4><dl>${c.specs.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>
      ${c.facts?.length ? `<h4>${t('panel.facts', 'Worth knowing')}</h4>${c.facts.map(f => `<p>${f}</p>`).join('')}` : ''}
      <h4>${t('panel.sources', 'Sources')}</h4><p class="panel__refs">${c.refs.map(r => `<a href="${pillarPath('references')}#ref-${r}">[${r}]</a>`).join(' ')} · <a href="${pillarPath('anatomy')}#${id}">${t('panel.more', 'Read more in Anatomy →')}</a></p>`;
    root.classList.add('is-open'); root.setAttribute('aria-hidden', 'false');
  }
  function close() { root.classList.remove('is-open'); root.setAttribute('aria-hidden', 'true'); }
  root.querySelector('#panel-close').addEventListener('click', close);
  window.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  return { open, close, isOpen: () => root.classList.contains('is-open') };
}
