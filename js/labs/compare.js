/**
 * VRFB vs LFP comparison laboratory.
 * Cash-flow model: js/sim/finance.js (tested). Both technologies are evaluated
 * over the same project life, with replacements, salvage and end-of-life items.
 */
import { boot, field, checkbox, readParams, setParams, out, readout, levelBlock, downloadBar, num, t, tf, money, autoLink } from './common.js';
import { vrfbModel, lfpModel, tornado, durationSweep, breakevenDuration, PROJECT_DEFAULTS as PD, VRFB_DEFAULTS as VD, LFP_DEFAULTS as LD } from '../sim/finance.js';
import { lineChart, barChart, tornadoChart, legend, CHART_COLORS } from '../calc/chart.js';
import { renderQuiz } from '../ui/quiz.js';

const L = await boot('compare');
const $ = (id) => document.getElementById(id);
$('levels').innerHTML = levelBlock(L('levels')); autoLink($('levels'), 8);
const CV = CHART_COLORS[0], CL = CHART_COLORS[1], GREY = '#8291a8';

// --- inputs -----------------------------------------------------------------------------
const f = (k, d, o) => field(k, L(`p.${k}`), d, o);
$('prj').innerHTML = [f('P', PD.P, { unit: 'MW', min: 0.01, max: 1000, step: 0.5 }), f('h', PD.h, { unit: 'h', min: 1, max: 24, step: 0.5 }), f('cycles', PD.cycles, { unit: L('u.perYear'), min: 10, max: 730, step: 5 }), f('life', PD.life, { unit: L('u.years'), min: 5, max: 40, step: 1 }), f('disc', PD.disc, { unit: '%', min: 0, max: 20, step: 0.5 }), f('chg', PD.chg, { unit: '$/MWh', min: 0, max: 300, step: 1 }), f('sell', PD.sell, { unit: '$/MWh', min: 0, max: 600, step: 5 })].join('');
$('v-main').innerHTML = [f('stackCost', VD.stackCost, { unit: '$/kW', min: 50, max: 3000, step: 10 }), f('v2o5', VD.v2o5, { unit: '$/kg', min: 3, max: 80, step: 0.5 }), f('bosE', VD.bosE, { unit: '$/kWh', min: 0, max: 300, step: 5 }), f('rte', VD.rte, { unit: '%', min: 50, max: 90, step: 1 }), f('om', VD.om, { unit: '$/kW·' + L('u.yr'), min: 0, max: 100, step: 1 }), f('stackInterval', VD.stackInterval, { unit: L('u.years'), min: 3, max: 40, step: 1 })].join('');
$('v-more').innerHTML = [f('pcsCost', VD.pcsCost, { unit: '$/kW', min: 0, max: 500, step: 5 }), f('bosP', VD.bosP, { unit: '$/kW', min: 0, max: 1000, step: 10 }), f('acidProc', VD.acidProc, { unit: '$/kWh', min: 0, max: 100, step: 1 }), f('c', VD.c, { unit: 'mol/L', min: 0.8, max: 3, step: 0.1 }), f('window', VD.window * 100, { unit: '%', min: 40, max: 100, step: 1 }), f('epc', VD.epc, { unit: '%', min: 0, max: 60, step: 1 }), f('fade', VD.fade, { unit: '%/' + L('u.yr'), min: 0, max: 5, step: 0.1 }), f('stackRepl', VD.stackRepl, { unit: '%', min: 0, max: 100, step: 5 }), f('resid', VD.resid, { unit: '%', min: 0, max: 100, step: 5 }), f('decom', VD.decom, { unit: '$/kWh', min: 0, max: 50, step: 1 }), f('leaseRate', VD.leaseRate, { unit: '%/' + L('u.yr'), min: 0, max: 25, step: 0.5 })].join('');
$('v-lease').innerHTML = checkbox('lease', L('p.lease'), false);
$('l-main').innerHTML = [f('capexE', LD.capexE, { unit: '$/kWh', min: 50, max: 1000, step: 5 }), f('dod', LD.dod, { unit: '%', min: 50, max: 100, step: 1 }), f('rte', LD.rte, { unit: '%', min: 60, max: 96, step: 1 }), f('om', LD.om, { unit: '$/kW·' + L('u.yr'), min: 0, max: 100, step: 1 }), f('calFade', LD.calFade, { unit: '%/' + L('u.yr'), min: 0, max: 6, step: 0.1 }), f('cycFade', LD.cycFade, { unit: L('u.per1000'), min: 0, max: 10, step: 0.1 })].join('');
$('l-more').innerHTML = [f('pcsCost', LD.pcsCost, { unit: '$/kW', min: 0, max: 500, step: 5 }), f('epc', LD.epc, { unit: '%', min: 0, max: 60, step: 1 }), f('eol', LD.eol, { unit: '%', min: 50, max: 90, step: 1 }), f('calLife', LD.calLife, { unit: L('u.years'), min: 5, max: 30, step: 1 }), f('replCost', LD.replCost, { unit: '%', min: 10, max: 120, step: 5 }), f('recycle', LD.recycle, { unit: '$/kWh', min: -50, max: 50, step: 1 }), f('decom', LD.decom, { unit: '$/kWh', min: 0, max: 50, step: 1 })].join('');
const R = (k, key, accent) => readout(k, L(`r.${key}`), accent);
const outs = () => [R('lcos', 'lcos', true), R('capex', 'capex'), R('perKWh', 'perKWh'), R('npv', 'npv', true), R('payback', 'payback'), R('repl', 'repl'), R('energy', 'energy'), R('annual', 'annual')].join('');
$('v-out').innerHTML = outs(); $('l-out').innerHTML = outs();
$('assume').innerHTML = L('assume');
renderQuiz($('quiz'), L('quiz', []), { labels: t('learn.ui.quiz', {}) });

