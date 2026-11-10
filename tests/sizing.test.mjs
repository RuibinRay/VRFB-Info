import test from 'node:test';
import assert from 'node:assert/strict';
import { sizeSystem, electrolyteFor, v2o5PerKWh, cRate, durationHours, stackDesign, efficiencyAt, stoichFlowLps, tankDimensions } from '../js/sim/sizing.js';
import { F } from '../js/sim/constants.js';
import { simulate, simulateProject, runDispatch, solarShape, LOAD_SHAPES } from '../js/sim/dispatch.js';

const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg || ''} expected ${b} ± ${tol}, got ${a}`);

test('power, energy, duration and C-rate', () => {
  for (const [mw, mwh, hours, c] of [[1, 4, 4, 0.25], [1, 8, 8, 0.125], [10, 100, 10, 0.1], [100, 1000, 10, 0.1]]) {
    near(durationHours(mwh, mw), hours, 1e-12); near(cRate(mwh, mw), c, 1e-12);
  }
});

test('energy scales with electrolyte, power with stacks', () => {
  const a = sizeSystem({ powerKW: 1000, energyKWh: 4000 }), b = sizeSystem({ powerKW: 1000, energyKWh: 8000 }), c = sizeSystem({ powerKW: 2000, energyKWh: 4000 });
  assert.equal(a.nStacks, b.nStacks, 'doubling energy leaves the stack count unchanged');
  near(b.litresTotal / a.litresTotal, 2, 1e-9, 'doubling energy doubles the electrolyte');
  near(c.litresTotal, a.litresTotal, 1e-6, 'doubling power leaves the electrolyte unchanged');
  near(c.nStacks / a.nStacks, 2, 0.05, 'doubling power doubles the stacks');
  near(a.chargeEnergyAC, 4000 / 0.72, 1e-9, 'charging energy = rated energy ÷ round-trip efficiency');
  near(a.energyDC, 4000 / Math.sqrt(0.72), 1e-9);
  near(a.whPerLitreTotal, 23.16, 0.01);
});

test('vanadium inventory from first principles', () => {
  // 1 kWh at 1.35 V needs 1000/1.35 Ah = 27.64 mol e⁻; one V per electron on each side; 80 % usable
  const mol = 2 * (1000 / 1.35) / 26.8015 / 0.8;
  near(electrolyteFor(1).molV, mol, 0.01);
  near(v2o5PerKWh(1.6, 0.8, 1.35), 6.28, 0.02, 'kg V₂O₅ per kWh DC at 80 % window');
  near(v2o5PerKWh(1.6, 1, 1.35), 5.03, 0.02, 'theoretical minimum');
  near(v2o5PerKWh(2.5, 0.8, 1.35), v2o5PerKWh(1.6, 0.8, 1.35), 1e-9, 'concentration changes the volume, not the mass of vanadium');
});

test('stack design, flow and pump power', () => {
  const p = { P: 250, E: 1000, Vcell: 1.3, j: 80, A: 2500, N: 40, c: 1.6, dod: 0.8, lambda: 8, dp: 0.6, eta: 0.55, asr: 1.2, ce: 96, inv: 97 };
  const m = stackDesign(p);
  near(m.I, 200, 1e-9); near(m.Vstack, 52, 1e-9); near(m.Pstack, 10.4, 1e-9); assert.equal(m.nStacks, 25);
  near(stoichFlowLps(200, 40, 1.6), 40 * 200 / (F * 1.6), 1e-12);
  near(m.Qstack, 8 * 40 * 200 / (F * 1.6) * 60, 1e-9, 'L/min per stack per loop');
  near(m.pumpKW, (m.Qstack / 60000) * 0.6e5 / 0.55 * 2 * 25 / 1000, 1e-9);
  assert.ok(m.pumpFrac > 0.005 && m.pumpFrac < 0.06, 'pumps take a few percent of rated power');
  const e = efficiencyAt(p, 80, m.pumpFrac);
  near(e.ve, (1.4 - 0.096) / (1.4 + 0.096), 1e-12);
  near(e.sys, e.cell * 0.97 * 0.97 * (1 - m.pumpFrac) / (1 + m.pumpFrac), 1e-12, 'pumps are charged on both legs of the cycle');
  assert.ok(e.sys > 0.65 && e.sys < 0.8, 'AC round trip within the published 65–80 % band');
  assert.ok(efficiencyAt(p, 160, m.pumpFrac).sys < e.sys, 'efficiency falls as current density rises');
  const t = tankDimensions(100, 1.5, 0); near(Math.PI * t.d * t.d / 4 * t.h, 100, 1e-9);
});

test('dispatch conserves energy', () => {
  const cases = [simulate({ solar: 50, Pbat: 20, Ecap: 160, base: 20, peak: 25, rte: 72, soc0: 20 }),
    simulateProject({ kind: 'household', dailyLoad: 30, solarPeak: 8, Pbat: 5, Ecap: 20, rte: 75, soc0: 10 }),
    simulateProject({ kind: 'utility', dailyLoad: 2400, solarPeak: 300, Pbat: 100, Ecap: 800, rte: 72, soc0: 0 })];
  for (const s of cases) {
    near(s.direct + s.charged + s.exported, s.solarE, 1e-6, 'solar = used directly + stored + exported');
    near(s.direct + s.shifted + s.imported, s.loadE, 1e-6, 'load = solar direct + battery + grid');
    near(s.charged - s.shifted - (s.Eend - s.E0), s.losses, 1e-9);
    assert.ok(s.losses >= -1e-9, 'the battery never creates energy');
    for (const r of s.rows) { assert.ok(r.E >= -1e-9, 'never below empty'); near(r.load - r.pv - r.bat - r.grid, 0, 1e-9, 'power balance every step'); }
    assert.ok(s.selfSufficiency >= 0 && s.selfSufficiency <= 1 + 1e-9);
  }
  // a full day of the household profile adds up to the requested energy
  near(cases[1].loadE, 30, 1e-6);
  // round trip: energy out ≤ energy in × efficiency (+ what was already stored)
  const s = runDispatch({ pv: [10, 10, 0, 0], load: [0, 0, 5, 5], dt: 1, Pbat: 10, Ecap: 100, rte: 81, soc0: 0 });
  near(s.Eend + s.shifted / 0.9, 18, 1e-9, 'stored energy = charged × one-way efficiency');
});

test('profiles are well behaved', () => {
  assert.equal(solarShape(3), 0); assert.equal(solarShape(22), 0); near(solarShape(12.5), 1, 1e-9);
  for (const f of Object.values(LOAD_SHAPES)) for (let t = 0; t < 24; t += 0.25) assert.ok(f(t) > 0);
});
