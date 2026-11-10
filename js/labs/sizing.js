/**
 * Power vs energy laboratory: MW, MWh, C-rate and duration.
 * Stacks set the power; electrolyte sets the energy. Model: js/sim/sizing.js.
 */
import { boot, field, slider, readParams, setParams, out, readout, levelBlock, downloadBar, num, t, pagePath, pillarPath, autoLink, scaled } from './common.js';
import { sizeSystem } from '../sim/sizing.js';
import { electrolyteColor } from '../sim/electrochem.js';
import { lineChart, legend, CHART_COLORS } from '../calc/chart.js';
import { renderQuiz } from '../ui/quiz.js';

const L = await boot('sizing');
const $ = (id) => document.getElementById(id);
$('levels').innerHTML = levelBlock(L('levels')); autoLink($('levels'), 8);

const PRESETS = [[1, 4], [1, 8], [10, 100], [100, 1000]];
$('presets').innerHTML = PRESETS.map(([p, e], i) => `<button type="button" data-i="${i}">${num(p)} MW / ${num(e)} MWh</button>`).join('');
$('main').innerHTML = `<div class="fields" style="margin-bottom:14px">${field('P', L('p.P'), 1, { unit: 'MW', min: 0.001, max: 1000, step: 0.1 })}${field('E', L('p.E'), 8, { unit: 'MWh', min: 0.001, max: 24000, step: 0.5 })}</div>${slider('h', L('p.h'), 8, { unit: ' h', min: 0.5, max: 24, step: 0.5 })}`;
$('params').innerHTML = [
  field('stackKW', L('p.stackKW'), 30, { unit: 'kW', min: 1, max: 500, step: 1 }),
  field('c', L('p.c'), 1.6, { unit: 'mol/L', min: 0.5, max: 3, step: 0.1 }),
  field('window', L('p.window'), 80, { unit: '%', min: 30, max: 100, step: 1 }),
  field('vCell', L('p.vCell'), 1.35, { unit: 'V', min: 1, max: 1.6, step: 0.01 }),
  field('rte', L('p.rte'), 72, { unit: '%', min: 40, max: 95, step: 1 }),
  field('tanks', L('p.tanks'), 1, { min: 1, max: 40, step: 1 }),
].join('');
$('readouts').innerHTML = [readout('duration', L('r.duration'), true), readout('crate', L('r.crate')), readout('stacks', L('r.stacks'), true), readout('volume', L('r.volume'), true), readout('tank', L('r.tank')), readout('v2o5', L('r.v2o5')), readout('charge', L('r.charge')), readout('loss', L('r.loss')), readout('density', L('r.density'))].join('');
$('assume').innerHTML = L('assume');
$('next').innerHTML = `<div class="grid-3"><a class="card" href="${pagePath('learn')}#lesson-eng-power-energy" style="color:inherit"><div class="eyebrow">${L('next.lesson')}</div><p style="margin:0">${L('next.lessonP')}</p></a><a class="card" href="${pagePath('compare')}" style="color:inherit"><div class="eyebrow">${L('next.compare')}</div><p style="margin:0">${L('next.compareP')}</p></a><a class="card" href="${pillarPath('engineering')}#sizing-tool" style="color:inherit"><div class="eyebrow">${L('next.stack')}</div><p style="margin:0">${L('next.stackP')}</p></a></div>`;
renderQuiz($('quiz'), L('quiz', []), { labels: t('learn.ui.quiz', {}) });

const main = $('main'), P = $('params');
const chart = lineChart($('chart'), { series: [], xLabel: L('hours'), yLabel: L('powerAxis'), yMin: 0, xFormat: v => num(v, 0), yFormat: v => num(v, v < 10 ? 1 : 0) });
let last = null;

function inputs() {
  const m = readParams(main), a = readParams(P);
  return { P: m.P, E: m.E, h: m.h, ...a };
}
function compute(i) {
  return sizeSystem({ powerKW: i.P * 1000, energyKWh: i.E * 1000, stackKW: i.stackKW, c: i.c, window: i.window / 100, vCell: i.vCell, rte: i.rte, tanksPerSide: i.tanks });
}

