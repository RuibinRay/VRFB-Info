import test from 'node:test';
import assert from 'node:assert/strict';
import { vrfbModel, lfpModel, vrfbCapex, lfpCapex, lfpServiceLife, tornado, durationSweep, breakevenDuration, PROJECT_DEFAULTS, VRFB_DEFAULTS, LFP_DEFAULTS } from '../js/sim/finance.js';
import { v2o5PerKWh } from '../js/sim/sizing.js';

const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg || ''} expected ${b} ± ${tol}, got ${a}`);
const rel = (a, b, tol, msg) => near(a / b, 1, tol, msg);

test('VRFB capital cost adds up', () => {
  const prj = { ...PROJECT_DEFAULTS }, v = { ...VRFB_DEFAULTS };
  const c = vrfbCapex(prj, v);
  near(c.stacks, 10000 * 450, 1e-6); near(c.pcs, 10000 * 100, 1e-6); near(c.bos, 80000 * 60 + 10000 * 150, 1e-6);
  near(c.kgPerKWh, v2o5PerKWh(1.6, 0.8, 1.35) / Math.sqrt(0.72), 1e-9, 'vanadium sized for DC energy behind the discharge losses');
  near(c.electrolyte, 80000 * (c.kgPerKWh * 18 + 15), 1e-6);
  near(c.total, (c.stacks + c.pcs + c.bos + c.electrolyte) * 1.2, 1e-6);
  near(c.parts.power + c.parts.storage + c.parts.bos + c.parts.epc, c.total, 1e-6, 'chart categories cover the total');
  assert.ok(c.total / c.Ekwh > 250 && c.total / c.Ekwh < 500, 'installed $/kWh within the published band for 8–10 h systems');
});

test('LCOS reduces to simple arithmetic when nothing is discounted', () => {
  const prj = { P: 1, h: 4, cycles: 100, life: 10, disc: 0, chg: 50, sell: 0 };
  const v = { fade: 0, stackInterval: 99, resid: 0, decom: 0, om: 10, rte: 80 };
  const m = vrfbModel(prj, v);
  const energy = 10 * 4 * 100;                                    // MWh over the life
  const stackSalvage = (1 - 10 / 99) * m.capex.stacks * 0.5;       // unused refurbishment life
  const costs = m.capex.total + 10 * (1000 * 10) + energy / 0.8 * 50 - stackSalvage;
  rel(m.lcos, costs / energy, 1e-9);
  near(m.totalEnergy, energy, 1e-9);
  near(m.npv, -costs, 1e-6, 'with no revenue the NPV is minus the lifetime cost');
  assert.equal(m.payback, null, 'a project with no revenue never pays back');
});

test('discounting, revenue and payback', () => {
  const base = vrfbModel();
  assert.ok(vrfbModel({ disc: 3 }).lcos < base.lcos && vrfbModel({ disc: 12 }).lcos > base.lcos, 'a higher discount rate raises LCOS');
  // NPV is zero when energy is sold at exactly the LCOS
  near(vrfbModel({ sell: base.lcos }).npv, 0, 1, 'selling at LCOS breaks even');
  near(lfpModel({ sell: lfpModel().lcos }).npv, 0, 1);
  const rich = vrfbModel({ sell: 400 });
  assert.ok(rich.npv > 0 && rich.payback > 0 && rich.payback < rich.discPayback, 'discounted payback is always later');
  assert.ok(vrfbModel({ sell: 400, chg: 0 }).payback < rich.payback);
  // cumulative cash flow is consistent with the yearly rows
  const last = rich.years.at(-1); near(last.cum, -rich.capex.total + rich.years.reduce((s, y) => s + y.net, 0), 1e-6);
});

test('replacements, residual value and the common horizon', () => {
  const v = vrfbModel({ life: 25 });
  assert.deepEqual(v.replacements, [12, 24], 'stack refurbishment recurs every interval');
  assert.deepEqual(vrfbModel({ life: 12 }).replacements, [], 'never in the final year');
  near(v.residual.electrolyte, 0.6 * v.capex.electrolyteValue, 1e-6);
  near(v.residual.salvage, (1 - 1 / 12) * v.capex.stacks * 0.5, 1e-6, 'a stack refurbished in year 24 keeps 11/12 of its value');
  // LFP: replaced when it can no longer finish a year above end-of-life health
  const svc = lfpServiceLife(LFP_DEFAULTS, 330);
  near(svc.fadePerYear, 0.015 + 0.02 * 330 * 0.9 / 1000, 1e-12);
  const l = lfpModel({ life: 25 });
  assert.equal(l.replacements.length, 1); assert.equal(l.replacements[0], Math.floor(svc.years));
  for (const y of l.years) assert.ok(y.health >= 0.69, `health never far below end-of-life (year ${y.t}: ${y.health})`);
  assert.ok(l.residual.salvage > 0, 'the replacement battery still has life left at year 25');
  // harder cycling shortens LFP life; it does not change VRFB refurbishment timing
  assert.ok(lfpServiceLife(LFP_DEFAULTS, 700).years < svc.years);
  assert.deepEqual(vrfbModel({ cycles: 700 }).replacements, v.replacements);
  // both technologies are evaluated over the same number of years
  assert.equal(v.years.length, l.years.length);
});

test('LFP capital cost uses nameplate energy', () => {
  const c = lfpCapex({ ...PROJECT_DEFAULTS }, { ...LFP_DEFAULTS });
  near(c.nameplate, 80000 / 0.9, 1e-6, 'nameplate = usable ÷ depth of discharge');
  near(c.total, (c.nameplate * 250 + 10000 * 100) * 1.15, 1e-6);
});

test('electrolyte leasing moves cost from capex to opex', () => {
  const own = vrfbModel(), lease = vrfbModel({}, { lease: 1 });
  near(own.capex.total - lease.capex.total, own.capex.electrolyteValue * 1.2, 1e-6);
  assert.equal(lease.residual.electrolyte, 0, 'leased electrolyte has no residual value to the project');
  near(lease.years[0].lease, 0.08 * own.capex.electrolyteValue, 1e-6);
  assert.ok(lease.perKWh < own.perKWh);
});

test('sensitivities point the right way', () => {
  const t = Object.fromEntries(tornado('vrfb', {}, {}, ['v2o5', 'stackCost', 'rte', 'cycles', 'disc', 'chg']).map(r => [r.key, r]));
  assert.ok(t.v2o5.high > t.v2o5.low && t.stackCost.high > t.stackCost.low && t.disc.high > t.disc.low && t.chg.high > t.chg.low);
  assert.ok(t.rte.high < t.rte.low && t.cycles.high < t.cycles.low, 'more efficiency or more cycles lower LCOS');
  // vanadium price matters more at long duration, stack cost more at short duration
  const span = (h, key) => tornado('vrfb', { h }, {}, [key])[0].span / vrfbModel({ h }).lcos;
  assert.ok(span(12, 'v2o5') > span(2, 'v2o5')); assert.ok(span(2, 'stackCost') > span(12, 'stackCost'));
});

test('neither technology wins everywhere', () => {
  const sweep = durationSweep({}, {}, {});
  assert.ok(sweep[0].lfp < sweep[0].vrfb, 'LFP is cheaper at 2 h with the default inputs');
  assert.ok(sweep.at(-1).vrfb < sweep.at(-1).lfp, 'VRFB is cheaper at 24 h with the default inputs');
  const be = breakevenDuration(sweep); assert.ok(be > 2 && be < 12);
  // …and the answer flips with the assumptions
  assert.equal(breakevenDuration(durationSweep({}, { v2o5: 45 }, { capexE: 150 })), null, 'expensive vanadium and cheap cells: LFP wins at every duration');
  for (const s of sweep) assert.ok(s.vrfb > 0 && s.lfp > 0);
  assert.ok(sweep.every((s, i) => i === 0 || s.vrfb <= sweep[i - 1].vrfb), 'VRFB LCOS falls monotonically with duration');
});
