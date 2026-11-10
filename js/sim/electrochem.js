/**
 * Electrochemistry of the all-vanadium cell: Nernst open-circuit voltage,
 * half-cell potentials, polarisation and efficiency. Pure functions.
 *
 * Convention: SOC is the fraction of vanadium in the CHARGED form on each side
 * (V²⁺ in the negative electrolyte, VO₂⁺ in the positive), assumed equal on
 * both sides (a balanced system).
 */
import { F, R, T_REF, E0_NEG, E0_POS, E0_CELL, DONNAN_OFFSET, AH_PER_MOL, V_HEX } from './constants.js';

export const clampSoc = (s) => Math.min(0.999, Math.max(0.001, s));
export const thermalVoltage = (T = T_REF) => R * T / F; // 25.7 mV at 25 °C

/** Half-cell potentials vs SHE (V). cH is the proton concentration in mol/L (treated as activity). */
export function halfCellPotentials(soc, T = T_REF, cH = 5) {
  const s = clampSoc(soc), k = thermalVoltage(T);
  const neg = E0_NEG + k * Math.log((1 - s) / s);                     // [V³⁺]/[V²⁺]
  const pos = E0_POS + k * Math.log(s / (1 - s)) + 2 * k * Math.log(cH); // [VO₂⁺][H⁺]²/[VO²⁺]
  return { neg, pos };
}

/** Open-circuit cell voltage (V). `donnan` adds the empirical +60 mV offset [ref 15]. */
export function ocv(soc, { T = T_REF, cH = 5, donnan = true } = {}) {
  const { neg, pos } = halfCellPotentials(soc, T, cH);
  return pos - neg + (donnan ? DONNAN_OFFSET : 0);
}

/**
 * Cell voltage under load.
 *   j     current density, mA/cm² (always positive)
 *   asr   area-specific resistance, Ω·cm² (membrane + electrolyte + contacts + linearised kinetics)
 *   mode  +1 charging, −1 discharging, 0 open circuit
 *   jLim  optional mass-transport limiting current density at 100 % reactant, mA/cm²
 *         (illustrative: scales with the fraction of reactant still available)
 */
export function cellVoltage({ soc, j = 0, asr = 1.2, mode = 0, T = T_REF, cH = 5, donnan = true, jLim = 0 }) {
  const e = ocv(soc, { T, cH, donnan });
  if (!mode || j <= 0) return { ocv: e, ohmic: 0, transport: 0, v: e, limited: false };
  const ohmic = (j / 1000) * asr;
  let transport = 0, limited = false;
  if (jLim > 0) {
    const s = clampSoc(soc);
    const reactant = mode > 0 ? 1 - s : s;            // charging consumes the discharged species
    const ratio = j / (jLim * reactant);
    if (ratio >= 0.98) { limited = true; transport = thermalVoltage(T) * Math.log(1 / 0.02); }
    else transport = thermalVoltage(T) * Math.log(1 / (1 - ratio));
  }
  const v = mode > 0 ? e + ohmic + transport : e - ohmic - transport;
  return { ocv: e, ohmic, transport, v, limited };
}

/** Voltage efficiency of a symmetric charge/discharge at the same current density. */
export function voltageEfficiency(openCircuit, j, asr) {
  const drop = (j / 1000) * asr;
  return Math.max(0, (openCircuit - drop) / (openCircuit + drop));
}

/** Mole fractions of the four species at a given SOC. */
export const speciesFractions = (soc) => ({ v2: soc, v3: 1 - soc, v4: 1 - soc, v5: soc });

/** Theoretical charge capacity of ONE electrolyte, in Ah. c in mol/L, litres per side. */
export const capacityAh = (c, litresPerSide) => c * litresPerSide * AH_PER_MOL;

/**
 * Energy density of the TOTAL electrolyte (both tanks), Wh/L.
 * Each electron needs one vanadium ion on each side, hence the factor ½.
 */
export const energyDensityWhPerL = (c, window = 1, vCell = 1.35) => c * AH_PER_MOL * window * vCell / 2;

/** Gibbs energy of the cell reaction per mole of electrons, kJ/mol (ΔG = −nFE). */
export const gibbsKJ = (E = E0_CELL) => -F * E / 1000;

// --- colours ----------------------------------------------------------------
const hexToRgb = (h) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const RGB = Object.fromEntries(Object.entries(V_HEX).map(([k, v]) => [k, hexToRgb(v)]));
/** CSS colour of an electrolyte at a given SOC. side: 'neg' (green → violet) or 'pos' (blue → yellow). */
export function electrolyteColor(side, soc) {
  const a = side === 'neg' ? RGB.v3 : RGB.v4, b = side === 'neg' ? RGB.v2 : RGB.v5;
  const t = Math.min(1, Math.max(0, soc));
  return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(',')})`;
}
