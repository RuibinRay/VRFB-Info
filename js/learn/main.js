/**
 * Course hub: learning path with inline lessons, saved progress, illustrated
 * glossary, final assessment and completion summary.
 */
import { init, t, tf, num, pillarPath, pagePath } from '../i18n/index.js';
import { mountChrome } from '../ui/chrome.js';
import { initGlossary } from '../ui/glossary.js';
import { getLevel, onLevel } from '../ui/level.js';
import { LESSONS, LESSON_IDS, PILLARS, lessonsOf, lessonById } from './course.js';
import { renderKit } from './kit.js';
import { getProgress, lessonState, courseSummary, saveAssessment, resetProgress, onProgress } from './progress.js';
import { GLOSS_ICON, icon } from './icons.js';
import { download, MIME } from '../sim/exporters.js';
import { makeReport } from '../ui/report.js';
import { shuffled } from '../ui/quiz.js';

await init({ extra: ['learn', 'labs'] });
mountChrome({ active: 'learn' });
const U = (k, f = '') => t(`learn.ui.${k}`, f), $ = (id) => document.getElementById(id);
const terms = t('learn.glossary', {});
initGlossary(terms);
const dateFmt = (ms) => new Date(ms).toLocaleDateString(document.documentElement.lang, { year: 'numeric', month: 'short', day: 'numeric' });

$('how').innerHTML = U('how', []).map(([h, p], i) => `<div class="card"><div class="eyebrow">${i + 1}</div><h3 style="font-size:1.05rem">${h}</h3><p class="muted" style="margin:0;font-size:0.9rem">${p}</p></div>`).join('');

// --- learning path ---------------------------------------------------------------------
const rendered = new Set();
function drawPath() {
  $('path').innerHTML = PILLARS.map(p => `<div class="path__pillar" style="--c:${p.color}"><i></i><h3>${t(`nav.${p.slug}`)}</h3><a class="muted" style="font-size:0.82rem" href="${pillarPath(p.slug)}">${U('openPillar')} →</a></div>` +
    lessonsOf(p.slug).map(l => { const n = LESSON_IDS.indexOf(l.id) + 1, tx = t(`learn.lessons.${l.id}`);
      return `<div id="lesson-${l.id}" style="scroll-margin-top:calc(var(--nav-h) + 12px)"><a class="lesson" href="#lesson-${l.id}" data-lesson-row="${l.id}" style="--c:${p.color}" aria-expanded="false"><span class="lesson__n">${n}</span><span><h4>${tx.title}</h4><p>${tx.summary}</p></span><span class="lesson__state" data-row-state="${l.id}"></span></a><div class="kit" data-kit="${l.id}" hidden style="margin-top:10px"></div></div>`; }).join('')).join('');
  rendered.clear();
}
function openLesson(id, scroll = true) {
  const box = document.querySelector(`[data-kit="${id}"]`), row = document.querySelector(`[data-lesson-row="${id}"]`); if (!box) return;
  const open = box.hidden; box.hidden = !open; row.setAttribute('aria-expanded', String(open));
  if (open && !rendered.has(id)) { renderKit(box, id, { context: 'hub' }); rendered.add(id); }
  if (open && scroll) document.getElementById(`lesson-${id}`).scrollIntoView({ behavior: 'smooth', block: 'start' });
}
$('path').addEventListener('click', (e) => { const row = e.target.closest('[data-lesson-row]'); if (!row) return; e.preventDefault(); history.replaceState(null, '', `#lesson-${row.dataset.lessonRow}`); openLesson(row.dataset.lessonRow, false); });

