/**
 * Clickable equations. `parts` is language-neutral: plain HTML strings and
 * [html, variableKey] pairs. Variable names, units and explanations come from
 * the dictionary (learn.eqvars.<key> = { n, u, d }).
 */
const s = (html, key) => [html, key];
export const EQUATIONS = {
  cellE0: { parts: [s('E°<sub>cell</sub>', 'E0cell'), ' = ', s('E°<sub>+</sub>', 'E0pos'), ' − ', s('E°<sub>−</sub>', 'E0neg'), ' = 1.004 − (−0.255) = 1.259 V'] },
  nernst: { parts: [s('E', 'E'), ' = ', s('E°', 'E0cell'), ' + (', s('R', 'R'), s('T', 'T'), ' / ', s('F', 'F'), ') · [ 2 ln( ', s('SOC', 'SOC'), ' / (1 − ', s('SOC', 'SOC'), ') ) + 2 ln ', s('c<sub>H⁺</sub>', 'cH'), ' ]'] },
  capacity: { parts: [s('Q', 'Q'), ' = ', s('c', 'c'), ' · ', s('V', 'Vol'), ' · ', s('F', 'F'), '&nbsp;&nbsp;&nbsp;', s('E', 'En'), ' = ', s('Q', 'Q'), ' · ', s('ΔSOC', 'dSOC'), ' · ', s('V<sub>cell</sub>', 'Vcell')] },
  stackV: { parts: [s('V<sub>stack</sub>', 'Vstack'), ' = ', s('N', 'N'), ' · ', s('V<sub>cell</sub>', 'Vcell'), '&nbsp;&nbsp;&nbsp;', s('P', 'P'), ' = ', s('V<sub>stack</sub>', 'Vstack'), ' · ', s('I', 'I')] },
  ohm: { parts: [s('ΔV', 'dV'), ' = ', s('j', 'j'), ' · ', s('ASR', 'ASR')] },
  duration: { parts: [s('t', 't'), ' = ', s('E', 'En'), ' / ', s('P', 'P')] },
  crate: { parts: [s('C', 'Crate'), ' = ', s('P', 'P'), ' / ', s('E', 'En')] },
  vcell: { parts: [s('V<sub>cell</sub>', 'Vcell'), ' = ', s('E', 'E'), ' ± ', s('j', 'j'), ' · ', s('ASR', 'ASR'), ' ± ', s('η', 'eta')] },
  eff: { parts: [s('EE', 'EE'), ' = ', s('CE', 'CE'), ' · ', s('VE', 'VE'), '&nbsp;&nbsp;&nbsp;', s('RTE', 'RTE'), ' ≈ ', s('EE', 'EE'), ' · ', s('η<sub>inv</sub>', 'etaInv'), '² · (1 − ', s('f', 'fp'), ') / (1 + ', s('f', 'fp'), ')'] },
  flow: { parts: [s('Q<sub>flow</sub>', 'Qf'), ' = ', s('λ', 'lambda'), ' · ', s('N', 'N'), ' · ', s('I', 'I'), ' / ( ', s('F', 'F'), ' · ', s('c', 'c'), ' · ', s('x', 'x'), ' )'] },
  pumpP: { parts: [s('P<sub>pump</sub>', 'Ppump'), ' = ', s('Q<sub>flow</sub>', 'Qf'), ' · ', s('Δp', 'dp'), ' / ', s('η<sub>p</sub>', 'etaP')] },
  lcos: { parts: [s('LCOS', 'LCOS'), ' = [ ', s('CAPEX', 'CAPEX'), ' + Σ ', s('C<sub>t</sub>', 'Ct'), ' / (1 + ', s('r', 'r'), ')<sup>t</sup> − ', s('S', 'Sres'), ' / (1 + ', s('r', 'r'), ')<sup>N</sup> ] / Σ ', s('E<sub>t</sub>', 'Et'), ' / (1 + ', s('r', 'r'), ')<sup>t</sup>'] },
  npv: { parts: [s('NPV', 'NPV'), ' = −', s('CAPEX', 'CAPEX'), ' + Σ ( ', s('R<sub>t</sub>', 'Rt'), ' − ', s('C<sub>t</sub>', 'Ct'), ' ) / (1 + ', s('r', 'r'), ')<sup>t</sup>'] },
};
