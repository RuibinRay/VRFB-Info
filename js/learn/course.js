/**
 * Language-neutral structure of the course: pillars, lessons and what each
 * lesson links to. Text lives in js/i18n/learn.<lang>.js under lessons.<id>.
 *
 *   id      lesson id, also the key of its text and quiz
 *   pillar  pillar slug (page under pillars/)
 *   at      id of the pillar-page section the lesson kit is attached to
 *   visual  diagram key in js/learn/diagrams.js
 *   eq      equation keys in js/learn/equations.js (shown from the intermediate level up)
 *   lab     hands-on experiment: [page, hash-or-query] of a root page, or ['#id'] for a tool on the pillar page
 */
export const PILLARS = [
  { slug: 'chemistry', color: '#a36bff' }, { slug: 'anatomy', color: '#26d9e3' }, { slug: 'engineering', color: '#5ee37a' },
  { slug: 'economics', color: '#ff9b2f' }, { slug: 'applications', color: '#ffd23f' },
];
export const LESSONS = [
  { id: 'chem-states', pillar: 'chemistry', at: 'why-vanadium', visual: 'states', eq: [], lab: ['lab', ''] },
  { id: 'chem-reactions', pillar: 'chemistry', at: 'half-reactions', visual: 'cell', eq: ['cellE0'], lab: ['simulator', ''] },
  { id: 'chem-nernst', pillar: 'chemistry', at: 'nernst', visual: 'nernst', eq: ['nernst'], lab: ['#tool-nernst'] },
  { id: 'chem-electrolyte', pillar: 'chemistry', at: 'electrolyte', visual: 'density', eq: ['capacity'], lab: ['sizing', ''] },
  { id: 'chem-side', pillar: 'chemistry', at: 'side-reactions', visual: 'crossover', eq: [], lab: ['lab', '?part=membrane'] },
  { id: 'anat-cell', pillar: 'anatomy', at: 'overview', visual: 'layers', eq: ['stackV'], lab: ['lab', ''] },
  { id: 'anat-membrane', pillar: 'anatomy', at: 'components', visual: 'membrane', eq: ['ohm'], lab: ['lab', '?part=membrane'] },
  { id: 'anat-bop', pillar: 'anatomy', at: 'balance-of-plant', visual: 'loop', eq: [], lab: ['lab', '?part=pump'] },
  { id: 'eng-power-energy', pillar: 'engineering', at: 'power-vs-energy', visual: 'area', eq: ['duration', 'crate'], lab: ['sizing', ''] },
  { id: 'eng-efficiency', pillar: 'engineering', at: 'efficiency', visual: 'losses', eq: ['vcell', 'eff'], lab: ['simulator', ''] },
  { id: 'eng-flow', pillar: 'engineering', at: 'thermal', visual: 'pump', eq: ['flow', 'pumpP'], lab: ['#tool-sizing'] },
  { id: 'econ-capex', pillar: 'economics', at: 'cost-structure', visual: 'capex', eq: [], lab: ['compare', ''] },
  { id: 'econ-lcos', pillar: 'economics', at: 'lcos-tool', visual: 'lcos', eq: ['lcos', 'npv'], lab: ['compare', ''] },
  { id: 'econ-compare', pillar: 'economics', at: 'comparison', visual: 'cross', eq: [], lab: ['compare', ''] },
  { id: 'app-dispatch', pillar: 'applications', at: 'dispatch-tool', visual: 'duck', eq: [], lab: ['project', ''] },
];
export const LESSON_IDS = LESSONS.map(l => l.id);
export const lessonById = (id) => LESSONS.find(l => l.id === id);
export const lessonsOf = (pillar) => LESSONS.filter(l => l.pillar === pillar);
export const nextLesson = (id) => LESSONS[LESSON_IDS.indexOf(id) + 1] || null;
