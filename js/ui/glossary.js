/**
 * Glossary tooltips. Elements with data-term="id" (or text auto-linked with
 * autoLink) show the definition on hover, focus or tap.
 *   initGlossary(terms)   terms: { id: { t: term, d: definition, m?: [extra strings to match] } }
 */
let TERMS = {}, tip = null, index = [];

export function initGlossary(terms) {
  TERMS = terms || {};
  index = Object.entries(TERMS).flatMap(([id, g]) => [g.t, ...(g.m || [])].map(s => ({ id, s }))).filter(x => x.s && x.s.length > 2).sort((a, b) => b.s.length - a.s.length);
  if (!tip) {
    tip = document.createElement('div'); tip.className = 'gloss-tip'; tip.setAttribute('role', 'tooltip'); document.body.appendChild(tip);
    const show = (el) => {
      const g = TERMS[el.dataset.term]; if (!g) return;
      tip.innerHTML = `<b>${g.t}</b>${g.d}`;
      const r = el.getBoundingClientRect(); tip.classList.add('is-on');
      const w = tip.offsetWidth, h = tip.offsetHeight;
      tip.style.left = `${Math.max(8, Math.min(innerWidth - w - 8, r.left + r.width / 2 - w / 2))}px`;
      tip.style.top = `${r.top - h - 8 > 8 ? r.top - h - 8 : r.bottom + 8}px`;
    };
    const hide = () => tip.classList.remove('is-on');
    document.addEventListener('pointerover', e => { const el = e.target.closest?.('[data-term]'); if (el) show(el); });
    document.addEventListener('pointerout', e => { if (e.target.closest?.('[data-term]')) hide(); });
    document.addEventListener('focusin', e => { const el = e.target.closest?.('[data-term]'); if (el) show(el); });
    document.addEventListener('focusout', hide);
    document.addEventListener('click', e => { const el = e.target.closest?.('[data-term]'); if (el) show(el); else hide(); });
    window.addEventListener('scroll', hide, { passive: true });
  }
  document.querySelectorAll('[data-term]').forEach(decorate);
}
function decorate(el) { el.classList.add('term'); if (!el.hasAttribute('tabindex')) el.tabIndex = 0; }

/**
 * Wraps the first occurrence of each glossary term inside `root` (text nodes
 * only; skips links, buttons, code, headings and existing terms).
 */
export function autoLink(root, limit = 12) {
  if (!index.length || !root) return;
  const used = new Set(); let count = 0;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.parentElement.closest('a,button,code,h1,h2,h3,h4,[data-term],.eq-live,.equation,select,option,label') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT) });
  const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
  const cjk = /[㐀-鿿]/;
  for (const node of nodes) {
    if (count >= limit) break;
    let text = node.nodeValue; if (!text || text.trim().length < 3) continue;
    const lower = text.toLowerCase();
    for (const { id, s } of index) {
      if (used.has(id)) continue;
      const at = lower.indexOf(s.toLowerCase()); if (at < 0) continue;
      if (!cjk.test(s)) { const before = lower[at - 1], after = lower[at + s.length]; if ((before && /[a-záéíóúñü0-9]/i.test(before)) || (after && /[a-záéíóúñü0-9]/i.test(after))) continue; }
      const range = document.createRange(); range.setStart(node, at); range.setEnd(node, at + s.length);
      const span = document.createElement('dfn'); span.dataset.term = id; decorate(span); range.surroundContents(span);
      used.add(id); count++; break; // the node was split; continue with the next text node
    }
  }
}
export const getTerms = () => TERMS;