// --- progress ----------------------------------------------------------------------------
function drawProgress() {
  const p = getProgress(), s = courseSummary(LESSON_IDS, p);
  $('progress-bar').style.width = `${s.percent}%`; $('progress-text').textContent = tf('learn.ui.progressText', { done: s.done, total: s.total, pct: s.percent });
  const quizzes = LESSON_IDS.map(id => p.lessons[id]?.quiz).filter(Boolean), avg = quizzes.length ? quizzes.reduce((a, q) => a + q.score / q.total, 0) / quizzes.length * 100 : null;
  $('progress-stats').innerHTML = [[`${s.done} / ${s.total}`, U('st.lessons')], [`${s.started}`, U('st.started')], [avg === null ? '—' : `${num(avg, 0)} %`, U('st.quiz')], [s.assessment ? `${s.assessment.score} / ${s.assessment.total}` : '—', U('st.assessment')]].map(([b, l]) => `<div class="readout"><b>${b}</b><span>${l}</span></div>`).join('');
  LESSONS.forEach(l => { const st = lessonState(l.id, p), el = document.querySelector(`[data-row-state="${l.id}"]`); if (!el) return; el.textContent = st.passed ? `✓ ${U('status.done')}` : st.started ? U('status.doing') : U('status.todo'); el.closest('.lesson').classList.toggle('is-done', st.passed); });
  const next = LESSONS.find(l => !lessonState(l.id, p).passed), cont = $('continue');
  cont.textContent = s.done === 0 ? U('start') : next ? tf('learn.ui.continue', { title: t(`learn.lessons.${next.id}.title`) }) : U('takeAssessment');
  cont.href = next ? `#lesson-${next.id}` : '#assessment'; cont.onclick = (e) => { if (next) { e.preventDefault(); const box = document.querySelector(`[data-kit="${next.id}"]`); if (box.hidden) openLesson(next.id); else document.getElementById(`lesson-${next.id}`).scrollIntoView({ behavior: 'smooth' }); } };
  const hist = (p.history || []).slice(-12).reverse();
  $('history').innerHTML = hist.length ? `<div class="table-scroll" style="max-height:320px"><table><tbody>${hist.map(h => `<tr><td class="mono" style="white-space:nowrap">${dateFmt(h.at)}</td><td>${U(`hist.${h.type}`, h.type)}</td><td>${h.id === 'final' ? U('assessTitle') : t(`learn.lessons.${h.id}.title`, h.id)}</td><td class="num">${h.detail || ''}</td></tr>`).join('')}</tbody></table></div>` : `<p class="muted" style="margin:0">${U('histEmpty')}</p>`;
}
const noteLevel = () => { $('level-note').textContent = U(`levelNote.${getLevel()}`); };

// --- glossary -------------------------------------------------------------------------------
function drawGlossary(filter = '') {
  const f = filter.trim().toLowerCase();
  const list = Object.entries(terms).filter(([, g]) => !f || g.t.toLowerCase().includes(f) || g.d.toLowerCase().includes(f)).sort((a, b) => a[1].t.localeCompare(b[1].t, document.documentElement.lang));
  $('gloss-grid').innerHTML = list.length ? list.map(([id, g]) => `<article class="gloss-card" id="term-${id}">${icon(GLOSS_ICON[id] || 'dot')}<div><h4>${g.t}</h4><p>${g.d}</p></div></article>`).join('') : `<p class="muted">${U('glossEmpty')}</p>`;
}
$('gloss-search').placeholder = U('glossSearch'); $('gloss-search').addEventListener('input', (e) => drawGlossary(e.target.value));

