import * as THREE from 'three';

/**
 * The installation around the battery skid: a solar farm, rows of additional
 * flow-battery modules, a step-up substation, transmission towers and the
 * energy-flow streams between them.
 *
 * state.grid      opacity of the whole site (1 in wide shots, 0 during close-ups)
 * state.flowSolar solar → battery stream (charging)
 * state.flowGrid  battery → grid stream (discharging)
 */
export function buildGrid(M, opts = {}) {
  const group = new THREE.Group(); group.name = 'site'; group.visible = false;
  const mobile = !!opts.mobile;
  const fadeMats = [];
  const fade = (m) => { m.transparent = true; m.userData.baseOpacity = m.opacity ?? 1; fadeMats.push(m); return m; };
  const mesh = (geo, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); group.add(m); return m; };
  const d = new THREE.Object3D();

  // --- solar farm (west of the pad) ----------------------------------------------
  const cols = mobile ? 8 : 12, rows = mobile ? 5 : 7;
  const panels = new THREE.InstancedMesh(new THREE.BoxGeometry(1.45, 0.04, 0.9), fade(M.panel()), cols * rows);
  const posts = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.035, 0.035, 0.7, 6), fade(M.steelDark()), cols * rows);
  let k = 0;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const x = -9.2 - c * 1.62, z = -8 + r * 2.0;
    d.position.set(x, -0.45, z); d.rotation.set(-0.5, 0, 0); d.scale.set(1, 1, 1); d.updateMatrix(); panels.setMatrixAt(k, d.matrix);
    d.position.set(x, -0.85, z); d.rotation.set(0, 0, 0); d.updateMatrix(); posts.setMatrixAt(k, d.matrix); k++;
  }
  panels.castShadow = !mobile; group.add(panels, posts);
  mesh(new THREE.BoxGeometry(0.9, 1.0, 0.6), fade(M.paint(0xb3b8bf)), -7.6, -0.7, 0.4);      // string inverter / combiner
  mesh(new THREE.BoxGeometry(0.5, 0.03, 0.02), fade(M.glow(0x26d9e3, 1.2)), -7.6, -0.3, 0.71);

  // --- more flow-battery modules behind the featured skid --------------------------
  const nMod = mobile ? 4 : 8;
  const boxes = new THREE.InstancedMesh(new THREE.BoxGeometry(2.6, 1.15, 1.05), fade(M.container()), nMod);
  const tanks = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.5, 0.5, 1.5, 20), fade(M.paint(0x9aa4b2)), nMod * 2);
  const domes = new THREE.InstancedMesh(new THREE.SphereGeometry(0.5, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), fade(M.steel()), nMod * 2);
  for (let i = 0; i < nMod; i++) {
    const x = -5.2 + (i % 4) * 3.5, z = -6.6 - Math.floor(i / 4) * 3.4;
    d.rotation.set(0, 0, 0); d.scale.set(1, 1, 1);
    d.position.set(x, -0.62, z); d.updateMatrix(); boxes.setMatrixAt(i, d.matrix);
    [-1, 1].forEach((s, j) => {
      d.position.set(x + s * 0.62, -0.45, z - 1.25); d.scale.set(1, 1, 1); d.updateMatrix(); tanks.setMatrixAt(i * 2 + j, d.matrix);
      d.position.set(x + s * 0.62, 0.3, z - 1.25); d.scale.set(1, 0.45, 1); d.updateMatrix(); domes.setMatrixAt(i * 2 + j, d.matrix);
    });
  }
  boxes.castShadow = tanks.castShadow = !mobile; group.add(boxes, tanks, domes);
  mesh(new THREE.BoxGeometry(18, 0.04, 9), fade(M.concrete()), 0.2, -1.19, -8.6).receiveShadow = !mobile;
  // access road
  const road = mesh(new THREE.PlaneGeometry(60, 2.6), fade(M.paint(0x161b24)), 0, -1.188, 5.2); road.rotation.x = -Math.PI / 2;
  const dash = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.9, 0.08), fade(new THREE.MeshBasicMaterial({ color: 0x8c96a8 })), 24);
  for (let i = 0; i < 24; i++) { d.position.set(-28 + i * 2.4, -1.185, 5.2); d.rotation.set(-Math.PI / 2, 0, 0); d.scale.set(1, 1, 1); d.updateMatrix(); dash.setMatrixAt(i, d.matrix); }
  group.add(dash);

  // --- substation and transmission towers (east) -------------------------------------
  const lineMat = fade(new THREE.LineBasicMaterial({ color: 0xb8c2d2, transparent: true, opacity: 0.9 }));
  function tower(x, z) {
    const pts = [];
    const H = 5.2, b = 0.66, t = 0.18, y0 = -1.2;
    const leg = (sx, sz) => { pts.push(sx * b, y0, sz * b, sx * t, y0 + H, sz * t); };
    leg(1, 1); leg(-1, 1); leg(1, -1); leg(-1, -1);
    for (let i = 1; i <= 6; i++) { const y = y0 + i * H / 6, w = b + (t - b) * i / 6, wp = b + (t - b) * (i - 1) / 6, yp = y0 + (i - 1) * H / 6;
      [[1, 1, -1, 1], [1, -1, -1, -1], [1, 1, 1, -1], [-1, 1, -1, -1]].forEach(([ax, az, bx, bz]) => { pts.push(ax * w, y, az * w, bx * w, y, bz * w); pts.push(ax * wp, yp, az * wp, bx * w, y, bz * w); });
    }
    const arms = [[3.5, 1.6], [4.3, 1.2]];
    arms.forEach(([ya, wa]) => { pts.push(0, y0 + ya, -wa, 0, y0 + ya, wa); pts.push(0, y0 + ya, -wa, 0, y0 + ya - 0.5, -0.25); pts.push(0, y0 + ya, wa, 0, y0 + ya - 0.5, 0.25); });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    const l = new THREE.LineSegments(g, lineMat); l.position.set(x, 0, z); group.add(l);
    return { x, z, arms: [[-1.6, 3.5], [1.6, 3.5], [-1.2, 4.3], [1.2, 4.3]] };
  }
  const towers = [tower(12.5, -1.5), tower(19, -1.5), tower(25.5, -1.5)];
  const wireMat = fade(new THREE.LineBasicMaterial({ color: 0x8893a8, transparent: true, opacity: 0.8 }));
  for (let i = 0; i < towers.length - 1; i++) {
    const a = towers[i], b = towers[i + 1];
    a.arms.forEach(([az, ay]) => {
      const p0 = new THREE.Vector3(a.x, -1.2 + ay, a.z + az), p1 = new THREE.Vector3(b.x, -1.2 + ay, b.z + az);
      const mid = p0.clone().add(p1).multiplyScalar(0.5); mid.y -= 0.7;
      group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(new THREE.QuadraticBezierCurve3(p0, mid, p1).getPoints(20)), wireMat));
    });
  }
  // transformer with radiator fins and bushings, switchgear, gantry
  mesh(new THREE.BoxGeometry(1.2, 1.0, 0.9), fade(M.paint(0x7f8690)), 8.6, -0.7, -1.5).castShadow = !mobile;
  for (let i = 0; i < 7; i++) mesh(new THREE.BoxGeometry(0.03, 0.8, 0.5), fade(M.steelDark()), 8.15 + i * 0.15, -0.72, -0.8);
  [-0.32, 0, 0.32].forEach(x => { mesh(new THREE.CylinderGeometry(0.05, 0.075, 0.55, 10), fade(M.polymer(0xd9dde3)), 8.6 + x, 0.07, -1.5); mesh(new THREE.SphereGeometry(0.05, 10, 8), fade(M.steelPolished()), 8.6 + x, 0.36, -1.5); });
  mesh(new THREE.BoxGeometry(1.6, 0.9, 0.6), fade(M.cabinet()), 8.6, -0.75, -3.0);
  const fencePts = []; const fx0 = 7.2, fx1 = 10.4, fz0 = -3.8, fz1 = -0.2;
  [[fx0, fz0, fx1, fz0], [fx1, fz0, fx1, fz1], [fx1, fz1, fx0, fz1], [fx0, fz1, fx0, fz0]].forEach(([ax, az, bx, bz]) => { for (const y of [-0.3, -0.7]) fencePts.push(ax, y, az, bx, y, bz); for (let i = 0; i <= 6; i++) { const x = ax + (bx - ax) * i / 6, z = az + (bz - az) * i / 6; fencePts.push(x, -1.2, z, x, -0.25, z); } });
  const fg = new THREE.BufferGeometry(); fg.setAttribute('position', new THREE.Float32BufferAttribute(fencePts, 3));
  group.add(new THREE.LineSegments(fg, fade(new THREE.LineBasicMaterial({ color: 0x6f7a8c, transparent: true, opacity: 0.7 }))));

  // --- energy-flow streams ---------------------------------------------------------
  const flows = [];
  function flow(points, hex, n, key) {
    const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
    const pos = new Float32Array(n * 3); const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pm = new THREE.PointsMaterial({ size: 0.24, map: opts.glow || null, color: hex, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
    const pts = new THREE.Points(geo, pm); pts.frustumCulled = false; group.add(pts);
    const lm = new THREE.LineBasicMaterial({ color: hex, transparent: true, opacity: 0 });
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(48)), lm));
    flows.push({ curve, pts, pm, lm, n, key });
  }
  const n = mobile ? 40 : 90;
  flow([[-16, 0.2, -1.5], [-11, 0.9, -0.6], [-7.6, 0.1, 0.4], [-4.6, 0.5, -0.9], [-1.6, 0.9, -2.0]], 0x26d9e3, n, 'flowSolar');
  flow([[0.9, 0.9, -2.0], [4.2, 0.7, -1.9], [8.6, 0.6, -1.5], [10.6, 1.9, -1.5], [12.5, 2.7, -1.5], [19, 2.5, -1.5]], 0xff9b2f, n, 'flowGrid');

  let time = 0; const v = new THREE.Vector3();
  function update(state, dt) {
    const g = state.grid;
    group.visible = g > 0.001;
    if (!group.visible) return;
    time += dt;
    for (const m of fadeMats) m.opacity = m.userData.baseOpacity * g;
    for (const f of flows) {
      const a = (state[f.key] ?? 0) * g;
      f.pm.opacity = a; f.lm.opacity = 0.45 * a; f.pts.visible = a > 0.01;
      if (!f.pts.visible) continue;
      const arr = f.pts.geometry.attributes.position.array;
      for (let i = 0; i < f.n; i++) { const u = (i / f.n + time * 0.1) % 1; f.curve.getPointAt(u, v); arr[i * 3] = v.x; arr[i * 3 + 1] = v.y; arr[i * 3 + 2] = v.z; }
      f.pts.geometry.attributes.position.needsUpdate = true;
    }
  }
  return { group, update };
}
