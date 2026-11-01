import * as THREE from 'three';

function roundedRect(target, x, y, w, h, r) {
  target.moveTo(x + r, y);
  target.lineTo(x + w - r, y);
  target.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  target.lineTo(x + w, y + h - r);
  target.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  target.lineTo(x + r, y + h);
  target.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  target.lineTo(x, y + r);
  target.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  return target;
}

/**
 * Plate with rounded corners, optional bolt holes and a central window.
 * Thickness is along X (stack axis); width along Z; height along Y.
 * holes: [[z, y, radius]]  window: { w, h, r }
 */
export function plateGeometry({ w, h, t, r = 0.07, holes = [], window = null, bevel = 0.004, segments = 10 }) {
  const shape = roundedRect(new THREE.Shape(), -w / 2, -h / 2, w, h, r);
  holes.forEach(([z, y, rad]) => { const p = new THREE.Path(); p.absarc(-z, y, rad, 0, Math.PI * 2, true); shape.holes.push(p); });
  if (window) { shape.holes.push(roundedRect(new THREE.Path(), -window.w / 2, -window.h / 2, window.w, window.h, window.r || 0.04)); }
  const geo = new THREE.ExtrudeGeometry(shape, { depth: t, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2, curveSegments: segments });
  geo.translate(0, 0, -t / 2);
  geo.rotateY(Math.PI / 2);
  geo.computeVertexNormals();
  return geo;
}

export function hexNutGeometry(r = 0.04, h = 0.035) { const g = new THREE.CylinderGeometry(r, r, h, 6); g.rotateZ(Math.PI / 2); return g; }
export function rodGeometry(r = 0.016) { const g = new THREE.CylinderGeometry(r, r, 1, 14); g.rotateZ(Math.PI / 2); return g; }

/** Rounded polyline as a CurvePath: straight runs with quadratic-bezier corners. */
export function roundedPolyline(points, bend = 0.14) {
  const v = points.map(p => new THREE.Vector3(...p));
  const path = new THREE.CurvePath();
  let prev = v[0].clone();
  for (let i = 1; i < v.length - 1; i++) {
    const a = v[i], din = a.clone().sub(v[i - 1]), dout = v[i + 1].clone().sub(a);
    const rIn = Math.min(bend, din.length() / 2), rOut = Math.min(bend, dout.length() / 2);
    const pb = a.clone().sub(din.normalize().multiplyScalar(rIn));
    const pa = a.clone().add(dout.normalize().multiplyScalar(rOut));
    if (pb.distanceTo(prev) > 1e-5) path.add(new THREE.LineCurve3(prev, pb));
    path.add(new THREE.QuadraticBezierCurve3(pb, a, pa));
    prev = pa;
  }
  path.add(new THREE.LineCurve3(prev, v[v.length - 1].clone()));
  return path;
}
