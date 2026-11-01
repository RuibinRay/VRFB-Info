import * as THREE from 'three';
import { roundedPolyline } from './shapes.js';
import { negColor, posColor } from './materials.js';

/**
 * Balance of plant around the stack: two tanks, two pumps, piping, skid,
 * power-conversion cabinet and control panel. Liquid colour follows state.soc.
 */
export function buildSystem(M, opts = {}) {
  const group = new THREE.Group(); group.name = 'system';
  const periphery = new THREE.Group(); group.add(periphery); // fades out during explode
  const fixed = new THREE.Group(); group.add(fixed);         // skid, ground, cradle
  const pickables = [];
  const shadows = !!opts.shadows;
  const particlesPer = opts.mobile ? 60 : 140;
  const fadeMats = [];
  const reg = (mesh, id) => { mesh.traverse(c => { c.userData.component = id; c.castShadow = shadows; c.receiveShadow = shadows; }); pickables.push(mesh); return mesh; };
  const fade = (mat) => { mat.userData.baseOpacity = mat.opacity ?? 1; mat.transparent = true; fadeMats.push(mat); return mat; };

  // --- ground + skid --------------------------------------------------------
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), M.ground()); ground.rotation.x = -Math.PI / 2; ground.position.y = -1.2; ground.receiveShadow = shadows; fixed.add(ground);
  const gridH = new THREE.GridHelper(120, 120, 0x1a2436, 0x111826); gridH.position.y = -1.195; gridH.material.transparent = true; gridH.material.opacity = 0.5; fixed.add(gridH);
  const skid = new THREE.Mesh(new THREE.BoxGeometry(9.2, 0.12, 3.4), M.steelDark()); skid.position.y = -1.14; skid.receiveShadow = shadows; skid.castShadow = shadows; fixed.add(skid);
  [-1.5, 1.5].forEach(z => { const rail = new THREE.Mesh(new THREE.BoxGeometry(9.2, 0.16, 0.16), M.steel()); rail.position.set(0, -1.06, z); fixed.add(rail); });
  [-0.45, 0.45].forEach(x => { const c = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 1.05), M.steelDark()); c.position.set(x, -0.93, 0); c.castShadow = shadows; fixed.add(c); });

  // --- tanks --------------------------------------------------------------
  const liquids = [];
  function tank(x, id) {
    const g = new THREE.Group(); g.position.x = x;
    const R = 0.8, Hc = 1.7, yc = 0.25;
    const shell = new THREE.Mesh(new THREE.CylinderGeometry(R, R, Hc, 48, 1, true), fade(M.glass())); shell.position.y = yc; g.add(shell);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(R, 48, 20, 0, Math.PI * 2, 0, Math.PI / 2), fade(M.steel())); dome.scale.y = 0.42; dome.position.y = yc + Hc / 2; g.add(dome);
    const cone = new THREE.Mesh(new THREE.CylinderGeometry(R, 0.14, 0.42, 48, 1, true), fade(M.steelDark())); cone.position.y = yc - Hc / 2 - 0.21; cone.material.side = THREE.DoubleSide; g.add(cone);
    [yc - Hc / 2 + 0.03, yc + Hc / 2 - 0.03].forEach(y => { const band = new THREE.Mesh(new THREE.TorusGeometry(R + 0.015, 0.035, 10, 64), fade(M.steel())); band.rotation.x = Math.PI / 2; band.position.y = y; g.add(band); });
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.16, 20), fade(M.steel())); neck.position.set(0.25, yc + Hc / 2 + 0.32, 0); g.add(neck);
    const neck2 = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.14, 20), fade(M.steel())); neck2.position.set(-0.3, yc + Hc / 2 + 0.3, 0.2); g.add(neck2);
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.62, 0.1), fade(M.steelDark())); leg.position.set(Math.cos(a) * 0.7, -0.78, Math.sin(a) * 0.7); g.add(leg); }
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.74, 0.04, 8, 48), fade(M.steelDark())); ring.rotation.x = Math.PI / 2; ring.position.y = -0.5; g.add(ring);
    // liquid
    const liqMat = fade(M.liquid(0xffffff));
    const fill = 0.78;
    const liq = new THREE.Mesh(new THREE.CylinderGeometry(R - 0.035, R - 0.035, Hc * fill, 48), liqMat); liq.position.y = yc - Hc / 2 + Hc * fill / 2; g.add(liq);
    const liqCone = new THREE.Mesh(new THREE.CylinderGeometry(R - 0.035, 0.12, 0.4, 48), liqMat); liqCone.position.y = cone.position.y; g.add(liqCone);
    liquids.push({ mat: liqMat, id });
    reg(g, id); periphery.add(g); return g;
  }
  tank(-3.4, 'tank_pos'); tank(3.4, 'tank_neg');

  // --- pumps --------------------------------------------------------------
  const fans = [];
  function pump(x, hex, dir) {
    const g = new THREE.Group(); g.position.set(x, -0.8, 0);
    const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.42, 28).rotateZ(Math.PI / 2), fade(M.paint(hex))); motor.position.x = dir * 0.1; g.add(motor);
    const fins = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.36), fade(M.paint(hex))); fins.position.x = dir * 0.1; fins.position.y = -0.15; g.add(fins);
    const volute = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.16, 32).rotateZ(Math.PI / 2), fade(M.steel())); volute.position.x = -dir * 0.2; g.add(volute);
    const fan = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.03, 8).rotateZ(Math.PI / 2), fade(M.steelDark())); fan.position.x = dir * 0.33; g.add(fan); fans.push(fan);
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.08, 0.5), fade(M.steelDark())); base.position.y = -0.24; g.add(base);
    const outlet = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.2, 16), fade(M.steel())); outlet.position.set(-dir * 0.2, 0.22, 0); g.add(outlet);
    const inlet = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.1, 16).rotateZ(Math.PI / 2), fade(M.steel())); inlet.position.set(-dir * 0.33, 0, 0); g.add(inlet);
    reg(g, 'pump'); periphery.add(g); return g;
  }
  pump(-2.1, 0x2452d9, 1); pump(2.1, 0x2da84a, -1);

  // --- cabinet + control panel ------------------------------------------------
  const cab = new THREE.Group(); cab.position.set(-0.3, -0.15, -2.2);
  const cabBody = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.9, 0.8), [M.paint(0x9aa0a8), M.paint(0x9aa0a8), M.paint(0xb0b5bc), M.paint(0x6e737a), fade(M.cabinet()), M.paint(0x9aa0a8)].map(m => fade(m))); cab.add(cabBody);
  const cabFeet = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.1, 0.7), fade(M.steelDark())); cabFeet.position.y = -1.0; cab.add(cabFeet);
  reg(cab, 'cabinet'); periphery.add(cab);
  const panel = new THREE.Group(); panel.position.set(2.0, -0.35, -2.2);
  panel.add(new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.2, 0.5), fade(M.paint(0xb3b8bf))));
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.32), fade(M.glow(0x1d4f9a, 0.9))); screen.position.set(0, 0.25, 0.251); panel.add(screen);
  [[-0.2, 0x3ddc5f], [-0.08, 0xff4242], [0.04, 0x3ddc5f], [0.16, 0xffb020]].forEach(([x, c]) => { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 16).rotateX(Math.PI / 2), fade(M.glow(c, 0.8))); b.position.set(x, -0.1, 0.255); panel.add(b); });
  [[0xff4a3d, 0.86], [0xffb020, 0.96], [0x3ddc5f, 1.06]].forEach(([c, y]) => { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.1, 16), fade(M.glow(c, 0.9))); l.position.set(0.25, y, 0); panel.add(l); });
  reg(panel, 'cabinet'); periphery.add(panel);
  const conduit = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 1.6), fade(M.paint(0x2a2d32))); conduit.position.set(-0.3, 0.75, -1.4); periphery.add(conduit);

  // --- pipes + particle flows -------------------------------------------------
  const flows = [];
  function pipe(points, side) {
    const curve = roundedPolyline(points, 0.16);
    const mat = fade(M.pipe(0xffffff));
    const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 64, 0.05, 14, false), mat); mesh.castShadow = shadows; periphery.add(mesh);
    const n = particlesPer; const pos = new Float32Array(n * 3); const off = new Float32Array(n);
    for (let i = 0; i < n; i++) off[i] = i / n;
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pm = new THREE.PointsMaterial({ size: 0.045, color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true });
    const pts = new THREE.Points(geo, pm); pts.frustumCulled = false; periphery.add(pts);
    flows.push({ curve, pipeMat: mat, pts, pm, off, side, len: curve.getLength() });
    return mesh;
  }
  // positive loop (left, blue→yellow) and negative loop (right, green→violet):
  // tank → pump → stack lower port; stack upper port → tank
  const L = (p) => p, Rr = (p) => p.map(([x, y, z]) => [-x, y, z]);
  const supplyA = [[-3.4, -0.95, 0], [-3.4, -1.02, 0], [-2.6, -1.02, 0], [-2.6, -0.8, 0], [-2.37, -0.8, 0]];
  const supplyB = [[-2.3, -0.6, 0], [-2.3, -0.3, 0], [-1.6, -0.3, 0], [-1.05, -0.3, 0]];
  const ret = [[-1.05, 0.3, 0], [-1.7, 0.3, 0], [-1.7, 1.6, 0], [-3.15, 1.6, 0], [-3.15, 1.4, 0]];
  pipe(L(supplyA), 'pos'); pipe(L(supplyB), 'pos'); pipe(L(ret), 'pos');
  pipe(Rr(supplyA), 'neg'); pipe(Rr(supplyB), 'neg'); pipe(Rr(ret), 'neg');
  // valves on return lines
  [[-1.7, 1.0, 0], [1.7, 1.0, 0]].forEach(([x, y, z]) => { const v = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.16, 16), fade(M.steel())); v.position.set(x, y, z); periphery.add(v); const w = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.018, 8, 24), fade(M.paint(x < 0 ? 0x2452d9 : 0x2da84a))); w.position.set(x + (x < 0 ? -0.14 : 0.14), y, z); w.rotation.y = Math.PI / 2; periphery.add(w); });

  const cNeg = new THREE.Color(), cPos = new THREE.Color(), cTmp = new THREE.Color();
  let time = 0;
  function update(state, dt) {
    time += dt;
    negColor(state.soc, cNeg); posColor(state.soc, cPos);
    liquids.forEach(l => { const c = l.id === 'tank_neg' ? cNeg : cPos; l.mat.color.copy(c); l.mat.emissive.copy(c); });
    const o = state.periphery;
    periphery.visible = o > 0.015;
    for (const m of fadeMats) m.opacity = m.userData.baseOpacity * o;
    const speed = state.flowSystem;
    fans.forEach(f => { f.rotation.x += dt * 18 * speed; });
    for (const f of flows) {
      const c = f.side === 'neg' ? cNeg : cPos;
      f.pipeMat.color.copy(c).lerp(cTmp.set(0xffffff), 0.15); f.pipeMat.emissive.copy(c);
      f.pm.color.copy(c).lerp(cTmp.set(0xffffff), 0.5); f.pm.opacity = speed * o;
      if (speed * o < 0.01) { f.pts.visible = false; continue; }
      f.pts.visible = true;
      const arr = f.pts.geometry.attributes.position.array; const v = new THREE.Vector3();
      const adv = (time * 0.35 * speed) / f.len; // ≈ constant linear speed
      for (let i = 0; i < f.off.length; i++) { const u = (f.off[i] + adv) % 1; f.curve.getPointAt(u, v); arr[i * 3] = v.x; arr[i * 3 + 1] = v.y; arr[i * 3 + 2] = v.z; }
      f.pts.geometry.attributes.position.needsUpdate = true;
    }
  }
  return { group, pickables, update };
}
