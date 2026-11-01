import { lineChart, legend, readInputs, CHART_COLORS, fmt } from './chart.js';
import { CS } from './strings.js';
/** Levelised cost of storage (LCOS) for a VRFB vs a lithium-ion comparator. */
const AH_PER_MOL = 26.801, M_V = 50.94, M_V2O5 = 181.88;
export function v2o5PerKwh(c, dod, vnom) { const whPerLitreTotal = c * AH_PER_MOL * dod * vnom / 2; const litres = 1000 / whPerLitreTotal; const molV = c * litres; return molV * M_V / 1000 * (M_V2O5 / (2 * M_V)); }
function npv(rate, years, fn) { let s = 0; for (let t = 1; t <= years; t++) s += fn(t) / Math.pow(1 + rate, t); return s; }

export function lcosVRFB(p, v2o5Price = p.v2o5) {
  const Pkw = p.P * 1000, Ekwh = p.P * p.h * 1000;
  const kgPerKwh = v2o5PerKwh(p.c, p.dod, 1.35);
  const stack = Pkw * p.stackCost;
  const electrolyte = Ekwh * (kgPerKwh * v2o5Price + p.acidProc);
  const bos = Ekwh * p.bosE + Pkw * p.bosP;
  const epc = (stack + electrolyte + bos) * p.epc / 100;
  const capex = stack + electrolyte + bos + epc;
  const r = p.disc / 100, N = p.life;
  const eYear = (t) => Ekwh * p.dod * p.cycles * Math.pow(1 - p.deg / 100, t - 1) / 1000; // MWh discharged
  const costs = capex + npv(r, N, t => Pkw * p.om + eYear(t) / (p.rte / 100) * p.chg + (t === p.stackYear ? stack * p.stackRepl / 100 : 0)) - (electrolyte * p.resid / 100) / Math.pow(1 + r, N);
  const energy = npv(r, N, eYear);
  return { capex, stack, electrolyte, bos, epc, lcos: costs / energy, perKwh: capex / Ekwh, kgPerKwh, energyMWh: energy };
}
export function lcosLiIon(p) {
  const Pkw = p.P * 1000, Ekwh = p.P * p.h * 1000;
  const capex = Ekwh * p.liCapex;
  const r = p.disc / 100, N = p.liLife;
  const eYear = (t) => Ekwh * 0.9 * p.cycles * Math.pow(1 - p.liDeg / 100, t - 1) / 1000;
  const costs = capex + npv(r, N, t => Pkw * p.liOm + eYear(t) / (p.liRte / 100) * p.chg);
  return { capex, lcos: costs / npv(r, N, eYear), perKwh: capex / Ekwh };
}

const root = document.getElementById('tool-lcos');
if (root) {
  const out = (k, v) => { const el = root.querySelector(`[data-out="${k}"]`); if (el) el.textContent = v; };
  const chartEl = root.querySelector('.chart'), legEl = root.querySelector('.legend:not(.costbar-legend)'), bar = root.querySelector('.costbar'), barLeg = root.querySelector('.costbar-legend');
  let chart;
  const money = (v) => v >= 1e6 ? `$${(v / 1e6).toFixed(2)} M` : `$${fmt.n(0)(v)}`;
  function update() {
    const p = readInputs(root); const v = lcosVRFB(p); const li = lcosLiIon(p);
    out('capex', money(v.capex)); out('perKwh', `$${fmt.n(0)(v.perKwh)}/kWh`); out('lcos', `$${fmt.n(0)(v.lcos)}/MWh`); out('lcosLi', `$${fmt.n(0)(li.lcos)}/MWh`);
    out('kg', v.kgPerKwh.toFixed(1) + ' kg'); out('elecShare', ((v.electrolyte / v.capex) * 100).toFixed(0) + ' %'); out('liPerKwh', `$${fmt.n(0)(li.perKwh)}/kWh`);
    const parts = [[CS.econ.parts[0], v.stack, CHART_COLORS[0]], [CS.econ.parts[1], v.electrolyte, CHART_COLORS[1]], [CS.econ.parts[2], v.bos, CHART_COLORS[2]], [CS.econ.parts[3], v.epc, CHART_COLORS[3]]];
    bar.innerHTML = parts.map(([n, val, c]) => `<span title="${n}: ${money(val)}" style="width:${(val / v.capex * 100).toFixed(1)}%;background:${c}"></span>`).join('');
    barLeg.innerHTML = parts.map(([n, val, c]) => `<span><i style="background:${c}"></i>${n} · ${(val / v.capex * 100).toFixed(0)} %</span>`).join('');
    const pts = Array.from({ length: 36 }, (_, i) => { const price = 5 + i; return [price, lcosVRFB(p, price).lcos]; });
    const series = [
      { name: CS.econ.vrfb, color: CHART_COLORS[0], points: pts },
      { name: CS.econ.li, color: CHART_COLORS[1], dash: [5, 4], points: pts.map(([x]) => [x, li.lcos]) },
    ];
    if (!chart) { chart = lineChart(chartEl, { series, xLabel: CS.econ.x, yLabel: CS.econ.y, xFormat: v => `${v}`, yFormat: v => `${Number(v).toFixed(0)}`, yMin: 0, marker: p.v2o5 }); legend(legEl, series); }
    else chart.update({ series, marker: p.v2o5 });
  }
  root.addEventListener('input', update); update();
}
