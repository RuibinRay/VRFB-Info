import * as THREE from 'three';

/** HTML labels projected from 3D anchors every frame. */
export function createLabels(container, camera, onClick) {
  const items = []; const v = new THREE.Vector3();
  function add(spec, opacityFn, cls = '') {
    const el = document.createElement('button');
    el.className = `label ${spec.dir} ${cls}`; el.type = 'button';
    el.innerHTML = `<span class="label__dot"></span><span class="label__line"></span><span class="label__text">${spec.text}<small>${spec.sub || ''}</small></span>`;
    el.addEventListener('click', () => onClick && onClick(spec.id));
    container.appendChild(el);
    items.push({ el, object: spec.object, offset: new THREE.Vector3(...(spec.offset || [0, 0, 0])), opacityFn, id: spec.id, vis: -1 });
  }
  function update() {
    const w = innerWidth, h = innerHeight;
    for (const it of items) {
      const o = it.opacityFn();
      if (o < 0.02) { if (it.vis !== 0) { it.el.style.opacity = '0'; it.el.style.pointerEvents = 'none'; it.vis = 0; } continue; }
      it.object.getWorldPosition(v).add(it.offset).project(camera);
      if (v.z > 1 || v.x < -1.3 || v.x > 1.3 || v.y < -1.3 || v.y > 1.3) { it.el.style.opacity = '0'; it.vis = 0; continue; }
      it.el.style.transform = `translate3d(${((v.x + 1) / 2 * w).toFixed(1)}px, ${((1 - v.y) / 2 * h).toFixed(1)}px, 0)`;
      it.el.style.opacity = o.toFixed(2); it.el.style.pointerEvents = o > 0.5 ? 'auto' : 'none'; it.vis = 1;
    }
  }
  function highlight(id) { items.forEach(it => it.el.classList.toggle('is-hot', it.id === id)); }
  return { add, update, highlight };
}
