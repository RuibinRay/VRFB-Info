/** Single source of truth driven by the scroll timeline; models read it every frame. */
export const state = {
  cam: { px: 4.6, py: 8.5, pz: 30, tx: -3.4, ty: 0.3, tz: -1.5, fov: 40 }, // opening wide shot of the installation
  sway: 1,        // slow camera drift amount
  explode: 0,     // stack 0 = compact, 1 = exploded
  periphery: 1,   // tanks/pumps/pipes opacity
  casing: 1,      // clear enclosure around the stack
  labels: 0,      // stack component label opacity
  plantLabels: 0, // balance-of-plant label opacity
  view: 0,        // 0 = macro scene, 1 = microscopic scene
  iris: 0,        // dark iris overlay
  reaction: 0,    // micro scene: 0 = ions charged … 1 = ions discharged
  microDir: 1,    // micro scene: +1 discharge direction, −1 charge direction
  flowCell: 0,    // serpentine flow particles
  reveal: 0,      // slides layers off the centre flow field so the camera can see it
  flowSystem: 0,  // pipe flow + pump rotation
  soc: 0.04,      // tank state of charge: starts discharged (blue VO²⁺ / green V³⁺), charges to yellow / violet
  grid: 1,        // solar farm, neighbouring modules, substation and towers
  flowSolar: 0,   // solar → battery energy stream
  flowGrid: 0,    // battery → grid energy stream
  canvas: 1,      // canvas opacity at the end of the journey
};

export const env = {
  mobile: matchMedia('(max-width: 768px)').matches || (navigator.maxTouchPoints > 0 && matchMedia('(pointer: coarse)').matches),
  reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
};
