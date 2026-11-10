/**
 * Build your own energy storage project: a seven-step guided simulator.
 * Models: js/sim/dispatch.js (one day), js/sim/sizing.js (stacks and
 * electrolyte), js/sim/finance.js (cash flows). All tested.
 */
import { boot, field, readParams, setParams, out, readout, levelBlock, downloadBar, num, t, tf, money, scaled, autoLink } from './common.js';
import { simulateProject } from '../sim/dispatch.js';
import { sizeSystem } from '../sim/sizing.js';
import { vrfbModel, lfpModel, VRFB_DEFAULTS as VD, LFP_DEFAULTS as LD } from '../sim/finance.js';
import { lineChart, barChart, legend, CHART_COLORS } from '../calc/chart.js';
import { createSite3D } from './site3d.js';

const L = await boot('project');
const $ = (id) => document.getElementById(id);
$('levels').innerHTML = levelBlock(L('levels')); autoLink($('levels'), 8);

// Application presets. Power in kW, energy in kWh, prices in $/MWh. `scale` multiplies
// the utility-scale cost defaults: small systems cost more per unit (illustrative).
const APPS = {
  household: { dailyLoad: 30, solar: 5, P: 5, h: 4, tariff: 250, feed: 50, scale: 2.4, lfp: 700, life: 20 },
  commercial: { dailyLoad: 1200, solar: 160, P: 100, h: 4, tariff: 180, feed: 40, scale: 1.5, lfp: 450, life: 20 },
  industrial: { dailyLoad: 24000, solar: 3200, P: 1000, h: 6, tariff: 120, feed: 35, scale: 1.15, lfp: 320, life: 25 },
  utility: { dailyLoad: 2400000, solar: 300000, P: 100000, h: 8, tariff: 110, feed: 25, scale: 1, lfp: 250, life: 25 },
};
const ICON = {
  household: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M3 11 12 4l9 7M5 10v10h14V10M10 20v-6h4v6"/></svg>',
  commercial: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M5 21V4h10v17M15 9h4v12M3 21h18M8 8h4M8 12h4M8 16h4"/></svg>',
  industrial: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M3 21V10l5 3v-3l5 3V6h3v15M3 21h18M18 21V3h2v18"/></svg>',
  utility: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M9 21 11 3h2l2 18M6 9h12M7 14h10M4 21h16"/></svg>',
  vrfb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><rect x="2" y="6" width="6" height="13" rx="2"/><rect x="16" y="6" width="6" height="13" rx="2"/><rect x="10" y="9" width="4" height="8" rx="1"/><path d="M8 11h2M14 11h2M8 15h2M14 15h2"/></svg>',
  lfp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><rect x="3" y="7" width="16" height="10" rx="2"/><path d="M21 10v4M8 10v4M12 10v4"/></svg>',
};
const KEY = 'vrfb-project';
const defaults = (app) => { const a = APPS[app]; return { step: 0, app, tech: 'vrfb', dailyLoad: a.dailyLoad, solar: a.solar, P: a.P, h: a.h, tariff: a.tariff, feed: a.feed, life: a.life, disc: 7,
  rte: VD.rte, window: 80, stackKW: app === 'household' ? 5 : 30, c: VD.c, stackCost: Math.round(VD.stackCost * a.scale), v2o5: VD.v2o5, bosE: Math.round(VD.bosE * a.scale), bosP: Math.round(VD.bosP * a.scale), pcsCost: Math.round(VD.pcsCost * a.scale), om: Math.round(VD.om * a.scale),
  lRte: LD.rte, dod: LD.dod, capexE: a.lfp, lOm: Math.round(LD.om * a.scale), calLife: LD.calLife, calFade: LD.calFade, cycFade: LD.cycFade }; };
let S = (() => { try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && APPS[s.app]) return { ...defaults(s.app), ...s }; } catch {} return defaults('commercial'); })();
const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {} };

