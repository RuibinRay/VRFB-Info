import { lineChart, legend, readInputs, CHART_COLORS, fmt } from './chart.js';
/** System sizing: stacks, electrolyte, tanks, pumps and efficiency vs current density. */
const F = 96485, AH_PER_MOL = 26.801;
const root = document.getElementById('tool-sizing');
if (root) {
  const out = (k, v) => { const el = root.querySelector(`[data-out="${k}"]`); if (el) el.textContent = v; };
  const chartEl = root.querySelector('.chart'), legEl = root.querySelector('.legend');
  let chart;
  function model(p) {
    const I = p.j * p.A / 1000;                       // A
    const Vstack = p.N * p.Vcell;                      // V
    const Pstack = I * Vstack / 1000;                  // kW
    const nStacks = Math.max(1, Math.ceil(p.P / Pstack));
    const whPerLitreSide = p.c * AH_PER_MOL * p.dod * p.Vcell;   // Wh per litre of ONE electrolyte
    const litresSide = p.E * 1000 / whPerLitreSide;
    const litresTotal = 2 * litresSide;
    const whPerLitreTotal = whPerLitreSide / 2;
    const Dtank = Math.cbrt(4 * (litresSide / 1000) / (1.5 * Math.PI)); // H = 1.5 D
    const Qstack = p.lambda * p.N * I / (F * p.c) * 60;           // L/min per stack per loop
    const pumpW = (Qstack / 60000) * (p.dp * 1e5) / p.eta;          // W per stack per loop
    const pumpKW = pumpW * 2 * nStacks / 1000;
    const pumpFrac = pumpKW / p.P;
    return { I, Vstack, Pstack, nStacks, litresSide, litresTotal, whPerLitreTotal, Dtank, Qstack, pumpKW, pumpFrac };
  }
  function efficiency(p, j, pumpFrac) {
    const ocvV = 1.4; // ≈ OCV at 50 % SOC (Knehr & Kumbur 2011)
    const drop = j / 1000 * p.asr;                     // V, ohmic + kinetic lumped into ASR
    const ve = (ocvV - drop) / (ocvV + drop);          // voltage efficiency
    const ce = p.ce / 100;
    const cell = ce * ve;
    const sys = cell * (1 - pumpFrac) * Math.pow(p.inv / 100, 2);
    return { ve, ce, cell, sys };
  }
  function update() {
    const p = readInputs(root); const m = model(p); const e = efficiency(p, p.j, m.pumpFrac);
    out('stackI', fmt.n(0)(m.I) + ' A'); out('stackV', fmt.n(1)(m.Vstack) + ' V'); out('stackP', fmt.n(1)(m.Pstack) + ' kW'); out('nStacks', fmt.n(0)(m.nStacks));
    out('litres', fmt.n(0)(m.litresTotal) + ' L'); out('whL', fmt.n(1)(m.whPerLitreTotal) + ' Wh/L'); out('tank', `Ø ${m.Dtank.toFixed(2)} m × ${(m.Dtank * 1.5).toFixed(2)} m`);
    out('flow', fmt.n(1)(m.Qstack) + ' L/min'); out('pump', fmt.n(1)(m.pumpKW) + ' kW'); out('pumpFrac', (m.pumpFrac * 100).toFixed(1) + ' %');
    out('ve', (e.ve * 100).toFixed(1) + ' %'); out('cell', (e.cell * 100).toFixed(1) + ' %'); out('sys', (e.sys * 100).toFixed(1) + ' %');
    const pts = (k) => Array.from({ length: 37 }, (_, i) => { const j = 20 + i * 5; const mm = model({ ...p, j }); return [j, efficiency(p, j, mm.pumpFrac)[k] * 100]; });
    const series = [
      { name: 'Cell energy efficiency (CE × VE)', color: CHART_COLORS[0], points: pts('cell') },
      { name: 'System AC-AC (pumps + inverter)', color: CHART_COLORS[1], points: pts('sys') },
      { name: 'Voltage efficiency', color: CHART_COLORS[2], dash: [4, 4], points: pts('ve') },
    ];
    if (!chart) { chart = lineChart(chartEl, { series, xLabel: 'Current density (mA/cm²)', yLabel: 'Efficiency (%)', yMin: 40, yMax: 100, xFormat: v => `${v}`, yFormat: v => `${Number(v).toFixed(0)}`, marker: p.j }); legend(legEl, series); }
    else chart.update({ series, marker: p.j });
  }
  root.addEventListener('input', update); update();
}