// --- picture: stacks in the middle, a tank each side ---------------------------------------
function drawViz(i, r) {
  const unit = r.nStacks <= 40 ? 1 : r.nStacks <= 400 ? 10 : r.nStacks <= 4000 ? 100 : 1000;
  const icons = Math.ceil(r.nStacks / unit), cols = Math.min(10, Math.ceil(Math.sqrt(icons * 2.2))), rows = Math.ceil(icons / cols);
  const cell = Math.min(26, 220 / cols, 150 / rows), gw = cols * cell, gh = rows * cell, gx = 400 - gw / 2, gy = 190 - gh / 2;
  const tankH = Math.max(70, Math.min(250, 74 + 46 * Math.log10(Math.max(0.05, i.E) * 10))), tankW = tankH * 0.62, ty = 320 - tankH;
  const tank = (cx, side) => `<g><rect x="${cx - tankW / 2}" y="${ty}" width="${tankW}" height="${tankH}" rx="12" fill="rgba(255,255,255,0.05)" stroke="rgba(200,215,235,0.55)" stroke-width="1.5"/>
    <rect x="${cx - tankW / 2 + 3}" y="${ty + tankH * 0.16}" width="${tankW - 6}" height="${tankH * 0.84 - 3}" rx="9" fill="${electrolyteColor(side, 0)}" opacity="0.9"/>
    <text x="${cx}" y="342" text-anchor="middle" fill="#e8edf5" font-size="13">${L(side === 'pos' ? 'v.tankPos' : 'v.tankNeg')}</text>
    <text x="${cx}" y="360" text-anchor="middle" fill="#8291a8" font-size="12" font-family="JetBrains Mono, monospace">${num(r.litresPerSide / 1000, r.litresPerSide < 10000 ? 1 : 0)} m³</text></g>`;
  let blocks = '';
  for (let k = 0; k < icons; k++) { const x = gx + (k % cols) * cell, y = gy + Math.floor(k / cols) * cell; blocks += `<rect x="${x + 2}" y="${y + 2}" width="${cell - 4}" height="${cell - 4}" rx="3" fill="#26d9e3" opacity="0.85"><animate attributeName="opacity" values="0.55;0.95;0.55" dur="2.4s" begin="${(k % 7) * 0.2}s" repeatCount="indefinite"/></rect>`; }
  const lx = 150, rx = 650, pipeY = 320 - 12;
  $('viz').innerHTML = `<svg viewBox="0 0 800 380" role="img" aria-label="${L('vizTitle')}">
    <defs><style>.fl{stroke-dasharray:6 8;animation:fl 1.2s linear infinite}@keyframes fl{to{stroke-dashoffset:-14}}@media (prefers-reduced-motion: reduce){.fl{animation:none}}</style></defs>
    <text x="400" y="28" text-anchor="middle" fill="#26d9e3" font-size="13" font-family="JetBrains Mono, monospace" letter-spacing="2">${L('v.power')}</text>
    <text x="400" y="50" text-anchor="middle" fill="#e8edf5" font-size="20" font-weight="600">${num(r.nStacks)} ${L('v.stacks')} · ${scaled(i.P * 1000, ['kW', 'MW', 'GW'])}</text>
    <text x="${lx}" y="${ty - 30}" text-anchor="middle" fill="#5ee37a" font-size="13" font-family="JetBrains Mono, monospace" letter-spacing="2">${L('v.energy')}</text>
    <text x="${lx}" y="${ty - 10}" text-anchor="middle" fill="#e8edf5" font-size="16" font-weight="600">${scaled(i.E * 1000, ['kWh', 'MWh', 'GWh'])}</text>
    <path class="fl" d="M${lx + tankW / 2} ${pipeY} H${gx - 6}" stroke="${electrolyteColor('pos', 0)}" stroke-width="4" fill="none"/><path class="fl" d="M${gx + gw + 6} ${pipeY} H${rx - tankW / 2}" stroke="${electrolyteColor('neg', 0)}" stroke-width="4" fill="none"/>
    <path d="M${lx + tankW / 2} ${pipeY} V${gy + gh / 2} H${gx - 6}" stroke="rgba(200,215,235,0.25)" stroke-width="2" fill="none"/><path d="M${rx - tankW / 2} ${pipeY} V${gy + gh / 2} H${gx + gw + 6}" stroke="rgba(200,215,235,0.25)" stroke-width="2" fill="none"/>
    <rect x="${gx - 8}" y="${gy - 8}" width="${gw + 16}" height="${gh + 16}" rx="10" fill="rgba(38,217,227,0.06)" stroke="rgba(38,217,227,0.4)"/>${blocks}
    ${tank(lx, 'pos')}${tank(rx, 'neg')}
    ${unit > 1 ? `<text x="400" y="${Math.min(372, gy + gh + 30)}" text-anchor="middle" fill="#8291a8" font-size="12">${L('v.each').replace('{n}', num(unit))}</text>` : ''}</svg>`;
  let note = '';
  if (last) { const dP = i.P / last.P, dE = i.E / last.E;
    if (Math.abs(dP - 1) > 0.01 && Math.abs(dE - 1) < 0.01) note = L('n.power');
    else if (Math.abs(dE - 1) > 0.01 && Math.abs(dP - 1) < 0.01) note = L('n.energy');
    else if (Math.abs(dP - 1) > 0.01) note = L('n.both'); }
  if (note) $('viz-note').innerHTML = note;
}