const kW = (v) => scaled(v, ['kW', 'MW', 'GW']), kWh = (v) => scaled(v, ['kWh', 'MWh', 'GWh']);

// --- step 1 and 3: choices ------------------------------------------------------------------
$('apps').innerHTML = Object.keys(APPS).map(a => `<button type="button" class="choice" data-app="${a}">${ICON[a]}<b>${L(`apps.${a}.name`)}</b><small>${L(`apps.${a}.desc`)}</small></button>`).join('');
$('techs').innerHTML = ['vrfb', 'lfp'].map(k => `<button type="button" class="choice" data-tech="${k}">${ICON[k]}<b>${L(`techs.${k}.name`)}</b><small>${L(`techs.${k}.desc`)}</small></button>`).join('');
$('apps').addEventListener('click', (e) => { const b = e.target.closest('[data-app]'); if (!b) return; S = { ...defaults(b.dataset.app), step: 0, tech: S.tech }; fill(); render(); });
$('techs').addEventListener('click', (e) => { const b = e.target.closest('[data-tech]'); if (!b) return; S.tech = b.dataset.tech; fill(); render(); });

// --- fields ----------------------------------------------------------------------------------
const F = (k, o) => field(k, L(`p.${k}`), S[k], o);
function fill() {
  $('f-demand').innerHTML = [F('dailyLoad', { unit: 'kWh', min: 1, max: 1e8, step: 1 }), F('solar', { unit: 'kWp', min: 0, max: 5e6, step: 1 }), F('P', { unit: 'kW', min: 0.5, max: 2e6, step: 0.5 }), F('h', { unit: 'h', min: 0.5, max: 24, step: 0.5 })].join('');
  $('f-config').innerHTML = (S.tech === 'vrfb'
    ? [F('stackKW', { unit: 'kW', min: 1, max: 500, step: 1 }), F('rte', { unit: '%', min: 50, max: 90, step: 1 }), F('window', { unit: '%', min: 40, max: 100, step: 1 }), F('c', { unit: 'mol/L', min: 0.8, max: 3, step: 0.1 })]
    : [F('lRte', { unit: '%', min: 60, max: 96, step: 1 }), F('dod', { unit: '%', min: 50, max: 100, step: 1 }), F('calLife', { unit: L('years'), min: 5, max: 30, step: 1 })]).concat([F('life', { unit: L('years'), min: 5, max: 40, step: 1 }), F('disc', { unit: '%', min: 0, max: 20, step: 0.5 }), F('tariff', { unit: '$/MWh', min: 0, max: 800, step: 5 }), F('feed', { unit: '$/MWh', min: 0, max: 400, step: 5 })]).join('');
  $('f-cost').innerHTML = (S.tech === 'vrfb'
    ? [F('stackCost', { unit: '$/kW', min: 50, max: 6000, step: 10 }), F('v2o5', { unit: '$/kg', min: 3, max: 80, step: 0.5 }), F('bosE', { unit: '$/kWh', min: 0, max: 600, step: 5 }), F('bosP', { unit: '$/kW', min: 0, max: 2000, step: 10 }), F('pcsCost', { unit: '$/kW', min: 0, max: 1000, step: 5 }), F('om', { unit: '$/kW·' + L('yr'), min: 0, max: 200, step: 1 })]
    : [F('capexE', { unit: '$/kWh', min: 50, max: 2000, step: 5 }), F('pcsCost', { unit: '$/kW', min: 0, max: 1000, step: 5 }), F('lOm', { unit: '$/kW·' + L('yr'), min: 0, max: 200, step: 1 }), F('calFade', { unit: '%/' + L('yr'), min: 0, max: 6, step: 0.1 }), F('cycFade', { unit: L('per1000'), min: 0, max: 10, step: 0.1 })]).join('');
}
['f-demand', 'f-config', 'f-cost'].forEach(id => $(id).addEventListener('input', () => { Object.assign(S, readParams($(id))); render(); }));

