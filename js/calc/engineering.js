import { lineChart, legend, readInputs, CHART_COLORS, fmt } from './chart.js';
import { CS } from './strings.js';
import { stackDesign, efficiencyAt } from '../sim/sizing.js';
/** System sizing: stacks, electrolyte, tanks, pumps and efficiency vs current density. */
const root = document.getElementById('tool-sizing');
if (root) {
  const out = (k, v) => { const el = root.querySelector('[data-out="' + k + '"]'); if (el) el.textContent = v; };
  const chartEl = root.querySelector('.chart'), legEl = root.querySelector('.legend');
  let chart;
  const model = stackDesign;
  const efficiency = (p, j, pumpFrac) => efficiencyAt(p, j, pumpFrac);
  function update() {
    const p = readInputs(root); const m = model(p); const e = efficiency(p, p.j, m.pumpFrac);
    out('stackI', fmt.n(0)(m.I) + ' A'); out('stackV', fmt.n(1)(m.Vstack) + ' V'); out('stackP', fmt.n(1)(m.Pstack) + ' kW'); out('nStacks', fmt.n(0)(m.nStacks));
    out('litres', fmt.n(0)(m.litresTotal) + ' L'); out('whL', fmt.n(1)(m.whPerLitreTotal) + ' Wh/L'); out('tank', `Ø ${m.Dtank.toFixed(2)} m × ${(m.Dtank * 1.5).toFixed(2)} m`);
    out('flow', fmt.n(1)(m.Qstack) + ' L/min'); out('pump', fmt.n(1)(m.pumpKW) + ' kW'); out('pumpFrac', (m.pumpFrac * 100).toFixed(1) + ' %');
    out('ve', (e.ve * 100).toFixed(1) + ' %'); out('cell', (e.cell * 100).toFixed(1) + ' %'); out('sys', (e.sys * 100).toFixed(1) + ' %');
    const pts = (k) => Array.from({ length: 37 }, (_, i) => { const j = 20 + i * 5; const mm = model({ ...p, j }); return [j, efficiency(p, j, mm.pumpFrac)[k] * 100]; });
    const series = [
      { name: CS.eng.cell, color: CHART_COLORS[0], points: pts('cell') },
      { name: CS.eng.sys, color: CHART_COLORS[1], points: pts('sys') },
      { name: CS.eng.ve, color: CHART_COLORS[2], dash: [4, 4], points: pts('ve') },
    ];
    if (!chart) { chart = lineChart(chartEl, { series, xLabel: CS.eng.x, yLabel: CS.eng.y, yMin: 40, yMax: 100, xFormat: v => `${v}`, yFormat: v => `${Number(v).toFixed(0)}`, marker: p.j }); legend(legEl, series); }
    else chart.update({ series, marker: p.j });
  }
  root.addEventListener('input', update); update();
}
