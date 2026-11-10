/**
 * System sizing: how power (stacks) and energy (electrolyte) are specified
 * independently in a flow battery. Pure functions.
 *
 * Energy conventions used across the site:
 *   • "rated energy" is the usable AC energy delivered at the meter in one full discharge
 *   • the electrolyte must hold more than that as DC energy because of discharge losses
 *   • charging from empty takes rated energy ÷ round-trip efficiency at the meter
 */
import { F, AH_PER_MOL, M_V, KG_V2O5_PER_KG_V } from './constants.js';

/** kW ↔ kWh relations. */
export const durationHours = (energy, power) => energy / power;
export const cRate = (energy, power) => power / energy;            // 1/h: 0.25C = four-hour system
export const oneWayEfficiency = (rtePct) => Math.sqrt(rtePct / 100); // assume symmetric charge/discharge losses

/**
 * Electrolyte needed for a DC energy content.
 *   energyKWhDC  DC energy that must be extractable from the tanks
 *   c            vanadium concentration, mol/L
 *   window       usable SOC window as a fraction (0.8 = 10–90 %)
 *   vCell        average cell voltage on discharge, V
 */
export function electrolyteFor(energyKWhDC, { c = 1.6, window = 0.8, vCell = 1.35 } = {}) {
  const whPerLitreSide = c * AH_PER_MOL * window * vCell;     // one electron per vanadium ion, per side
  const litresPerSide = energyKWhDC * 1000 / whPerLitreSide;
  const litresTotal = 2 * litresPerSide;
  const molV = c * litresTotal;
  const kgV = molV * M_V / 1000;
  return { whPerLitreSide, whPerLitreTotal: whPerLitreSide / 2, litresPerSide, litresTotal, m3Total: litresTotal / 1000, molV, kgV, kgV2O5: kgV * KG_V2O5_PER_KG_V };
}
/** kg of V₂O₅ per kWh of DC energy capacity. */
export const v2o5PerKWh = (c = 1.6, window = 0.8, vCell = 1.35) => electrolyteFor(1, { c, window, vCell }).kgV2O5;

/** Upright cylindrical tank: diameter and height for a volume (m³), height = aspect × diameter, plus ullage. */
export function tankDimensions(m3, aspect = 1.5, ullage = 0.1) {
  const v = m3 * (1 + ullage);
  const d = Math.cbrt(4 * v / (aspect * Math.PI));
  return { d, h: aspect * d, volume: v };
}

/**
 * Whole-system sizing for the Power vs Energy lab.
 *   powerKW, energyKWh   rated AC power and usable AC energy
 *   stackKW              rated power of one stack
 *   rte                  AC round-trip efficiency, %
 */
export function sizeSystem({ powerKW, energyKWh, stackKW = 30, c = 1.6, window = 0.8, vCell = 1.35, rte = 72, tanksPerSide = 1 }) {
  const eta = oneWayEfficiency(rte);
  const nStacks = Math.max(1, Math.ceil(powerKW / stackKW - 1e-9));
  const energyDC = energyKWh / eta;                         // must leave the electrolyte
  const el = electrolyteFor(energyDC, { c, window, vCell });
  const tank = tankDimensions(el.litresPerSide / 1000 / tanksPerSide);
  return {
    duration: durationHours(energyKWh, powerKW), cRate: cRate(energyKWh, powerKW),
    nStacks, installedStackKW: nStacks * stackKW,
    eta, energyDC, chargeEnergyAC: energyKWh / (rte / 100), lossesPerCycle: energyKWh / (rte / 100) - energyKWh,
    theoreticalEnergyDC: energyDC / window,                 // if the full 0–100 % window were usable
    ...el, tank, tanksPerSide,
  };
}

/**
 * Stack design from electrochemical inputs (Engineering pillar calculator).
 *   P kW rated · E kWh · Vcell V under load · j mA/cm² · A cm² · N cells/stack · c mol/L
 *   dod usable window · lambda flow factor (× stoichiometric, on total vanadium) · dp bar · eta pump efficiency
 */
export function stackDesign(p) {
  const I = p.j * p.A / 1000;                                // A
  const Vstack = p.N * p.Vcell;
  const Pstack = I * Vstack / 1000;                          // kW
  const nStacks = Math.max(1, Math.ceil(p.P / Pstack - 1e-9));
  const el = electrolyteFor(p.E, { c: p.c, window: p.dod, vCell: p.Vcell });
  const tank = tankDimensions(el.litresPerSide / 1000, 1.5, 0);
  const Qstack = stoichFlowLps(I, p.N, p.c) * p.lambda * 60; // L/min per stack per loop
  const pumpW = (Qstack / 60000) * (p.dp * 1e5) / p.eta;     // hydraulic power ÷ pump efficiency
  const pumpKW = pumpW * 2 * nStacks / 1000;                 // two loops per stack
  return { I, Vstack, Pstack, nStacks, litresSide: el.litresPerSide, litresTotal: el.litresTotal, whPerLitreTotal: el.whPerLitreTotal, Dtank: tank.d, Qstack, pumpKW, pumpFrac: pumpKW / p.P };
}

/**
 * Stoichiometric electrolyte flow for a stack, L/s per loop: the flow that would
 * deliver exactly as many vanadium ions as the current converts, if every ion
 * reacted in a single pass. `reactantFraction` is the share of vanadium still in
 * the reacting oxidation state (1 = referenced to total vanadium).
 */
export const stoichFlowLps = (I, cells, c, reactantFraction = 1) => cells * I / (F * c * reactantFraction);

/**
 * Efficiency chain at a current density.
 * Pumps run during both charge and discharge, so their share f of rated power
 * reduces the output and adds to the input: factor (1 − f) / (1 + f).
 */
export function efficiencyAt({ asr, ce, inv }, j, pumpFrac, ocvV = 1.4) {
  const drop = j / 1000 * asr;
  const ve = Math.max(0, (ocvV - drop) / (ocvV + drop));
  const c = ce / 100, cell = c * ve, i = inv / 100;
  const sys = cell * i * i * (1 - pumpFrac) / (1 + pumpFrac);
  return { ve, ce: c, cell, sys };
}
