/**
 * Live charge / discharge laboratory.
 * The numbers come from the zero-dimensional model in js/sim/cell.js (tested);
 * the picture is a conceptual animation driven by those numbers.
 */
import { boot, field, readParams, out, readout, levelBlock, downloadBar, num, t, pagePath, pillarPath, autoLink } from './common.js';
import { createCellSim, CELL_DEFAULTS } from '../sim/cell.js';
import { electrolyteColor, ocv, thermalVoltage } from '../sim/electrochem.js';
import { F, AH_PER_MOL, V_HEX } from '../sim/constants.js';
import { lineChart, legend, CHART_COLORS } from '../calc/chart.js';

const L = await boot('simulator');
const $ = (id) => document.getElementById(id);
document.getElementById('levels').innerHTML = levelBlock(L('levels'));
autoLink(document.getElementById('levels'), 8);

// --- parameters -------------------------------------------------------------------
const P = $('params');
P.innerHTML = [
  field('j', L('p.j'), CELL_DEFAULTS.j, { unit: 'mA/cm²', min: 10, max: 300, step: 5 }),
  field('cells', L('p.cells'), CELL_DEFAULTS.cells, { min: 1, max: 200, step: 1 }),
  field('area', L('p.area'), CELL_DEFAULTS.area, { unit: 'cm²', min: 100, max: 20000, step: 100 }),
  field('asr', L('p.asr'), CELL_DEFAULTS.asr, { unit: 'Ω·cm²', min: 0.3, max: 4, step: 0.1 }),
  field('litres', L('p.litres'), CELL_DEFAULTS.litres, { unit: 'L', min: 50, max: 2000000, step: 50 }),
  field('c', L('p.c'), CELL_DEFAULTS.c, { unit: 'mol/L', min: 0.5, max: 3, step: 0.1 }),
  field('T', L('p.T'), CELL_DEFAULTS.T, { unit: '°C', min: 5, max: 45, step: 1 }),
  field('ce', L('p.ce'), CELL_DEFAULTS.ce * 100, { unit: '%', min: 80, max: 100, step: 0.5 }),
  field('socMin', L('p.socMin'), CELL_DEFAULTS.socMin * 100, { unit: '%', min: 1, max: 45, step: 1 }),
  field('socMax', L('p.socMax'), CELL_DEFAULTS.socMax * 100, { unit: '%', min: 55, max: 99, step: 1 }),
].join('');
const params = () => { const p = readParams(P); return { ...p, ce: p.ce / 100, socMin: p.socMin / 100, socMax: p.socMax / 100, jLim: $('transport').checked ? 1500 : 0 }; };

$('readouts').innerHTML = [readout('soc', L('r.soc'), true), readout('vcell', L('r.vcell')), readout('ocv', L('r.ocv')), readout('vstack', L('r.vstack')), readout('I', L('r.I')), readout('P', L('r.P'), true), readout('eIn', L('r.eIn')), readout('eOut', L('r.eOut')), readout('stored', L('r.stored')), readout('time', L('r.time'))].join('');
$('cycle-out').innerHTML = [readout('ce', L('r.ce')), readout('ve', L('r.ve')), readout('ee', L('r.ee'), true), readout('tc', L('r.tc'))].join('');
$('assume').innerHTML = L('assume');
$('flowkey').innerHTML = `<span style="color:#26d9e3"><i></i>${L('k.electron')}</span><span style="color:#ff9b2f"><i class="dash"></i>${L('k.current')}</span><span style="color:#ffffff"><i class="dot"></i>${L('k.ion')}</span><span style="color:#a36bff"><i></i>${L('k.flow')}</span>`;
$('next').innerHTML = `<div class="grid-3"><a class="card" href="${pagePath('learn')}#lesson-chem-reactions" style="color:inherit"><div class="eyebrow">${L('next.lesson')}</div><p style="margin:0">${L('next.lessonP')}</p></a><a class="card" href="${pagePath('sizing')}" style="color:inherit"><div class="eyebrow">${L('next.sizing')}</div><p style="margin:0">${L('next.sizingP')}</p></a><a class="card" href="${pillarPath('chemistry')}#nernst" style="color:inherit"><div class="eyebrow">${L('next.nernst')}</div><p style="margin:0">${L('next.nernstP')}</p></a></div>`;

