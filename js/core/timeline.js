/**
 * One GSAP timeline scrubbed by the scroll position of #scroll-track.
 * Every tween writes into `state`; nothing is time-based here, so the whole
 * journey plays identically forwards and backwards.
 */
export function buildTimeline(state, anchors) {
  const gsap = window.gsap; gsap.registerPlugin(window.ScrollTrigger);
  const chapters = [...document.querySelectorAll('.chapter')].map(el => ({ el, name: el.dataset.chapter, vh: parseFloat(getComputedStyle(el).getPropertyValue('--vh')) || 100 }));
  const at = {}, len = {}; let t = 0;
  chapters.forEach(c => { at[c.name] = t; len[c.name] = c.vh; t += c.vh; });

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: '#scroll-track', start: 'top top', end: 'bottom bottom', scrub: 1.1, invalidateOnRefresh: true },
  });
  const cam = state.cam;
  const memX = anchors.membraneX, faceX = anchors.bipolarFaceX;

  // hero: slow drift while the title is read
  tl.to(cam, { px: 2.8, py: 1.3, pz: 7.2, tx: -0.6, ty: 0.1, duration: len.hero }, at.hero);
  tl.to(state, { sway: 0, duration: len.hero * 0.6 }, at.hero + len.hero * 0.4);

  // approach: dolly in to the stack
  tl.to(cam, { px: 1.7, py: 0.7, pz: 2.7, tx: 0, ty: 0.1, tz: 0, fov: 36, duration: len.approach, ease: 'power1.inOut' }, at.approach);

  // explode: periphery fades, layers separate, labels in
  tl.to(state, { periphery: 0, duration: len.explode * 0.25 }, at.explode);
  tl.to(cam, { px: 0.5, py: 1.1, pz: 6.6, tx: 0, ty: 0.05, tz: 0, fov: 42, duration: len.explode, ease: 'power1.inOut' }, at.explode);
  tl.to(state, { explode: 1, duration: len.explode * 0.7, ease: 'power2.inOut' }, at.explode + len.explode * 0.05);
  tl.to(state, { labels: 1, duration: len.explode * 0.25 }, at.explode + len.explode * 0.55);

  // dive: labels out, fly to the membrane, iris closes, switch to micro
  tl.to(state, { labels: 0, duration: len.dive * 0.25 }, at.dive);
  tl.to(cam, { px: memX + 0.55, py: 0.12, pz: 0.9, tx: memX, ty: 0, tz: 0, fov: 52, duration: len.dive, ease: 'power2.in' }, at.dive);
  tl.to(state, { iris: 1, duration: len.dive * 0.3, ease: 'power1.in' }, at.dive + len.dive * 0.65);
  tl.set(state, { view: 1 }, at.dive + len.dive * 0.97);
  tl.set(cam, { px: -0.4, py: 0.5, pz: 5.8, tx: 0, ty: 0, tz: 0, fov: 46 }, at.dive + len.dive * 0.97);

  // micro: iris opens, discharge reaction runs, slow pan, iris closes
  tl.to(state, { iris: 0, duration: len.micro * 0.12, ease: 'power1.out' }, at.micro);
  tl.to(cam, { px: 1.2, py: 0.3, pz: 4.6, tx: 0.2, ty: 0, tz: 0, duration: len.micro * 0.88 }, at.micro);
  tl.to(state, { reaction: 1, duration: len.micro * 0.7 }, at.micro + len.micro * 0.14);
  tl.to(state, { iris: 1, duration: len.micro * 0.1, ease: 'power1.in' }, at.micro + len.micro * 0.88);
  tl.set(state, { view: 0 }, at.micro + len.micro * 0.985);
  tl.set(cam, { px: faceX + 1.6, py: 0.3, pz: 0.9, tx: faceX, ty: 0, tz: 0, fov: 44 }, at.micro + len.micro * 0.985);
  tl.set(state, { reveal: 1 }, at.micro + len.micro * 0.985);

  // flowcell: iris opens on the serpentine plate, particles flow, camera closes in
  tl.to(state, { iris: 0, duration: len.flowcell * 0.14, ease: 'power1.out' }, at.flowcell);
  tl.to(state, { flowCell: 1, duration: len.flowcell * 0.3 }, at.flowcell + len.flowcell * 0.05);
  tl.to(cam, { px: faceX + 1.25, py: 0.1, pz: 0.35, tx: faceX, ty: -0.05, tz: 0, fov: 46, duration: len.flowcell * 0.9, ease: 'power1.inOut' }, at.flowcell + len.flowcell * 0.1);

  // rebuild: flow stops, layers close, periphery returns, camera pulls back
  tl.to(state, { flowCell: 0, duration: len.rebuild * 0.2 }, at.rebuild);
  tl.to(state, { reveal: 0, duration: len.rebuild * 0.35, ease: 'power2.inOut' }, at.rebuild + len.rebuild * 0.05);
  tl.to(cam, { px: 2.4, py: 1.1, pz: 3.8, tx: 0, ty: 0.1, tz: 0, fov: 38, duration: len.rebuild, ease: 'power1.inOut' }, at.rebuild);
  tl.to(state, { explode: 0, duration: len.rebuild * 0.7, ease: 'power2.inOut' }, at.rebuild + len.rebuild * 0.1);
  tl.to(state, { periphery: 1, duration: len.rebuild * 0.3 }, at.rebuild + len.rebuild * 0.65);

  // system: pumps run, tanks charge
  tl.to(cam, { px: 0.8, py: 1.5, pz: 8.4, tx: 0, ty: 0.2, tz: 0, fov: 38, duration: len.system, ease: 'power1.inOut' }, at.system);
  tl.to(state, { flowSystem: 1, duration: len.system * 0.25 }, at.system);
  tl.to(state, { soc: 0.97, duration: len.system * 0.75 }, at.system + len.system * 0.2);

  // grid: pull out, solar farm and towers rise
  tl.to(cam, { px: 2.0, py: 7.5, pz: 24, tx: 1.0, ty: 0.3, tz: -1.5, fov: 42, duration: len.grid, ease: 'power1.inOut' }, at.grid);
  tl.to(state, { grid: 1, duration: len.grid * 0.6, ease: 'power2.out' }, at.grid + len.grid * 0.12);

  // outro: hand over to the HTML pillars
  tl.to(state, { canvas: 0, duration: len.outro * 0.9 }, at.outro + len.outro * 0.1);
  tl.to(state, { flowSystem: 0, duration: len.outro * 0.5 }, at.outro);

  return { tl, chapters, at, len };
}
