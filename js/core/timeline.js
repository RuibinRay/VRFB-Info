import { REVEAL } from '../models/stack.js';

/**
 * One GSAP timeline scrubbed by the scroll position of #scroll-track.
 * Every tween writes into `state`; nothing is time-based here, so the whole
 * journey plays identically forwards and backwards.
 *
 * Sequence: wide shot of the installation → fly in → tanks, pumps and pipes
 * (charging) → follow the electrolyte into the stack → explode → flow field →
 * into a felt pore → discharge → charge → pull back and rebuild → solar farm
 * and grid (discharging) → hand over to the page.
 */
export function buildTimeline(state, anchors, env = {}) {
  const gsap = window.gsap; gsap.registerPlugin(window.ScrollTrigger);
  const chapters = [...document.querySelectorAll('.chapter')].map(el => ({ el, name: el.dataset.chapter, vh: parseFloat(getComputedStyle(el).getPropertyValue('--vh')) || 100 }));
  const at = {}, len = {}; let t = 0;
  chapters.forEach(c => { at[c.name] = t; len[c.name] = c.vh; t += c.vh; });

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: '#scroll-track', start: 'top top', end: 'bottom bottom', scrub: env.reducedMotion ? true : 1.1, invalidateOnRefresh: true },
  });
  const cam = state.cam;
  const memX = anchors.membraneX, faceX = anchors.bipolarFaceX, feltX = anchors.feltX + REVEAL;
  const A = (name, f) => at[name] + len[name] * f, D = (name, f) => len[name] * f;
  const io = 'power1.inOut';

  // 0 · hero: slow drift over the installation while the title is read
  tl.to(cam, { px: 3.4, py: 6.6, pz: 25, tx: -2.9, ty: 0.3, tz: -1.0, duration: len.hero }, at.hero);
  tl.to(state, { sway: 0.35, duration: D('hero', 0.6) }, A('hero', 0.4));

  // 1 · approach: fly down to the battery skid
  tl.to(cam, { px: 2.7, py: 1.9, pz: 9.4, tx: 0, ty: 0.15, tz: 0, fov: 38, duration: len.approach, ease: io }, at.approach);
  tl.to(state, { sway: 0, duration: D('approach', 0.5) }, at.approach);

  // 2 · plant: pumps start, solar charges the tanks, camera visits both loops
  tl.to(state, { flowSystem: 1, flowSolar: 1, duration: D('plant', 0.15) }, at.plant);
  tl.to(state, { soc: 0.97, duration: D('plant', 0.8) }, A('plant', 0.14));
  tl.to(state, { plantLabels: 1, duration: D('plant', 0.12) }, A('plant', 0.08));
  tl.to(state, { plantLabels: 0, duration: D('plant', 0.1) }, A('plant', 0.9));
  tl.to(cam, { px: -5.3, py: 1.1, pz: 5.6, tx: -2.3, ty: 0.15, tz: 0, fov: 40, duration: D('plant', 0.45), ease: io }, at.plant);
  tl.to(cam, { px: 5.4, py: 0.9, pz: 5.4, tx: 2.4, ty: 0.05, tz: 0, duration: D('plant', 0.55), ease: io }, A('plant', 0.45));

  // 3 · pipe: ride the negative loop from the pump to the stack port
  tl.to(cam, { px: 3.3, py: -0.2, pz: 2.3, tx: 2.15, ty: -0.5, tz: 0, fov: 40, duration: D('pipe', 0.5), ease: io }, at.pipe);
  tl.to(cam, { px: 1.72, py: -0.14, pz: 0.78, tx: 0.92, ty: -0.3, tz: 0, fov: 44, duration: D('pipe', 0.5), ease: io }, A('pipe', 0.5));
  tl.to(state, { flowSolar: 0, duration: D('pipe', 0.4) }, A('pipe', 0.5));

  // 4 · explode: enclosure and plant fade, layers separate, labels in
  tl.to(state, { casing: 0, duration: D('explode', 0.14) }, at.explode);
  tl.to(state, { periphery: 0, grid: 0, duration: D('explode', 0.25) }, at.explode);
  tl.to(cam, { px: 0.5, py: 1.1, pz: 6.6, tx: 0, ty: 0.05, tz: 0, fov: 42, duration: len.explode, ease: io }, at.explode);
  tl.to(state, { explode: 1, duration: D('explode', 0.7), ease: 'power2.inOut' }, A('explode', 0.05));
  tl.to(state, { labels: 1, duration: D('explode', 0.25) }, A('explode', 0.55));

  // 5 · flowcell: the stack opens like a book on the centre flow field
  tl.to(state, { labels: 0, duration: D('flowcell', 0.18) }, at.flowcell);
  tl.to(state, { reveal: 1, duration: D('flowcell', 0.38), ease: 'power2.inOut' }, A('flowcell', 0.04));
  tl.to(cam, { px: faceX + 1.6, py: 0.3, pz: 0.9, tx: faceX, ty: 0, tz: 0, fov: 44, duration: D('flowcell', 0.5), ease: io }, at.flowcell);
  tl.to(cam, { px: faceX + 1.25, py: 0.1, pz: 0.35, tx: faceX, ty: -0.05, tz: 0, fov: 46, duration: D('flowcell', 0.5), ease: io }, A('flowcell', 0.5));
  tl.to(state, { flowCell: 1, duration: D('flowcell', 0.25) }, A('flowcell', 0.3));

  // 6 · dive: pan from the channels to the felt they feed, then into a pore
  tl.to(state, { flowCell: 0, duration: D('dive', 0.35) }, at.dive);
  tl.to(cam, { px: faceX + 0.95, py: 0.25, pz: 1.9, tx: faceX + 0.95, ty: 0, tz: 0, fov: 46, duration: D('dive', 0.5), ease: io }, at.dive);
  tl.to(cam, { px: feltX - 0.42, py: 0.04, pz: 0.2, tx: feltX, ty: 0, tz: 0, fov: 52, duration: D('dive', 0.5), ease: 'power2.in' }, A('dive', 0.5));
  tl.to(state, { iris: 1, duration: D('dive', 0.3), ease: 'power1.in' }, A('dive', 0.67));
  tl.set(state, { view: 1 }, A('dive', 0.975));
  tl.set(cam, { px: -2.9, py: 0.9, pz: 6.6, tx: -1.9, ty: 0.35, tz: 0, fov: 46 }, A('dive', 0.975));

  // 7 · micro: discharge. The camera follows the electrons from the negative felt across the circuit
  tl.to(state, { iris: 0, duration: D('micro', 0.12), ease: 'power1.out' }, at.micro);
  tl.to(cam, { px: -0.2, py: 0.8, pz: 6.0, tx: -1.1, ty: 0.35, tz: 0, duration: D('micro', 0.9) }, A('micro', 0.1));
  tl.to(state, { reaction: 1, duration: D('micro', 0.7) }, A('micro', 0.14));

  // 8 · charge: the current reverses and every ion is driven back
  tl.to(state, { microDir: -1, duration: D('charge', 0.14) }, at.charge);
  tl.to(state, { reaction: 0, duration: D('charge', 0.68) }, A('charge', 0.14));
  tl.to(cam, { px: -2.6, py: 0.85, pz: 6.3, tx: -1.8, ty: 0.35, tz: 0, duration: D('charge', 0.86) }, at.charge);
  tl.to(state, { iris: 1, duration: D('charge', 0.1), ease: 'power1.in' }, A('charge', 0.88));
  tl.set(state, { view: 0, reveal: 0 }, A('charge', 0.985));
  tl.set(cam, { px: memX + 0.55, py: 0.12, pz: 1.0, tx: memX, ty: 0, tz: 0, fov: 48 }, A('charge', 0.985));

  // 9 · rebuild: pull back through the stack as it closes, plant and site return
  tl.to(state, { iris: 0, duration: D('rebuild', 0.14), ease: 'power1.out' }, at.rebuild);
  tl.to(cam, { px: 2.6, py: 1.3, pz: 4.6, tx: 0, ty: 0.1, tz: 0, fov: 38, duration: D('rebuild', 0.7), ease: io }, at.rebuild);
  tl.to(cam, { px: 3.4, py: 2.2, pz: 8.8, duration: D('rebuild', 0.3), ease: io }, A('rebuild', 0.7));
  tl.to(state, { explode: 0, duration: D('rebuild', 0.62), ease: 'power2.inOut' }, A('rebuild', 0.1));
  tl.to(state, { periphery: 1, duration: D('rebuild', 0.28) }, A('rebuild', 0.58));
  tl.to(state, { casing: 1, duration: D('rebuild', 0.18) }, A('rebuild', 0.76));
  tl.to(state, { grid: 1, duration: D('rebuild', 0.3) }, A('rebuild', 0.68));

  // 10 · grid: rise over the site; the battery discharges into the evening peak
  tl.to(cam, { px: 5.5, py: 6.8, pz: 21, tx: 3.6, ty: 0.3, tz: -1.5, fov: 42, duration: len.grid, ease: io }, at.grid);
  tl.to(state, { flowGrid: 1, duration: D('grid', 0.22) }, A('grid', 0.1));
  tl.to(state, { soc: 0.3, duration: D('grid', 0.75) }, A('grid', 0.2));

  // outro: hand over to the HTML sections
  tl.to(state, { canvas: 0, duration: D('outro', 0.9) }, A('outro', 0.1));
  tl.to(state, { flowSystem: 0, flowGrid: 0, duration: D('outro', 0.5) }, at.outro);

  return { tl, chapters, at, len };
}
