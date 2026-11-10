/**
 * One-day solar + load + battery dispatch at 15-minute resolution. Pure functions.
 * Power in any consistent unit (kW or MW); energy in the matching unit-hours.
 */

/** Clear-sky solar shape, 0…1, between sunrise and sunset (hours). */
export function solarShape(t, sunrise = 6, sunset = 19) {
  if (t <= sunrise || t >= sunset) return 0;
  return Math.pow(Math.max(0, Math.sin(Math.PI * (t - sunrise) / (sunset - sunrise))), 1.3);
}

const g = (t, mu, sigma) => Math.exp(-Math.pow((t - mu) / sigma, 2));
/** Idealised daily load shapes (relative units; normalised by the caller). */
export const LOAD_SHAPES = {
  household: (t) => 0.35 + 0.55 * g(t, 7.5, 1.3) + 1.0 * g(t, 19.5, 2.4),
  commercial: (t) => 0.3 + 0.9 * (1 / (1 + Math.exp(-(t - 7.5) * 1.6))) * (1 / (1 + Math.exp((t - 18.5) * 1.6))),
  industrial: (t) => 0.75 + 0.25 * (1 / (1 + Math.exp(-(t - 6) * 1.4))) * (1 / (1 + Math.exp((t - 22) * 1.4))),
  utility: (t) => 0.62 + 0.14 * g(t, 8, 1.8) + 0.38 * g(t, 19.5, 2.4),
};

/**
 * Core dispatch loop. The battery charges only from solar surplus and
 * discharges only into a deficit ("self-consumption" strategy). Losses are
 * split evenly between charging and discharging.
 *   pv, load  arrays of power per step · dt step in hours
 *   Pbat      battery power limit · Ecap usable energy · rte % · soc0 % of Ecap
 */
export function runDispatch({ pv, load, dt = 0.25, Pbat, Ecap, rte, soc0 = 0 }) {
  const eff = Math.sqrt(rte / 100);
  let E = Ecap * soc0 / 100; const E0 = E; const rows = [];
  let solarE = 0, loadE = 0, direct = 0, shifted = 0, exported = 0, imported = 0, charged = 0;
  for (let i = 0; i < pv.length; i++) {
    const p = pv[i], l = load[i]; let bat = 0;
    if (p >= l) {
      const surplus = p - l, room = (Ecap - E) / (dt * eff);
      const ch = Math.max(0, Math.min(surplus, Pbat, room));
      bat = -ch; E += ch * eff * dt; exported += (surplus - ch) * dt; direct += l * dt; charged += ch * dt;
    } else {
      const deficit = l - p, avail = E * eff / dt;
      const dis = Math.max(0, Math.min(deficit, Pbat, avail));
      bat = dis; E -= dis / eff * dt; imported += (deficit - dis) * dt; direct += p * dt; shifted += dis * dt;
    }
    solarE += p * dt; loadE += l * dt;
    rows.push({ t: i * dt, pv: p, load: l, bat, E, grid: l - p - bat }); // grid > 0 import, < 0 export
  }
  return { rows, solarE, loadE, direct, shifted, exported, imported, charged, E0, Eend: E, losses: charged - shifted - (E - E0), selfSufficiency: loadE > 0 ? (direct + shifted) / loadE : 0, selfConsumption: solarE > 0 ? (direct + charged) / solarE : 0, cycles: Ecap > 0 ? shifted / Ecap : 0 };
}

const steps = (dt) => Array.from({ length: Math.round(24 / dt) }, (_, i) => i * dt);

/** Applications-pillar simulator (MW): base load + evening peak + morning bump. */
export function simulate(p) {
  const dt = 0.25, ts = steps(dt);
  const pv = ts.map(t => p.solar * solarShape(t));
  const load = ts.map(t => p.base + p.peak * g(t, 19.5, 2.2) + 0.25 * p.peak * g(t, 7.5, 1.5));
  return runDispatch({ pv, load, dt, Pbat: p.Pbat, Ecap: p.Ecap, rte: p.rte, soc0: p.soc0 });
}

/**
 * Project-builder simulator: a load shape scaled to a daily energy demand.
 *   kind 'household' | 'commercial' | 'industrial' | 'utility'
 *   dailyLoad energy per day · solarPeak peak PV output · Pbat, Ecap, rte, soc0 as above
 */
export function simulateProject({ kind = 'commercial', dailyLoad, solarPeak, Pbat, Ecap, rte, soc0 = 20, dt = 0.25 }) {
  const ts = steps(dt), shape = LOAD_SHAPES[kind] || LOAD_SHAPES.commercial;
  const raw = ts.map(shape), sum = raw.reduce((s, v) => s + v * dt, 0);
  const load = raw.map(v => v * dailyLoad / sum);
  const pv = ts.map(t => solarPeak * solarShape(t));
  return { ...runDispatch({ pv, load, dt, Pbat, Ecap, rte, soc0 }), peakLoad: Math.max(...load) };
}