function drawSteps(i, r) {
  const sp = (v, d = 1) => num(v, d);
  $('steps').innerHTML = [
    [L('f.duration'), `t = E ÷ P = ${sp(i.E)} MWh ÷ ${sp(i.P)} MW = <b>${sp(r.duration)} h</b>`],
    [L('f.crate'), `C = P ÷ E = ${sp(i.P)} ÷ ${sp(i.E)} = <b>${num(r.cRate, 3)} C</b> (1/${sp(r.duration)} h)`],
    [L('f.stacks'), `N = P ÷ P<sub>stack</sub> = ${sp(i.P * 1000, 0)} kW ÷ ${sp(i.stackKW, 0)} kW → <b>${num(r.nStacks)}</b>`],
    [L('f.dc'), `E<sub>DC</sub> = E ÷ η = ${sp(i.E)} ÷ ${num(r.eta, 3)} = <b>${sp(r.energyDC / 1000, 2)} MWh</b>`],
    [L('f.volume'), `V = E<sub>DC</sub> ÷ (c × 26.8 × ΔSOC × V<sub>cell</sub>) = ${sp(r.energyDC, 0)} kWh ÷ ${num(r.whPerLitreSide, 1)} Wh/L = <b>${sp(r.litresPerSide / 1000, 1)} m³</b>`],
    [L('f.v2o5'), `m = 2 × c × V × M<sub>V₂O₅</sub>/2 = <b>${sp(r.kgV2O5 / 1000, 1)} t</b> (${num(r.kgV2O5 / (i.E * 1000), 1)} kg/kWh)`],
    [L('f.charge'), `E<sub>in</sub> = E ÷ RTE = ${sp(i.E)} ÷ ${num(i.rte / 100, 2)} = <b>${sp(r.chargeEnergyAC / 1000, 2)} MWh</b>`],
    [L('f.window'), `${sp(r.theoreticalEnergyDC / 1000, 2)} MWh × ${num(i.window, 0)} % = <b>${sp(r.energyDC / 1000, 2)} MWh</b>`],
  ].map(([h, f]) => `<li>${h}<span class="f">${f}</span></li>`).join('');
}

function drawChart(i) {
  const rect = (P, h) => [[0, P], [h, P], [h, 0]];
  const series = [{ name: `${L('s.yours')}: ${num(i.P, 1)} MW × ${num(i.h, 1)} h = ${num(i.E, 1)} MWh`, color: CHART_COLORS[0], fill: true, points: [[0, 0], ...rect(i.P, i.h), [24, 0]] },
    { name: `${L('s.half')}: ${num(i.P * 2, 1)} MW × ${num(i.h / 2, 1)} h`, color: CHART_COLORS[1], dash: [5, 4], points: [[0, 0], ...rect(i.P * 2, i.h / 2), [24, 0]] }];
  chart.update({ series }); legend($('lg'), series);
}

function drawExamples(i) {
  const rows = PRESETS.map(([p, e]) => { const r = compute({ ...i, P: p, E: e }); return `<tr><td>${num(p)} MW / ${num(e)} MWh</td><td class="num">${num(r.duration, 0)} h</td><td class="num">${num(r.cRate, 3)} C</td><td class="num">${num(r.nStacks)}</td><td class="num">${num(r.m3Total, 0)} m³</td><td class="num">${num(r.chargeEnergyAC / 1000, 1)} MWh</td></tr>`; }).join('');
  $('examples').innerHTML = `<thead><tr><th>${L('e.system')}</th><th class="num">${L('r.duration')}</th><th class="num">${L('r.crate')}</th><th class="num">${L('r.stacks')}</th><th class="num">${L('e.electrolyte')}</th><th class="num">${L('r.charge')}</th></tr></thead><tbody>${rows}</tbody>`;
}

