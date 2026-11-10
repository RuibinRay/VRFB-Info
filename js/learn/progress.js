/**
 * Learning progress, saved in the browser only (localStorage 'vrfb-progress').
 * Nothing is sent anywhere. Shape:
 *   { lessons: { id: { read, tabs: {worked, tryit, visual}, quiz: { score, total, at } } },
 *     assessment: { score, total, at, byPillar: { pillar: [right, total] } },
 *     history: [{ at, type, id, detail }] }
 */
const KEY = 'vrfb-progress';
const PASS = 2 / 3;

function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } }
function save(p) { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch {} window.dispatchEvent(new CustomEvent('vrfb:progress', { detail: p })); return p; }
function entry(p, id) { p.lessons = p.lessons || {}; p.lessons[id] = p.lessons[id] || {}; return p.lessons[id]; }
function log(p, type, id, detail) { p.history = (p.history || []).concat([{ at: Date.now(), type, id, detail }]).slice(-200); }

export const getProgress = () => { const p = load(); p.lessons = p.lessons || {}; p.history = p.history || []; return p; };
export function markRead(id) { const p = load(), e = entry(p, id); if (!e.read) { e.read = Date.now(); log(p, 'read', id); save(p); } }
export function markTab(id, tab) { const p = load(), e = entry(p, id); e.tabs = e.tabs || {}; if (!e.tabs[tab]) { e.tabs[tab] = Date.now(); log(p, tab, id); save(p); } }
export function saveQuiz(id, score, total) { const p = load(), e = entry(p, id); if (!e.quiz || score >= e.quiz.score) e.quiz = { score, total, at: Date.now() }; log(p, 'quiz', id, `${score}/${total}`); save(p); }
export function saveAssessment(result) { const p = load(); p.assessment = { ...result, at: Date.now() }; log(p, 'assessment', 'final', `${result.score}/${result.total}`); save(p); }
export function resetProgress() { try { localStorage.removeItem(KEY); } catch {} window.dispatchEvent(new CustomEvent('vrfb:progress', { detail: {} })); }
export const onProgress = (fn) => window.addEventListener('vrfb:progress', () => fn(getProgress()));

/** A lesson counts as complete when its knowledge check was passed (at least two thirds right). */
export function lessonState(id, p = getProgress()) {
  const e = p.lessons[id] || {};
  const passed = !!e.quiz && e.quiz.score / e.quiz.total >= PASS;
  return { read: !!e.read, quiz: e.quiz || null, tabs: e.tabs || {}, passed, started: !!e.read || !!e.quiz || !!e.tabs };
}
export function courseSummary(ids, p = getProgress()) {
  const states = ids.map(id => lessonState(id, p));
  const done = states.filter(s => s.passed).length, started = states.filter(s => s.started).length;
  return { done, started, total: ids.length, percent: ids.length ? Math.round(done / ids.length * 100) : 0, assessment: p.assessment || null };
}
