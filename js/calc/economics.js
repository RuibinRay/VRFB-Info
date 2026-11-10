import { lineChart, legend, readInputs, CHART_COLORS, fmt } from './chart.js';
import { CS } from './strings.js';
import { vrfbModel, lfpModel } from '../sim/finance.js';
/**
 * Economics-pillar calculator: levelised cost of storage for a VRFB against an
 * LFP comparator over ONE shared project life. The cash-flow model lives in
 * js/sim/finance.js (tested in tests/finance.test.mjs); the full comparison
 * lab on compare.html exposes every input.
 */
const root = document.getElementById('tool-lcos');
if (root) {
  const out = (k, v) => { const el = root.querySelector(`[data-out="${k}"]`); if (el) el.textContent = v; };
  const chartEl = root.querySelector('.chart'), legEl = root.querySelector('.legend:not(.costbar-legend)'), bar = root.querySelector('.costbar'), barLeg = root.querySelector('.costbar-legend');
  let chart;
  const money = (v) => Math.abs(v) >= 1e6 ? `$${(v / 1e6).toFixed(2)} M` : `$${fmt.n(0)(v)}`;
  const split = (p) => ({
    prj: { P: p.P, h: p.h, cycles: p.cycles, life: p.life, disc: p.disc, chg: p.chg },
    v: { v2o5: p.v2o5, c: p.c, window: p.dod, acidProc: p.acidProc, stackCost: p.stackCost, pcsCost: p.pcsCost, bosE: p.bosE, bosP: p.bosP, epc: p.epc, om: p.om, rte: p.rte, fade: p.deg, stackInterval: p.stackYear, stackRepl: p.stackRepl, resid: p.resid },
    l: { capexE: p.liCapex, rte: p.liRte, calLife: p.liLife, calFade: p.liDeg, om: p.liOm, dod: p.liDod, replCost: p.liRepl },
  });
  function update() {
    const p = readInputs(root); const { prj, v: vIn, l: lIn } = split(p);
    const v = vrfbModel(prj, vIn), li = lfpModel(prj, lIn);
    out('capex', money(v.capex.total)); out('perKwh', `$${fmt.n(0)(v.perKWh)}/kWh`); out('lcos', `$${fmt.n(0)(v.lcos)}/MWh`); out('lcosLi', `$${fmt.n(0)(li.lcos)}/MWh`);
    out('kg', v.capex.kgPerKWh.toFixed(1) + ' kg'); out('elecShare', ((v.capex.electrolyte * (1 + vIn.epc / 100) / v.capex.total) * 100).toFixed(0) + ' %'); out('liPerKwh', `$${fmt.n(0)(li.perKWh)}/kWh`);
    out('liRepl', li.replacements.length ? li.replacements.join(', ') : '—'); out('vRepl', v.replacements.length ? v.replacements.join(', ') : '—');
    const parts = [[CS.econ.parts[0], v.capex.parts.power, CHART_COLORS[0]], [CS.econ.parts[1], v.capex.parts.storage, CHART_COLORS[1]], [CS.econ.parts[2], v.capex.parts.bos, CHART_COLORS[2]], [CS.econ.parts[3], v.capex.parts.epc, CHART_COLORS[3]]];
    bar.innerHTML = parts.map(([n, val, c]) => `<span title="${n}: ${money(val)}" style="width:${(val / v.capex.total * 100).toFixed(1)}%;background:${c}"></span>`).join('');
    barLeg.innerHTML = parts.map(([n, val, c]) => `<span><i style="background:${c}"></i>${n} · ${(val / v.capex.total * 100).toFixed(0)} %</span>`).join('');
    const pts = Array.from({ length: 36 }, (_, i) => { const price = 5 + i; return [price, vrfbModel(prj, { ...vIn, v2o5: price }).lcos]; });
    const series = [
      { name: CS.econ.vrfb, color: CHART_COLORS[0], points: pts },
      { name: CS.econ.li, color: CHART_COLORS[1], dash: [5, 4], points: pts.map(([x]) => [x, li.lcos]) },
    ];
    if (!chart) { chart = lineChart(chartEl, { series, xLabel: CS.econ.x, yLabel: CS.econ.y, xFormat: v => `${v}`, yFormat: v => `${Number(v).toFixed(0)}`, yMin: 0, marker: p.v2o5 }); legend(legEl, series); }
    else chart.update({ series, marker: p.v2o5 });
  }
  root.addEventListener('input', update); update();
}
