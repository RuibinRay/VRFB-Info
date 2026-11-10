/** Small line illustrations for the glossary. GLOSS_ICON maps a term id to an icon key. */
const P = {
  battery: '<rect x="8" y="14" width="26" height="16" rx="3"/><path d="M36 19v6M14 22h6M17 19v6M25 22h5"/>',
  layers: '<rect x="9" y="10" width="5" height="24" rx="1"/><rect x="17" y="10" width="3" height="24" rx="1"/><rect x="23" y="10" width="5" height="24" rx="1"/><rect x="31" y="10" width="3" height="24" rx="1"/>',
  cell: '<rect x="8" y="10" width="28" height="24" rx="3"/><path d="M22 10v24" stroke-dasharray="3 3"/><circle cx="15" cy="22" r="2.5"/><circle cx="29" cy="22" r="2.5"/>',
  membrane: '<path d="M22 8v28" stroke-width="4" opacity="0.5"/><path d="M10 16h9M10 28h9M25 22h9"/><path d="M17 13l3 3-3 3M17 25l3 3-3 3"/>',
  electron: '<circle cx="22" cy="22" r="5"/><path d="M19.5 22h5"/><path d="M8 22a14 14 0 0 1 28 0" stroke-dasharray="3 4"/><path d="M33 17l3 5 3-5"/>',
  ion: '<circle cx="22" cy="22" r="9"/><path d="M18 22h8M22 18v8"/>',
  flask: '<path d="M18 8h8M19 8v9l-8 14a3 3 0 0 0 2.6 4.5h16.8A3 3 0 0 0 33 31l-8-14V8"/><path d="M14 27h16"/>',
  pump: '<circle cx="22" cy="22" r="10"/><path d="M22 14v16M14 22h16M16 16l12 12M28 16 16 28" opacity="0.6"/><path d="M32 22h6M6 22h6"/>',
  bolt: '<path d="M24 6 12 24h9l-2 14 13-19h-9l1-13Z"/>',
  gauge: '<path d="M8 28a14 14 0 0 1 28 0"/><path d="M22 28l7-9"/><path d="M12 28h2M30 28h2M22 14v2"/>',
  chart: '<path d="M8 34h28M8 34V10"/><path d="M11 28l7-8 6 4 9-12"/>',
  money: '<circle cx="22" cy="22" r="13"/><path d="M26 17c-1-2-7-2.5-7 1s7 2 7 6-6 3.5-8 1M22 12v20"/>',
  clock: '<circle cx="22" cy="22" r="13"/><path d="M22 14v8l6 4"/>',
  sun: '<circle cx="22" cy="22" r="6"/><path d="M22 6v5M22 33v5M6 22h5M33 22h5M10.7 10.7l3.5 3.5M29.8 29.8l3.5 3.5M10.7 33.3l3.5-3.5M29.8 14.2l3.5-3.5"/>',
  felt: '<rect x="8" y="10" width="28" height="24" rx="3"/><path d="M11 16l9 4M14 30l12-9M22 13l10 8M18 24l14 6M12 23l6-8"/>',
  recycle: '<path d="M14 18a9 9 0 0 1 16-2l2 3M30 26a9 9 0 0 1-16 2l-2-3"/><path d="M32 12v7h-7M12 32v-7h7"/>',
  wave: '<path d="M6 16c5-6 9 6 16 0s11 6 16 0M6 26c5-6 9 6 16 0s11 6 16 0"/>',
  percent: '<circle cx="14" cy="14" r="4"/><circle cx="30" cy="30" r="4"/><path d="M32 10 12 34"/>',
  grid: '<path d="M18 36 21 8h2l3 28M12 16h20M14 24h16"/>',
  dot: '<circle cx="22" cy="22" r="5"/>',
};
export const icon = (key) => `<svg viewBox="0 0 44 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="color:var(--cyan)" aria-hidden="true">${P[key] || P.dot}</svg>`;
export const GLOSS_ICON = {
  vrfb: 'battery', redox: 'electron', oxidation: 'ion', electrolyte: 'flask', vanadium: 'ion', v2o5: 'flask', stack: 'layers', cell: 'cell', electrode: 'felt', felt: 'felt', bipolar: 'layers', membrane: 'membrane', proton: 'ion', crossover: 'membrane', rebalancing: 'recycle', collector: 'bolt', flowfield: 'wave',
  soc: 'gauge', ocv: 'bolt', nernst: 'chart', faraday: 'electron', current_density: 'bolt', overpotential: 'chart', asr: 'membrane', ce: 'percent', ve: 'percent', rte: 'percent', power: 'bolt', energy: 'battery', duration: 'clock', crate: 'clock', dod: 'gauge', window: 'gauge',
  pcs: 'grid', bms: 'gauge', shunt: 'electron', flow_factor: 'pump', parasitic: 'pump', capex: 'money', opex: 'money', lcos: 'money', npv: 'chart', discount: 'percent', payback: 'clock', degradation: 'chart', leasing: 'recycle', lfp: 'battery', self_sufficiency: 'sun', peak_shaving: 'chart', hydrogen: 'ion',
};
