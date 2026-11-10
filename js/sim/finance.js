/**
 * Techno-economic model for stationary storage: capital cost, yearly cash
 * flows, levelised cost of storage (LCOS), net present value and payback.
 * Pure functions, no DOM.
 *
 * Accounting rules (the same for every technology, so comparisons are fair):
 *   • one analysis horizon `life` (years) shared by both technologies
 *   • rated energy = usable AC energy delivered per full cycle at beginning of life
 *   • replacements are charged in the year they occur and never in the final year
 *   • whatever service life is left in a replaced part at the end of the horizon
 *     is credited as salvage (straight-line), so a battery replaced in year 15
 *     of a 25-year study is not treated as worthless in year 25
 *   • end-of-life items (electrolyte recovery, recycling, decommissioning) fall in year `life`
 *   • all cash flows are real (no inflation) and discounted at `disc`
 *
 * Default values are ILLUSTRATIVE and editable. They sit inside the ranges of
 * the U.S. DOE / PNNL 2022 cost assessment [ref 5] and Minke & Turek 2018
 * [ref 14]; they are not quotes.
 */
import { v2o5PerKWh, oneWayEfficiency } from './sizing.js';

export const PROJECT_DEFAULTS = {
  P: 10,          // MW rated power
  h: 8,           // hours at rated power
  cycles: 330,    // full cycles per year
  life: 25,       // analysis horizon, years
  disc: 7,        // % real discount rate
  chg: 30,        // $/MWh price paid for charging energy
  sell: 120,      // $/MWh value of discharged energy (tariff or avoided cost)
};
export const VRFB_DEFAULTS = {
  stackCost: 450, // $/kW stacks
  pcsCost: 100,   // $/kW power conversion system
  bosP: 150,      // $/kW pumps, piping, controls
  bosE: 60,       // $/kWh tanks and energy-related balance of system
  v2o5: 18,       // $/kg vanadium pentoxide
  acidProc: 15,   // $/kWh acid, water and electrolyte processing
  c: 1.6,         // mol/L vanadium
  window: 0.8,    // usable SOC window (fraction)
  vNom: 1.35,     // V nominal cell voltage on discharge
  epc: 20,        // % of equipment
  om: 15,         // $/kW-yr fixed O&M (includes periodic rebalancing)
  rte: 72,        // % AC round-trip efficiency
  fade: 0.3,      // %/yr capacity fade NOT recovered by rebalancing
  stackInterval: 12, // years between stack refurbishments
  stackRepl: 50,  // % of stack cost per refurbishment
  resid: 60,      // % of electrolyte cost recovered at end of life (if owned)
  decom: 5,       // $/kWh decommissioning
  lease: 0,       // 1 = electrolyte leased instead of purchased
  leaseRate: 8,   // %/yr of electrolyte value paid as lease fee
};
export const LFP_DEFAULTS = {
  capexE: 250,    // $/kWh installed DC storage block incl. containers and thermal management, per NAMEPLATE kWh
  pcsCost: 100,   // $/kW power conversion system
  epc: 15,        // % of equipment
  dod: 90,        // % of nameplate used per cycle
  rte: 86,        // % AC round-trip efficiency
  calFade: 1.5,   // %/yr calendar fade
  cycFade: 2.0,   // % capacity lost per 1000 equivalent full cycles
  eol: 70,        // % state of health at which the battery is replaced
  calLife: 15,    // years, maximum calendar life
  replCost: 60,   // % of the initial storage-block cost per replacement
  om: 10,         // $/kW-yr fixed O&M
  recycle: 0,     // $/kWh nameplate, net recycling value (+) or cost (−) at end of life
  decom: 5,       // $/kWh decommissioning
};

const df = (rate, t) => 1 / Math.pow(1 + rate, t);

