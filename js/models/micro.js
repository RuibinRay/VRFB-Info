import * as THREE from 'three';
import { V_COLORS } from './materials.js';

function mulberry(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

/**
 * Microscopic cross-section of one cell: carbon-fibre felts either side of the
 * membrane, vanadium ions that change oxidation state as `state.reaction`
 * advances (discharge), protons crossing the membrane and electrons leaving
 * through the fibres. Colour-flips are threshold-based so scrubbing backwards
 * re-charges the ions.
 */
export function buildMicro(M, opts = {}) {
  const group = new THREE.Group(); group.name = 'micro'; group.visible = false;
  const rand = mulberry(42);
  const mobile = !!opts.mobile;

  // membrane and bipolar walls
  const mem = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.7, 1.3), M.membrane()); mem.material.opacity = 0.9; group.add(mem);
  [-2.45, 2.45].forEach(x => { const w = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.9, 1.4), M.graphite()); w.position.x = x; group.add(w); });

  // fibres (instanced)
  const nF = mobile ? 90 : 160;
  const fib = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.035, 0.035, 1, 8), M.carbon(), nF);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < nF; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    dummy.position.set(side * (0.35 + rand() * 1.9), (rand() - 0.5) * 2.5, (rand() - 0.5) * 1.1);
    dummy.rotation.set(rand() * Math.PI, rand() * Math.PI, rand() * Math.PI);
    dummy.scale.set(1, 0.8 + rand() * 1.4, 1);
    dummy.updateMatrix(); fib.setMatrixAt(i, dummy.matrix);
  }
  group.add(fib);

  // ions
  const ionGeo = new THREE.SphereGeometry(0.075, 18, 14);
  const ions = [];
  const nI = mobile ? 26 : 40;
  for (let s = 0; s < 2; s++) for (let i = 0; i < nI; i++) {
    const side = s === 0 ? -1 : 1;
    const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.3, roughness: 0.35, metalness: 0.1 });
    const m = new THREE.Mesh(ionGeo, mat);
    const p0 = new THREE.Vector3(side * (0.35 + rand() * 1.9), (rand() - 0.5) * 2.4, (rand() - 0.5) * 1.0);
    m.position.copy(p0);
    ions.push({ mesh: m, p0, side, th: 0.04 + rand() * 0.92, ph: rand() * 6.28 });
    group.add(m);
  }
  // protons
  const protons = [];
  const pGeo = new THREE.SphereGeometry(0.03, 10, 8);
  const pMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1.2 });
  for (let i = 0; i < (mobile ? 10 : 16); i++) { const m = new THREE.Mesh(pGeo, pMat); protons.push({ mesh: m, off: rand(), y: (rand() - 0.5) * 2.2, z: (rand() - 0.5) * 0.9, sp: 0.8 + rand() * 0.6 }); group.add(m); }
  // electrons
  const electrons = [];
  const eGeo = new THREE.SphereGeometry(0.022, 8, 6);
  const eMat = new THREE.MeshStandardMaterial({ color: 0x26d9e3, emissive: 0x26d9e3, emissiveIntensity: 2 });
  for (let i = 0; i < (mobile ? 12 : 22); i++) { const m = new THREE.Mesh(eGeo, eMat); electrons.push({ mesh: m, off: rand(), side: i % 2 ? 1 : -1, y: (rand() - 0.5) * 2.4, z: (rand() - 0.5) * 1.0, sp: 0.5 + rand() * 0.5 }); group.add(m); }

  // soft volumetric backdrop
  const back = new THREE.Mesh(new THREE.PlaneGeometry(9, 5), new THREE.MeshBasicMaterial({ color: 0x0a1222, transparent: true, opacity: 0.85 })); back.position.z = -1.2; group.add(back);

  // label anchors
  const anchor = (x, y, z) => { const o = new THREE.Object3D(); o.position.set(x, y, z); group.add(o); return o; };
  const labelSpecs = [
    { object: anchor(-1.4, 1.35, 0), text: 'Negative electrode', sub: 'carbon felt · V²⁺ → V³⁺ + e⁻', dir: 'up', id: 'felt_neg', offset: [0, 0, 0] },
    { object: anchor(0, -1.4, 0.3), text: 'Membrane', sub: 'H⁺ passes · vanadium blocked', dir: 'down', id: 'membrane', offset: [0, 0, 0] },
    { object: anchor(1.4, 1.35, 0), text: 'Positive electrode', sub: 'VO₂⁺ + 2H⁺ + e⁻ → VO²⁺ + H₂O', dir: 'up', id: 'felt_pos', offset: [0, 0, 0] },
  ];

  let time = 0;
  const tmp = new THREE.Color();
  function update(state, dt) {
    if (!group.visible) return;
    time += dt;
    const r = state.reaction;
    for (const ion of ions) {
      const flipped = r > ion.th;
      const base = ion.side < 0 ? (flipped ? V_COLORS.v3 : V_COLORS.v2) : (flipped ? V_COLORS.v4 : V_COLORS.v5);
      ion.mesh.material.color.copy(base); ion.mesh.material.emissive.copy(base);
      const d = (r - ion.th) / 0.03; const pulse = Math.exp(-d * d);
      ion.mesh.scale.setScalar(1 + 0.9 * pulse);
      ion.mesh.material.emissiveIntensity = 0.3 + 1.5 * pulse;
      ion.mesh.position.set(
        ion.p0.x + Math.sin(time * 1.1 + ion.ph) * 0.06,
        ion.p0.y + Math.cos(time * 0.9 + ion.ph * 1.3) * 0.06,
        ion.p0.z + Math.sin(time * 1.3 + ion.ph * 0.7) * 0.05);
    }
    for (const p of protons) { const u = (p.off + time * 0.18 * p.sp) % 1; p.mesh.position.set(-1.0 + u * 2.0, p.y + Math.sin(time * 2 + p.off * 9) * 0.05, p.z); p.mesh.scale.setScalar(0.6 + 0.6 * Math.sin(u * Math.PI)); }
    for (const e of electrons) { const u = (e.off + time * 0.22 * e.sp) % 1; const x = e.side < 0 ? -0.4 - u * 1.95 : 2.35 - u * 1.95; e.mesh.position.set(x, e.y + Math.sin(u * 14) * 0.08, e.z); }
  }
  return { group, update, labelSpecs };
}
