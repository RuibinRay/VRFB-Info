/**
 * Learning level shared across the whole site: beginner → intermediate → advanced.
 * Stored in localStorage('vrfb-level') and mirrored on <body data-level>, which
 * the stylesheets use to reveal .lv-i (intermediate and up) and .lv-a (advanced).
 * Any control with [data-level-set="…"] or a <select data-level-select> is wired up.
 */
export const LEVELS = ['beginner', 'intermediate', 'advanced'];
const KEY = 'vrfb-level';

export function getLevel() {
  try { const v = localStorage.getItem(KEY); if (LEVELS.includes(v)) return v; } catch {}
  return 'beginner';
}
export function setLevel(level) {
  if (!LEVELS.includes(level)) return;
  try { localStorage.setItem(KEY, level); } catch {}
  apply(level);
  window.dispatchEvent(new CustomEvent('vrfb:level', { detail: level }));
}
function apply(level) {
  document.body.dataset.level = level;
  document.querySelectorAll('[data-level-set]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.levelSet === level)));
  document.querySelectorAll('select[data-level-select]').forEach(s => { s.value = level; });
}
export function initLevel(scope = document) {
  scope.querySelectorAll('[data-level-set]').forEach(b => { if (!b.dataset.bound) { b.dataset.bound = '1'; b.addEventListener('click', () => setLevel(b.dataset.levelSet)); } });
  scope.querySelectorAll('select[data-level-select]').forEach(s => { if (!s.dataset.bound) { s.dataset.bound = '1'; s.addEventListener('change', () => setLevel(s.value)); } });
  apply(getLevel());
  return getLevel();
}
export const onLevel = (fn) => window.addEventListener('vrfb:level', e => fn(e.detail));
export const levelIndex = (level = getLevel()) => LEVELS.indexOf(level);
