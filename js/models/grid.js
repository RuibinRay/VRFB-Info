import * as THREE from 'three';

/** Solar array, transmission towers and energy-flow particles revealed by state.grid. */
export function buildGrid(M, opts = {}) {
  const group = new THREE.Group(); group.name = 'grid'; group.visible = false;
  const mobile = !!opts.mobile;
  const fadeMats = [];
  const fade = (m) => { m.transparent = true; m.userData.baseOpacity = m.opacity ?? 1; fadeMats.push(m); return m; };

  // --- solar array ----------------------------------------------------------
  const cols = 7, rows = 5;
  const panels = new THREE.InstancedMesh(new THREE.BoxGeometry(1.35, 0.04, 0.85), fade(M.panel()), cols * rows);
  const posts = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.035, 0.035, 0.7, 8), fade(M.steelDark()), cols * rows);
  const d = new THREE.Object3D(); let k = 0;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const x = -13.5 + c * 1.5, z = -3 + r * 1.55;
    d.position.set(x, -0.45, z); d.rotation.set(-0.5, 0, 0); d.scale.set(1, 1, 1); d.updateMatrix(); panels.setMatrixAt(k, d.matrix);
    d.position.set(x, -0.85, z); d.rotation.set(0, 0, 0); d.updateMatrix(); posts.setMatrixAt(k, d.matrix); k++;
  }
  panels.castShadow = !mobile; group.add(panels, posts);
  const combiner = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 0.4), fade(M.paint(0xb3b8bf))); combiner.position.set(-4.8, -0.8, 0); group.add(combiner);

  // --- transmission towers ----------------------------------------------------
  const lineMat = fade(new THREE.LineBasicMaterial({ color: 0xb8c2d2, transparent: true, opacity: 0.9 }));
  function tower(x, z) {
    const pts = [];
    const H = 4.6, b = 0.6, t = 0.18, y0 = -1.2;
    const leg = (sx, sz) => { pts.push(sx * b, y0, sz * b, sx * t, y0 + H, sz * t); };
    leg(1, 1); leg(-1, 1); leg(1, -1); leg(-1, -1);
    for (let i = 1; i <= 6; i++) { const y = y0 + i * H / 6, w = b + (t - b) * i / 6, wp = b + (t - b) * (i - 1) / 6, yp = y0 + (i - 1) * H / 6;
      [[1, 1, -1, 1], [1, -1, -1, -1], [1, 1, 1, -1], [-1, 1, -1, -1]].forEach(([ax, az, bx, bz]) => { pts.push(ax * w, y, az * w, bx * w, y, bz * w); pts.push(ax * wp, yp, az * wp, bx * w, y, bz * w); });
    }
    [[3.0, 1.5], [3.7, 1.1]].forEach(([ya, wa]) => { pts.push(-wa, y0 + ya, 0, wa, y0 + ya, 0); pts.push(-wa, y0 + ya, 0, -0.25, y0 + ya - 0.5, 0); pts.push(wa, y0 + ya, 0, 0.25, y0 + ya - 0.5, 0); });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    const l = new THREE.LineSegments(g, lineMat); l.position.set(x, 0, z); group.add(l);
    return { x, z, arms: [[-1.5, 3.0], [1.5, 3.0], [-1.1, 3.7], [1.1, 3.7]] };
  }
  const towers = [tower(7.5, -1.5), tower(12.5, -1.5), tower(17.5, -1.5)];
  const wireMat = fade(new THREE.LineBasicMaterial({ color: 0x8893a8, transparent: true, opacity: 0.8 }));
  for (let i = 0; i < towers.length - 1; i++) {
    const a = towers[i], b = towers[i + 1];
    a.arms.forEach(([ax, ay]) => {
      const p0 = new THREE.Vector3(a.x, -1.2 + ay, a.z + ax * 0.0), p1 = new THREE.Vector3(b.x, -1.2 + ay, b.z);
      p0.z += ax; p1.z += ax;
      const mid = p0.clone().add(p1).multiplyScalar(0.5); mid.y -= 0.6;
      const curve = new THREE.QuadraticBezierCurve3(p0, mid, p1);
      group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(20)), wireMat));
    });
  }
  // step-up transformer near the first tower
  const tx = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.9, 0.8), fade(M.paint(0x7f8690))); tx.position.set(5.4, -0.75, -1.5); group.add(tx);
  [-0.3, 0, 0.3].forEach(x => { const bush = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.5, 10), fade(M.polymer(0xd9dde3))); bush.position.set(5.4 + x, -0.05, -1.5); group.add(bush); });

  // --- energy flow particles ----------------------------------------------------
  const flows = [];
  function flow(points, hex, n) {
    const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
    const pos = new Float32Array(n * 3); const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pm = new THREE.PointsMaterial({ size: 0.09, color: hex, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
    const pts = new THREE.Points(geo, pm); pts.frustumCulled = false; group.add(pts);
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(40)), fade(new THREE.LineBasicMaterial({ color: hex, transparent: true, opacity: 0.25 }))); group.add(line);
    flows.push({ curve, pts, pm, n });
  }
  const n = mobile ? 40 : 80;
  flow([[-9, -0.2, 0.2], [-6.5, 0.4, 0.6], [-4.8, -0.3, 0.2], [-1.9, -0.1, -1.6]], 0x26d9e3, n);
  flow([[1.2, -0.1, -1.7], [3.5, 0.2, -1.6], [5.4, 0.3, -1.5], [7.5, 1.8, -1.5]], 0xff9b2f, n);

  let time = 0; const v = new THREE.Vector3();
  function update(state, dt) {
    const g = state.grid;
    group.visible = g > 0.001;
    if (!group.visible) return;
    time += dt;
    group.position.y = -(1 - g) * 3.5;
    for (const m of fadeMats) m.opacity = m.userData.baseOpacity * g;
    for (const f of flows) {
      f.pm.opacity = g;
      const arr = f.pts.geometry.attributes.position.array;
      for (let i = 0; i < f.n; i++) { const u = (i / f.n + time * 0.12) % 1; f.curve.getPointAt(u, v); arr[i * 3] = v.x; arr[i * 3 + 1] = v.y; arr[i * 3 + 2] = v.z; }
      f.pts.geometry.attributes.position.needsUpdate = true;
    }
  }
  return { group, update };
}
