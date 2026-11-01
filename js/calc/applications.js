import { lineChart, legend, readInputs, CHART_COLORS, fmt } from './chart.js';
/** 24-hour solar + VRFB dispatch simulator (15-minute steps). */
export function simulate(p) {
  const dt = 0.25, steps = 96; const eff = Math.sqrt(p.rte / 100);
  let E = p.Ecap * p.soc0 / 100; const rows = [];
  let solarE = 0, direct = 0, shifted = 0, exported = 0, imported = 0, charged = 0;
  for (let i = 0; i < steps; i++) {
    const t = i * dt;
    const pv = t > 6 && t < 19 ? p.solar * Math.pow(Math.max(0, Math.sin(Math.PI * (t - 6) / 13)), 1.3) : 0;
    const load = p.base + p.peak * Math.exp(-Math.pow((t - 19.5) / 2.2, 2)) + 0.25 * p.peak * Math.exp(-Math.pow((t - 7.5) / 1.5, 2));
    let bat = 0; // + discharge, − charge (MW at the grid side)
    if (pv >= load) {
      const surplus = pv - load; const room = (p.Ecap - E) / (dt * eff);
      const ch = Math.min(surplus, p.Pbat, room); bat = -ch; E += ch * eff * dt; exported += (surplus - ch) * dt; direct += load * dt; charged += ch * dt;
    } else {
      const deficit = load - pv; const avail = E * eff / dt;
      const dis = Math.min(deficit, p.Pbat, avail); bat = dis; E -= dis / eff * dt; imported += (deficit - dis) * dt; direct += pv * dt; shifted += dis * dt;
    }
    solarE += pv * dt; rows.push({ t, pv, load, bat, E });
  }
  const loadE = rows.reduce((s, r) => s + r.load * dt, 0);
  return { rows, solarE, direct, shifted, exported, imported, loadE, charged, selfSufficiency: (direct + shifted) / loadE };
}

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
      { name: 'Solar output', color: CHART_COLORS[1], fill: true, points: s.rows.map(r => [r.t, r.pv]) },
      { name: 'Load', color: CHART_COLORS[0], points: s.rows.map(r => [r.t, r.load]) },
      { name: 'Battery (+ discharge / − charge)', color: CHART_COLORS[2], points: s.rows.map(r => [r.t, r.bat]) },
    ];
    const soc = [{ name: 'Tank state of charge', color: CHART_COLORS[3], fill: true, points: s.rows.map(r => [r.t, r.E / p.Ecap * 100]) }];
    if (!chart) { chart = lineChart(chartEl, { series, xLabel: 'Hour of day', yLabel: 'Power (MW)', xFormat: hh, yFormat: v => `${Number(v).toFixed(0)}` }); legend(legEl, series); socChart = lineChart(socEl, { series: soc, xLabel: 'Hour of day', yLabel: 'SOC (%)', xFormat: hh, yFormat: v => `${Number(v).toFixed(0)}`, yMin: 0, yMax: 100 }); }
    else { chart.update({ series }); socChart.update({ series: soc }); }
  }
  root.addEventListener('input', update); update();
}
