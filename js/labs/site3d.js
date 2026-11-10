/**
 * Schematic 3D view of a solar-plus-storage site for the project builder.
 * Not to scale: element counts grow with the logarithm of the real sizes so a
 * household and a utility plant both fit in view. Falls back to a 2D drawing
 * when WebGL is unavailable.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { V_HEX } from '../sim/constants.js';

export function createSite3D(el, labels = {}) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }); } catch { renderer = null; }
  if (!renderer) return { ok: false, canvas: null, update(cfg) { el.innerHTML = fallback(cfg, labels); } };
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.outputColorSpace = THREE.SRGBColorSpace;
  el.appendChild(renderer.domElement);
  const scene = new THREE.Scene(); scene.fog = new THREE.FogExp2(0x070a10, 0.012);
  const camera = new THREE.PerspectiveCamera(38, 16 / 9, 0.1, 200); camera.position.set(8.5, 6, 11.5);
  scene.add(new THREE.HemisphereLight(0xa8c4ff, 0x141a26, 1.7));
  const sun = new THREE.DirectionalLight(0xfff1e0, 2.2); sun.position.set(6, 10, 4); scene.add(sun);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), new THREE.MeshStandardMaterial({ color: 0x141c2b, roughness: 0.95 })); ground.rotation.x = -Math.PI / 2; scene.add(ground);
  const grid = new THREE.GridHelper(120, 120, 0x1c2940, 0x121a2a); grid.position.y = 0.002; scene.add(grid);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.autoRotate = !matchMedia('(prefers-reduced-motion: reduce)').matches; controls.autoRotateSpeed = 0.6; controls.maxPolarAngle = Math.PI / 2 - 0.05; controls.minDistance = 6; controls.maxDistance = 50; controls.target.set(0, 0.8, 0);
  let world = new THREE.Group(); scene.add(world);
  const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.2, ...o });
  const add = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); world.add(m); return m; };
  const log = (v) => Math.log10(1 + Math.max(0, v));

  function update(cfg) {
    world.traverse(o => { o.geometry?.dispose?.(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m.dispose()); });
    scene.remove(world); world = new THREE.Group(); scene.add(world);
    // solar array (west)
    const n = Math.round(Math.min(72, Math.max(4, 3 + 9 * log(cfg.solarKW)))), cols = Math.ceil(Math.sqrt(n * 1.6)), rows = Math.ceil(n / cols);
    const pm = std(0x1d4a9a, { metalness: 0.4, roughness: 0.3, emissive: 0x12336e, emissiveIntensity: 0.9 });
    for (let i = 0; i < n; i++) { const c = i % cols, r = Math.floor(i / cols); const p = add(new THREE.BoxGeometry(1.2, 0.05, 0.75), pm, -5.5 - c * 1.35, 0.5, (r - (rows - 1) / 2) * 1.25); p.rotation.x = -0.45; add(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 6), std(0x6f7a8c), p.position.x, 0.25, p.position.z); }
    // battery (centre)
    if (cfg.tech === 'vrfb') {
      const pairs = Math.min(5, Math.max(1, Math.round(0.7 + 0.9 * log(cfg.m3PerSide)))), r = Math.min(1.0, 0.42 + 0.2 * log(cfg.m3PerSide / pairs)), h = r * 2.1;
      for (let i = 0; i < pairs; i++) { const z = (i - (pairs - 1) / 2) * (2 * r + 0.35);
        [[-1.9 - r, V_HEX.v4], [1.9 + r, V_HEX.v3]].forEach(([x, hex]) => { add(new THREE.CylinderGeometry(r, r, h, 28), std(new THREE.Color(hex), { transparent: true, opacity: 0.88, emissive: new THREE.Color(hex), emissiveIntensity: 0.25 }), x, h / 2, z); const d = add(new THREE.SphereGeometry(r, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2), std(0xc9ced4, { metalness: 0.8, roughness: 0.4 }), x, h, z); d.scale.y = 0.35; }); }
      const stacks = Math.min(6, Math.max(1, Math.round(0.6 + 1.5 * log(cfg.nStacks / 4))));
      for (let i = 0; i < stacks; i++) { const z = (i - (stacks - 1) / 2) * 1.15; add(new THREE.BoxGeometry(2.3, 1.0, 0.9), std(0xb9c0c9), 0, 0.5, z); add(new THREE.BoxGeometry(2.32, 0.08, 0.92), std(0x26d9e3, { emissive: 0x26d9e3, emissiveIntensity: 0.7 }), 0, 0.86, z); }
    } else {
      const boxes = Math.min(10, Math.max(1, Math.round(0.4 + 1.6 * log(cfg.energyKWh / 20)))), cols2 = Math.min(2, boxes), rows2 = Math.ceil(boxes / cols2);
      for (let i = 0; i < boxes; i++) { const c = i % cols2, r = Math.floor(i / cols2); const x = (c - (cols2 - 1) / 2) * 2.9, z = (r - (rows2 - 1) / 2) * 1.35; add(new THREE.BoxGeometry(2.6, 1.15, 1.05), std(0xdfe4ea), x, 0.58, z); add(new THREE.BoxGeometry(2.62, 0.1, 1.07), std(0xff9b2f, { emissive: 0xff9b2f, emissiveIntensity: 0.6 }), x, 0.95, z); }
    }
    add(new THREE.BoxGeometry(0.9, 1.3, 0.6), std(0x8e949c), 0, 0.65, -3.4); // power conversion
    // consumer (east)
    const ex = 6.5;
    if (cfg.app === 'household') { add(new THREE.BoxGeometry(2.2, 1.4, 2.0), std(0xe6dccb), ex, 0.7, 0); const roof = add(new THREE.ConeGeometry(1.9, 1.0, 4), std(0x8a3b2f), ex, 1.9, 0); roof.rotation.y = Math.PI / 4; }
    else if (cfg.app === 'commercial') { add(new THREE.BoxGeometry(2.6, 3.2, 2.2), std(0x9fb3c8, { metalness: 0.5, roughness: 0.3 }), ex, 1.6, 0); for (let f = 0; f < 4; f++) add(new THREE.BoxGeometry(2.62, 0.06, 2.22), std(0x26d9e3, { emissive: 0x26d9e3, emissiveIntensity: 0.35 }), ex, 0.6 + f * 0.75, 0); }
    else if (cfg.app === 'industrial') { add(new THREE.BoxGeometry(4.2, 1.6, 3.0), std(0xa7adb5), ex + 0.6, 0.8, 0); [-1, 0, 1].forEach(k => { const s = add(new THREE.CylinderGeometry(0.01, 0.75, 0.7, 4), std(0x7f8690), ex + 0.6 + k * 1.3, 1.95, 0); s.rotation.y = Math.PI / 4; s.scale.z = 2.7; }); add(new THREE.CylinderGeometry(0.18, 0.24, 3.2, 12), std(0x6f7680), ex + 2.9, 1.6, 1.6); }
    else { add(new THREE.BoxGeometry(1.2, 1.0, 0.9), std(0x7f8690), ex - 1, 0.5, 0); const pts = []; const H = 5, b = 0.7, tp = 0.2; [[1, 1], [-1, 1], [1, -1], [-1, -1]].forEach(([a, c]) => pts.push(a * b, 0, c * b, a * tp, H, c * tp)); for (let i = 1; i <= 5; i++) { const y = i * H / 5, w = b + (tp - b) * i / 5; [[1, 1, -1, 1], [1, -1, -1, -1], [1, 1, 1, -1], [-1, 1, -1, -1]].forEach(([a, c, d, e]) => pts.push(a * w, y, c * w, d * w, y, e * w)); } pts.push(0, 3.6, -1.5, 0, 3.6, 1.5, 0, 4.3, -1.1, 0, 4.3, 1.1);
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); const l = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: 0xb8c2d2 })); l.position.set(ex + 2, 0, 0); world.add(l); }
    // cables: solar → converter → consumer
    const line = (pts, hex) => { const g = new THREE.BufferGeometry().setFromPoints(pts.map(p => new THREE.Vector3(...p))); world.add(new THREE.Line(g, new THREE.LineBasicMaterial({ color: hex }))); };
    line([[-5, 0.05, 0], [-2.6, 0.05, -3.4], [0, 0.05, -3.4]], 0x26d9e3); line([[0, 0.05, -3.4], [3.5, 0.05, -3.4], [ex - 1.2, 0.05, 0]], 0xff9b2f);
  }
  function fit() { const w = el.clientWidth, h = el.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
  new ResizeObserver(fit).observe(el); fit();
  let visible = true; new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(el);
  renderer.setAnimationLoop(() => { if (!visible) return; controls.update(); renderer.render(scene, camera); });
  return { ok: true, canvas: renderer.domElement, update };
}

function fallback(cfg, L) {
  const battery = cfg.tech === 'vrfb'
    ? `<rect x="250" y="70" width="46" height="80" rx="8" fill="${V_HEX.v4}"/><rect x="310" y="96" width="70" height="54" rx="6" fill="#b9c0c9"/><rect x="394" y="70" width="46" height="80" rx="8" fill="${V_HEX.v3}"/>`
    : '<rect x="270" y="92" width="70" height="58" rx="6" fill="#dfe4ea"/><rect x="350" y="92" width="70" height="58" rx="6" fill="#dfe4ea"/>';
  return `<svg viewBox="0 0 640 200" role="img" style="width:100%;height:100%"><rect x="40" y="96" width="120" height="54" rx="6" fill="#10244f" stroke="#8fb6ff"/><text x="100" y="175" text-anchor="middle" fill="#b7c2d3" font-size="13">${L.solar || 'Solar'}</text>${battery}<text x="345" y="175" text-anchor="middle" fill="#b7c2d3" font-size="13">${L.battery || 'Battery'}</text><rect x="500" y="70" width="90" height="80" rx="6" fill="#9fb3c8"/><text x="545" y="175" text-anchor="middle" fill="#b7c2d3" font-size="13">${L.load || 'Load'}</text><path d="M160 123H250M440 123H500" stroke="#26d9e3" stroke-width="3" stroke-dasharray="6 6"/></svg>`;
}