const prjEl = $('prj'), vEls = [$('v-main'), $('v-more'), $('v-lease')], lEls = [$('l-main'), $('l-more')];
const read = () => {
  const prj = readParams(prjEl), v = Object.assign({}, ...vEls.map(readParams)), l = Object.assign({}, ...lEls.map(readParams));
  v.window = v.window / 100;
  return { prj, v, l };
};

// --- charts -------------------------------------------------------------------------------
const usd = (v) => `$${num(v, 0)}`, usdM = (v) => `$${num(v / 1e6, Math.abs(v) < 1e7 ? 1 : 0)} M`;
const capexChart = barChart($('ch-capex'), { categories: [], series: [], stacked: true, yFormat: usdM });
const lcosChart = barChart($('ch-lcos'), { categories: [], series: [], stacked: true, yFormat: usd, yLabel: '$/MWh' });
const annualChart = barChart($('ch-annual'), { categories: [], series: [], yFormat: usdM, xLabel: L('year') });
const cashChart = lineChart($('ch-cash'), { series: [], xLabel: L('year'), xFormat: v => num(v, 0), yFormat: usdM });
const sweepChart = lineChart($('ch-sweep'), { series: [], xLabel: L('p.h') + ' (h)', yLabel: 'LCOS ($/MWh)', yMin: 0, xFormat: v => num(v, 0), yFormat: v => num(v, 0) });
const torChart = tornadoChart($('ch-tornado'), { rows: [], base: 0, format: usd });
let torTech = 'vrfb', tabTech = 'vrfb', result = null;

const TOR_KEYS = { vrfb: ['v2o5', 'stackCost', 'bosE', 'rte', 'cycles', 'disc', 'chg', 'life', 'om', 'stackRepl'], lfp: ['capexE', 'rte', 'cycles', 'disc', 'chg', 'calFade', 'cycFade', 'replCost', 'om', 'dod'] };
const fmtPay = (p) => (p === null ? L('never') : `${num(p, 1)} ${L('u.yr')}`);

function drawOut(el, m) {
  out(el, 'lcos', `$${num(m.lcos, 0)}/MWh`); out(el, 'capex', money(m.capex.total)); out(el, 'perKWh', `$${num(m.perKWh, 0)}/kWh`); out(el, 'npv', money(m.npv));
  out(el, 'payback', fmtPay(m.payback)); out(el, 'repl', m.replacements.length ? `${L('u.yr')} ${m.replacements.join(', ')}` : L('none'));
  out(el, 'energy', `${num(m.totalEnergy / 1000, 0)} GWh`); out(el, 'annual', money(m.annualised));
}
function drawTornado() {
  const { prj, v, l } = read();
  const rows = tornado(torTech, prj, torTech === 'vrfb' ? v : l, TOR_KEYS[torTech], 20).map(r => ({ label: L(`p.${r.key}`), low: r.low, high: r.high }));
  torChart.update({ rows, base: result[torTech].lcos, lowColor: CHART_COLORS[2], highColor: CHART_COLORS[3], lowLabel: '−20 %', highLabel: '+20 %' });
  $('lg-tornado').innerHTML = `<span><i style="background:${CHART_COLORS[2]}"></i>${L('torLow')}</span><span><i style="background:${CHART_COLORS[3]}"></i>${L('torHigh')}</span><span class="muted">${L('torBase')}</span>`;
}
function drawTable() {
  const m = result[tabTech];
  $('cash').innerHTML = `<thead><tr>${['year', 't.health', 't.energy', 't.om', 't.charging', 't.repl', 't.revenue', 't.residual', 't.net', 't.cum'].map((k, i) => `<th${i ? ' class="num"' : ''}>${L(k)}</th>`).join('')}</tr></thead><tbody>
    <tr><td>0</td><td class="num">—</td><td class="num">—</td><td class="num">—</td><td class="num">—</td><td class="num">${money(m.capex.total)}</td><td class="num">—</td><td class="num">—</td><td class="num">${money(-m.capex.total)}</td><td class="num">${money(-m.capex.total)}</td></tr>
    ${m.years.map(y => `<tr><td>${y.t}</td><td class="num">${num(y.health * 100, 1)} %</td><td class="num">${num(y.energy, 0)}</td><td class="num">${money(y.om + y.lease)}</td><td class="num">${money(y.charging)}</td><td class="num">${y.replacement ? money(y.replacement) : '—'}</td><td class="num">${money(y.revenue)}</td><td class="num">${y.residual ? money(y.residual) : '—'}</td><td class="num">${money(y.net)}</td><td class="num">${money(y.cum)}</td></tr>`).join('')}</tbody>`;
}