function update(changed) {
  const m = readParams(main);
  // three linked numbers: energy = power × duration
  if (changed === 'E') setParams(main, { h: Math.min(24, Math.max(0.5, Math.round(m.E / m.P * 2) / 2)) });
  else setParams(main, { E: +(m.P * m.h).toFixed(3) });
  const i = inputs(); if (changed === 'E') i.h = i.E / i.P; else i.E = i.P * i.h;
  const r = compute(i), R = $('readouts');
  out(R, 'duration', `${num(r.duration, 1)} h`); out(R, 'crate', `${num(r.cRate, 3)} C`); out(R, 'stacks', num(r.nStacks));
  out(R, 'volume', `${num(r.m3Total, r.m3Total < 100 ? 1 : 0)} m³`); out(R, 'tank', `Ø ${num(r.tank.d, 1)} × ${num(r.tank.h, 1)} m`); out(R, 'v2o5', `${num(r.kgV2O5 / 1000, 1)} t`);
  out(R, 'charge', scaled(r.chargeEnergyAC, ['kWh', 'MWh', 'GWh'])); out(R, 'loss', scaled(r.lossesPerCycle, ['kWh', 'MWh', 'GWh'])); out(R, 'density', `${num(r.whPerLitreTotal, 1)} Wh/L`);
  document.querySelectorAll('#presets button').forEach((b, k) => b.setAttribute('aria-pressed', String(Math.abs(PRESETS[k][0] - i.P) < 1e-9 && Math.abs(PRESETS[k][1] - i.E) < 1e-6)));
  drawViz(i, r); drawSteps(i, r); drawChart(i); drawExamples(i);
  last = { P: i.P, E: i.E }; window.__sizing = { i, r };
}
main.addEventListener('input', (e) => update(e.target.dataset.k));
P.addEventListener('input', () => update());
$('presets').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; const [p, en] = PRESETS[+b.dataset.i]; setParams(main, { P: p, E: en, h: Math.min(24, en / p) }); update('E'); });
update();

downloadBar($('dl'), () => {
  const { i, r } = window.__sizing;
  const inRows = [[L('inputs'), L('value')], [`${L('p.P')} (MW)`, i.P], [`${L('p.E')} (MWh)`, i.E], [`${L('p.stackKW')} (kW)`, i.stackKW], [`${L('p.c')} (mol/L)`, i.c], [`${L('p.window')} (%)`, i.window], [`${L('p.vCell')} (V)`, i.vCell], [`${L('p.rte')} (%)`, i.rte], [L('p.tanks'), i.tanks]];
  const outRows = [[L('results'), L('value')], [`${L('r.duration')} (h)`, +r.duration.toFixed(3)], [`${L('r.crate')} (1/h)`, +r.cRate.toFixed(4)], [L('r.stacks'), r.nStacks], [`${L('r.volume')} (m³)`, +r.m3Total.toFixed(2)], [`${L('e.perTank')} (m³)`, +(r.litresPerSide / 1000 / i.tanks).toFixed(2)], [`${L('r.v2o5')} (t)`, +(r.kgV2O5 / 1000).toFixed(2)], [`${L('f.dc')} (MWh)`, +(r.energyDC / 1000).toFixed(3)], [`${L('r.charge')} (MWh)`, +(r.chargeEnergyAC / 1000).toFixed(3)], [`${L('r.loss')} (MWh)`, +(r.lossesPerCycle / 1000).toFixed(3)], [`${L('r.density')} (Wh/L)`, +r.whPerLitreTotal.toFixed(2)]];
  const steps = [...document.querySelectorAll('#steps li')].map(li => li.textContent.replace(/\s+/g, ' ').trim());
  return { name: 'vrfb-power-vs-energy', sheets: [{ name: L('inputs'), rows: inRows }, { name: L('results'), rows: outRows }, { name: t('labs.common.formulas'), rows: [[t('labs.common.formulas')], ...steps.map(s => [s])] }],
    report: { title: L('h1'), subtitle: `${num(i.P, 2)} MW / ${num(i.E, 2)} MWh`, blocks: [{ h: L('inputs') }, { kv: inRows.slice(1).map(([k, v]) => [k, String(v)]) }, { h: L('results') }, { kv: outRows.slice(1).map(([k, v]) => [k, String(v)]) }, { h: t('labs.common.formulas') }, ...steps.map(s => ({ p: s })), { img: chart.canvas, caption: L('chartTitle') }, { h: t('labs.common.assumptions') }, { p: L('assume'), muted: true }] } };
});
