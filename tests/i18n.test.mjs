import test from 'node:test';
import assert from 'node:assert/strict';
import { LESSONS, LESSON_IDS, PILLARS } from '../js/learn/course.js';
import { EQUATIONS } from '../js/learn/equations.js';
import { GLOSS_ICON } from '../js/learn/icons.js';
import { COMPONENTS } from '../js/data/components.js';

const LANGS = ['en', 'es', 'zh'], BUNDLES = ['', 'labs.', 'learn.'];
const load = async (bundle, lang) => (await import(`../js/i18n/${bundle}${lang}.js`)).default;

/** Flat list of key paths; arrays contribute their length so translated lists must match. */
function shape(o, prefix = '', out = []) {
  if (Array.isArray(o)) { out.push(`${prefix}[${o.length}]`); o.forEach((v, i) => { if (v && typeof v === 'object') shape(v, `${prefix}.${i}`, out); }); }
  else if (o && typeof o === 'object') for (const k of Object.keys(o)) shape(o[k], prefix ? `${prefix}.${k}` : k, out);
  else out.push(prefix);
  return out;
}
const placeholders = (s) => (typeof s === 'string' ? (s.match(/\{\w+\}/g) || []).sort().join(',') : '');
function leaves(o, prefix = '', out = {}) { if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) leaves(v, prefix ? `${prefix}.${k}` : k, out); else out[prefix] = o; return out; }

for (const bundle of BUNDLES) {
  test(`${bundle || 'base.'}* dictionaries have identical keys in every language`, async () => {
    const keep = (k) => !k.startsWith('components') && !/^glossary\.\w+\.m\[/.test(k);   // match strings for tooltips differ by language
    const en = await load(bundle, 'en'); const ref = shape(en).filter(keep).sort();
    for (const lang of ['es', 'zh']) {
      const other = shape(await load(bundle, lang)).filter(keep).sort();
      const missing = ref.filter(k => !other.includes(k)), extra = other.filter(k => !ref.includes(k));
      assert.deepEqual({ missing, extra }, { missing: [], extra: [] }, `${bundle}${lang}.js differs from English`);
    }
  });
  test(`${bundle || 'base.'}* translations keep every {placeholder} and are not left empty`, async () => {
    const en = leaves(await load(bundle, 'en'));
    for (const lang of ['es', 'zh']) {
      const other = leaves(await load(bundle, lang));
      for (const [k, v] of Object.entries(en)) {
        if (k.startsWith('components')) continue;
        assert.equal(placeholders(other[k]), placeholders(v), `${bundle}${lang}.js › ${k}`);
        if (typeof v === 'string' && v.trim()) assert.ok(String(other[k]).trim().length > 0, `${bundle}${lang}.js › ${k} is empty`);
      }
    }
  });
}

test('every lesson, quiz, equation variable and glossary icon exists in every language', async () => {
  for (const lang of LANGS) {
    const learn = await load('learn.', lang), labs = await load('labs.', lang);
    for (const l of LESSONS) {
      const t = learn.lessons[l.id]; assert.ok(t, `${lang}: lesson ${l.id}`);
      for (const k of ['title', 'summary', 'b', 'i', 'a', 'see', 'tryit']) assert.ok(t[k] && t[k].length >= 4, `${lang}: ${l.id}.${k}`);
      assert.ok(t.worked.q && t.worked.steps.length >= 2 && t.worked.a, `${lang}: ${l.id} worked example`);
      assert.equal(t.quiz.length, 3, `${lang}: ${l.id} has three questions`);
      for (const q of t.quiz) { assert.equal(q.options.length, 4); assert.ok(q.answer >= 0 && q.answer < 4 && q.why); }
      for (const e of l.eq) assert.ok(EQUATIONS[e], `equation ${e}`);
      assert.ok(PILLARS.some(p => p.slug === l.pillar));
    }
    for (const eq of Object.values(EQUATIONS)) for (const p of eq.parts) if (Array.isArray(p)) assert.ok(learn.eqvars[p[1]]?.n, `${lang}: variable ${p[1]}`);
    for (const id of Object.keys(learn.glossary)) assert.ok(GLOSS_ICON[id], `icon for glossary term ${id}`);
    assert.ok(Object.keys(learn.glossary).length >= 45);
    for (const id of Object.keys(COMPONENTS)) { const p = labs.lab.parts[id]; assert.ok(p, `${lang}: lab text for ${id}`); for (const k of ['what', 'why', 'how', 'fail']) assert.equal(p[k].length, 2, `${lang}: ${id}.${k} has simple + engineering text`); }
    for (const page of ['sizing', 'compare']) for (const q of labs[page].quiz) assert.ok(q.answer >= 0 && q.answer < q.options.length);
    assert.equal(labs.lab.tour.length, 6); assert.equal(labs.project.steps.length, 7);
  }
  assert.equal(new Set(LESSON_IDS).size, 15);
});

test('quiz answers are the same option in every language', async () => {
  const [en, es, zh] = await Promise.all(LANGS.map(l => load('learn.', l)));
  for (const id of LESSON_IDS) en.lessons[id].quiz.forEach((q, i) => { assert.equal(es.lessons[id].quiz[i].answer, q.answer, `es ${id} q${i + 1}`); assert.equal(zh.lessons[id].quiz[i].answer, q.answer, `zh ${id} q${i + 1}`); });
});

test('translated component specifications cover every component', async () => {
  for (const lang of ['es', 'zh']) {
    const c = (await load('', lang)).components;
    for (const [id, base] of Object.entries(COMPONENTS)) { assert.ok(c[id]?.name && c[id].role, `${lang}: ${id}`); assert.equal(c[id].specs.length, base.specs.length, `${lang}: ${id} specs`); }
  }
});