// --- final assessment ------------------------------------------------------------------------
const PASS = 0.7;
function pickQuestions() { // one question from every lesson, so each pillar is covered
  return LESSONS.map(l => { const qs = t(`learn.lessons.${l.id}.quiz`, []); const q = qs[Math.floor(Math.random() * qs.length)]; return { ...shuffled(q), pillar: l.pillar, lesson: l.id }; });
}
function drawAssessment() {
  const prev = getProgress().assessment, A = $('assess');
  A.innerHTML = `<p>${U('assessIntro')}</p>${prev ? summaryHtml(prev) : ''}<p style="margin:14px 0 0"><button type="button" class="btn btn--accent" id="assess-start">${U(prev ? 'assessAgain' : 'assessStart')}</button></p>`;
  $('assess-start').addEventListener('click', runAssessment); bindSummary();
}
function summaryHtml(r) {
  const ok = r.score / r.total >= PASS;
  return `<div class="certificate" style="margin-top:14px"><div class="eyebrow">${U(ok ? 'certTitle' : 'certNotYet')}</div><h3 style="font-size:1.5rem;margin-bottom:6px">${r.score} / ${r.total} · ${num(r.score / r.total * 100, 0)} %</h3><p class="muted" style="margin-bottom:12px">${U(ok ? 'certPass' : 'certFail')} · ${dateFmt(r.at || Date.now())}</p>
    ${PILLARS.map(p => { const [a, b] = r.byPillar[p.slug] || [0, 0]; return `<div class="bar-row" style="--c:${p.color}"><span>${t(`nav.${p.slug}`)}</span><div class="progress"><i style="width:${b ? a / b * 100 : 0}%"></i></div><span class="mono">${a} / ${b}</span></div>`; }).join('')}
    ${r.weak?.length ? `<p style="margin:12px 0 0;font-size:0.9rem">${U('review')}: ${r.weak.map(id => `<a href="#lesson-${id}" data-review="${id}">${t(`learn.lessons.${id}.title`)}</a>`).join(' · ')}</p>` : ''}
    <p style="margin:14px 0 0"><button type="button" class="btn btn--ghost btn--sm" id="cert-pdf">${U('certDownload')}</button></p></div>`;
}
function bindSummary() {
  document.querySelectorAll('[data-review]').forEach(a => a.addEventListener('click', (e) => { e.preventDefault(); const id = a.dataset.review, box = document.querySelector(`[data-kit="${id}"]`); if (box.hidden) openLesson(id); else document.getElementById(`lesson-${id}`).scrollIntoView({ behavior: 'smooth' }); }));
  $('cert-pdf')?.addEventListener('click', async () => {
    const p = getProgress(), r = p.assessment, s = courseSummary(LESSON_IDS, p);
    const bytes = await makeReport({ title: U('certDoc'), subtitle: `${t('meta.site')} · ${dateFmt(r.at || Date.now())}`, footer: `${t('meta.site')} · ${location.origin}${location.pathname}`, blocks: [
      { h: U('assessTitle') }, { kv: [[U('st.assessment'), `${r.score} / ${r.total} (${num(r.score / r.total * 100, 0)} %)`], [U('st.lessons'), `${s.done} / ${s.total}`], ...PILLARS.map(pl => [t(`nav.${pl.slug}`), `${(r.byPillar[pl.slug] || [0, 0]).join(' / ')}`])] },
      { h: U('pathTitle') }, { table: { head: ['#', U('lessonWord'), U('st.quiz')], rows: LESSONS.map((l, i) => { const q = p.lessons[l.id]?.quiz; return [String(i + 1), t(`learn.lessons.${l.id}.title`), q ? `${q.score} / ${q.total}` : '—']; }) } },
      { p: U('certNote'), muted: true }] });
    download(`vrfb-course-summary-${new Date().toISOString().slice(0, 10)}.pdf`, bytes, MIME.pdf);
  });
}
function runAssessment() {
  const qs = pickQuestions(), A = $('assess'); let i = 0, score = 0; const byPillar = {}, weak = [];
  const show = () => {
    const q = qs[i];
    A.innerHTML = `<div class="progress" style="margin-bottom:14px"><i style="width:${i / qs.length * 100}%"></i></div><div class="eyebrow">${tf('learn.ui.question', { n: i + 1, total: qs.length })} · ${t(`nav.${q.pillar}`)}</div><div class="quiz"><div class="quiz__q"><p>${q.q}</p><div class="quiz__opts">${q.options.map((o, k) => `<button type="button" class="quiz__opt" data-o="${k}" data-letter="${'ABCDE'[k]}">${o}</button>`).join('')}</div></div></div><p id="assess-next" style="margin:0"></p>`;
    A.querySelectorAll('.quiz__opt').forEach(b => b.addEventListener('click', () => {
      const right = +b.dataset.o === q.answer; A.querySelectorAll('.quiz__opt').forEach(x => { x.disabled = true; if (+x.dataset.o === q.answer) x.classList.add('is-right'); }); if (!right) { b.classList.add('is-wrong'); weak.push(q.lesson); } else score++;
      byPillar[q.pillar] = byPillar[q.pillar] || [0, 0]; byPillar[q.pillar][1]++; if (right) byPillar[q.pillar][0]++;
      const why = document.createElement('p'); why.className = 'quiz__why' + (right ? '' : ' is-wrong'); why.innerHTML = `<b>${U(right ? 'quiz.correct' : 'quiz.incorrect')}</b> ${q.why}`; A.querySelector('.quiz__q').appendChild(why);
      $('assess-next').innerHTML = `<button type="button" class="btn btn--accent btn--sm">${U(i + 1 < qs.length ? 'assessNext' : 'assessFinish')}</button>`;
      $('assess-next').querySelector('button').addEventListener('click', () => { i++; if (i < qs.length) show(); else { saveAssessment({ score, total: qs.length, byPillar, weak }); drawAssessment(); document.getElementById('assessment').scrollIntoView({ behavior: 'smooth' }); } });
    }));
  };
  show();
}

$('reset-progress').addEventListener('click', () => { if (confirm(U('resetConfirm'))) { resetProgress(); drawPath(); drawProgress(); drawAssessment(); } });

drawPath(); drawProgress(); drawGlossary(); drawAssessment(); noteLevel();
onProgress(drawProgress); onLevel(noteLevel);
const openFromHash = () => { const m = location.hash.match(/^#lesson-(.+)$/); if (m && lessonById(m[1])) { const box = document.querySelector(`[data-kit="${m[1]}"]`); if (box.hidden) openLesson(m[1]); } else if (location.hash.startsWith('#term-') || location.hash === '#glossary' || location.hash === '#assessment') document.querySelector(location.hash)?.scrollIntoView(); };
window.addEventListener('hashchange', openFromHash); requestAnimationFrame(openFromHash);
