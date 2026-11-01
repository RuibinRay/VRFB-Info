import * as THREE from 'three';

/** Click / hover picking of stack and system components. */
export function createPicker({ canvas, camera, getList, onPick, onHover }) {
  const ray = new THREE.Raycaster(); const ndc = new THREE.Vector2();
  let down = null, hovered = null;
  const resolve = (hits) => { for (const h of hits) { let o = h.object; while (o && !o.userData.component) o = o.parent; if (o) return o; } return null; };
  function cast(e) { ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(ndc, camera); return resolve(ray.intersectObjects(getList(), true)); }
  canvas.addEventListener('pointerdown', e => { down = [e.clientX, e.clientY]; });
  canvas.addEventListener('pointerup', e => { if (!down) return; const d = Math.hypot(e.clientX - down[0], e.clientY - down[1]); down = null; if (d > 8) return; const o = cast(e); if (o) onPick(o.userData.component, o); });
  let last = 0;
  canvas.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return; const now = performance.now(); if (now - last < 50) return; last = now;
    const o = cast(e); const id = o ? o.userData.component : null;
    if (id !== hovered) { hovered = id; canvas.style.cursor = id ? 'pointer' : ''; onHover && onHover(id, o); }
  }, { passive: true });
}
