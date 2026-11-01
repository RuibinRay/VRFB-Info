import { lineChart, legend, readInputs, CHART_COLORS } from './chart.js';
import { CS } from './strings.js';
/** Open-circuit voltage explorer: Nernst equation for the all-vanadium cell. */
const R = 8.314, F = 96485, E0 = 1.259; // V, standard cell potential (1.004 − (−0.255))
const V2 = [139, 77, 255], V3 = [63, 207, 90], V4 = [47, 123, 255], V5 = [255, 207, 51];
const mix = (a, b, t) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(',')})`;
export function ocv(soc, T, cH, donnan) { const s = Math.min(0.999, Math.max(0.001, soc)); return E0 + (R * T / F) * (2 * Math.log(s / (1 - s)) + 2 * Math.log(cH)) + (donnan ? 0.06 : 0); }

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
    out('nernst').textContent = ((R * T / F) * 1000).toFixed(1) + ' mV';
    root.querySelector('[data-out="negtank"]').style.background = mix(V3, V2, p.soc / 100);
    root.querySelector('[data-out="postank"]').style.background = mix(V4, V5, p.soc / 100);
    chart.update({ series: list, marker: p.soc });
  }
  root.addEventListener('input', update); update();
}
