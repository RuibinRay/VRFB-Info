import { lineChart, legend, readInputs, CHART_COLORS } from './chart.js';
import { CS } from './strings.js';
import { ocv as nernst, electrolyteColor, thermalVoltage } from '../sim/electrochem.js';
/** Open-circuit voltage explorer: Nernst equation for the all-vanadium cell (model in js/sim/electrochem.js). */
const ocv = (soc, T, cH, donnan) => nernst(soc, { T, cH, donnan });

const root = document.getElementById('tool-nernst');
if (root) {
  const chartEl = root.querySelector('.chart'), legEl = root.querySelector('.legend');
  const series = () => {
    const p = readInputs(root); const T = p.T + 273.15; const donnan = root.querySelector('[data-k="donnan"]').checked;
    const pts = (fn) => Array.from({ length: 97 }, (_, i) => { const s = 0.02 + i * 0.01; return [s * 100, fn(s)]; });
    return { p, T, donnan, list: [
      { name: CS.chem.yours, color: CHART_COLORS[0], points: pts(s => ocv(s, T, p.cH, donnan)) },
      { name: CS.chem.ref, color: CHART_COLORS[1], dash: [5, 4], points: pts(s => ocv(s, 298.15, 5, false)) },
    ] };
  };
  const first = series();
  const chart = lineChart(chartEl, { series: first.list, xLabel: CS.chem.x, yLabel: CS.chem.y, xFormat: v => `${v}`, yFormat: v => Number(v).toFixed(2), yMin: 1.0, yMax: 1.7, marker: first.p.soc });
  legend(legEl, first.list);
  const out = (k) => root.querySelector(`[data-out="${k}"]`);
  function update() {
    const { p, T, donnan, list } = series();
    const E = ocv(p.soc / 100, T, p.cH, donnan);
    out('ocv').textContent = E.toFixed(3) + ' V';
    out('stack').textContent = (E * p.N).toFixed(1) + ' V';
    out('ratio').textContent = `${(p.soc).toFixed(0)} : ${(100 - p.soc).toFixed(0)}`;
    out('nernst').textContent = (thermalVoltage(T) * 1000).toFixed(1) + ' mV';
    root.querySelector('[data-out="negtank"]').style.background = electrolyteColor('neg', p.soc / 100);
    root.querySelector('[data-out="postank"]').style.background = electrolyteColor('pos', p.soc / 100);
    chart.update({ series: list, marker: p.soc });
  }
  root.addEventListener('input', update); update();
}
