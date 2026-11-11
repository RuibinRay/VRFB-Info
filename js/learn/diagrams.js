/**
 * Animated scientific diagrams for the lessons, drawn as inline SVG so they are
 * sharp at any size, translate with the page and respect reduced-motion.
 *   diagram(key, L)  →  SVG markup.  L(labelKey) returns a translated label.
 * Curves that show model results (Nernst, cost shares, LCOS crossing) are
 * computed from the same tested modules the calculators use.
 */
import { V_HEX } from '../sim/constants.js';
import { ocv } from '../sim/electrochem.js';
import { vrfbCapex, durationSweep, breakevenDuration, PROJECT_DEFAULTS, VRFB_DEFAULTS } from '../sim/finance.js';

const W = 640, H = 300, FG = '#e8edf5', MU = '#8291a8', CY = '#26d9e3', OR = '#ff9b2f', VI = '#a36bff', GR = '#5ee37a', LINE = 'rgba(160,180,210,0.3)';
const C = ['#139fae', '#d9711c', '#9d66f5', '#45a157'];
const tx = (x, y, s, o = {}) => `<text x="${x}" y="${y}" text-anchor="${o.a || 'middle'}" fill="${o.c || FG}" font-size="${o.s || 13}"${o.w ? ` font-weight="${o.w}"` : ''}${o.m ? ' font-family="JetBrains Mono, monospace"' : ''}>${s}</text>`;
const svg = (body, label) => `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${label}"><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill="context-stroke"/></marker></defs>${body}</svg>`;
/** Visitors who ask for reduced motion get the same diagrams as still pictures. */
const REDUCED = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const still = (markup) => (REDUCED ? markup.replace(/<animate(Motion|Transform)?\b[^>]*\/>/g, '') : markup);
const mover = (path, color, dur, n = 3, r = 4) => REDUCED ? '' : Array.from({ length: n }, (_, i) => `<circle r="${r}" fill="${color}"><animateMotion dur="${dur}s" begin="${-(i * dur / n).toFixed(2)}s" repeatCount="indefinite" path="${path}"/></circle>`).join('');
const tankShape = (x, y, w, h, color, level = 0.78) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="rgba(255,255,255,0.05)" stroke="rgba(200,215,235,0.55)" stroke-width="1.5"/><rect x="${x + 3}" y="${y + h * (1 - level)}" width="${w - 6}" height="${h * level - 3}" rx="7" fill="${color}" opacity="0.92"/>`;

const D = {
  states(L) {
    const ion = (x, hex, sym, ox, state) => `<circle cx="${x}" cy="128" r="40" fill="${hex}" opacity="0.92"/>${tx(x, 124, sym, { s: 17, w: 600, c: '#0a0f1a' })}${tx(x, 144, ox, { s: 12, c: '#0a0f1a', m: 1 })}${tx(x, 192, state, { s: 12, c: MU })}`;
    const pair = (x0, x1, title, color) => `${tx((x0 + x1) / 2, 54, title, { s: 14, w: 600, c: color })}<path d="M${x0 + 46} 118H${x1 - 46}" stroke="${OR}" stroke-width="2" marker-end="url(#ah)"/><path d="M${x1 - 46} 138H${x0 + 46}" stroke="${CY}" stroke-width="2" marker-end="url(#ah)"/>${mover(`M${x0 + 46} 118H${x1 - 46}`, OR, 2.4, 2)}${mover(`M${x1 - 46} 138H${x0 + 46}`, CY, 2.4, 2)}`;
    return svg(`${pair(110, 250, L('pos'), V_HEX.v5)}${ion(110, V_HEX.v5, 'VO₂⁺', '+5', L('charged'))}${ion(250, V_HEX.v4, 'VO²⁺', '+4', L('discharged'))}
      ${pair(390, 530, L('neg'), V_HEX.v2)}${ion(390, V_HEX.v2, 'V²⁺', '+2', L('charged'))}${ion(530, V_HEX.v3, 'V³⁺', '+3', L('discharged'))}
      <path d="M210 250h40" stroke="${OR}" stroke-width="2" marker-end="url(#ah)"/>${tx(258, 254, L('discharge'), { a: 'start', s: 12, c: FG })}<path d="M410 250h-40" stroke="${CY}" stroke-width="2" marker-end="url(#ah)"/>${tx(418, 254, L('charge'), { a: 'start', s: 12, c: FG })}`, L('pos') + ' / ' + L('neg'));
  },
  cell(L) {
    const wire = 'M408 96V46H232V96';
    return svg(`${tankShape(30, 96, 86, 160, V_HEX.v5)}${tankShape(524, 96, 86, 160, V_HEX.v2)}${tx(73, 280, L('pos'), { s: 12, c: MU })}${tx(567, 280, L('neg'), { s: 12, c: MU })}
      <rect x="226" y="96" width="88" height="160" fill="${V_HEX.v5}" opacity="0.28"/><rect x="326" y="96" width="88" height="160" fill="${V_HEX.v2}" opacity="0.28"/><rect x="314" y="96" width="12" height="160" fill="#cdeedd" opacity="0.8"/><rect x="220" y="92" width="6" height="168" fill="#2a2d32"/><rect x="414" y="92" width="6" height="168" fill="#2a2d32"/>
      <path d="M116 236H226M414 236H524M226 116H116M524 116H414" stroke="${LINE}" stroke-width="5" fill="none"/>
      <path d="${wire}" stroke="#c9773a" stroke-width="3" fill="none"/>${mover(wire, CY, 3, 5, 4)}<rect x="284" y="30" width="72" height="32" rx="7" fill="#131b2b" stroke="${OR}" stroke-width="1.5"/>${tx(320, 51, L('load'), { s: 12, c: OR })}
      ${mover('M356 150H284', '#fff', 2.2, 3, 3)}${mover('M356 205H284', '#fff', 2.6, 3, 3)}${tx(320, 276, L('membrane') + ' · H⁺', { s: 12, c: MU })}
      ${tx(270, 86, '+', { s: 15, w: 600 })}${tx(370, 86, '−', { s: 15, w: 600 })}${tx(468, 40, 'e⁻', { s: 13, c: CY, m: 1 })}<path d="M450 46H420" stroke="${CY}" stroke-width="1.5" marker-end="url(#ah)"/>${tx(172, 40, 'I', { s: 13, c: OR, m: 1 })}<path d="M190 46H220" stroke="${OR}" stroke-width="1.5" marker-end="url(#ah)"/>`, L('load'));
  },
  nernst(L) {
    const x0 = 70, x1 = 600, y0 = 250, y1 = 40, vmin = 1.2, vmax = 1.6, X = (s) => x0 + s * (x1 - x0), Y = (v) => y0 - (v - vmin) / (vmax - vmin) * (y0 - y1);
    let d = ''; for (let i = 2; i <= 98; i++) d += `${i === 2 ? 'M' : 'L'}${X(i / 100).toFixed(1)} ${Y(ocv(i / 100)).toFixed(1)}`;
    const grid = [1.2, 1.3, 1.4, 1.5, 1.6].map(v => `<path d="M${x0} ${Y(v)}H${x1}" stroke="${LINE}"/>${tx(x0 - 8, Y(v) + 4, v.toFixed(1), { a: 'end', s: 11, c: MU, m: 1 })}`).join('') + [0, 25, 50, 75, 100].map(p => tx(X(p / 100), y0 + 18, p, { s: 11, c: MU, m: 1 })).join('');
    return svg(`${grid}<rect x="${X(0.1)}" y="${y1}" width="${X(0.9) - X(0.1)}" height="${y0 - y1}" fill="${GR}" opacity="0.07"/>${tx(X(0.5), y1 + 16, L('window'), { s: 12, c: GR })}
      <path d="${d}" fill="none" stroke="${VI}" stroke-width="2.5"/><circle r="6" fill="${VI}" stroke="#0d1320" stroke-width="2"><animateMotion dur="7s" repeatCount="indefinite" path="${d}" keyPoints="0;1;0" keyTimes="0;0.5;1" calcMode="linear"/></circle>
      <circle cx="${X(0.5)}" cy="${Y(ocv(0.5))}" r="4" fill="${FG}"/>${tx(X(0.5) + 10, Y(ocv(0.5)) + 18, '≈ 1.40 V', { a: 'start', s: 12, m: 1 })}${tx((x0 + x1) / 2, H - 6, L('soc'), { s: 12, c: MU })}${tx(18, 30, L('volts'), { a: 'start', s: 12, c: MU })}`, L('soc'));
  },
  density(L) {
    const bar = (y, w, color, label, value) => `${tx(40, y + 22, label, { a: 'start', s: 13 })}<rect x="40" y="${y + 32}" width="${w}" height="26" rx="5" fill="${color}"><animate attributeName="width" from="0" to="${w}" dur="1.2s" fill="freeze"/></rect>${tx(40 + w + 10, y + 50, value, { a: 'start', s: 13, m: 1 })}`;
    return svg(`${tx(40, 34, L('density'), { a: 'start', s: 14, w: 600 })}${bar(52, 42, C[0], L('vrfbE'), '≈ 25 Wh/L')}${bar(132, 500, C[1], L('liE'), '≈ 250–400 Wh/L')}${tx(40, 250, L('densityNote'), { a: 'start', s: 12, c: MU })}${tx(40, 270, L('illustrative'), { a: 'start', s: 11, c: MU })}`, L('density'));
  },
  crossover(L) {
    const ions = (x0, x1, a, b) => Array.from({ length: 9 }, (_, i) => `<circle cx="${x0 + ((i * 53) % (x1 - x0))}" cy="${70 + ((i * 71) % 170)}" r="10" fill="${i % 2 ? a : b}" opacity="0.9"><animate attributeName="cy" values="${70 + ((i * 71) % 170)};${80 + ((i * 71) % 170)};${70 + ((i * 71) % 170)}" dur="${3 + (i % 3)}s" repeatCount="indefinite"/></circle>`).join('');
    return svg(`<rect x="300" y="40" width="40" height="220" fill="#cdeedd" opacity="0.75"/>${tx(320, 30, L('membrane'), { s: 12, c: MU })}${ions(40, 280, V_HEX.v5, V_HEX.v4)}${ions(360, 600, V_HEX.v2, V_HEX.v3)}
      ${mover('M380 100H260', '#fff', 2.2, 3, 3.5)}${mover('M380 210H260', '#fff', 2.8, 3, 3.5)}${tx(320, 284, 'H⁺ ' + L('passes'), { s: 12 })}
      <circle r="10" fill="${V_HEX.v2}" opacity="0.9"><animateMotion dur="9s" repeatCount="indefinite" path="M400 160H250"/></circle><path d="M395 176H255" stroke="${OR}" stroke-width="1.5" stroke-dasharray="5 5" marker-end="url(#ah)"/>${tx(320, 196, L('crossover'), { s: 12, c: OR })}
      ${tx(160, 284, L('pos'), { s: 12, c: MU })}${tx(480, 284, L('neg'), { s: 12, c: MU })}`, L('crossover'));
  },
  layers(L) {
    const parts = [['#c9ced4', 16, 'endplate'], ['#d8793a', 5, 'collector'], ['#aab0b8', 5, 'frame'], ['#2f3338', 10, 'bipolar'], ['#4a4f57', 12, 'felt'], ['#cdeedd', 4, 'membrane'], ['#4a4f57', 12, 'felt'], ['#2f3338', 10, 'bipolar'], ['#aab0b8', 5, 'frame'], ['#d8793a', 5, 'collector'], ['#c9ced4', 16, 'endplate']];
    const total = parts.reduce((s, p) => s + p[1], 0), gap = 34, spread = total + gap * (parts.length - 1); let xc = 320 - total / 2, xe = 320 - spread / 2, out = '', labels = '';
    parts.forEach(([c, w, key], i) => { out += `<rect y="70" width="${w}" height="150" rx="2" fill="${c}" stroke="rgba(255,255,255,0.25)" x="${REDUCED ? xe : xc}"><animate attributeName="x" values="${xc};${xe};${xe};${xc}" keyTimes="0;0.35;0.75;1" dur="8s" repeatCount="indefinite"/></rect>`; if (i < 6) labels += `<g opacity="${REDUCED ? 1 : 0}"><animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.35;0.75;1" dur="8s" repeatCount="indefinite"/>${tx(xe + w / 2, i % 2 ? 250 : 52, L(key), { s: 11, c: i === 5 ? GR : FG })}</g>`; xc += w; xe += w + gap; });
    return svg(`${out}${labels}${tx(320, 290, L('layersNote'), { s: 12, c: MU })}`, L('layersNote'));
  },
  membrane(L) {
    const pores = [80, 130, 180, 230].map(y => `<path d="M286 ${y}H354" stroke="rgba(13,19,32,0.55)" stroke-width="9" stroke-linecap="round"/>`).join('');
    return svg(`<rect x="280" y="40" width="80" height="220" rx="4" fill="#cdeedd" opacity="0.8"/>${pores}${tx(320, 30, L('membrane'), { s: 12, c: MU })}
      ${[80, 130, 180, 230].map((y, i) => mover(`M420 ${y}H220`, '#fff', 2 + i * 0.4, 2, 3.5)).join('')}${tx(150, 60, 'H⁺ ' + L('passes'), { s: 12 })}
      <circle r="13" fill="${V_HEX.v2}"><animate attributeName="cx" values="480;372;480" dur="3.2s" repeatCount="indefinite"/><animate attributeName="cy" values="105;105;105" dur="3.2s" repeatCount="indefinite"/></circle><circle r="13" fill="${V_HEX.v3}"><animate attributeName="cx" values="520;372;520" dur="4s" repeatCount="indefinite"/><animate attributeName="cy" values="205;205;205" dur="4s" repeatCount="indefinite"/></circle>${tx(490, 60, L('blocked'), { s: 12, c: OR })}
      <path d="M90 250H250" stroke="${CY}" stroke-width="2" marker-start="url(#ah)" marker-end="url(#ah)"/>${tx(90, 276, L('thin'), { a: 'start', s: 11, c: MU })}${tx(250, 276, L('thick'), { a: 'end', s: 11, c: MU })}`, L('membrane'));
  },
  loop(L) {
    const box = (x, y, w, h, label, color = 'rgba(255,255,255,0.06)') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${color}" stroke="rgba(200,215,235,0.5)"/>${tx(x + w / 2, y + h / 2 + 4, label, { s: 12 })}`;
    const lp = 'M70 190V240H190V214M230 214H262M262 150H180V96H70V120', rp = 'M570 190V240H450V214M410 214H378M378 150H460V96H570V120';
    return svg(`${tankShape(30, 120, 80, 70, V_HEX.v4)}${tankShape(530, 120, 80, 70, V_HEX.v3)}${tx(70, 112, L('tank'), { s: 12, c: MU })}${tx(570, 112, L('tank'), { s: 12, c: MU })}
      <path d="${lp}" stroke="${V_HEX.v4}" stroke-width="4" fill="none"/><path d="${rp}" stroke="${V_HEX.v3}" stroke-width="4" fill="none"/>${mover(lp, '#fff', 6, 6, 3)}${mover(rp, '#fff', 6, 6, 3)}
      <circle cx="210" cy="214" r="18" fill="#1b2433" stroke="${V_HEX.v4}" stroke-width="2"/><circle cx="430" cy="214" r="18" fill="#1b2433" stroke="${V_HEX.v3}" stroke-width="2"/>${tx(210, 252, L('pump'), { s: 11, c: MU })}${tx(430, 252, L('pump'), { s: 11, c: MU })}
      ${box(262, 130, 116, 100, L('stack'), 'rgba(38,217,227,0.1)')}${box(270, 40, 100, 44, L('pcs'))}<path d="M320 84V130" stroke="${OR}" stroke-width="3"/><path d="M370 62H480" stroke="${OR}" stroke-width="3" marker-end="url(#ah)"/>${tx(520, 66, L('grid'), { s: 12, c: OR })}${mover('M320 130V84', OR, 1.6, 2, 3)}`, L('stack'));
  },
  area(L) {
    const x0 = 70, y0 = 240;
    return svg(`<path d="M${x0} 40V${y0}H600" stroke="${LINE}" stroke-width="1.5" fill="none"/>${tx(x0 - 8, 44, L('power'), { a: 'start', s: 12, c: MU })}${tx(600, y0 + 20, L('time'), { a: 'end', s: 12, c: MU })}
      <rect x="${x0}" y="140" width="200" height="100" fill="${C[0]}" opacity="0.35" stroke="${C[0]}" stroke-width="2"><animate attributeName="width" values="200;440;440;200;200" keyTimes="0;0.3;0.5;0.8;1" dur="9s" repeatCount="indefinite"/><animate attributeName="height" values="100;100;100;100;100" dur="9s" repeatCount="indefinite"/></rect>
      <rect x="${x0}" y="140" width="200" height="100" fill="none" stroke="${C[1]}" stroke-width="2" stroke-dasharray="6 5"><animate attributeName="y" values="140;140;140;60;140" keyTimes="0;0.5;0.55;0.8;1" dur="9s" repeatCount="indefinite"/><animate attributeName="height" values="100;100;100;180;100" keyTimes="0;0.5;0.55;0.8;1" dur="9s" repeatCount="indefinite"/></rect>
      ${tx(180, 196, L('energyArea'), { s: 13, w: 600 })}<rect x="420" y="30" width="12" height="12" fill="${C[0]}" opacity="0.6"/>${tx(438, 41, L('moreEnergy'), { a: 'start', s: 12 })}<rect x="420" y="52" width="12" height="12" fill="none" stroke="${C[1]}" stroke-width="2"/>${tx(438, 63, L('morePower'), { a: 'start', s: 12 })}`, L('energyArea'));
  },
  losses(L) {
    const steps = [[100, L('start'), MU], [97, L('ce'), C[0]], [84.4, L('ve'), C[1]], [79.4, L('inv'), C[2]], [74.8, L('pumps'), C[3]]]; const x0 = 60, bw = 84, gap = 28, Y = (v) => 240 - (v - 50) / 50 * 190;
    let out = `<path d="M${x0 - 10} 240H610" stroke="${LINE}"/>`;
    steps.forEach(([v, label, c], i) => { const x = x0 + i * (bw + gap), prev = i ? steps[i - 1][0] : v; out += `<rect x="${x}" y="${Y(v)}" width="${bw}" height="${240 - Y(v)}" rx="4" fill="${i ? '#1b2433' : MU}" opacity="${i ? 1 : 0.5}"/>${i ? `<rect x="${x}" y="${Y(prev)}" width="${bw}" height="${Y(v) - Y(prev)}" fill="${c}" opacity="0.9"/><rect x="${x}" y="${Y(v)}" width="${bw}" height="${240 - Y(v)}" rx="4" fill="${C[0]}" opacity="0.25"/>` : ''}${tx(x + bw / 2, Y(v) - 8 - (i ? Y(v) - Y(prev) : 0), `${v.toFixed(0)} %`, { s: 12, m: 1 })}${tx(x + bw / 2, 260, label, { s: 11, c: MU })}`; });
    return svg(`${out}${tx(60, 24, L('lossesTitle'), { a: 'start', s: 13, w: 600 })}${tx(60, 290, L('illustrative'), { a: 'start', s: 11, c: MU })}`, L('lossesTitle'));
  },
  pump(L) {
    const x0 = 70, x1 = 590, y0 = 240, y1 = 50, X = (f) => x0 + f * (x1 - x0), Y = (v) => y0 - v * (y0 - y1);
    const curve = (fn) => Array.from({ length: 41 }, (_, i) => { const f = 0.05 + i * 0.0235; return `${i ? 'L' : 'M'}${X(f).toFixed(1)} ${Y(Math.min(1, fn(f))).toFixed(1)}`; }).join('');
    const pump = (f) => 0.9 * f * f * f + 0.04, starve = (f) => 0.07 / f, sum = (f) => pump(f) + starve(f); let best = 0.1, bv = 9; for (let f = 0.1; f < 1; f += 0.01) if (sum(f) < bv) { bv = sum(f); best = f; }
    return svg(`<path d="M${x0} ${y1 - 10}V${y0}H${x1 + 10}" stroke="${LINE}" stroke-width="1.5" fill="none"/>${tx((x0 + x1) / 2, y0 + 30, L('flowRate'), { s: 12, c: MU })}${tx(x0, y1 - 18, L('lossAxis'), { a: 'start', s: 12, c: MU })}
      <path d="${curve(pump)}" stroke="${C[1]}" stroke-width="2.5" fill="none"/><path d="${curve(starve)}" stroke="${C[2]}" stroke-width="2.5" fill="none"/><path d="${curve(sum)}" stroke="${FG}" stroke-width="2" stroke-dasharray="6 5" fill="none"/>
      <circle cx="${X(best)}" cy="${Y(bv)}" r="6" fill="${GR}"><animate attributeName="r" values="6;9;6" dur="1.8s" repeatCount="indefinite"/></circle>${tx(X(best), Y(bv) - 14, L('optimum'), { s: 12, c: GR })}
      ${tx(x1, Y(pump(0.92)) - 8, L('pumpLoss'), { a: 'end', s: 12, c: C[1] })}${tx(X(0.12), Y(starve(0.11)) - 2, L('starve'), { a: 'start', s: 12, c: C[2] })}`, L('flowRate'));
  },
  capex(L) {
    const shares = [2, 10].map(h => { const c = vrfbCapex({ ...PROJECT_DEFAULTS, h }, { ...VRFB_DEFAULTS }); return ['power', 'storage', 'bos', 'epc'].map(k => c.parts[k] / c.total); });
    const names = [L('stacks'), L('electrolyte'), L('bos'), L('epc')];
    const bar = (x, sh, title) => { let y = 250, out = ''; sh.forEach((s, i) => { const h = s * 190; y -= h; out += `<rect x="${x}" y="${y + 1}" width="110" height="${Math.max(1, h - 2)}" rx="3" fill="${C[i]}"/>${h > 20 ? tx(x + 55, y + h / 2 + 4, `${Math.round(s * 100)} %`, { s: 12, c: '#0a0f1a', w: 600 }) : ''}`; }); return out + tx(x + 55, 272, title, { s: 13, w: 600 }); };
    return svg(`${bar(90, shares[0], L('h2'))}${bar(260, shares[1], L('h10'))}${names.map((n, i) => `<rect x="420" y="${78 + i * 30}" width="14" height="14" rx="3" fill="${C[i]}"/>${tx(442, 90 + i * 30, n, { a: 'start', s: 12 })}`).join('')}${tx(420, 50, L('capexTitle'), { a: 'start', s: 13, w: 600 })}${tx(420, 222, L('illustrative'), { a: 'start', s: 11, c: MU })}`, L('capexTitle'));
  },
  lcos(L) {
    const pile = (x, y, items) => items.map(([label, c], i) => `<rect x="${x}" y="${y + i * 30}" width="230" height="26" rx="5" fill="${c}" opacity="0.85"/>${tx(x + 115, y + 18 + i * 30, label, { s: 12, c: '#0a0f1a', w: 600 })}`).join('');
    return svg(`${tx(190, 28, L('costs'), { s: 13, w: 600 })}${pile(75, 40, [[L('capexWord'), C[0]], [L('om'), C[1]], [L('charging'), C[2]], [L('repl'), C[3]]])}
      <path d="M60 170H320" stroke="${FG}" stroke-width="2.5"/>${tx(190, 196, L('energy'), { s: 13, w: 600 })}<rect x="75" y="206" width="230" height="30" rx="5" fill="rgba(255,255,255,0.08)" stroke="${CY}"/>${Array.from({ length: 8 }, (_, i) => `<rect x="${82 + i * 28}" y="212" width="22" height="18" rx="3" fill="${CY}" opacity="${0.9 - i * 0.07}"><animate attributeName="opacity" values="0.2;${0.9 - i * 0.07};0.2" dur="3s" begin="${i * 0.25}s" repeatCount="indefinite"/></rect>`).join('')}
      ${tx(380, 176, '=', { s: 30, w: 600 })}<rect x="420" y="120" width="180" height="100" rx="12" fill="rgba(255,155,47,0.1)" stroke="${OR}"/>${tx(510, 162, 'LCOS', { s: 24, w: 700, c: OR })}${tx(510, 192, '$/MWh', { s: 14, c: FG, m: 1 })}${tx(190, 262, L('discounted'), { s: 11, c: MU })}`, 'LCOS');
  },
  cross(L) {
    const sw = durationSweep({}, {}, {}, [2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24]), be = breakevenDuration(sw);
    const x0 = 70, x1 = 590, y0 = 240, y1 = 40, ymax = Math.max(...sw.map(s => Math.max(s.vrfb, s.lfp))) * 1.05, ymin = 80, X = (h) => x0 + (h - 2) / 22 * (x1 - x0), Y = (v) => y0 - (v - ymin) / (ymax - ymin) * (y0 - y1);
    const path = (k) => sw.map((s, i) => `${i ? 'L' : 'M'}${X(s.h).toFixed(1)} ${Y(s[k]).toFixed(1)}`).join('');
    const bv = be ? sw.reduce((a, b) => (Math.abs(b.h - be) < Math.abs(a.h - be) ? b : a)).lfp : 0;
    return svg(`<path d="M${x0} ${y1 - 10}V${y0}H${x1 + 10}" stroke="${LINE}" stroke-width="1.5" fill="none"/>${[4, 8, 12, 16, 20, 24].map(h => tx(X(h), y0 + 18, h, { s: 11, c: MU, m: 1 })).join('')}${tx((x0 + x1) / 2, y0 + 38, L('duration'), { s: 12, c: MU })}${tx(x0, y1 - 18, L('lcosAxis'), { a: 'start', s: 12, c: MU })}
      <path d="${path('vrfb')}" stroke="${C[0]}" stroke-width="2.5" fill="none"/><path d="${path('lfp')}" stroke="${C[1]}" stroke-width="2.5" fill="none"/>${tx(x1, Y(sw.at(-1).vrfb) + 18, 'VRFB', { a: 'end', s: 12, c: C[0], w: 600 })}${tx(x1, Y(sw.at(-1).lfp) - 8, 'LFP', { a: 'end', s: 12, c: C[1], w: 600 })}
      ${be ? `<circle cx="${X(be)}" cy="${Y(bv)}" r="6" fill="${FG}"><animate attributeName="r" values="6;10;6" dur="1.8s" repeatCount="indefinite"/></circle>${tx(X(be) + 12, Y(bv) - 14, `${L('breakeven')} ≈ ${be.toFixed(1)} h`, { a: 'start', s: 12 })}` : ''}${tx(x1, y1, L('assumption'), { a: 'end', s: 11, c: MU })}`, L('breakeven'));
  },
  duck(L) {
    const x0 = 50, x1 = 600, y0 = 240, X = (t) => x0 + t / 24 * (x1 - x0), Y = (v) => y0 - v * 170;
    const sun = (t) => (t > 6 && t < 19 ? Math.pow(Math.sin(Math.PI * (t - 6) / 13), 1.3) : 0), load = (t) => 0.32 + 0.1 * Math.exp(-Math.pow((t - 8) / 1.8, 2)) + 0.4 * Math.exp(-Math.pow((t - 19.5) / 2.4, 2));
    const line = (fn) => Array.from({ length: 97 }, (_, i) => `${i ? 'L' : 'M'}${X(i / 4).toFixed(1)} ${Y(fn(i / 4)).toFixed(1)}`).join('');
    const between = (a, b, cond) => { let top = '', bot = ''; for (let i = 0; i <= 96; i++) { const t = i / 4; if (!cond(t)) continue; top += `${top ? 'L' : 'M'}${X(t).toFixed(1)} ${Y(a(t)).toFixed(1)}`; bot = `L${X(t).toFixed(1)} ${Y(b(t)).toFixed(1)}` + bot; } return top + bot + 'Z'; };
    return svg(`<path d="M${x0} ${y0}H${x1}" stroke="${LINE}"/>${[0, 6, 12, 18, 24].map(h => tx(X(h), y0 + 18, `${String(h).padStart(2, '0')}:00`, { s: 11, c: MU, m: 1 })).join('')}
      <path d="${between(sun, load, t => sun(t) > load(t))}" fill="${C[1]}" opacity="0.3"/><path d="${between(load, sun, t => t > 15 && load(t) > sun(t) && t < 23.5)}" fill="${C[2]}" opacity="0.35"/>
      <path d="${line(sun)}" stroke="${C[1]}" stroke-width="2.5" fill="none"/><path d="${line(load)}" stroke="${C[0]}" stroke-width="2.5" fill="none"/>
      <path d="M${X(12.5)} ${Y(0.62)}C${X(15)} ${Y(1.05)},${X(18)} ${Y(1.0)},${X(20)} ${Y(0.5)}" stroke="${FG}" stroke-width="2" fill="none" stroke-dasharray="6 5" marker-end="url(#ah)"><animate attributeName="stroke-dashoffset" from="22" to="0" dur="1.2s" repeatCount="indefinite"/></path>
      ${tx(X(12.5), Y(0.5), L('surplus'), { s: 12, c: FG })}${tx(X(20.3), Y(0.3), L('deficit'), { s: 12, c: FG })}${tx(X(16.2), Y(1.06), L('shift'), { s: 12, w: 600 })}${tx(X(9), Y(0.98), L('solar'), { s: 12, c: C[1], w: 600 })}${tx(X(2.5), Y(0.42), L('demand'), { s: 12, c: C[0], w: 600 })}`, L('shift'));
  },
};

export function diagram(key, L) { const f = D[key]; return f ? still(f(L)) : ''; }
export const DIAGRAM_KEYS = Object.keys(D);
