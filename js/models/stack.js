import * as THREE from 'three';
import { plateGeometry, hexNutGeometry, rodGeometry } from './shapes.js';
import { SERP } from './textures.js';

export const STACK = { H: 1.2, W: 0.9, cells: 8, center: 4 };
const END_TYPES = new Set(['endplate', 'collector', 'gasket']);

/**
 * Procedural VRFB stack: end plates, collectors, flow frames, bipolar plates,
 * felts and membranes along the X axis. `update(state)` interpolates every layer
 * between its compact and exploded position, so scrubbing is fully reversible.
 */
export function buildStack(M, T, opts = {}) {
  const group = new THREE.Group(); group.name = 'stack';
  const { H, W, cells: N, center: C } = STACK;
  const layers = [], pickables = [];
  const shadows = !!opts.shadows;

  const corner = [[0.37, 0.52], [-0.37, 0.52], [0.37, -0.52], [-0.37, -0.52]];
  const holes4 = corner.map(([z, y]) => [z, y, 0.03]);
  const endHoles = [...corner.map(([z, y]) => [z * 1.1, y * 1.12, 0.035]), [0.44, 0.2, 0.03], [-0.44, 0.2, 0.03], [0.44, -0.2, 0.03], [-0.44, -0.2, 0.03]];

  const G = {
    endplate: plateGeometry({ w: 1.0, h: 1.36, t: 0.12, r: 0.11, holes: endHoles, bevel: 0.008 }),
    collector: plateGeometry({ w: 0.84, h: 1.14, t: 0.02, r: 0.06, bevel: 0.002 }),
    gasket: plateGeometry({ w: W, h: H, t: 0.012, r: 0.07, holes: holes4, window: { w: 0.7, h: 1.0, r: 0.05 }, bevel: 0.002 }),
    bipolar: plateGeometry({ w: W, h: H, t: 0.04, r: 0.07, holes: holes4, bevel: 0.003 }),
    felt: new THREE.BoxGeometry(0.04, 1.0, 0.7),
    membrane: new THREE.BoxGeometry(0.006, 1.14, 0.84),
    flow: new THREE.PlaneGeometry(0.72, 1.02),
    tab: new THREE.BoxGeometry(0.02, 0.22, 0.14),
    bracket: new THREE.BoxGeometry(0.08, 1.56, 0.14),
    nut: hexNutGeometry(0.042, 0.04),
    bolt: new THREE.CylinderGeometry(0.02, 0.02, 0.14, 12).rotateZ(Math.PI / 2),
    barb: new THREE.CylinderGeometry(0.05, 0.05, 0.26, 24).rotateZ(Math.PI / 2),
    ridge: new THREE.TorusGeometry(0.052, 0.008, 8, 24).rotateY(Math.PI / 2),
    collar: new THREE.CylinderGeometry(0.07, 0.07, 0.03, 24).rotateZ(Math.PI / 2),
    oring: new THREE.TorusGeometry(0.08, 0.016, 10, 32).rotateY(Math.PI / 2),
  };

  const mark = (mesh, id, extra = {}) => { mesh.userData.component = id; Object.assign(mesh.userData, extra); mesh.castShadow = shadows; mesh.receiveShadow = shadows; return mesh; };
  const addLayer = (type, mesh, t, cell) => { mark(mesh, type, { cell }); layers.push({ type, mesh, t, cell }); group.add(mesh); pickables.push(mesh); return mesh; };

  // --- end plate assemblies ------------------------------------------------
  function endAssembly(side) { // side: -1 left, +1 right
    const m = new THREE.Mesh(G.endplate, M.steel());
    const out = side; // outward direction along x
    // brackets + bolts
    [-0.36, 0.36].forEach(z => {
      const b = new THREE.Mesh(G.bracket, M.steelDark()); b.position.set(out * 0.13, 0, z); b.castShadow = shadows; m.add(b);
      [-0.62, 0, 0.62].forEach(y => {
        const bolt = new THREE.Mesh(G.bolt, M.steelDark()); bolt.position.set(out * 0.12, y, z); m.add(bolt);
        const nut = new THREE.Mesh(G.nut, M.steel()); nut.position.set(out * 0.19, y, z); m.add(nut);
      });
    });
    // ports
    const ringHex = side < 0 ? 0x26d9e3 : 0xff9b2f;
    [-0.3, 0.3].forEach(y => {
      const port = new THREE.Group(); port.position.set(out * 0.06, y, 0);
      const barb = new THREE.Mesh(G.barb, M.steel()); barb.position.x = out * 0.15; port.add(barb);
      [0.2, 0.24, 0.28].forEach(d => { const r = new THREE.Mesh(G.ridge, M.steel()); r.position.x = out * d; port.add(r); });
      const collar = new THREE.Mesh(G.collar, M.steel()); collar.position.x = out * 0.03; port.add(collar);
      const o = new THREE.Mesh(G.oring, M.oring(ringHex)); o.position.x = out * 0.012; port.add(o);
      port.traverse(c => { c.userData.component = side < 0 ? 'port_neg' : 'port_pos'; c.castShadow = shadows; });
      m.add(port);
    });
    return m;
  }

  // --- collectors ------------------------------------------------------------
  function collector(side) {
    const m = new THREE.Mesh(G.collector, M.copper());
    const tab = new THREE.Mesh(G.tab, m.material); tab.position.set(0, 0.57 + 0.09, side < 0 ? 0.22 : -0.22); tab.userData.component = 'collector'; m.add(tab);
    return m;
  }

  // --- bipolar plate with two flow-field faces ------------------------------
  function bipolar() {
    const m = new THREE.Mesh(G.bipolar, M.graphite());
    const fA = new THREE.Mesh(G.flow, M.flowField()); fA.rotation.y = Math.PI / 2; fA.position.x = 0.0245; fA.userData.component = 'bipolar'; m.add(fA);
    const fB = new THREE.Mesh(G.flow, M.flowField()); fB.rotation.y = -Math.PI / 2; fB.position.x = -0.0245; fB.userData.component = 'bipolar'; m.add(fB);
    return m;
  }

  // --- build order (left → right) -------------------------------------------
  addLayer('endplate', endAssembly(-1), 0.12, -1);
  addLayer('collector', collector(-1), 0.02, -1);
  addLayer('gasket', new THREE.Mesh(G.gasket, M.gasket()), 0.012, -1);
  for (let i = 0; i < N; i++) {
    addLayer('bipolar', bipolar(), 0.04, i);
    addLayer('felt_neg', new THREE.Mesh(G.felt, M.felt()), 0.04, i);
    addLayer('membrane', new THREE.Mesh(G.membrane, M.membrane()), 0.006, i);
    addLayer('felt_pos', new THREE.Mesh(G.felt, M.felt()), 0.04, i);
  }
  addLayer('bipolar', bipolar(), 0.04, N);
  addLayer('gasket', new THREE.Mesh(G.gasket, M.gasket()), 0.012, N + 1);
  addLayer('collector', collector(1), 0.02, N + 1);
  addLayer('endplate', endAssembly(1), 0.12, N + 1);

  // --- layout: compact vs exploded -----------------------------------------
  const inCenter = (L) => (L.type === 'bipolar' && (L.cell === C || L.cell === C + 1)) || (L.cell === C && L.type !== 'bipolar');
  const gapAfter = (i) => {
    const a = layers[i], b = layers[i + 1]; if (!b) return 0;
    if (END_TYPES.has(a.type) || END_TYPES.has(b.type)) return 0.17;
    if (inCenter(a) || inCenter(b)) return 0.3;
    if (b.type === 'bipolar') return 0.06;
    return 0;
  };
  const total = layers.reduce((s, L) => s + L.t, 0);
  let cur = -total / 2; layers.forEach(L => { L.xc = cur + L.t / 2; cur += L.t; });
  cur = 0; layers.forEach((L, i) => { L.xe = cur + L.t / 2; cur += L.t + gapAfter(i); });
  const span = cur; layers.forEach(L => { L.xe -= span / 2; L.mesh.position.x = L.xc; });

  // --- tie rods + nuts -------------------------------------------------------
  const frame = new THREE.Group(); group.add(frame);
  const rods = corner.map(([z, y]) => { const r = new THREE.Mesh(rodGeometry(0.016), M.steel()); r.position.set(0, y * 1.12, z * 1.1); r.userData.component = 'tierod'; r.castShadow = shadows; frame.add(r); pickables.push(r); return r; });
  const nuts = [];
  corner.forEach(([z, y]) => [-1, 1].forEach(s => { const n = new THREE.Mesh(G.nut, M.steel()); n.position.set(0, y * 1.12, z * 1.1); n.userData.component = 'tierod'; n.userData.side = s; frame.add(n); nuts.push(n); }));

  // --- anchors used by the camera timeline ---------------------------------
  const find = (type, cell) => layers.find(L => L.type === type && L.cell === cell);
  const anchors = {
    membraneX: find('membrane', C).xe,
    bipolarFaceX: find('bipolar', C).xe + 0.0205,
    compactHalf: total / 2 + 0.06,
    explodedHalf: span / 2 + 0.06,
  };

  // --- serpentine particle path on the centre cell's left bipolar plate -----
  const serpLocal = T.serp.points.map(([cx, cy]) => new THREE.Vector3(0, (0.5 - cy / SERP.H) * 1.02, (0.5 - cx / SERP.W) * 0.72));
  const serpCurve = new THREE.CatmullRomCurve3(serpLocal, false, 'catmullrom', 0.0);

  // labels: [type, cell, text, sub, up/down]
  const labelSpecs = [
    ['endplate', -1, 'End plate', 'stainless steel', 'up', 0.72],
    ['collector', -1, 'Current collector', 'copper', 'down', -0.72],
    ['gasket', -1, 'Flow frame & gasket', 'PVC · EPDM', 'up', 1.0],
    ['bipolar', C, 'Bipolar plate', 'graphite flow field', 'down', -1.0],
    ['felt_neg', C, 'Negative electrode', 'carbon felt · V²⁺/V³⁺', 'up', 0.72],
    ['membrane', C, 'Ion-exchange membrane', 'Nafion®', 'down', -0.72],
    ['felt_pos', C, 'Positive electrode', 'carbon felt · VO²⁺/VO₂⁺', 'up', 1.0],
    ['endplate', N + 1, 'Tie rods & clamps', '4 × M12', 'down', -1.0],
  ].map(([type, cell, text, sub, dir, dy]) => ({ object: find(type, cell).mesh, text, sub, dir, id: type === 'endplate' && cell > 0 ? 'tierod' : type, offset: [0, dy, 0] }));

  const revealFrom = layers.indexOf(find('bipolar', C)) + 1;
  function update(state) {
    const e = state.explode, rv = state.reveal || 0;
    for (let i = 0; i < layers.length; i++) { const L = layers[i]; L.mesh.position.x = L.xc + (L.xe - L.xc) * e + (i >= revealFrom ? rv * 1.8 : 0); }
    const xl = layers[0].mesh.position.x - 0.06 - 0.21, xr = layers[layers.length - 1].mesh.position.x + 0.06 + 0.21;
    rods.forEach(r => { r.scale.x = (xr - xl) + 0.2; r.position.x = (xl + xr) / 2; });
    nuts.forEach(n => { n.position.x = n.userData.side < 0 ? xl + 0.02 : xr - 0.02; });
  }
  update({ explode: 0, reveal: 0 });

  return { group, layers, pickables, anchors, update, serpCurve, bipolarCenter: find('bipolar', C).mesh, labelSpecs, find };
}