// --- simulation state -----------------------------------------------------------------
let sim = createCellSim({ ...params(), soc0: 0.1 });
let mode = 0, lastMode = 1, running = false, auto = false;
let hist = [];
const push = (s) => { hist.push({ t: s.t / 3600, soc: s.soc * 100, v: s.vCell, ocv: s.ocv, p: s.powerKW, eIn: s.eInKWh, eOut: s.eOutKWh, stored: sim.storedKWh() }); if (hist.length > 900) hist = hist.filter((_, i) => i % 2 === 0 || i === hist.length - 1); };

const charts = {
  soc: lineChart($('ch-soc'), { series: [], xLabel: L('hours'), yMin: 0, yMax: 100, xFormat: v => num(v, 1), yFormat: v => num(v, 0) }),
  volt: lineChart($('ch-volt'), { series: [], xLabel: L('hours'), yMin: 1.0, yMax: 1.7, xFormat: v => num(v, 1), yFormat: v => num(v, 2) }),
  power: lineChart($('ch-power'), { series: [], xLabel: L('hours'), xFormat: v => num(v, 1), yFormat: v => num(v, 1) }),
  energy: lineChart($('ch-energy'), { series: [], xLabel: L('hours'), yMin: 0, xFormat: v => num(v, 1), yFormat: v => num(v, 0) }),
};
const sVolt = [{ name: L('s.vcell'), color: CHART_COLORS[0] }, { name: L('s.ocv'), color: CHART_COLORS[1], dash: [5, 4] }];
const sEnergy = [{ name: L('s.eIn'), color: CHART_COLORS[0] }, { name: L('s.eOut'), color: CHART_COLORS[1] }, { name: L('s.stored'), color: CHART_COLORS[2], dash: [5, 4] }];
legend($('lg-volt'), sVolt); legend($('lg-energy'), sEnergy);
function drawCharts() {
  const pts = (k) => hist.map(h => [h.t, h[k]]);
  const pad = (s) => (s.points.length === 1 ? { ...s, points: [s.points[0], [s.points[0][0] + 0.001, s.points[0][1]]] } : s);
  charts.soc.update({ series: [pad({ name: L('r.soc'), color: CHART_COLORS[3], fill: true, points: pts('soc') })] });
  charts.volt.update({ series: [pad({ ...sVolt[0], points: pts('v') }), pad({ ...sVolt[1], points: pts('ocv') })] });
  charts.power.update({ series: [pad({ name: L('r.P'), color: CHART_COLORS[2], fill: true, points: pts('p') })] });
  charts.energy.update({ series: [pad({ ...sEnergy[0], points: pts('eIn') }), pad({ ...sEnergy[1], points: pts('eOut') }), pad({ ...sEnergy[2], points: pts('stored') })] });
}

