import { lineChart, legend, readInputs, CHART_COLORS, fmt } from './chart.js';
import { CS } from './strings.js';
/** 24-hour solar + VRFB dispatch simulator (15-minute steps); model in js/sim/dispatch.js. */
import { simulate } from '../sim/dispatch.js';
export { simulate };

const root = document.getElementById('tool-dispatch');
if (root) {
  const out = (k, v) => { const el = root.querySelector(`[data-out="${k}"]`); if (el) el.textContent = v; };
  const chartEl = root.querySelector('.chart'), legEl = root.querySelector('.legend'), socEl = root.querySelector('.chart--soc');
  let chart, socChart;
  const hh = (v) => `${String(Math.floor(v)).padStart(2, '0')}:00`;
  function update() {
    const p = readInputs(root); const s = simulate(p);
    out('solarE', fmt.n(0)(s.solarE) + ' MWh'); out('shifted', fmt.n(0)(s.shifted) + ' MWh'); out('exported', fmt.n(0)(s.exported) + ' MWh'); out('imported', fmt.n(0)(s.imported) + ' MWh'); out('self', (s.selfSufficiency * 100).toFixed(0) + ' %'); out('hours', (p.Ecap / p.Pbat).toFixed(1) + ' h');
    const series = [
      { name: CS.apps.solar, color: CHART_COLORS[1], fill: true, points: s.rows.map(r => [r.t, r.pv]) },
      { name: CS.apps.load, color: CHART_COLORS[0], points: s.rows.map(r => [r.t, r.load]) },
      { name: CS.apps.battery, color: CHART_COLORS[2], points: s.rows.map(r => [r.t, r.bat]) },
    ];
    const soc = [{ name: CS.apps.soc, color: CHART_COLORS[3], fill: true, points: s.rows.map(r => [r.t, r.E / p.Ecap * 100]) }];
    if (!chart) { chart = lineChart(chartEl, { series, xLabel: CS.apps.x, yLabel: CS.apps.y, xFormat: hh, yFormat: v => `${Number(v).toFixed(0)}` }); legend(legEl, series); socChart = lineChart(socEl, { series: soc, xLabel: CS.apps.x, yLabel: CS.apps.ySoc, xFormat: hh, yFormat: v => `${Number(v).toFixed(0)}`, yMin: 0, yMax: 100 }); }
    else { chart.update({ series }); socChart.update({ series: soc }); }
  }
  root.addEventListener('input', update); update();
}
