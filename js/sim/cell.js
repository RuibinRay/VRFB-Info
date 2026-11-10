/**
 * Time-stepping charge/discharge model of a VRFB stack with its two tanks.
 *
 * Quantitative but deliberately simple (a "zero-dimensional" model):
 *   • constant-current operation at current density j
 *   • OCV from the Nernst equation with the empirical +60 mV offset
 *   • one lumped area-specific resistance for ohmic and (linearised) kinetic losses
 *   • coulombic losses split evenly between charge and discharge
 *   • tanks perfectly mixed; SOC equal on both sides
 * Neglected: shunt currents, crossover dynamics, temperature rise, pump power.
 */
import { F, AH_PER_MOL } from './constants.js';
import { cellVoltage, ocv } from './electrochem.js';

export const CELL_DEFAULTS = {
  cells: 40,          // cells in series
  area: 2500,         // cm² active area per cell
  j: 80,              // mA/cm²
  asr: 1.2,           // Ω·cm²
  c: 1.6,             // mol/L vanadium
  litres: 2000,       // litres of electrolyte PER SIDE
  T: 25,              // °C
  cH: 5,              // mol/L protons
  ce: 0.97,           // round-trip coulombic efficiency
  socMin: 0.1, socMax: 0.9,
  vMax: 1.65, vMin: 1.0,   // cell cut-off voltages
  jLim: 0,            // optional mass-transport limit (mA/cm² at 100 % reactant)
};

export function createCellSim(overrides = {}) {
  const p = { ...CELL_DEFAULTS, ...overrides };
  const s = { t: 0, soc: p.soc0 ?? p.socMin, eIn: 0, eOut: 0, ahIn: 0, ahOut: 0, stopped: null };
  const capacityAh = () => p.c * p.litres * AH_PER_MOL;           // per side
  const current = () => p.j * p.area / 1000;                       // A through every cell
  const tempK = () => p.T + 273.15;

  /** Instantaneous electrical state for a mode (+1 charge, −1 discharge, 0 rest). */
  function snapshot(mode = 0) {
    const cv = cellVoltage({ soc: s.soc, j: p.j, asr: p.asr, mode, T: tempK(), cH: p.cH, jLim: p.jLim });
    const I = mode ? current() : 0;
    const vStack = cv.v * p.cells;
    return { t: s.t, soc: s.soc, mode, ocv: cv.ocv, vCell: cv.v, vStack, I, powerKW: vStack * I / 1000 * (mode > 0 ? -1 : 1), eInKWh: s.eIn, eOutKWh: s.eOut, storedKWh: storedKWh(), limited: cv.limited };
  }
  /** Electrical energy recoverable at open-circuit voltage from the current SOC down to socMin, kWh (ideal, no losses). */
  function storedKWh() {
    const n = 24; let e = 0; const lo = p.socMin, hi = Math.max(lo, s.soc);
    for (let i = 0; i < n; i++) { const x = lo + (hi - lo) * (i + 0.5) / n; e += ocv(x, { T: tempK(), cH: p.cH }); }
    return e / n * (hi - lo) * capacityAh() / 1000;
  }
  /**
   * Advance by dt seconds in the given mode. Returns the snapshot after the step.
   * Stops (and reports why) at the SOC window or the cut-off voltage.
   */
  function step(dt, mode) {
    s.stopped = null;
    if (!mode) { s.t += dt; return snapshot(0); }
    const I = current(), half = Math.sqrt(p.ce);
    const before = cellVoltage({ soc: s.soc, j: p.j, asr: p.asr, mode, T: tempK(), cH: p.cH, jLim: p.jLim });
    if (mode > 0 && (s.soc >= p.socMax || before.v >= p.vMax)) { s.stopped = s.soc >= p.socMax ? 'soc-max' : 'v-max'; return snapshot(0); }
    if (mode < 0 && (s.soc <= p.socMin || before.v <= p.vMin)) { s.stopped = s.soc <= p.socMin ? 'soc-min' : 'v-min'; return snapshot(0); }
    // every cell in series converts I/F mol/s on each side; tanks hold c·V mol
    const dMol = p.cells * I * dt / F;
    const dSoc = dMol / (p.c * p.litres) * (mode > 0 ? half : -1 / half);
    const next = Math.min(p.socMax, Math.max(p.socMin, s.soc + dSoc));
    const frac = Math.abs(dSoc) > 0 ? Math.abs(next - s.soc) / Math.abs(dSoc) : 0; // partial last step
    const eKWh = before.v * p.cells * I * dt * frac / 3.6e6;
    if (mode > 0) { s.eIn += eKWh; s.ahIn += I * dt * frac / 3600; } else { s.eOut += eKWh; s.ahOut += I * dt * frac / 3600; }
    s.soc = next; s.t += dt * frac;
    return snapshot(mode);
  }
  function reset(soc0) { s.t = 0; s.soc = soc0 ?? p.soc0 ?? p.socMin; s.eIn = 0; s.eOut = 0; s.ahIn = 0; s.ahOut = 0; s.stopped = null; }
  /** Run a complete charge then discharge between the SOC limits; returns the efficiencies. */
  function fullCycle(dt = 10) {
    reset(p.socMin); let guard = 0;
    while (!s.stopped && guard++ < 5e6) step(dt, 1);
    const tCharge = s.t; s.stopped = null;
    while (!s.stopped && guard++ < 5e6) step(dt, -1);
    return { eIn: s.eIn, eOut: s.eOut, energyEff: s.eOut / s.eIn, coulombicEff: s.ahOut / s.ahIn, voltageEff: (s.eOut / s.eIn) / (s.ahOut / s.ahIn), tCharge, tDischarge: s.t - tCharge, socEnd: s.soc };
  }
  return { p, s, step, reset, snapshot, fullCycle, capacityAh, current, storedKWh, set(k, v) { p[k] = v; } };
}