function update() {
  const { prj, v, l } = read();
  const mv = vrfbModel(prj, v), ml = lfpModel(prj, l);
  const sweep = durationSweep(prj, v, l, [1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24]), be = breakevenDuration(sweep);
  result = { vrfb: mv, lfp: ml, prj, v, l, sweep, be };
  drawOut($('v-out'), mv); drawOut($('l-out'), ml);

  // verdict: a statement about these inputs, never a general claim
  const cheaper = mv.lcos < ml.lcos ? 'vrfb' : 'lfp', lo = Math.min(mv.lcos, ml.lcos), hi = Math.max(mv.lcos, ml.lcos), diff = (hi - lo) / hi * 100;
  const head = diff < 3 ? L('verdict.tie') : tf(`labs.compare.verdict.${cheaper}`, { d: num(diff, 0), a: num(lo, 0), b: num(hi, 0), h: num(prj.h, 1) });
  const beText = be !== null ? tf('labs.compare.verdict.be', { h: num(be, 1), first: sweep[0].vrfb < sweep[0].lfp ? 'VRFB' : 'LFP', second: sweep[0].vrfb < sweep[0].lfp ? 'LFP' : 'VRFB' }) : tf('labs.compare.verdict.noBe', { tech: sweep[0].vrfb < sweep[0].lfp ? 'VRFB' : 'LFP' });
  const npvText = tf('labs.compare.verdict.npv', { v: money(mv.npv), l: money(ml.npv), s: num(prj.sell, 0) });
  $('verdict').innerHTML = `<h3>${head}</h3><p>${beText} ${npvText}</p><p style="margin-top:6px;font-size:0.86rem">${L('verdict.caveat')}</p>`;

  const cats = ['VRFB', 'LFP'], parts = ['power', 'storage', 'bos', 'epc'];
  const capSeries = parts.map((k, i) => ({ name: L(`c.${k}`), color: CHART_COLORS[i], values: [mv.capex.parts[k], ml.capex.parts[k]] }));
  capexChart.update({ categories: cats, series: capSeries }); legend($('lg-capex'), capSeries);
  const lp = ['capital', 'om', 'charging', 'replacement', 'residual'];
  const lcosSeries = lp.map((k, i) => ({ name: L(`lc.${k}`), color: i < 4 ? CHART_COLORS[i] : GREY, values: [mv.lcosParts[k], ml.lcosParts[k]] }));
  lcosChart.update({ categories: cats, series: lcosSeries }); legend($('lg-lcos'), lcosSeries);
  const years = mv.years.map(y => y.t);
  const annSeries = [{ name: 'VRFB', color: CV, values: mv.years.map(y => y.costs) }, { name: 'LFP', color: CL, values: ml.years.map(y => y.costs) }];
  annualChart.update({ categories: years, series: annSeries }); legend($('lg-annual'), annSeries);
  const cashSeries = [{ name: 'VRFB', color: CV, points: [[0, -mv.capex.total], ...mv.years.map(y => [y.t, y.cumDisc])] }, { name: 'LFP', color: CL, points: [[0, -ml.capex.total], ...ml.years.map(y => [y.t, y.cumDisc])] }];
  cashChart.update({ series: cashSeries }); legend($('lg-cash'), cashSeries);
  const swSeries = [{ name: 'VRFB', color: CV, points: sweep.map(s => [s.h, s.vrfb]) }, { name: 'LFP', color: CL, points: sweep.map(s => [s.h, s.lfp]) }];
  sweepChart.update({ series: swSeries, marker: prj.h }); legend($('lg-sweep'), swSeries);
  $('sweep-note').textContent = beText;
  drawTornado(); drawTable();

  // when is each technology the better choice: derived from the current numbers
  const bullets = [beText, L(mv.capex.total < ml.capex.total ? 'when.capexV' : 'when.capexL'), tf('labs.compare.when.repl', { n: ml.replacements.length, y: num(ml.serviceLife, 1), s: mv.replacements.length }), L(v.lease ? 'when.leaseOn' : 'when.leaseOff'), L('when.rte'), L('when.other')];
  $('when').innerHTML = `<ul style="padding-left:1.1em;margin:0;color:var(--fg-2)">${bullets.map(b => `<li style="margin-bottom:8px">${b}</li>`).join('')}</ul>`;
  autoLink($('when'), 4);
}