const fmtTime = (s) => `${Math.floor(s / 3600)}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')} h`;
function drawReadouts(s) {
  const R = $('readouts');
  out(R, 'soc', `${num(s.soc * 100, 1)} %`); out(R, 'vcell', `${num(s.vCell, 3)} V`); out(R, 'ocv', `${num(s.ocv, 3)} V`); out(R, 'vstack', `${num(s.vStack, 1)} V`);
  out(R, 'I', `${num(s.I, 0)} A`); out(R, 'P', `${num(Math.abs(s.powerKW), 2)} kW`); out(R, 'eIn', `${num(s.eInKWh, 1)} kWh`); out(R, 'eOut', `${num(s.eOutKWh, 1)} kWh`); out(R, 'stored', `${num(sim.storedKWh(), 1)} kWh`); out(R, 'time', fmtTime(s.t));
}
function drawSteps() {
  const p = sim.p, I = sim.current(), s = sim.s.soc, k = thermalVoltage(p.T + 273.15), e = ocv(s, { T: p.T + 273.15, cH: p.cH });
  const drop = p.j / 1000 * p.asr, sign = mode > 0 ? '+' : '−', v = mode > 0 ? e + drop : mode < 0 ? e - drop : e;
  const rate = p.cells * I / (F * p.c * p.litres) * 3600 * 100;
  $('steps').innerHTML = [
    [L('f.current'), `I = j × A = ${num(p.j, 0)} mA/cm² × ${num(p.area, 0)} cm² = <b>${num(I, 0)} A</b>`],
    [L('f.capacity'), `Q = c × V × 26.8 Ah/mol = ${num(p.c, 1)} × ${num(p.litres, 0)} × 26.8 = <b>${num(p.c * p.litres * AH_PER_MOL, 0)} Ah</b>`],
    [L('f.nernst'), `E = 1.259 + ${num(k * 1000, 1)} mV × [2 ln(${num(s, 2)}/${num(1 - s, 2)}) + 2 ln ${num(p.cH, 0)}] + 0.06 = <b>${num(e, 3)} V</b>`],
    [L('f.vcell'), `V = E ${mode ? sign : '±'} j × ASR = ${num(e, 3)} ${mode ? sign : '±'} ${num(drop, 3)} = <b>${num(v, 3)} V</b>`],
    [L('f.power'), `P = N × V × I = ${num(p.cells, 0)} × ${num(v, 3)} × ${num(I, 0)} = <b>${num(p.cells * v * I / 1000, 2)} kW</b>`],
    [L('f.rate'), `dSOC/dt = N × I / (F × c × V) = <b>${num(rate, 1)} % ${L('perHour')}</b>`],
  ].map(([h, f]) => `<li>${h}<span class="f">${f}</span></li>`).join('');
}
function drawRx() {
  const a = mode > 0 ? '←' : mode < 0 ? '→' : '⇌';
  $('rx').innerHTML = `${L('pos')}:&nbsp; VO₂⁺ + 2H⁺ + e⁻ <span class="arrow">${a}</span> VO²⁺ + H₂O<br>${L('neg')}:&nbsp; V²⁺ <span class="arrow">${a}</span> V³⁺ + e⁻<br><small>${L(mode > 0 ? 'rxCharge' : mode < 0 ? 'rxDischarge' : 'rxIdle')}</small>`;
}
function setStatus(msg) { $('status').innerHTML = msg; }
function sync() {
  $('ctl').querySelectorAll('button').forEach(b => { const a = b.dataset.act; b.setAttribute('aria-pressed', String((a === 'charge' && running && mode > 0) || (a === 'discharge' && running && mode < 0) || (a === 'pause' && !running && hist.length > 1))); });
  drawRx(); drawSteps();
}
function start(m) {
  if (m > 0 && sim.s.soc >= sim.p.socMax - 1e-6) return setStatus(`<b>${L('st.full')}</b>`);
  if (m < 0 && sim.s.soc <= sim.p.socMin + 1e-6) return setStatus(`<b>${L('st.empty')}</b>`);
  mode = m; lastMode = m; running = true; setStatus(L(m > 0 ? 'st.charging' : 'st.discharging')); sync();
}
function reset() { sim = createCellSim({ ...params(), soc0: params().socMin }); mode = 0; running = false; hist = []; push(sim.snapshot(0)); setStatus(L('st.ready')); drawReadouts(sim.snapshot(0)); drawCharts(); sync(); }
$('ctl').addEventListener('click', (e) => {
  const a = e.target.closest('[data-act]')?.dataset.act; if (!a) return;
  if (a === 'charge') start(1); else if (a === 'discharge') start(-1);
  else if (a === 'pause') { running = false; setStatus(L('st.paused')); sync(); }
  else if (a === 'reverse') start(-(mode || lastMode));
  else reset();
});
$('auto').addEventListener('change', (e) => { auto = e.target.checked; });
$('transport').addEventListener('change', () => { sim.set('jLim', $('transport').checked ? 1500 : 0); sync(); });
P.addEventListener('input', () => { const p = params(); Object.entries(p).forEach(([k, v]) => sim.set(k, v)); sim.s.soc = Math.min(p.socMax, Math.max(p.socMin, sim.s.soc)); drawReadouts(sim.snapshot(running ? mode : 0)); sync(); });
$('cycle').addEventListener('click', () => {
  const r = createCellSim(params()).fullCycle(20), C = $('cycle-out');
  out(C, 'ce', `${num(r.coulombicEff * 100, 1)} %`); out(C, 've', `${num(r.voltageEff * 100, 1)} %`); out(C, 'ee', `${num(r.energyEff * 100, 1)} %`); out(C, 'tc', `${num(r.tCharge / 3600, 1)} h / ${num(r.tDischarge / 3600, 1)} h`);
});