/** VRFB capital cost breakdown, $. */
export function vrfbCapex(prj, v) {
  const Pkw = prj.P * 1000, Ekwh = prj.P * prj.h * 1000;
  const eta = oneWayEfficiency(v.rte);
  const kgPerKWh = v2o5PerKWh(v.c, v.window, v.vNom) / eta;       // per usable AC kWh
  const electrolyteValue = Ekwh * (kgPerKWh * v.v2o5 + v.acidProc);
  const stacks = Pkw * v.stackCost, pcs = Pkw * v.pcsCost, bos = Ekwh * v.bosE + Pkw * v.bosP;
  const electrolyte = v.lease ? 0 : electrolyteValue;
  const equipment = stacks + pcs + bos + electrolyte;
  const epc = equipment * v.epc / 100;
  return { stacks, pcs, bos, electrolyte, electrolyteValue, epc, total: equipment + epc, kgPerKWh, Pkw, Ekwh,
    parts: { power: stacks, storage: electrolyte, bos: bos + pcs, epc } };
}
/** LFP capital cost breakdown, $. */
export function lfpCapex(prj, l) {
  const Pkw = prj.P * 1000, Ekwh = prj.P * prj.h * 1000;
  const nameplate = Ekwh / (l.dod / 100);
  const block = nameplate * l.capexE, pcs = Pkw * l.pcsCost;
  const epc = (block + pcs) * l.epc / 100;
  return { block, pcs, epc, total: block + pcs + epc, nameplate, Pkw, Ekwh,
    parts: { power: 0, storage: block, bos: pcs, epc } };
}

/** Years an LFP battery lasts before reaching its end-of-life state of health or calendar limit. */
export function lfpServiceLife(l, cyclesPerYear) {
  const fadePerYear = l.calFade / 100 + (l.cycFade / 100) * (cyclesPerYear * l.dod / 100) / 1000;
  const toEol = fadePerYear > 0 ? (1 - l.eol / 100) / fadePerYear : Infinity;
  return { fadePerYear, years: Math.min(l.calLife, toEol) };
}

function finish(prj, capex, rows, extra) {
  const r = prj.disc / 100, N = prj.life;
  let pvCosts = capex.total, pvEnergy = 0, npv = -capex.total, cum = -capex.total, cumDisc = -capex.total, payback = null, discPayback = null, totalEnergy = 0;
  for (const y of rows) {
    const d = df(r, y.t);
    y.costs = y.om + y.lease + y.charging + y.replacement;
    y.net = y.revenue - y.costs + y.residual;
    pvCosts += (y.costs - y.residual) * d; pvEnergy += y.energy * d; npv += y.net * d; totalEnergy += y.energy;
    const prev = cum, prevD = cumDisc;
    cum += y.net; cumDisc += y.net * d; y.cum = cum; y.cumDisc = cumDisc;
    if (payback === null && cum >= 0 && y.net > 0) payback = y.t - 1 + (-prev) / y.net;
    if (discPayback === null && cumDisc >= 0 && y.net > 0) discPayback = y.t - 1 + (-prevD) / (y.net * d);
  }
  const crf = r > 0 ? r / (1 - Math.pow(1 + r, -N)) : 1 / N;
  return { capex, years: rows, lcos: pvCosts / pvEnergy, npv, payback, discPayback, pvCosts, pvEnergy, totalEnergy,
    perKWh: capex.total / capex.Ekwh, perKW: capex.total / capex.Pkw, annualised: pvCosts * crf, ...extra };
}

/** Full VRFB cash-flow model. prj: PROJECT_DEFAULTS shape; v: VRFB_DEFAULTS shape. */
export function vrfbModel(prjIn = {}, vIn = {}) {
  const prj = { ...PROJECT_DEFAULTS, ...prjIn }, v = { ...VRFB_DEFAULTS, ...vIn };
  const capex = vrfbCapex(prj, v), N = Math.round(prj.life), interval = Math.max(1, Math.round(v.stackInterval));
  const rows = [], replacements = []; let lastRefurb = 0;
  for (let t = 1; t <= N; t++) {
    const health = Math.pow(1 - v.fade / 100, t - 1);
    const energy = capex.Ekwh * prj.cycles * health / 1000;                // MWh delivered
    const refurb = t % interval === 0 && t < N;
    if (refurb) { replacements.push(t); lastRefurb = t; }
    rows.push({ t, health, energy, om: capex.Pkw * v.om, lease: v.lease ? capex.electrolyteValue * v.leaseRate / 100 : 0,
      charging: energy / (v.rte / 100) * prj.chg, replacement: refurb ? capex.stacks * v.stackRepl / 100 : 0,
      revenue: energy * prj.sell, residual: 0 });
  }
  const remaining = Math.max(0, 1 - (N - lastRefurb) / interval);
  const residual = { electrolyte: v.lease ? 0 : capex.electrolyteValue * v.resid / 100, salvage: remaining * capex.stacks * v.stackRepl / 100, decommissioning: -capex.Ekwh * v.decom };
  residual.total = residual.electrolyte + residual.salvage + residual.decommissioning;
  rows[N - 1].residual = residual.total;
  return finish(prj, capex, rows, { tech: 'vrfb', replacements, residual, inputs: { prj, tech: v } });
}

