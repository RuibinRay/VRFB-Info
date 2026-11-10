import * as THREE from 'three';
import { V_COLORS } from './materials.js';

function mulberry(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

/**
 * Microscopic cross-section of one cell (a conceptual animation, not to scale):
 * carbon-fibre felts either side of the membrane, vanadium ions, protons, and
 * an external circuit that carries the electrons from one electrode to the other.
 *
 *   state.reaction  0 = fully charged ions … 1 = fully discharged ions.
 *                   Colour flips are threshold-based, so scrubbing backwards
 *                   re-charges the ions exactly.
 *   state.microDir  +1 discharge (e⁻ leave the negative felt, H⁺ cross to the
 *                   positive side), −1 charge (everything reverses), 0 at rest.
 * Layout: positive electrode on the left, negative on the right, as everywhere on the site.
 */
export function buildMicro(M, opts = {}) {
  const group = new THREE.Group(); group.name = 'micro'; group.visible = false;
  const rand = mulberry(42);
  const mobile = !!opts.mobile;

  // membrane and bipolar walls
  const mem = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.7, 1.3), M.membrane()); mem.material.opacity = 0.9; group.add(mem);
  // sulfonate channels hinted as faint vertical striations inside the membrane
  for (let i = 0; i < 5; i++) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.012, 2.6, 1.22), new THREE.MeshBasicMaterial({ color: 0xbff5dd, transparent: true, opacity: 0.08 })); s.position.x = -0.1 + i * 0.05; group.add(s); }
  [-2.45, 2.45].forEach(x => { const w = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.9, 1.4), M.graphite()); w.position.x = x; group.add(w); });

  // fibres (instanced)
  const nF = mobile ? 90 : 170;
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

  // vanadium ions
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
  // protons crossing the membrane
  const protons = [];
  const pGeo = new THREE.SphereGeometry(0.03, 10, 8);
  const pMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1.2 });
  for (let i = 0; i < (mobile ? 10 : 16); i++) { const m = new THREE.Mesh(pGeo, pMat); protons.push({ mesh: m, off: rand(), y: (rand() - 0.5) * 2.2, z: (rand() - 0.5) * 0.9, sp: 0.8 + rand() * 0.6 }); group.add(m); }

  // external circuit: wire over the top with a load / source in the middle
  const wirePts = [[-2.45, 1.4, 0], [-2.45, 1.72, 0], [-1.2, 1.86, 0], [0, 1.86, 0], [1.2, 1.86, 0], [2.45, 1.72, 0], [2.45, 1.4, 0]].map(p => new THREE.Vector3(...p));
  const wireCurve = new THREE.CatmullRomCurve3(wirePts, false, 'catmullrom', 0.2);
  group.add(new THREE.Mesh(new THREE.TubeGeometry(wireCurve, 60, 0.028, 8, false), new THREE.MeshStandardMaterial({ color: 0xc9773a, metalness: 0.9, roughness: 0.35 })));
  const device = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.3, 0.3), new THREE.MeshStandardMaterial({ color: 0x1b2433, metalness: 0.4, roughness: 0.4 })); device.position.set(0, 1.86, 0); group.add(device);
  const deviceGlowMat = new THREE.MeshStandardMaterial({ color: 0xffb347, emissive: 0xffb347, emissiveIntensity: 1.5 });
  const deviceGlow = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.16, 0.02), deviceGlowMat); deviceGlow.position.set(0, 1.86, 0.16); group.add(deviceGlow);
  const deviceHalo = opts.halo ? new THREE.Sprite(opts.halo(0xffb347, 0.5)) : null; if (deviceHalo) { deviceHalo.position.set(0, 1.86, 0.2); deviceHalo.scale.set(1.5, 1.0, 1); group.add(deviceHalo); }

  // electrons: in the fibres on both sides and along the wire
  const electrons = [];
  const eGeo = new THREE.SphereGeometry(0.024, 8, 6);
  const eMat = new THREE.MeshStandardMaterial({ color: 0x26d9e3, emissive: 0x26d9e3, emissiveIntensity: 2 });
  for (let i = 0; i < (mobile ? 12 : 22); i++) { const m = new THREE.Mesh(eGeo, eMat); electrons.push({ mesh: m, off: rand(), side: i % 2 ? 1 : -1, y: (rand() - 0.5) * 2.4, z: (rand() - 0.5) * 1.0, sp: 0.5 + rand() * 0.5 }); group.add(m); }
  const wireE = [];
  for (let i = 0; i < (mobile ? 10 : 16); i++) { const m = new THREE.Mesh(eGeo, eMat); wireE.push({ mesh: m, off: i / (mobile ? 10 : 16) }); group.add(m); }

  // soft backdrop
  const back = new THREE.Mesh(new THREE.PlaneGeometry(11, 7), new THREE.MeshBasicMaterial({ color: 0x0a1222, transparent: true, opacity: 0.85 })); back.position.set(0, 0.4, -1.2); group.add(back);

  // label anchors
  const anchor = (x, y, z) => { const o = new THREE.Object3D(); o.position.set(x, y, z); group.add(o); return o; };
  const labelSpecs = [
    { object: anchor(-1.5, 1.15, 0.2), text: 'Positive electrode', sub: 'VO₂⁺ + 2H⁺ + e⁻ ⇌ VO²⁺ + H₂O', dir: 'up', id: 'felt_pos', key: 'micro_pos', offset: [0, 0, 0] },
    { object: anchor(0, -1.4, 0.3), text: 'Membrane', sub: 'H⁺ passes · vanadium blocked', dir: 'down', id: 'membrane', key: 'micro_mem', offset: [0, 0, 0] },
    { object: anchor(1.3, 1.15, 0.2), text: 'Negative electrode', sub: 'V²⁺ ⇌ V³⁺ + e⁻', dir: 'up', id: 'felt_neg', key: 'micro_neg', offset: [0, 0, 0] },
    { object: anchor(0.42, 1.98, 0.2), text: 'External circuit', sub: 'electrons do the work here', dir: 'up', id: 'cabinet', key: 'micro_circuit', offset: [0, 0, 0] },
  ];

  let phase = 0, wobble = 0;
  const v = new THREE.Vector3(); const cDis = new THREE.Color(0xffb347), cChg = new THREE.Color(0x26d9e3), cOff = new THREE.Color(0x3a4558);
  const frac = (x) => ((x % 1) + 1) % 1;
  function update(state, dt) {
    if (!group.visible) return;
    const dir = state.microDir ?? 1;
    phase += dt * dir; wobble += dt;
    const r = state.reaction;
    for (const ion of ions) {
      const flipped = r > ion.th;
      const base = ion.side > 0 ? (flipped ? V_COLORS.v3 : V_COLORS.v2) : (flipped ? V_COLORS.v4 : V_COLORS.v5); // negative electrolyte on the right
      ion.mesh.material.color.copy(base); ion.mesh.material.emissive.copy(base);
      const d = (r - ion.th) / 0.03; const pulse = Math.exp(-d * d);
      ion.mesh.scale.setScalar(1 + 0.9 * pulse);
      ion.mesh.material.emissiveIntensity = 0.3 + 1.5 * pulse;
      ion.mesh.position.set(
        ion.p0.x + Math.sin(wobble * 1.1 + ion.ph) * 0.06,
        ion.p0.y + Math.cos(wobble * 0.9 + ion.ph * 1.3) * 0.06,
        ion.p0.z + Math.sin(wobble * 1.3 + ion.ph * 0.7) * 0.05);
    }
    // discharge: H⁺ cross from the negative (right) to the positive (left) side;
    // electrons leave the negative felt, cross the wire right → left and enter the positive felt
    for (const p of protons) { const u = frac(p.off + phase * 0.18 * p.sp); p.mesh.position.set(1.0 - u * 2.0, p.y + Math.sin(wobble * 2 + p.off * 9) * 0.05, p.z); p.mesh.scale.setScalar(0.6 + 0.6 * Math.sin(u * Math.PI)); }
    for (const e of electrons) { const u = frac(e.off + phase * 0.22 * e.sp); const x = e.side < 0 ? -2.35 + u * 1.95 : 0.4 + u * 1.95; e.mesh.position.set(x, e.y + Math.sin(u * 14) * 0.08, e.z); }
    for (const e of wireE) { wireCurve.getPointAt(frac(e.off - phase * 0.09), v); e.mesh.position.copy(v); }
    // the device in the circuit glows warm as a load (discharge) and cyan as a source (charge)
    const a = Math.min(1, Math.abs(dir));
    deviceGlowMat.color.copy(cOff).lerp(dir >= 0 ? cDis : cChg, a); deviceGlowMat.emissive.copy(deviceGlowMat.color); deviceGlowMat.emissiveIntensity = 0.2 + 1.6 * a;
    if (deviceHalo) { deviceHalo.material.color.copy(deviceGlowMat.color); deviceHalo.material.opacity = 0.5 * a; }
  }
  return { group, update, labelSpecs };
}