// --- conceptual animation ----------------------------------------------------------------
const cv = $('viz'), ctx = cv.getContext('2d');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const rnd = (() => { let s = 7; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; })();
const ions = { pos: Array.from({ length: 16 }, () => ({ x: rnd(), y: rnd(), th: rnd(), ph: rnd() * 6.28 })), neg: Array.from({ length: 16 }, () => ({ x: rnd(), y: rnd(), th: rnd(), ph: rnd() * 6.28 })) };
const fibres = Array.from({ length: 70 }, () => ({ x: rnd(), y: rnd(), a: rnd() * Math.PI, l: 0.08 + rnd() * 0.12 }));
const protons = Array.from({ length: 9 }, () => ({ y: rnd(), off: rnd() }));
let phase = 0, flowPhase = 0, wob = 0, dirSmooth = 0;
function fit() { const r = cv.getBoundingClientRect(), d = Math.min(2, window.devicePixelRatio || 1); cv.width = Math.round(r.width * d); cv.height = Math.round(r.height * d); ctx.setTransform(d, 0, 0, d, 0, 0); return { w: r.width, h: r.height }; }
function roundRect(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function dots(pts, n, ph, color, r) { // moving dots along a polyline; ph in [0,1)
  const seg = []; let total = 0; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); total += d; }
  ctx.fillStyle = color;
  for (let k = 0; k < n; k++) { let d = (((k / n + ph) % 1) + 1) % 1 * total, i = 0; while (i < seg.length - 1 && d > seg[i]) { d -= seg[i]; i++; } const f = seg[i] ? d / seg[i] : 0; ctx.beginPath(); ctx.arc(pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f, r, 0, 6.28); ctx.fill(); }
}
function line(pts, color, width, dash = []) { ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineJoin = 'round'; ctx.setLineDash(dash); ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke(); ctx.setLineDash([]); }
function arrow(x0, y, x1, color, label, above) {
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
  const d = Math.sign(x1 - x0); ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x1 - d * 9, y - 5); ctx.lineTo(x1 - d * 9, y + 5); ctx.closePath(); ctx.fill();
  ctx.textAlign = 'center'; ctx.textBaseline = above ? 'bottom' : 'top'; ctx.fillText(label, (x0 + x1) / 2, y + (above ? -5 : 5));
}
function draw(dt) {
  const { w, h } = fit(); ctx.clearRect(0, 0, w, h);
  const soc = sim.s.soc, live = running ? mode : 0;
  dirSmooth += (live - dirSmooth) * Math.min(1, dt * 4);
  if (!reduced) { phase += dt * dirSmooth * 0.22; flowPhase += dt * 0.12; wob += dt; }
  const small = w < 520; const fs = small ? 10 : 12;
  ctx.font = `${fs}px Inter, "PingFang SC", "Microsoft YaHei", system-ui, sans-serif`;
  const X = (f) => f * w, Y = (f) => f * h;
  const cPos = electrolyteColor('pos', soc), cNeg = electrolyteColor('neg', soc);
  const tank = (x0, side, color, name) => {
    const x = X(x0), y = Y(0.34), tw = X(0.17), th = Y(0.5);
    ctx.fillStyle = 'rgba(255,255,255,0.05)'; roundRect(x, y, tw, th, 10); ctx.fill();
    ctx.save(); roundRect(x, y, tw, th, 10); ctx.clip(); ctx.fillStyle = color; ctx.globalAlpha = 0.9; ctx.fillRect(x, y + th * 0.14 + Math.sin(wob * 1.4 + (side === 'pos' ? 0 : 2)) * 1.5, tw, th); ctx.restore();
    ctx.strokeStyle = 'rgba(200,215,235,0.55)'; ctx.lineWidth = 1.5; roundRect(x, y, tw, th, 10); ctx.stroke();
    ctx.fillStyle = '#e8edf5'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillText(name, x + tw / 2, y + th + 6);
    ctx.fillStyle = '#8291a8'; ctx.fillText(side === 'pos' ? `VO₂⁺ ${Math.round(soc * 100)} % · VO²⁺ ${Math.round((1 - soc) * 100)} %` : `V²⁺ ${Math.round(soc * 100)} % · V³⁺ ${Math.round((1 - soc) * 100)} %`, x + tw / 2, y + th + 8 + fs);
  };
  tank(0.03, 'pos', cPos, L('v.tankPos')); tank(0.80, 'neg', cNeg, L('v.tankNeg'));
  // cell
  const cx0 = X(0.33), cx1 = X(0.67), cy0 = Y(0.34), cy1 = Y(0.84), mid = (cx0 + cx1) / 2, mw = Math.max(8, X(0.022));
  const half = (x0, x1, color, set, charged, discharged) => {
    ctx.fillStyle = '#0c1220'; ctx.fillRect(x0, cy0, x1 - x0, cy1 - cy0);
    ctx.fillStyle = color; ctx.globalAlpha = 0.22; ctx.fillRect(x0, cy0, x1 - x0, cy1 - cy0); ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(150,160,175,0.35)'; ctx.lineWidth = 1.2;
    fibres.forEach((f, i) => { if ((i % 2 === 0) !== (set === ions.pos)) return; const fx = x0 + f.x * (x1 - x0), fy = cy0 + f.y * (cy1 - cy0), l = f.l * (x1 - x0); ctx.beginPath(); ctx.moveTo(fx - Math.cos(f.a) * l, fy - Math.sin(f.a) * l); ctx.lineTo(fx + Math.cos(f.a) * l, fy + Math.sin(f.a) * l); ctx.stroke(); });
    set.forEach(ion => { const isCharged = ion.th < soc; const d = (soc - ion.th) / 0.02, pulse = Math.exp(-d * d); const r = (small ? 4 : 6) * (1 + 0.7 * pulse);
      ctx.fillStyle = isCharged ? charged : discharged; ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 6 + 14 * pulse; ctx.beginPath(); ctx.arc(x0 + 8 + ion.x * (x1 - x0 - 16) + Math.sin(wob + ion.ph) * 3, cy0 + 8 + ion.y * (cy1 - cy0 - 16) + Math.cos(wob * 0.8 + ion.ph) * 3, r, 0, 6.28); ctx.fill(); ctx.shadowBlur = 0; });
  };
  half(cx0, mid - mw / 2, cPos, ions.pos, V_HEX.v5, V_HEX.v4); half(mid + mw / 2, cx1, cNeg, ions.neg, V_HEX.v2, V_HEX.v3);
  ctx.fillStyle = 'rgba(205,238,221,0.75)'; ctx.fillRect(mid - mw / 2, cy0, mw, cy1 - cy0);
  ctx.fillStyle = '#2a2d32'; ctx.fillRect(cx0 - 7, cy0 - 4, 7, cy1 - cy0 + 8); ctx.fillRect(cx1, cy0 - 4, 7, cy1 - cy0 + 8);
  // protons: discharge moves H⁺ from the negative (right) to the positive (left) side
  ctx.fillStyle = '#ffffff';
  protons.forEach(p => { const u = (((p.off - phase * 0.9) % 1) + 1) % 1; const span = X(0.12); ctx.globalAlpha = Math.abs(dirSmooth) * Math.sin(u * Math.PI); ctx.beginPath(); ctx.arc(mid - span / 2 + u * span, cy0 + 12 + p.y * (cy1 - cy0 - 24), small ? 2 : 2.6, 0, 6.28); ctx.fill(); });
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#e8edf5'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
  ctx.fillText(L('v.pos'), (cx0 + mid) / 2, cy0 - 8); ctx.fillText(L('v.neg'), (cx1 + mid) / 2, cy0 - 8);
  ctx.fillStyle = '#8291a8'; ctx.textBaseline = 'top'; ctx.fillText(L('v.membrane'), mid, cy1 + 6); ctx.fillText('H⁺', mid, cy1 + 8 + fs);
  // pipes (flow direction never changes)
  const pipes = [
    [[X(0.115), Y(0.84)], [X(0.115), Y(0.93)], [X(0.40), Y(0.93)], [X(0.40), cy1]], [[X(0.40), cy0], [X(0.40), Y(0.27)], [X(0.115), Y(0.27)], [X(0.115), Y(0.34)]],
    [[X(0.885), Y(0.84)], [X(0.885), Y(0.93)], [X(0.60), Y(0.93)], [X(0.60), cy1]], [[X(0.60), cy0], [X(0.60), Y(0.27)], [X(0.885), Y(0.27)], [X(0.885), Y(0.34)]],
  ];
  pipes.forEach((p, i) => { const c = i < 2 ? cPos : cNeg; line(p, 'rgba(200,215,235,0.25)', 7); line(p, c, 4); if (running) dots(p, 6, flowPhase * 2, 'rgba(255,255,255,0.85)', 1.8); });
  [[X(0.24), Y(0.93)], [X(0.76), Y(0.93)]].forEach(([px, py], i) => { ctx.fillStyle = '#1b2433'; ctx.strokeStyle = i ? cNeg : cPos; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(px, py, small ? 8 : 11, 0, 6.28); ctx.fill(); ctx.stroke();
    ctx.save(); ctx.translate(px, py); ctx.rotate(running ? wob * 5 : 0); ctx.strokeStyle = '#c9ced4'; ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(6, 0); ctx.moveTo(0, -6); ctx.lineTo(0, 6); ctx.stroke(); ctx.restore(); });
  // external circuit
  const wy = Y(0.12), wire = [[cx0 - 3.5, cy0 - 4], [cx0 - 3.5, wy], [cx1 + 3.5, wy], [cx1 + 3.5, cy0 - 4]];
  line(wire, '#c9773a', 3);
  if (Math.abs(dirSmooth) > 0.02) { ctx.globalAlpha = Math.abs(dirSmooth); dots(wire, 12, -phase * 1.6, '#26d9e3', small ? 2.4 : 3.2); ctx.globalAlpha = 1; } // discharge: e⁻ travel right → left
  const dw = X(0.16), dh = Y(0.12); ctx.fillStyle = '#131b2b'; ctx.strokeStyle = live > 0 ? '#26d9e3' : live < 0 ? '#ffb347' : '#5b6677'; ctx.lineWidth = 2; roundRect(mid - dw / 2, wy - dh / 2, dw, dh, 8); ctx.fill(); ctx.stroke();
  ctx.fillStyle = ctx.strokeStyle; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(L(live > 0 ? 'v.source' : live < 0 ? 'v.load' : 'v.open'), mid, wy);
  if (live) {
    const ax0 = mid + dw / 2 + 10, ax1 = cx1 - 6, bx0 = cx0 + 6, bx1 = mid - dw / 2 - 10;
    // electrons leave the negative (right) electrode on discharge; conventional current is the opposite direction
    if (live < 0) { arrow(ax1, wy - 12, ax0, '#26d9e3', 'e⁻', true); arrow(bx0, wy - 12, bx1, '#ff9b2f', 'I', true); }
    else { arrow(ax0, wy - 12, ax1, '#26d9e3', 'e⁻', true); arrow(bx1, wy - 12, bx0, '#ff9b2f', 'I', true); }
  }
}