$('o-demand').innerHTML = [readout('E', L('r.E'), true), readout('peak', L('r.peak')), readout('solarDay', L('r.solarDay')), readout('ratio', L('r.ratio'))].join('');
$('o-config').innerHTML = [readout('a', '', true), readout('b', ''), readout('c', ''), readout('d', '')].join('');
$('o-day').innerHTML = [readout('self', L('r.self'), true), readout('selfNo', L('r.selfNo')), readout('shifted', L('r.shifted'), true), readout('exported', L('r.exported')), readout('imported', L('r.imported')), readout('cycles', L('r.cycles'))].join('');
$('o-econ').innerHTML = [readout('capex', L('r.capex'), true), readout('perKWh', L('r.perKWh')), readout('saving', L('r.saving')), readout('lcos', L('r.lcos')), readout('npv', L('r.npv'), true), readout('payback', L('r.payback'))].join('');
$('econ-note').innerHTML = L('econNote'); $('final-note').innerHTML = L('finalNote');

// --- charts -----------------------------------------------------------------------------------
const hh = (v) => `${String(Math.floor(v)).padStart(2, '0')}:00`;
const profileChart = lineChart($('ch-profile'), { series: [], xLabel: L('hour'), yMin: 0, xFormat: hh, yFormat: v => num(v, 0) });
const dayChart = lineChart($('ch-day'), { series: [], xLabel: L('hour'), xFormat: hh, yFormat: v => num(v, 0) });
const socChart = lineChart($('ch-soc'), { series: [], xLabel: L('hour'), yMin: 0, yMax: 100, xFormat: hh, yFormat: v => num(v, 0) });
const capexChart = barChart($('ch-capex'), { categories: [], series: [], stacked: true, yFormat: v => money(v, 1) });
const cashChart = lineChart($('ch-cash'), { series: [], xLabel: L('year'), xFormat: v => num(v, 0), yFormat: v => money(v, 1) });
const site = createSite3D($('site3d'), { solar: L('s.solar'), battery: L('s.battery'), load: L('s.load') });

// --- model -------------------------------------------------------------------------------------
let R = null;
function compute() {
  const E = S.P * S.h, rte = S.tech === 'vrfb' ? S.rte : S.lRte;
  // run three days and keep the last so the result does not depend on the starting state of charge
  let soc0 = 20, day;
  for (let i = 0; i < 3; i++) { day = simulateProject({ kind: S.app, dailyLoad: S.dailyLoad, solarPeak: S.solar, Pbat: S.P, Ecap: E, rte, soc0 }); soc0 = E > 0 ? day.Eend / E * 100 : 0; }
  const noBat = simulateProject({ kind: S.app, dailyLoad: S.dailyLoad, solarPeak: S.solar, Pbat: 0, Ecap: 0.0001, rte, soc0: 0 });
  const cycles = E > 0 ? day.shifted / E * 365 : 0;
  const prj = { P: S.P / 1000, h: S.h, cycles: Math.max(1, cycles), life: S.life, disc: S.disc, chg: S.feed, sell: S.tariff };
  const sizing = sizeSystem({ powerKW: S.P, energyKWh: E, stackKW: S.stackKW, c: S.c, window: S.window / 100, rte: S.rte });
  const fin = S.tech === 'vrfb'
    ? vrfbModel(prj, { stackCost: S.stackCost, v2o5: S.v2o5, bosE: S.bosE, bosP: S.bosP, pcsCost: S.pcsCost, om: S.om, rte: S.rte, window: S.window / 100, c: S.c })
    : lfpModel(prj, { capexE: S.capexE, pcsCost: S.pcsCost, om: S.lOm, rte: S.lRte, dod: S.dod, calLife: S.calLife, calFade: S.calFade, cycFade: S.cycFade });
  return { E, rte, day, noBat, cycles, prj, sizing, fin };
}