/** Full LFP cash-flow model. prj: PROJECT_DEFAULTS shape; l: LFP_DEFAULTS shape. */
export function lfpModel(prjIn = {}, lIn = {}) {
  const prj = { ...PROJECT_DEFAULTS, ...prjIn }, l = { ...LFP_DEFAULTS, ...lIn };
  const capex = lfpCapex(prj, l), N = Math.round(prj.life);
  const svc = lfpServiceLife(l, prj.cycles);
  const rows = [], replacements = []; let lastRepl = 0;
  for (let t = 1; t <= N; t++) {
    const age = t - 1 - lastRepl;
    const health = Math.max(0, 1 - svc.fadePerYear * (age + 0.5));         // mid-year state of health
    const energy = capex.Ekwh * prj.cycles * health / 1000;
    const ageEnd = t - lastRepl;
    const replace = t < N && ageEnd + 1 > svc.years + 1e-9;                // cannot complete another year
    if (replace) { replacements.push(t); lastRepl = t; }
    rows.push({ t, health, energy, om: capex.Pkw * l.om, lease: 0, charging: energy / (l.rte / 100) * prj.chg,
      replacement: replace ? capex.block * l.replCost / 100 : 0, revenue: energy * prj.sell, residual: 0 });
  }
  const remaining = Math.max(0, 1 - (N - lastRepl) / svc.years);
  const residual = { salvage: remaining * capex.block * l.replCost / 100, recycling: capex.nameplate * l.recycle, decommissioning: -capex.nameplate * l.decom };
  residual.total = residual.salvage + residual.recycling + residual.decommissioning;
  rows[N - 1].residual = residual.total;
  return finish(prj, capex, rows, { tech: 'lfp', replacements, residual, serviceLife: svc.years, inputs: { prj, tech: l } });
}

export const MODELS = { vrfb: vrfbModel, lfp: lfpModel };

/**
 * One-at-a-time sensitivity: each key is moved ±pct % and the metric recomputed.
 * Keys are looked up in the technology inputs first, then in the project inputs.
 */
export function tornado(tech, prj, params, keys, pct = 20, metric = 'lcos') {
  const run = MODELS[tech], base = run(prj, params)[metric];
  return keys.map(key => {
    const inTech = key in { ...(tech === 'vrfb' ? VRFB_DEFAULTS : LFP_DEFAULTS), ...params };
    const cur = inTech ? { ...(tech === 'vrfb' ? VRFB_DEFAULTS : LFP_DEFAULTS), ...params }[key] : { ...PROJECT_DEFAULTS, ...prj }[key];
    const at = (f) => { const val = cur * f; return inTech ? run(prj, { ...params, [key]: val })[metric] : run({ ...prj, [key]: val }, params)[metric]; };
    const low = at(1 - pct / 100), high = at(1 + pct / 100);
    return { key, base, low, high, span: Math.abs(high - low) };
  }).sort((a, b) => b.span - a.span);
}

/** LCOS of both technologies against storage duration (hours at rated power). */
export function durationSweep(prj, v, l, hours = [2, 3, 4, 5, 6, 8, 10, 12, 16, 24]) {
  return hours.map(h => ({ h, vrfb: vrfbModel({ ...prj, h }, v).lcos, lfp: lfpModel({ ...prj, h }, l).lcos }));
}

/** Duration at which the two LCOS curves cross (linear interpolation), or null if they do not within the sweep. */
export function breakevenDuration(sweep) {
  for (let i = 1; i < sweep.length; i++) {
    const a = sweep[i - 1], b = sweep[i], da = a.vrfb - a.lfp, db = b.vrfb - b.lfp;
    if (da === 0) return a.h;
    if (da * db < 0) return a.h + (b.h - a.h) * (da / (da - db));
  }
  return null;
}