// --- loop ------------------------------------------------------------------------------------
let last = performance.now(), acc = 0, chartAcc = 0;
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000); last = now;
  if (running && mode) {
    const speed = +$('speed').value; let simT = dt * speed; const step = Math.max(2, speed / 60);
    let snap = null;
    while (simT > 0 && !sim.s.stopped) { const d = Math.min(step, simT); snap = sim.step(d, mode); simT -= d; acc += d; if (acc >= 120) { acc = 0; push(snap); } }
    if (sim.s.stopped) {
      push(sim.snapshot(0)); const why = sim.s.stopped;
      if (auto) { mode = -mode; lastMode = mode; sim.s.stopped = null; setStatus(L(mode > 0 ? 'st.charging' : 'st.discharging')); }
      else { running = false; setStatus(`<b>${L(`st.${why}`)}</b>`); }
      sync();
    }
    drawReadouts(sim.snapshot(running ? mode : 0));
    chartAcc += dt; if (chartAcc > 0.25) { chartAcc = 0; drawCharts(); drawSteps(); }
  }
  draw(dt);
  requestAnimationFrame(frame);
}
reset();
requestAnimationFrame(frame);

downloadBar($('dl'), () => {
  const p = sim.p;
  const inputs = [[L('paramTitle'), L('value')], [L('p.j') + ' (mA/cm²)', p.j], [L('p.cells'), p.cells], [L('p.area') + ' (cm²)', p.area], [L('p.asr') + ' (Ω·cm²)', p.asr], [L('p.litres') + ' (L)', p.litres], [L('p.c') + ' (mol/L)', p.c], [L('p.T') + ' (°C)', p.T], [L('p.ce') + ' (%)', p.ce * 100], [L('p.socMin') + ' (%)', p.socMin * 100], [L('p.socMax') + ' (%)', p.socMax * 100]];
  const series = [[L('hours'), L('r.soc') + ' (%)', L('r.vcell') + ' (V)', L('r.ocv') + ' (V)', L('r.P') + ' (kW)', L('r.eIn') + ' (kWh)', L('r.eOut') + ' (kWh)', L('r.stored') + ' (kWh)'], ...hist.map(h => [+h.t.toFixed(4), +h.soc.toFixed(2), +h.v.toFixed(4), +h.ocv.toFixed(4), +h.p.toFixed(3), +h.eIn.toFixed(3), +h.eOut.toFixed(3), +h.stored.toFixed(3)])];
  const s = sim.snapshot(running ? mode : 0);
  return { name: 'vrfb-charge-discharge', sheets: [{ name: L('paramTitle'), rows: inputs }, { name: L('chartsTitle'), rows: series }],
    report: { title: L('h1'), subtitle: L('lede'), blocks: [{ h: L('paramTitle') }, { kv: inputs.slice(1).map(([k, v]) => [k, String(v)]) }, { h: L('readTitle') }, { kv: [[L('r.soc'), `${num(s.soc * 100, 1)} %`], [L('r.vcell'), `${num(s.vCell, 3)} V`], [L('r.ocv'), `${num(s.ocv, 3)} V`], [L('r.vstack'), `${num(s.vStack, 1)} V`], [L('r.eIn'), `${num(s.eInKWh, 1)} kWh`], [L('r.eOut'), `${num(s.eOutKWh, 1)} kWh`]] },
      { h: L('chartsTitle') }, { img: charts.soc.canvas, caption: L('cSoc') + ' (%)' }, { img: charts.volt.canvas, caption: L('cVolt') + ' (V)' }, { img: charts.power.canvas, caption: L('cPower') + ' (kW)' }, { img: charts.energy.canvas, caption: L('cEnergy') + ' (kWh)' }, { h: t('labs.common.assumptions') }, { p: L('assume'), muted: true }] } };
});