function sankey(d) {
  const W = 640, H = 300, top = 26, colX = [20, 300, 600], nw = 14;
  const src = [['solar', d.solarE, CHART_COLORS[1]], ['grid', d.imported, '#8291a8']], snk = [['load', d.loadE, CHART_COLORS[0]], ['export', d.exported, CHART_COLORS[3]], ['loss', Math.max(0, d.charged - d.shifted), '#5b6677']];
  const total = Math.max(src.reduce((s, x) => s + x[1], 0), snk.reduce((s, x) => s + x[1], 0)) || 1, gap = 16, k = (H - top - 20 - gap * 2) / total;
  const place = (list) => { let y = top; const o = {}; list.forEach(([id, v, c]) => { o[id] = { y, h: Math.max(1, v * k), c, v, used: 0 }; y += Math.max(1, v * k) + gap; }); return o; };
  const A = place(src), B = place(snk); const bat = { y: top + (H - top - 20) / 2 - Math.max(2, d.charged * k) / 2, h: Math.max(2, d.charged * k), inUsed: 0, outUsed: 0 };
  const band = (x0, y0, x1, y1, w, color) => { if (w < 0.4) return ''; const mx = (x0 + x1) / 2; return `<path d="M${x0} ${y0 + w / 2} C${mx} ${y0 + w / 2}, ${mx} ${y1 + w / 2}, ${x1} ${y1 + w / 2}" stroke="${color}" stroke-width="${w}" fill="none" opacity="0.45"/>`; };
  const take = (n, v) => { const y = n.y + n.used; n.used += v * k; return y; };
  let paths = '';
  paths += band(colX[0] + nw, take(A.solar, d.direct), colX[2], take(B.load, d.direct), d.direct * k, CHART_COLORS[1]);
  { const y0 = take(A.solar, d.charged); paths += band(colX[0] + nw, y0, colX[1], bat.y, d.charged * k, CHART_COLORS[1]); }
  paths += band(colX[0] + nw, take(A.solar, d.exported), colX[2], take(B.export, d.exported), d.exported * k, CHART_COLORS[1]);
  paths += band(colX[1] + nw, bat.y, colX[2], take(B.load, d.shifted), d.shifted * k, CHART_COLORS[2]);
  paths += band(colX[1] + nw, bat.y + d.shifted * k, colX[2], take(B.loss, d.charged - d.shifted), (d.charged - d.shifted) * k, CHART_COLORS[2]);
  paths += band(colX[0] + nw, take(A.grid, d.imported), colX[2], take(B.load, d.imported), d.imported * k, '#8291a8');
  const node = (x, n, label, anchor) => `<rect x="${x}" y="${n.y}" width="${nw}" height="${n.h}" rx="3" fill="${n.c}"/><text x="${anchor === 'end' ? x - 6 : x + nw + 6}" y="${n.y + Math.min(n.h, 28) / 2 + 4}" text-anchor="${anchor}" fill="#e8edf5" font-size="12">${label}</text><text x="${anchor === 'end' ? x - 6 : x + nw + 6}" y="${n.y + Math.min(n.h, 28) / 2 + 19}" text-anchor="${anchor}" fill="#8291a8" font-size="11" font-family="JetBrains Mono, monospace">${kWh(n.v)}</text>`;
  $('sankey').innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${L('flowTitle')}">${paths}${node(colX[0], A.solar, L('s.solar'), 'start')}${node(colX[0], A.grid, L('s.grid'), 'start')}
    <rect x="${colX[1]}" y="${bat.y}" width="${nw}" height="${bat.h}" rx="3" fill="${CHART_COLORS[2]}"/><text x="${colX[1] + nw / 2}" y="${bat.y - 8}" text-anchor="middle" fill="#e8edf5" font-size="12">${L('s.battery')} · ${kWh(d.charged)}</text>
    ${node(colX[2], B.load, L('s.load'), 'end')}${node(colX[2], B.export, L('s.export'), 'end')}${node(colX[2], B.loss, L('s.loss'), 'end')}</svg>`;
}

function render() {
  persist();
  document.querySelectorAll('#apps .choice').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.app === S.app)));
  document.querySelectorAll('#techs .choice').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.tech === S.tech)));
  $('tech-note').innerHTML = L(`techNote.${S.app}`);
  document.querySelectorAll('#steps button').forEach((b, i) => { b.setAttribute('aria-current', i === S.step ? 'step' : 'false'); b.classList.toggle('is-done', i < S.step); });
  document.querySelectorAll('.wizard__panel').forEach(p => p.classList.toggle('is-on', +p.dataset.panel === S.step));
  $('prev').disabled = S.step === 0; $('next').textContent = S.step === 6 ? L('restart') : L('next');
  R = compute(); const { E, day, noBat, fin, sizing } = R;
  // step 2
  let el = $('o-demand'); out(el, 'E', kWh(E)); out(el, 'peak', kW(day.peakLoad)); out(el, 'solarDay', kWh(day.solarE)); out(el, 'ratio', `${num(day.solarE / day.loadE * 100, 0)} %`);
  const prof = [{ name: L('s.solar'), color: CHART_COLORS[1], fill: true, points: day.rows.map(r => [r.t, r.pv]) }, { name: L('s.load'), color: CHART_COLORS[0], points: day.rows.map(r => [r.t, r.load]) }];
  profileChart.update({ series: prof, yLabel: 'kW' }); legend($('lg-profile'), prof);
  // step 4
  el = $('o-config'); const lab = (k, text) => { const n = el.querySelector(`[data-out="${k}"]`).nextElementSibling; n.textContent = text; };
  if (S.tech === 'vrfb') { out(el, 'a', num(sizing.nStacks)); lab('a', L('r.stacks')); out(el, 'b', `${num(sizing.m3Total, sizing.m3Total < 100 ? 1 : 0)} m³`); lab('b', L('r.volume')); out(el, 'c', `Ø ${num(sizing.tank.d, 1)} × ${num(sizing.tank.h, 1)} m`); lab('c', L('r.tank')); out(el, 'd', `${num(sizing.kgV2O5 / 1000, sizing.kgV2O5 < 10000 ? 2 : 1)} t`); lab('d', L('r.v2o5')); }
  else { out(el, 'a', kWh(fin.capex.nameplate)); lab('a', L('r.nameplate')); out(el, 'b', `${num(fin.serviceLife, 1)} ${L('years')}`); lab('b', L('r.service')); out(el, 'c', fin.replacements.length ? fin.replacements.join(', ') : L('none')); lab('c', L('r.repl')); out(el, 'd', `${num(S.dod, 0)} %`); lab('d', L('p.dod')); }
  // step 5
  el = $('o-day'); out(el, 'self', `${num(day.selfSufficiency * 100, 0)} %`); out(el, 'selfNo', `${num(noBat.selfSufficiency * 100, 0)} %`); out(el, 'shifted', kWh(day.shifted)); out(el, 'exported', kWh(day.exported)); out(el, 'imported', kWh(day.imported)); out(el, 'cycles', num(day.cycles, 2));
  const ds = [{ name: L('s.solar'), color: CHART_COLORS[1], fill: true, points: day.rows.map(r => [r.t, r.pv]) }, { name: L('s.load'), color: CHART_COLORS[0], points: day.rows.map(r => [r.t, r.load]) }, { name: L('s.batteryPower'), color: CHART_COLORS[2], points: day.rows.map(r => [r.t, r.bat]) }, { name: L('s.gridPower'), color: CHART_COLORS[3], dash: [4, 4], points: day.rows.map(r => [r.t, r.grid]) }];
  dayChart.update({ series: ds, yLabel: 'kW' }); legend($('lg-day'), ds);
  socChart.update({ series: [{ name: L('socChart'), color: CHART_COLORS[3], fill: true, points: day.rows.map(r => [r.t, E > 0 ? r.E / E * 100 : 0]) }] });
  // step 6
  el = $('o-econ'); const y1 = fin.years[0];
  out(el, 'capex', money(fin.capex.total)); out(el, 'perKWh', `$${num(fin.perKWh, 0)}/kWh`); out(el, 'saving', money(y1.revenue - y1.costs)); out(el, 'lcos', `$${num(fin.lcos, 0)}/MWh`); out(el, 'npv', money(fin.npv)); out(el, 'payback', fin.payback === null ? L('never') : `${num(fin.payback, 1)} ${L('yr')}`);
  const cs = ['power', 'storage', 'bos', 'epc'].map((k, i) => ({ name: t(`labs.compare.c.${k}`), color: CHART_COLORS[i], values: [fin.capex.parts[k]] }));
  capexChart.update({ categories: [L(`techs.${S.tech}.name`)], series: cs }); legend($('lg-capex'), cs);
  cashChart.update({ series: [{ name: L('cashChart'), color: CHART_COLORS[0], fill: true, points: [[0, -fin.capex.total], ...fin.years.map(y => [y.t, y.cumDisc])] }] });
  // step 7
  const good = fin.npv > 0;
  $('summary').style.setProperty('--accent', good ? '#5ee37a' : '#ff9b2f');
  $('summary').innerHTML = `<h3>${tf('labs.project.sum.title', { P: kW(S.P), E: kWh(E), tech: L(`techs.${S.tech}.name`), app: L(`apps.${S.app}.name`).toLowerCase() })}</h3>
    <p>${tf('labs.project.sum.energy', { self: num(day.selfSufficiency * 100, 0), no: num(noBat.selfSufficiency * 100, 0), shifted: kWh(day.shifted), solar: kW(S.solar) })}</p>
    <p style="margin-top:6px">${tf(`labs.project.sum.${good ? 'good' : 'bad'}`, { capex: money(fin.capex.total), npv: money(fin.npv), pay: fin.payback === null ? L('never') : num(fin.payback, 1), lcos: num(fin.lcos, 0), tariff: num(S.tariff, 0), life: S.life })}</p>`;
  if (S.step === 6) { site.update({ app: S.app, tech: S.tech, solarKW: S.solar, powerKW: S.P, energyKWh: E, nStacks: sizing.nStacks, m3PerSide: sizing.litresPerSide / 1000 }); sankey(day); }
}

function go(step) { S.step = Math.max(0, Math.min(6, step)); render(); document.getElementById('steps').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
$('steps').addEventListener('click', (e) => { const b = e.target.closest('[data-step]'); if (b) go(+b.dataset.step); });
$('prev').addEventListener('click', () => go(S.step - 1));
$('next').addEventListener('click', () => { if (S.step === 6) { S = defaults(S.app); fill(); go(0); } else go(S.step + 1); });
fill(); render();

downloadBar($('dl'), () => {
  const { E, day, fin, sizing, cycles } = R;
  const keys = S.tech === 'vrfb' ? ['stackKW', 'rte', 'window', 'c', 'stackCost', 'v2o5', 'bosE', 'bosP', 'pcsCost', 'om'] : ['lRte', 'dod', 'calLife', 'capexE', 'pcsCost', 'lOm', 'calFade', 'cycFade'];
  const inputs = [[L('parameter'), L('value')], [L('steps.0'), L(`apps.${S.app}.name`)], [L('steps.2'), L(`techs.${S.tech}.name`)], ...['dailyLoad', 'solar', 'P', 'h', 'life', 'disc', 'tariff', 'feed', ...keys].map(k => [L(`p.${k}`), S[k]])];
  const results = [[L('metric'), L('value')], [L('r.E') + ' (kWh)', +E.toFixed(2)], [L('r.self') + ' (%)', +(day.selfSufficiency * 100).toFixed(1)], [L('r.shifted') + ' (kWh)', +day.shifted.toFixed(2)], [L('r.exported') + ' (kWh)', +day.exported.toFixed(2)], [L('r.imported') + ' (kWh)', +day.imported.toFixed(2)], [L('r.cycles'), +day.cycles.toFixed(3)], [L('cyclesYear'), +cycles.toFixed(1)],
    ...(S.tech === 'vrfb' ? [[L('r.stacks'), sizing.nStacks], [L('r.volume') + ' (m³)', +sizing.m3Total.toFixed(2)], [L('r.v2o5') + ' (kg)', Math.round(sizing.kgV2O5)]] : [[L('r.nameplate') + ' (kWh)', +fin.capex.nameplate.toFixed(1)], [L('r.service') + ' (' + L('years') + ')', +fin.serviceLife.toFixed(1)]]),
    [L('r.capex') + ' ($)', Math.round(fin.capex.total)], [L('r.perKWh') + ' ($/kWh)', +fin.perKWh.toFixed(1)], [L('r.lcos') + ' ($/MWh)', +fin.lcos.toFixed(1)], [L('r.npv') + ' ($)', Math.round(fin.npv)], [L('r.payback') + ' (' + L('years') + ')', fin.payback === null ? L('never') : +fin.payback.toFixed(2)]];
  const dayRows = [[L('hour'), L('s.solar') + ' (kW)', L('s.load') + ' (kW)', L('s.batteryPower') + ' (kW)', L('s.gridPower') + ' (kW)', L('socChart') + ' (%)'], ...day.rows.map(r => [+r.t.toFixed(2), +r.pv.toFixed(3), +r.load.toFixed(3), +r.bat.toFixed(3), +r.grid.toFixed(3), +(E > 0 ? r.E / E * 100 : 0).toFixed(2)])];
  const cash = [[L('year'), t('labs.compare.t.energy'), t('labs.compare.t.om'), t('labs.compare.t.charging'), t('labs.compare.t.repl'), t('labs.compare.t.revenue'), t('labs.compare.t.residual'), t('labs.compare.t.net'), t('labs.compare.t.cumDisc')], [0, '', '', '', Math.round(fin.capex.total), '', '', Math.round(-fin.capex.total), Math.round(-fin.capex.total)], ...fin.years.map(y => [y.t, +y.energy.toFixed(2), Math.round(y.om + y.lease), Math.round(y.charging), Math.round(y.replacement), Math.round(y.revenue), Math.round(y.residual), Math.round(y.net), Math.round(y.cumDisc)])];
  const imgs = [{ img: dayChart.canvas, caption: L('h.4') }, { img: socChart.canvas, caption: L('socChart') + ' (%)' }, { img: capexChart.canvas, caption: L('capexChart') }, { img: cashChart.canvas, caption: L('cashChart') }];
  if (site.ok && site.canvas) imgs.push({ img: site.canvas, caption: `${L('siteTitle')} · ${L('schematic')}` });
  return { name: 'vrfb-project', sheets: [{ name: L('sh.inputs'), rows: inputs }, { name: L('sh.results'), rows: results }, { name: L('sh.day'), rows: dayRows }, { name: L('sh.cash'), rows: cash }],
    report: { title: L('h1'), subtitle: $('summary').querySelector('h3').textContent, blocks: [{ p: $('summary').innerText }, { h: L('sh.inputs') }, { kv: inputs.slice(1).map(([k, v]) => [k, String(v)]) }, { h: L('sh.results') }, { kv: results.slice(1).map(([k, v]) => [k, typeof v === 'number' ? num(v, Math.abs(v) < 100 ? 2 : 0) : String(v)]) }, ...imgs, { h: t('labs.common.assumptions') }, { p: L('finalNote'), muted: true }] } };
});
