/**
 * Lesson kit: the block attached to each concept in the pillar pages and in the
 * learning path. Five tabs: explain (three levels + clickable equations), see
 * it (animated diagram), worked example, try it (experiment), check yourself.
 * Reading, exploring and passing the quiz are recorded in js/learn/progress.js.
 */
import { t, tf, pagePath, pillarPath } from '../i18n/index.js';
import { LESSONS, LESSON_IDS, lessonById, nextLesson, PILLARS } from './course.js';
import { EQUATIONS } from './equations.js';
import { diagram } from './diagrams.js';
import { renderEquation } from '../ui/equation.js';
import { renderQuiz } from '../ui/quiz.js';
import { markRead, markTab, saveQuiz, lessonState, onProgress } from './progress.js';
import { getLevel, setLevel, onLevel } from '../ui/level.js';
import { autoLink } from '../ui/glossary.js';

const U = (k, f = '') => t(`learn.ui.${k}`, f);
const join = (path, q) => (q && q.startsWith('?') && path.includes('?') ? path + '&' + q.slice(1) : path + (q || ''));
export const lessonUrl = (l, context) => (context === 'pillar' ? pagePath('learn', `#lesson-${l.id}`) : `${pillarPath(l.pillar)}#${l.at}`);

export function renderKit(el, id, { context = 'pillar' } = {}) {
  const l = lessonById(id), text = t(`learn.lessons.${id}`, null); if (!l || !text) return;
  const n = LESSON_IDS.indexOf(id) + 1, color = PILLARS.find(p => p.slug === l.pillar).color, vars = t('learn.eqvars', {});
  const eq = l.eq.map((k, i) => `<div class="lv-i" data-eq="${k}" id="eq-${id}-${i}"></div>`).join('');
  const labHref = l.lab[0].startsWith('#') ? (context === 'pillar' ? l.lab[0] : pillarPath(l.pillar) + l.lab[0]) : join(pagePath(l.lab[0]), l.lab[1]);
  const tabs = [['explain', U('tabs.explain')], ['visual', U('tabs.visual')], ['worked', U('tabs.worked')], ['tryit', U('tabs.tryit')], ['check', U('tabs.check')]];
  el.classList.add('kit'); el.style.setProperty('--accent', color);
  el.innerHTML = `
    <div class="kit__head"><div><div class="eyebrow" style="margin-bottom:4px">${tf('learn.ui.lessonOf', { n, total: LESSONS.length })}</div><h3>${text.title}</h3></div><span class="chip" data-state></span></div>
    <div class="kit__tabs" role="tablist">${tabs.map(([k, label], i) => `<button type="button" role="tab" data-tab="${k}" aria-selected="${i === 0}">${label}<span class="tick" data-tick="${k}"></span></button>`).join('')}</div>
    <div class="kit__pane is-on" data-pane="explain"><div class="kit__levels">
        <div class="kit__level" style="--c:var(--green)"><span class="lv-tag lv-tag--b">${U('levels.b')}</span><p>${text.b}</p></div>
        <div class="kit__level lv-i" style="--c:var(--cyan)"><span class="lv-tag lv-tag--i">${U('levels.i')}</span><p>${text.i}</p></div>
        <div class="kit__level lv-a" style="--c:var(--violet)"><span class="lv-tag lv-tag--a">${U('levels.a')}</span><p>${text.a}</p></div>
      </div>${eq}<p style="margin-top:14px"><button type="button" class="btn btn--ghost btn--sm" data-deeper></button></p></div>
    <div class="kit__pane" data-pane="visual"><div class="kit__visual">${diagram(l.visual, (k) => U(`d.${k}`, k))}</div><p class="muted" style="font-size:0.86rem;margin-top:10px">${text.see || ''}</p></div>
    <div class="kit__pane worked" data-pane="worked"><p><b>${text.worked.q}</b></p><ol>${text.worked.steps.map(s => `<li>${s}</li>`).join('')}</ol><div class="ans">${text.worked.a}</div></div>
    <div class="kit__pane" data-pane="tryit"><div class="tryit"><p>${text.tryit}</p><a class="btn btn--accent btn--sm" href="${labHref}" data-open>${U(l.lab[0].startsWith('#') && context === 'pillar' ? 'tryHere' : 'tryOpen')}</a></div></div>
    <div class="kit__pane" data-pane="check"><div data-quiz></div><div data-result style="margin-top:12px"></div></div>`;

  el.querySelectorAll('[data-eq]').forEach(box => renderEquation(box, { ...EQUATIONS[box.dataset.eq], vars }, { hint: U('eqHint') }));
  autoLink(el.querySelector('.kit__levels'), 6);

  const state = el.querySelector('[data-state]'), deeper = el.querySelector('[data-deeper]'), result = el.querySelector('[data-result]');
  function paint() {
    const s = lessonState(id);
    state.innerHTML = `<i style="color:${s.passed ? 'var(--green)' : s.started ? 'var(--cyan)' : 'var(--muted)'}"></i>${U(s.passed ? 'status.done' : s.started ? 'status.doing' : 'status.todo')}`;
    el.querySelector('[data-tick="visual"]').textContent = s.tabs.visual ? '✓' : ''; el.querySelector('[data-tick="worked"]').textContent = s.tabs.worked ? '✓' : ''; el.querySelector('[data-tick="tryit"]').textContent = s.tabs.tryit ? '✓' : ''; el.querySelector('[data-tick="check"]').textContent = s.passed ? '✓' : '';
    const lv = getLevel(); deeper.hidden = lv === 'advanced'; deeper.textContent = U(lv === 'beginner' ? 'deeper.i' : 'deeper.a');
  }
  deeper.addEventListener('click', () => setLevel(getLevel() === 'beginner' ? 'intermediate' : 'advanced'));
  el.querySelector('.kit__tabs').addEventListener('click', (e) => {
    const b = e.target.closest('[data-tab]'); if (!b) return; const k = b.dataset.tab;
    el.querySelectorAll('[data-tab]').forEach(x => x.setAttribute('aria-selected', String(x === b)));
    el.querySelectorAll('.kit__pane').forEach(p => p.classList.toggle('is-on', p.dataset.pane === k));
    if (k === 'visual' || k === 'worked') markTab(id, k);
  });
  el.querySelector('[data-open]').addEventListener('click', () => markTab(id, 'tryit'));
  renderQuiz(el.querySelector('[data-quiz]'), text.quiz, { labels: t('learn.ui.quiz', {}), onDone: (score, total) => {
    saveQuiz(id, score, total); const ok = score / total >= 2 / 3, next = nextLesson(id);
    result.innerHTML = `<div class="${ok ? 'worked' : ''}"><div class="${ok ? 'ans' : 'assume'}">${U(ok ? 'pass' : 'fail')}${ok && next ? ` <a href="${context === 'pillar' ? `${pillarPath(next.pillar)}#${next.at}` : `#lesson-${next.id}`}">${U('next')}: ${t(`learn.lessons.${next.id}.title`)} →</a>` : ''}${ok && !next ? ` <a href="${pagePath('learn', '#assessment')}">${U('toAssessment')} →</a>` : ''}</div></div>`;
  } });
  if ('IntersectionObserver' in window) { const io = new IntersectionObserver((entries) => { if (entries.some(e => e.isIntersecting)) { markRead(id); io.disconnect(); } }, { threshold: 0.5 }); io.observe(el); }
  onProgress(paint); onLevel(paint); paint();
}