document.querySelector('#app').addEventListener('input', (e) => { if (e.target.closest('#prj, #v-main, #v-more, #v-lease, #l-main, #l-more')) update(); });
$('tor-tech').addEventListener('click', (e) => { const b = e.target.closest('[data-tech]'); if (!b) return; torTech = b.dataset.tech; $('tor-tech').querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); drawTornado(); });
$('tab-tech').addEventListener('click', (e) => { const b = e.target.closest('[data-tech]'); if (!b) return; tabTech = b.dataset.tech; $('tab-tech').querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); drawTable(); });

// --- saved scenarios (kept in this browser only) ---------------------------------------------
const SKEY = 'vrfb-scenarios';
const loadScen = () => { try { return JSON.parse(localStorage.getItem(SKEY)) || []; } catch { return []; } };
const saveScen = (list) => { try { localStorage.setItem(SKEY, JSON.stringify(list)); } catch {} };
function drawScen() {
  const list = loadScen();
  $('scen').innerHTML = `<thead><tr><th>${L('sc.name')}</th><th class="num">${L('sc.size')}</th><th class="num">${L('sc.life')}</th><th class="num">LCOS VRFB</th><th class="num">LCOS LFP</th><th class="num">NPV VRFB</th><th class="num">NPV LFP</th><th>${L('sc.cheaper')}</th><th></th></tr></thead><tbody>${list.length ? list.map((s, i) => `<tr><td>${s.name}</td><td class="num">${num(s.P, 1)} MW / ${num(s.h, 1)} h</td><td class="num">${s.life}</td><td class="num">$${num(s.lv, 0)}</td><td class="num">$${num(s.ll, 0)}</td><td class="num">${money(s.nv)}</td><td class="num">${money(s.nl)}</td><td>${s.lv < s.ll ? 'VRFB' : 'LFP'}</td><td><button type="button" class="btn btn--ghost btn--sm" data-load="${i}">${L('sc.load')}</button> <button type="button" class="btn btn--ghost btn--sm" data-del="${i}" aria-label="${L('sc.del')}">✕</button></td></tr>`).join('') : `<tr><td colspan="9" class="muted">${L('sc.empty')}</td></tr>`}</tbody>`;
}
$('save-scen').addEventListener('click', () => {
  const list = loadScen(), { prj, v, l, vrfb, lfp } = result;
  list.push({ name: `${L('sc.scenario')} ${String.fromCharCode(65 + list.length % 26)}`, P: prj.P, h: prj.h, life: prj.life, lv: vrfb.lcos, ll: lfp.lcos, nv: vrfb.npv, nl: lfp.npv, inputs: { prj, v: { ...v, window: v.window * 100 }, l } });
  saveScen(list.slice(-8)); drawScen();
});
$('scen').addEventListener('click', (e) => {
  const d = e.target.closest('[data-del]'), ld = e.target.closest('[data-load]'); const list = loadScen();
  if (d) { list.splice(+d.dataset.del, 1); saveScen(list); drawScen(); }
  if (ld) { const s = list[+ld.dataset.load].inputs; setParams(prjEl, s.prj); vEls.forEach(el => setParams(el, s.v)); lEls.forEach(el => setParams(el, s.l)); update(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
});

update(); drawScen();

// --- downloads -------------------------------------------------------------------------------
downloadBar($('dl'), () => {
  const { prj, v, l, vrfb, lfp, sweep } = result;
  const rowsOf = (obj, sec) => Object.entries(obj).map(([k, val]) => [L(`p.${k}`, k), sec, typeof val === 'number' ? +(+val).toFixed(4) : val]);
  const inputs = [[L('parameter'), L('group'), L('value')], ...rowsOf(prj, L('projectTitle')), ...rowsOf({ ...v, window: v.window * 100 }, 'VRFB'), ...rowsOf(l, 'LFP')];
  const summary = [[L('metric'), 'VRFB', 'LFP'], ['LCOS ($/MWh)', +vrfb.lcos.toFixed(2), +lfp.lcos.toFixed(2)], [L('r.capex') + ' ($)', Math.round(vrfb.capex.total), Math.round(lfp.capex.total)], [L('r.perKWh') + ' ($/kWh)', +vrfb.perKWh.toFixed(1), +lfp.perKWh.toFixed(1)], [L('r.npv') + ' ($)', Math.round(vrfb.npv), Math.round(lfp.npv)], [L('r.payback'), vrfb.payback === null ? L('never') : +vrfb.payback.toFixed(2), lfp.payback === null ? L('never') : +lfp.payback.toFixed(2)], [L('r.repl'), vrfb.replacements.join(', ') || L('none'), lfp.replacements.join(', ') || L('none')], [L('r.energy') + ' (MWh)', Math.round(vrfb.totalEnergy), Math.round(lfp.totalEnergy)],
    ...['power', 'storage', 'bos', 'epc'].map(k => [`CAPEX · ${L(`c.${k}`)} ($)`, Math.round(vrfb.capex.parts[k]), Math.round(lfp.capex.parts[k])]), ...['capital', 'om', 'charging', 'replacement', 'residual'].map(k => [`LCOS · ${L(`lc.${k}`)} ($/MWh)`, +vrfb.lcosParts[k].toFixed(2), +lfp.lcosParts[k].toFixed(2)])];
  const cf = (m) => [[L('year'), L('t.health'), L('t.energy'), L('t.om'), L('t.charging'), L('t.repl'), L('t.revenue'), L('t.residual'), L('t.net'), L('t.cum'), L('t.cumDisc')], [0, '', '', '', '', Math.round(m.capex.total), '', '', Math.round(-m.capex.total), Math.round(-m.capex.total), Math.round(-m.capex.total)], ...m.years.map(y => [y.t, +y.health.toFixed(4), Math.round(y.energy), Math.round(y.om + y.lease), Math.round(y.charging), Math.round(y.replacement), Math.round(y.revenue), Math.round(y.residual), Math.round(y.net), Math.round(y.cum), Math.round(y.cumDisc)])];
  const sens = (tech) => tornado(tech, prj, tech === 'vrfb' ? v : l, TOR_KEYS[tech], 20).map(r => [tech.toUpperCase(), L(`p.${r.key}`), +r.low.toFixed(2), +r.base.toFixed(2), +r.high.toFixed(2)]);
  return { name: 'vrfb-vs-lfp', sheets: [{ name: L('sh.inputs'), rows: inputs }, { name: L('sh.summary'), rows: summary }, { name: 'VRFB ' + L('sh.cash'), rows: cf(vrfb) }, { name: 'LFP ' + L('sh.cash'), rows: cf(lfp) }, { name: L('sh.sens'), rows: [[L('sh.tech'), L('parameter'), 'LCOS −20 %', L('torBase'), 'LCOS +20 %'], ...sens('vrfb'), ...sens('lfp')] }, { name: L('sh.sweep'), rows: [[L('p.h') + ' (h)', 'LCOS VRFB ($/MWh)', 'LCOS LFP ($/MWh)'], ...sweep.map(s => [s.h, +s.vrfb.toFixed(2), +s.lfp.toFixed(2)])] }],
    report: { title: L('h1'), subtitle: `${num(prj.P, 1)} MW · ${num(prj.h, 1)} h · ${prj.life} ${L('u.years')} · ${num(prj.disc, 1)} %`, blocks: [{ h: L('resultsTitle') }, { p: $('verdict').innerText }, { table: { head: summary[0], rows: summary.slice(1).map(r => r.map((c, i) => (i && typeof c === 'number' ? num(c, Math.abs(c) < 1000 ? 1 : 0) : String(c)))) } },
      { img: capexChart.canvas, caption: L('cCapex') }, { img: lcosChart.canvas, caption: L('cLcos') }, { img: annualChart.canvas, caption: L('cAnnual') }, { img: cashChart.canvas, caption: L('cCash') }, { img: sweepChart.canvas, caption: L('cSweep') }, { img: torChart.canvas, caption: `${L('cTornado')} (${torTech.toUpperCase()})` },
      { h: L('sh.inputs') }, { table: { head: inputs[0], rows: inputs.slice(1).map(r => r.map(String)) } }, { h: t('labs.common.assumptions') }, { p: L('assume'), muted: true }] } };
});
