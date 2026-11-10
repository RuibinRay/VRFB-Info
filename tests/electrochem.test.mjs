import test from 'node:test';
import assert from 'node:assert/strict';
import { F, R, E0_CELL, E0_NEG, E0_POS, REACTIONS, AH_PER_MOL, KG_V2O5_PER_KG_V } from '../js/sim/constants.js';
import { ocv, halfCellPotentials, cellVoltage, voltageEfficiency, energyDensityWhPerL, thermalVoltage, gibbsKJ, electrolyteColor } from '../js/sim/electrochem.js';
import { createCellSim } from '../js/sim/cell.js';

const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg || ''} expected ${b} ± ${tol}, got ${a}`);

test('constants are the accepted values', () => {
  near(F, 96485.33, 0.01); near(R, 8.3145, 0.0001);
  near(E0_CELL, 1.259, 1e-9, 'E°cell = 1.004 − (−0.255)');
  near(AH_PER_MOL, 26.80, 0.01, 'Ah per mole of electrons');
  near(thermalVoltage(298.15) * 1000, 25.69, 0.02, 'RT/F at 25 °C in mV');
  near(KG_V2O5_PER_KG_V, 1.785, 0.001);
});

test('half-reactions conserve atoms and charge', () => {
  for (const [name, rx] of Object.entries(REACTIONS)) {
    const tally = (side) => side.reduce((acc, sp) => { const n = sp.n || 1; acc.charge += sp.charge * n; for (const [el, k] of Object.entries(sp.atoms)) acc[el] = (acc[el] || 0) + k * n; return acc; }, { charge: 0 });
    assert.deepEqual(tally(rx.left), tally(rx.right), `${name} half-reaction is balanced`);
  }
  // the overall cell reaction exchanges one electron per vanadium on each side
  const electrons = (rx) => [...rx.left, ...rx.right].filter(s => s.s === 'e').length;
  assert.equal(electrons(REACTIONS.negative), 1); assert.equal(electrons(REACTIONS.positive), 1);
});

test('Nernst open-circuit voltage', () => {
  // at 50 % SOC the concentration ratio terms vanish; only the proton term and the offset remain
  const expected = E0_CELL + 2 * thermalVoltage() * Math.log(5);
  near(ocv(0.5, { donnan: false }), expected, 1e-12);
  near(ocv(0.5, { donnan: false }), 1.342, 0.001, 'simple Nernst form at 5 M H⁺');
  near(ocv(0.5), 1.40, 0.005, 'measured OCV at 50 % SOC (Knehr & Kumbur 2011)');
  // with unit proton activity and equal concentrations the cell sits at E°
  near(ocv(0.5, { cH: 1, donnan: false }), E0_CELL, 1e-12);
  // monotonic in SOC, antisymmetric about 50 %
  let prev = -Infinity; for (let s = 0.02; s < 0.99; s += 0.02) { const e = ocv(s); assert.ok(e > prev, 'OCV rises with SOC'); prev = e; }
  near(ocv(0.9) - ocv(0.5), ocv(0.5) - ocv(0.1), 1e-12, 'symmetric about 50 % SOC');
  near(ocv(0.9) - ocv(0.1), 4 * thermalVoltage() * Math.log(9), 1e-12, '10→90 % swing = 4(RT/F)ln9 ≈ 226 mV');
  // hotter cells have a wider swing
  assert.ok(ocv(0.9, { T: 313.15 }) - ocv(0.1, { T: 313.15 }) > ocv(0.9) - ocv(0.1));
});

test('half-cell potentials sum to the cell voltage and move the right way', () => {
  const a = halfCellPotentials(0.5, 298.15, 1);
  near(a.neg, E0_NEG, 1e-12); near(a.pos, E0_POS, 1e-12);
  const charged = halfCellPotentials(0.9), flat = halfCellPotentials(0.1);
  assert.ok(charged.neg < flat.neg, 'negative electrode becomes more negative when charged');
  assert.ok(charged.pos > flat.pos, 'positive electrode becomes more positive when charged');
  near(charged.pos - charged.neg, ocv(0.9, { donnan: false }), 1e-12);
});

test('polarisation: charging needs more than OCV, discharging gives less', () => {
  const rest = cellVoltage({ soc: 0.5, j: 80, asr: 1.2, mode: 0 });
  const chg = cellVoltage({ soc: 0.5, j: 80, asr: 1.2, mode: 1 });
  const dis = cellVoltage({ soc: 0.5, j: 80, asr: 1.2, mode: -1 });
  near(chg.v - rest.v, 0.096, 1e-9, 'ohmic step = 80 mA/cm² × 1.2 Ω·cm²');
  near(rest.v - dis.v, 0.096, 1e-9);
  near(voltageEfficiency(rest.v, 80, 1.2), dis.v / chg.v, 1e-12);
  // the optional mass-transport term only ever adds loss
  const mt = cellVoltage({ soc: 0.15, j: 80, asr: 1.2, mode: -1, jLim: 1500 });
  assert.ok(mt.v < cellVoltage({ soc: 0.15, j: 80, asr: 1.2, mode: -1 }).v);
  assert.ok(cellVoltage({ soc: 0.02, j: 80, asr: 1.2, mode: -1, jLim: 1500 }).limited, 'starved electrode is flagged');
});

test('energy density and Gibbs energy', () => {
  near(energyDensityWhPerL(1.6, 0.8, 1.35), 23.2, 0.1, 'total electrolyte at 1.6 M, 80 % window');
  near(energyDensityWhPerL(1.6, 1, 1.35), 28.9, 0.1);
  near(gibbsKJ(), -121.5, 0.1, 'ΔG = −FE° per mole of electrons');
});

test('electrolyte colours follow the oxidation states', () => {
  assert.equal(electrolyteColor('neg', 0), 'rgb(31,174,69)');   // V³⁺ green
  assert.equal(electrolyteColor('neg', 1), 'rgb(124,58,237)');  // V²⁺ violet
  assert.equal(electrolyteColor('pos', 0), 'rgb(29,99,240)');   // VO²⁺ blue
  assert.equal(electrolyteColor('pos', 1), 'rgb(242,194,26)');  // VO₂⁺ yellow
});

test('cell simulation: coulomb counting and efficiencies', () => {
  const sim = createCellSim({ cells: 40, area: 2500, j: 80, asr: 1.2, c: 1.6, litres: 2000, ce: 0.97 });
  near(sim.current(), 200, 1e-9, 'I = j·A');
  near(sim.capacityAh(), 1.6 * 2000 * AH_PER_MOL, 1e-6);
  const r = sim.fullCycle(5);
  near(r.coulombicEff, 0.97, 0.002, 'round-trip coulombic efficiency equals the input');
  near(r.voltageEff, 0.87, 0.02, 'voltage efficiency at 80 mA/cm², 1.2 Ω·cm²');
  near(r.energyEff, r.coulombicEff * r.voltageEff, 1e-9, 'EE = CE × VE');
  near(r.socEnd, 0.1, 1e-6, 'a full cycle returns to the lower SOC limit');
  // charge time: 80 % of the vanadium in 2000 L, 40 cells each passing 200 A
  const idealSeconds = 0.8 * 1.6 * 2000 * F / (40 * 200);
  near(r.tCharge, idealSeconds / Math.sqrt(0.97), 15, 'charge time from Faraday\'s law');
  assert.ok(r.eOut < r.eIn, 'you never get out more than you put in');
});

test('cell simulation respects limits and is deterministic', () => {
  const sim = createCellSim({ soc0: 0.5 });
  const before = sim.snapshot(0);
  for (let i = 0; i < 20000; i++) sim.step(30, 1);
  assert.ok(sim.s.soc <= 0.9 + 1e-12); assert.equal(sim.s.stopped, 'soc-max');
  for (let i = 0; i < 20000; i++) sim.step(30, -1);
  assert.ok(sim.s.soc >= 0.1 - 1e-12); assert.equal(sim.s.stopped, 'soc-min');
  sim.reset(0.5); near(sim.snapshot(0).ocv, before.ocv, 1e-12);
  // higher current density → lower efficiency (the stack is being worked harder)
  const slow = createCellSim({ j: 40 }).fullCycle(10).energyEff, fast = createCellSim({ j: 160 }).fullCycle(10).energyEff;
  assert.ok(slow > fast);
});
