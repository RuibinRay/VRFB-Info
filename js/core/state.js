/** Single source of truth driven by the scroll timeline; models read it every frame. */
export const state = {
  cam: { px: 2.0, py: 1.7, pz: 8.2, tx: -1.6, ty: 0.05, tz: 0, fov: 38 },
  sway: 1,        // hero camera drift amount
  explode: 0,     // stack 0 = compact, 1 = exploded
  periphery: 1,   // tanks/pumps/pipes opacity
  labels: 0,      // component label opacity
  view: 0,        // 0 = macro scene, 1 = microscopic scene
  iris: 0,        // dark iris overlay
  reaction: 0,    // discharge progress in the micro scene
  flowCell: 0,    // serpentine flow particles
  reveal: 0,      // slides layers off the centre flow field so the camera can see it
  flowSystem: 0,  // pipe flow + pump rotation
  soc: 0.5,       // tank state of charge
  grid: 0,        // solar + grid reveal
  canvas: 1,      // canvas opacity at the end of the journey
};

export const env = {
  mobile: matchMedia('(max-width: 768px)').matches || (navigator.maxTouchPoints > 0 && matchMedia('(pointer: coarse)').matches),
  reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
};
