import * as THREE from 'three';
import { roundedPolyline } from './shapes.js';
import { negColor, posColor } from './materials.js';

/**
 * Balance of plant around the stack: two electrolyte tanks with level gauges,
 * magnetic-drive pumps, colour-coded piping with valves and instruments, the
 * power-conversion cabinet with DC busbars, a clear spill enclosure around the
 * stack, the skid and its concrete pad.
 *
 * Driven by state: periphery (opacity), flowSystem (pump + particle speed),
 * soc (liquid colour), casing (enclosure opacity).
 * `parts` exposes named sub-assemblies so the exploration lab can toggle them.
 */
export function buildSystem(M, opts = {}) {
  const group = new THREE.Group(); group.name = 'system';
  const periphery = new THREE.Group(); group.add(periphery); // fades out during explode
  const fixed = new THREE.Group(); group.add(fixed);         // skid, pad, cradle
  const casing = new THREE.Group(); group.add(casing);
  const pickables = [];
  const shadows = !!opts.shadows, mobile = !!opts.mobile;
  const particlesPer = mobile ? 60 : 140;
  const fadeMats = [], casingMats = [];
  const parts = { tanks: new THREE.Group(), pumps: new THREE.Group(), pipes: new THREE.Group(), instruments: new THREE.Group(), cabinet: new THREE.Group(), lighting: new THREE.Group(), casing };
  ['tanks', 'pumps', 'pipes', 'instruments', 'cabinet', 'lighting'].forEach(k => periphery.add(parts[k]));
  const reg = (obj, id) => { obj.traverse(c => { if (!c.userData.component) c.userData.component = id; c.castShadow = shadows; c.receiveShadow = shadows; }); pickables.push(obj); return obj; };
  const fade = (mat) => { mat.userData.baseOpacity = mat.opacity ?? 1; mat.transparent = true; fadeMats.push(mat); return mat; };
  const mesh = (geo, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); return m; };
  const UP = new THREE.Vector3(0, 1, 0);
  const along = (m, dir) => { m.quaternion.setFromUnitVectors(UP, dir.clone().normalize()); return m; };

  // --- ground, pad and skid ---------------------------------------------------
  const ground = mesh(new THREE.PlaneGeometry(160, 160), M.ground(), 0, -1.2, 0); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = shadows; fixed.add(ground);
  const gridH = new THREE.GridHelper(160, 160, 0x1a2436, 0x111826); gridH.position.y = -1.195; gridH.material.transparent = true; gridH.material.opacity = 0.45; fixed.add(gridH);
  const pad = mesh(new THREE.BoxGeometry(12.4, 0.06, 6.4), M.concrete(), 0, -1.19, -0.5); pad.receiveShadow = shadows; fixed.add(pad);
  const skid = mesh(new THREE.BoxGeometry(9.2, 0.12, 3.4), M.steelDark(), 0, -1.1, 0); skid.receiveShadow = shadows; skid.castShadow = shadows; fixed.add(skid);
  [-1.5, 1.5].forEach(z => fixed.add(mesh(new THREE.BoxGeometry(9.2, 0.16, 0.16), M.steel(), 0, -1.02, z)));
  [-4.5, 4.5].forEach(x => fixed.add(mesh(new THREE.BoxGeometry(0.16, 0.16, 3.16), M.steel(), x, -1.02, 0)));
  [-0.45, 0.45].forEach(x => { const c = mesh(new THREE.BoxGeometry(0.3, 0.3, 1.05), M.steelDark(), x, -0.93, 0); c.castShadow = shadows; fixed.add(c); });

  // --- tanks --------------------------------------------------------------------
  const liquids = [], halos = [], tankLights = [];
  function tank(x, id) {
    const g = new THREE.Group(); g.position.x = x;
    const R = 0.8, Hc = 1.7, yc = 0.25;
    const shell = mesh(new THREE.CylinderGeometry(R, R, Hc, 48, 1, true), fade(M.glass()), 0, yc, 0); g.add(shell);
    const dome = mesh(new THREE.SphereGeometry(R, 48, 20, 0, Math.PI * 2, 0, Math.PI / 2), fade(M.steel()), 0, yc + Hc / 2, 0); dome.scale.y = 0.42; g.add(dome);
    const cone = mesh(new THREE.CylinderGeometry(R, 0.14, 0.42, 48, 1, true), fade(M.steelDark()), 0, yc - Hc / 2 - 0.21, 0); cone.material.side = THREE.DoubleSide; g.add(cone);
    [yc - Hc / 2 + 0.03, yc, yc + Hc / 2 - 0.03].forEach((y, i) => { const band = mesh(new THREE.TorusGeometry(R + 0.015, i === 1 ? 0.018 : 0.035, 10, 64), fade(M.steel()), 0, y, 0); band.rotation.x = Math.PI / 2; g.add(band); });
    // manway with bolted lid, vent and nitrogen-blanket nozzle
    const manway = mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.1, 28), fade(M.steel()), 0.22, yc + Hc / 2 + 0.31, 0); g.add(manway);
    const lid = mesh(new THREE.CylinderGeometry(0.235, 0.235, 0.025, 28), fade(M.steelPolished()), 0.22, yc + Hc / 2 + 0.37, 0); g.add(lid);
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; g.add(mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.03, 6), fade(M.steelDark()), 0.22 + Math.cos(a) * 0.205, yc + Hc / 2 + 0.39, Math.sin(a) * 0.205)); }
    g.add(mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.16, 20), fade(M.steel()), -0.3, yc + Hc / 2 + 0.3, 0.2));
    g.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.22, 12), fade(M.steelPolished()), -0.1, yc + Hc / 2 + 0.36, -0.3));
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; g.add(mesh(new THREE.BoxGeometry(0.1, 0.62, 0.1), fade(M.steelDark()), Math.cos(a) * 0.7, -0.78, Math.sin(a) * 0.7)); }
    const ring = mesh(new THREE.TorusGeometry(0.74, 0.04, 8, 48), fade(M.steelDark()), 0, -0.5, 0); ring.rotation.x = Math.PI / 2; g.add(ring);
    // liquid
    const liqMat = fade(M.liquid(0xffffff));
    const fill = 0.78;
    g.add(mesh(new THREE.CylinderGeometry(R - 0.035, R - 0.035, Hc * fill, 48), liqMat, 0, yc - Hc / 2 + Hc * fill / 2, 0));
    g.add(mesh(new THREE.CylinderGeometry(R - 0.035, 0.12, 0.4, 48), liqMat, 0, cone.position.y, 0));
    liquids.push({ mat: liqMat, id });
    reg(g, id);
    // level gauge: a sight tube on the front of the shell, read by the control system
    const gauge = new THREE.Group(); gauge.position.set(0.34, yc, R + 0.07);
    gauge.add(mesh(new THREE.CylinderGeometry(0.024, 0.024, Hc * 0.86, 12, 1, true), fade(M.glass())));
    gauge.add(mesh(new THREE.CylinderGeometry(0.016, 0.016, Hc * 0.86 * fill, 10), liqMat, 0, -Hc * 0.86 * (1 - fill) / 2, 0));
    [-Hc * 0.43, Hc * 0.43].forEach(y => gauge.add(mesh(new THREE.BoxGeometry(0.07, 0.05, 0.1), fade(M.steelPolished()), 0, y, -0.03)));
    gauge.traverse(c => { c.userData.component = 'sensor'; }); g.add(gauge); pickables.push(gauge);
    parts.tanks.add(g);
    // coloured halo + practical light so the electrolyte tints the steel around it
    const halo = new THREE.Sprite(fade(M.halo(0xffffff, 0.22))); halo.position.set(x, yc - 0.1, 0); halo.scale.set(4.2, 4.2, 1); parts.lighting.add(halo); halos.push({ sprite: halo, id });
    if (!mobile) { const pl = new THREE.PointLight(0xffffff, 0, 6, 2); pl.position.set(x * 0.9, 0.2, 1.1); parts.lighting.add(pl); tankLights.push({ light: pl, id }); }
    return g;
  }
  tank(-3.4, 'tank_pos'); tank(3.4, 'tank_neg');

  // --- pumps ----------------------------------------------------------------------
  const fans = [];
  function pump(x, hex, dir) {
    const g = new THREE.Group(); g.position.set(x, -0.8, 0);
    const motor = mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.42, 28).rotateZ(Math.PI / 2), fade(M.paint(hex)), dir * 0.1, 0, 0); g.add(motor);
    [-0.06, 0.04, 0.14, 0.24].forEach(dx => { const rib = mesh(new THREE.TorusGeometry(0.165, 0.012, 6, 28), fade(M.paint(hex)), dir * dx, 0, 0); rib.rotation.y = Math.PI / 2; g.add(rib); });
    g.add(mesh(new THREE.BoxGeometry(0.3, 0.2, 0.36), fade(M.paint(hex)), dir * 0.1, -0.15, 0));
    g.add(mesh(new THREE.BoxGeometry(0.12, 0.08, 0.12), fade(M.steelDark()), dir * 0.1, 0.19, 0));               // terminal box
    g.add(mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.16, 32).rotateZ(Math.PI / 2), fade(M.steel()), -dir * 0.2, 0, 0));   // volute
    g.add(mesh(new THREE.CylinderGeometry(0.205, 0.205, 0.03, 32).rotateZ(Math.PI / 2), fade(M.steelPolished()), -dir * 0.11, 0, 0)); // coupling flange
    const fan = mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.03, 8).rotateZ(Math.PI / 2), fade(M.steelDark()), dir * 0.33, 0, 0); g.add(fan); fans.push(fan);
    g.add(mesh(new THREE.BoxGeometry(0.6, 0.08, 0.5), fade(M.steelDark()), 0, -0.24, 0));
    g.add(mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.2, 16), fade(M.steel()), -dir * 0.2, 0.22, 0));
    g.add(mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.1, 16).rotateZ(Math.PI / 2), fade(M.steel()), -dir * 0.33, 0, 0));
    reg(g, 'pump'); parts.pumps.add(g); return g;
  }
  pump(-2.1, 0x2452d9, 1); pump(2.1, 0x2da84a, -1);

  // --- power conversion cabinet, HMI and DC busbars ---------------------------------
  const cab = new THREE.Group(); cab.position.set(-0.3, -0.15, -2.2);
  cab.add(mesh(new THREE.BoxGeometry(2.8, 1.9, 0.8), [M.paint(0x9aa0a8), M.paint(0x9aa0a8), M.paint(0xb0b5bc), M.paint(0x6e737a), M.cabinet(), M.paint(0x9aa0a8)].map(m => fade(m))));
  cab.add(mesh(new THREE.BoxGeometry(2.6, 0.1, 0.7), fade(M.steelDark()), 0, -1.0, 0));
  cab.add(mesh(new THREE.BoxGeometry(2.7, 0.03, 0.02), fade(M.glow(0x26d9e3, 1.4)), 0, 0.86, 0.405));                    // status strip
  [-0.93, 0, 0.93].forEach(x => cab.add(mesh(new THREE.BoxGeometry(0.025, 0.3, 0.03), fade(M.steelPolished()), x + 0.38, 0, 0.415))); // door handles
  cab.add(mesh(new THREE.BoxGeometry(2.4, 0.08, 0.5), fade(M.steelDark()), 0, 0.99, 0));                                  // cable tray
  reg(cab, 'cabinet'); parts.cabinet.add(cab);
  const hmi = new THREE.Group(); hmi.position.set(2.0, -0.35, -2.2);
  hmi.add(mesh(new THREE.BoxGeometry(0.9, 1.2, 0.5), fade(M.paint(0xb3b8bf))));
  hmi.add(mesh(new THREE.PlaneGeometry(0.5, 0.32), fade(M.glow(0x1d4f9a, 0.9)), 0, 0.25, 0.251));
  [[-0.2, 0x3ddc5f], [-0.08, 0xff4242], [0.04, 0x3ddc5f], [0.16, 0xffb020]].forEach(([x, c]) => hmi.add(mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 16).rotateX(Math.PI / 2), fade(M.glow(c, 0.8)), x, -0.1, 0.255)));
  [[0xff4a3d, 0.86], [0xffb020, 0.96], [0x3ddc5f, 1.06]].forEach(([c, y]) => hmi.add(mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.1, 16), fade(M.glow(c, 0.9)), 0.25, y, 0)));
  reg(hmi, 'cabinet'); parts.cabinet.add(hmi);
  // busbar cables: left collector is the negative terminal (black), right the positive (red)
  const busbars = [];
  [[-1, 0.22, 0x1c1f24], [1, -0.22, 0xc23b2e]].forEach(([s, z, hex]) => {
    const pts = [[s * 0.56, 0.72, z], [s * 0.56, 1.08, z], [s * 0.56, 1.08, -2.0], [s * 0.5 - 0.3, 0.86, -2.0]];
    const curve = roundedPolyline(pts, 0.12); busbars.push({ curve, side: s });
    const c = mesh(new THREE.TubeGeometry(curve, 48, 0.028, 10, false), fade(M.polymer(hex))); c.userData.component = 'cabinet'; c.castShadow = shadows; parts.cabinet.add(c); pickables.push(c);
  });

  // --- pipes + particle flows -------------------------------------------------------
  const flows = [];
  function pipe(points, side) {
    const curve = roundedPolyline(points, 0.16);
    const mat = fade(M.pipe(0xffffff));
    const tube = mesh(new THREE.TubeGeometry(curve, 64, 0.05, 14, false), mat); tube.castShadow = shadows; tube.userData.component = 'pipe'; parts.pipes.add(tube); pickables.push(tube);
    // union collars at both ends
    [0, 1].forEach(u => { const p = curve.getPointAt(u), d = curve.getTangentAt(u); const col = along(mesh(new THREE.CylinderGeometry(0.068, 0.068, 0.05, 18), fade(M.steelPolished()), p.x, p.y, p.z), d); col.userData.component = 'pipe'; parts.pipes.add(col); });
    const n = particlesPer; const pos = new Float32Array(n * 3); const off = new Float32Array(n);
    for (let i = 0; i < n; i++) off[i] = i / n;
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pm = new THREE.PointsMaterial({ size: 0.045, map: opts.glow || null, color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true });
    const pts = new THREE.Points(geo, pm); pts.frustumCulled = false; parts.pipes.add(pts);
    flows.push({ curve, pipeMat: mat, pts, pm, off, side, len: curve.getLength() });
    return curve;
  }
  // positive loop (left, blue→yellow) and negative loop (right, green→violet):
  // tank → pump → stack lower port; stack upper port → tank
  const L = (p) => p, Rr = (p) => p.map(([x, y, z]) => [-x, y, z]);
  const supplyA = [[-3.4, -0.95, 0], [-3.4, -1.0, 0], [-2.6, -1.0, 0], [-2.6, -0.8, 0], [-2.37, -0.8, 0]];
  const supplyB = [[-2.3, -0.6, 0], [-2.3, -0.3, 0], [-1.6, -0.3, 0], [-1.05, -0.3, 0]];
  const ret = [[-1.05, 0.3, 0], [-1.7, 0.3, 0], [-1.7, 1.6, 0], [-3.15, 1.6, 0], [-3.15, 1.4, 0]];
  const curves = {
    pos: [pipe(L(supplyA), 'pos'), pipe(L(supplyB), 'pos'), pipe(L(ret), 'pos')],
    neg: [pipe(Rr(supplyA), 'neg'), pipe(Rr(supplyB), 'neg'), pipe(Rr(ret), 'neg')],
  };

  // --- valves and instruments ------------------------------------------------------
  const inst = (obj, id) => { obj.traverse(c => { c.userData.component = id; c.castShadow = shadows; }); parts.instruments.add(obj); pickables.push(obj); return obj; };
  [-1, 1].forEach(s => {
    const hex = s < 0 ? 0x2452d9 : 0x2da84a;
    // globe valve with handwheel on the return riser
    const gv = new THREE.Group(); gv.position.set(s * 1.7, 1.0, 0);
    const body = mesh(new THREE.SphereGeometry(0.095, 20, 14), fade(M.steel())); body.scale.set(1, 1.25, 1); gv.add(body);
    gv.add(mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.16, 8).rotateZ(Math.PI / 2), fade(M.steelPolished()), s * 0.13, 0, 0));
    const wheel = mesh(new THREE.TorusGeometry(0.1, 0.016, 8, 24), fade(M.paint(hex)), s * 0.2, 0, 0); wheel.rotation.y = Math.PI / 2; gv.add(wheel);
    [0, 1, 2].forEach(i => { const spoke = mesh(new THREE.BoxGeometry(0.012, 0.19, 0.012), fade(M.paint(hex)), s * 0.2, 0, 0); spoke.rotation.x = i * Math.PI / 3; gv.add(spoke); });
    inst(gv, 'valve');
    // quarter-turn ball valve on the tank outlet
    const bv = new THREE.Group(); bv.position.set(s * 3.0, -1.0, 0);
    bv.add(mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.16, 16).rotateZ(Math.PI / 2), fade(M.steel())));
    bv.add(mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.08, 8), fade(M.steelPolished()), 0, 0.09, 0));
    bv.add(mesh(new THREE.BoxGeometry(0.2, 0.02, 0.035), fade(M.paint(0xd43d2f)), s * 0.06, 0.135, 0));
    inst(bv, 'valve');
    // electromagnetic flow meter on the stack supply line
    const fm = new THREE.Group(); fm.position.set(s * 1.72, -0.3, 0);
    fm.add(mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.2, 20).rotateZ(Math.PI / 2), fade(M.steelPolished())));
    fm.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.09, 10), fade(M.steelDark()), 0, 0.11, 0));
    fm.add(mesh(new THREE.BoxGeometry(0.15, 0.11, 0.1), fade(M.paint(0x2c3340)), 0, 0.2, 0));
    fm.add(mesh(new THREE.PlaneGeometry(0.11, 0.06), fade(M.glow(0x36e0a0, 1.1)), 0, 0.2, 0.051));
    inst(fm, 'sensor');
    // pressure gauge on the pump discharge
    const pg = new THREE.Group(); pg.position.set(s * 2.3, -0.42, 0);
    pg.add(mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.13, 8).rotateX(Math.PI / 2), fade(M.steelPolished()), 0, 0, 0.08));
    const dial = mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.03, 28).rotateX(Math.PI / 2), [fade(M.steelPolished()), fade(M.dial()), fade(M.steelPolished())], 0, 0, 0.16); pg.add(dial);
    inst(pg, 'sensor');
    // temperature probe on the return riser
    const tp = new THREE.Group(); tp.position.set(s * 1.7, 0.62, 0);
    tp.add(mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.14, 8).rotateX(Math.PI / 2), fade(M.steelPolished()), 0, 0, 0.09));
    tp.add(mesh(new THREE.BoxGeometry(0.06, 0.06, 0.05), fade(M.paint(0x2c3340)), 0, 0, 0.18));
    inst(tp, 'sensor');
  });

  // --- site lighting: two masts whose beams read as light shafts through the air -----
  [[-4.9, -2.9], [4.9, -2.9]].forEach(([x, z]) => {
    const pole = mesh(new THREE.CylinderGeometry(0.045, 0.06, 4.6, 10), fade(M.steelDark()), x, 1.1, z); parts.lighting.add(pole);
    const head = mesh(new THREE.BoxGeometry(0.36, 0.08, 0.2), fade(M.steelDark()), x - Math.sign(x) * 0.12, 3.42, z + 0.1); parts.lighting.add(head);
    const lamp = mesh(new THREE.PlaneGeometry(0.3, 0.14), fade(M.glow(0xdcecff, 2.2)), head.position.x, 3.375, head.position.z); lamp.rotation.x = Math.PI / 2; parts.lighting.add(lamp);
    const target = new THREE.Vector3(x * 0.42, -1.1, 0.2), origin = new THREE.Vector3(head.position.x, 3.37, head.position.z);
    const len = origin.distanceTo(target);
    const beam = mesh(new THREE.ConeGeometry(1.7, len, 28, 1, true), fade(M.beam(0x9fc8ff, mobile ? 0.03 : 0.045)));
    beam.geometry.translate(0, -len / 2, 0); beam.position.copy(origin); along(beam, origin.clone().sub(target)); beam.renderOrder = 3; parts.lighting.add(beam);
    const halo = new THREE.Sprite(fade(M.halo(0xcfe4ff, 0.55))); halo.position.copy(origin); halo.scale.set(1.1, 1.1, 1); parts.lighting.add(halo);
  });

  // --- clear spill enclosure around the stack ---------------------------------------------
  const cm = (m) => { m.userData.baseOpacity = m.opacity ?? 1; m.transparent = true; casingMats.push(m); return m; };
  const CX = 0.9, CY0 = -0.84, CY1 = 0.92, CZ = 0.68, bar = 0.028;
  const frame = new THREE.Group(); const barMat = cm(M.steelDark());
  [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([a, b]) => {
    frame.add(mesh(new THREE.BoxGeometry(bar, CY1 - CY0, bar), barMat, a * CX, (CY0 + CY1) / 2, b * CZ));
    frame.add(mesh(new THREE.BoxGeometry(2 * CX, bar, bar), barMat, 0, a < 0 ? CY0 : CY1, b * CZ));
    frame.add(mesh(new THREE.BoxGeometry(bar, bar, 2 * CZ), barMat, a * CX, b < 0 ? CY0 : CY1, 0));
  });
  frame.traverse(c => { c.userData.component = 'casing'; }); casing.add(frame); pickables.push(frame);
  const glassMat = cm(M.casing());
  const pane = (w, h, x, y, z, ry = 0, rx = 0) => { const p = mesh(new THREE.PlaneGeometry(w, h), glassMat, x, y, z); p.rotation.set(rx, ry, 0); p.renderOrder = 2; casing.add(p); };
  pane(2 * CX, CY1 - CY0, 0, (CY0 + CY1) / 2, CZ); pane(2 * CX, CY1 - CY0, 0, (CY0 + CY1) / 2, -CZ);
  pane(2 * CZ, CY1 - CY0, CX, (CY0 + CY1) / 2, 0, Math.PI / 2); pane(2 * CZ, CY1 - CY0, -CX, (CY0 + CY1) / 2, 0, Math.PI / 2);
  pane(2 * CX, 2 * CZ, 0, CY1, 0, 0, Math.PI / 2);

  // --- label anchors for the balance-of-plant chapter ---------------------------------------
  const anchor = (x, y, z) => { const o = new THREE.Object3D(); o.position.set(x, y, z); group.add(o); return o; };
  const labelSpecs = [
    { object: anchor(-3.4, 1.5, 0.3), text: 'Positive tank', sub: 'VO²⁺ blue → VO₂⁺ yellow', dir: 'up', id: 'tank_pos', key: 'plant_tank_pos' },
    { object: anchor(-2.1, -0.62, 0.3), text: 'Circulation pump', sub: 'magnetic drive', dir: 'down', id: 'pump', key: 'plant_pump' },
    { object: anchor(-0.3, 0.86, -1.8), text: 'Power conversion', sub: 'DC ⇄ AC · controls', dir: 'up', id: 'cabinet', key: 'plant_pcs' },
    { object: anchor(1.72, -0.1, 0.1), text: 'Flow meter', sub: 'sensors feed the BMS', dir: 'down', id: 'sensor', key: 'plant_sensor' },
    { object: anchor(1.9, 1.0, 0.1), text: 'Isolation valve', sub: 'one per line', dir: 'up', id: 'valve', key: 'plant_valve' },
    { object: anchor(3.4, 1.5, 0.3), text: 'Negative tank', sub: 'V³⁺ green → V²⁺ violet', dir: 'up', id: 'tank_neg', key: 'plant_tank_neg' },
  ];

  const cNeg = new THREE.Color(), cPos = new THREE.Color(), cTmp = new THREE.Color(), v = new THREE.Vector3();
  let time = 0;
  function update(state, dt) {
    time += dt;
    negColor(state.soc, cNeg); posColor(state.soc, cPos);
    liquids.forEach(l => { const c = l.id === 'tank_neg' ? cNeg : cPos; l.mat.color.copy(c); l.mat.emissive.copy(c); });
    const o = state.periphery;
    periphery.visible = o > 0.015;
    for (const m of fadeMats) m.opacity = m.userData.baseOpacity * o;
    halos.forEach(h => h.sprite.material.color.copy(h.id === 'tank_neg' ? cNeg : cPos));
    tankLights.forEach(t => { t.light.color.copy(t.id === 'tank_neg' ? cNeg : cPos); t.light.intensity = 2.2 * o; });
    const co = (state.casing ?? 1) * (state.casingShow ?? 1);
    casing.visible = co > 0.015;
    for (const m of casingMats) m.opacity = m.userData.baseOpacity * co;
    const speed = state.flowSystem;
    fans.forEach(f => { f.rotation.x += dt * 18 * speed; });
    for (const f of flows) {
      const c = f.side === 'neg' ? cNeg : cPos;
      f.pipeMat.color.copy(c).lerp(cTmp.set(0xffffff), 0.06); f.pipeMat.emissive.copy(c);
      f.pm.color.copy(c).lerp(cTmp.set(0xffffff), 0.5); f.pm.opacity = speed * o;
      if (speed * o < 0.01 || !parts.pipes.visible) { f.pts.visible = false; continue; }
      f.pts.visible = true;
      const arr = f.pts.geometry.attributes.position.array;
      const adv = (time * 0.35 * speed) / f.len; // ≈ constant linear speed
      for (let i = 0; i < f.off.length; i++) { const u = (f.off[i] + adv) % 1; f.curve.getPointAt(u, v); arr[i * 3] = v.x; arr[i * 3 + 1] = v.y; arr[i * 3 + 2] = v.z; }
      f.pts.geometry.attributes.position.needsUpdate = true;
    }
  }
  /** Show or hide a named sub-assembly (exploration lab). */
  function setPart(name, visible) { if (parts[name]) parts[name].visible = visible; if (name === 'tanks') parts.lighting.children.forEach(c => { if (c.isSprite && halos.some(h => h.sprite === c) || c.isPointLight) c.visible = visible; }); }
  return { group, pickables, update, labelSpecs, parts, setPart, curves, busbars, fixed };
}
