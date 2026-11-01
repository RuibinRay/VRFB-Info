import * as THREE from 'three';

/** Camera rig: reads state.cam, adds hero sway + mouse parallax, widens for portrait screens. */
export function createRig(camera, env) {
  const pos = new THREE.Vector3(), target = new THREE.Vector3();
  const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
  if (!env.mobile) window.addEventListener('pointermove', e => { mouse.x = (e.clientX / innerWidth) * 2 - 1; mouse.y = (e.clientY / innerHeight) * 2 - 1; }, { passive: true });
  let time = 0;
  function update(state, dt) {
    time += dt;
    const c = state.cam;
    target.set(c.tx, c.ty, c.tz); pos.set(c.px, c.py, c.pz);
    // portrait: pull back along the view ray so the subject still fits
    const a = camera.aspect; const k = a < 1.3 ? Math.min(2.4, Math.pow(1.3 / a, 0.85)) : 1;
    pos.sub(target).multiplyScalar(k).add(target);
    if (a < 1) target.y -= 0.16 * pos.distanceTo(target) * (1 - a); // portrait: lift the subject above the caption
    if (!env.reducedMotion) { pos.x += Math.sin(time * 0.22) * 0.5 * state.sway; pos.y += Math.cos(time * 0.17) * 0.18 * state.sway; }
    mouse.sx += (mouse.x - mouse.sx) * Math.min(1, dt * 4); mouse.sy += (mouse.y - mouse.sy) * Math.min(1, dt * 4);
    const dist = pos.distanceTo(target);
    pos.x += mouse.sx * 0.04 * dist; pos.y -= mouse.sy * 0.03 * dist;
    camera.position.copy(pos); camera.lookAt(target);
    if (camera.fov !== c.fov) { camera.fov = c.fov; camera.updateProjectionMatrix(); }
  }
  return { update };
}
