import * as THREE from 'three';

function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function mulberry(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

function tex(c, srgb = false) {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Brushed-metal roughness map (grey streaks). */
export function brushedTexture() {
  const c = canvas(512, 512); const g = c.getContext('2d'); const r = mulberry(7);
  g.fillStyle = '#7a7a7a'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 2600; i++) {
    const y = r() * 512, l = 40 + r() * 300, x = r() * 512;
    g.strokeStyle = `rgba(${r() > 0.5 ? 160 : 60},${r() > 0.5 ? 160 : 60},${r() > 0.5 ? 160 : 60},${0.12 + r() * 0.2})`;
    g.lineWidth = 0.6 + r(); g.beginPath(); g.moveTo(x, y); g.lineTo(x + l, y + (r() - 0.5) * 0.6); g.stroke();
  }
  const t = tex(c); t.repeat.set(2, 2); return t;
}

/** Serpentine flow field: colour map, bump map and the path for the flow particles. */
export const SERP = { W: 512, H: 724, margin: 54, passes: 11, groove: 26 };
export function serpentinePoints() {
  const { W, H, margin: m, passes } = SERP; const pts = [];
  const pitch = (H - 2 * m) / (passes - 1);
  for (let i = 0; i < passes; i++) {
    const y = m + i * pitch; const dir = i % 2 === 0;
    pts.push([dir ? m : W - m, y], [dir ? W - m : m, y]);
  }
  return pts;
}
export function serpentineTextures() {
  const { W, H, groove } = SERP; const pts = serpentinePoints(); const r = mulberry(3);
  const col = canvas(W, H); const g = col.getContext('2d');
  g.fillStyle = '#2b2e33'; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(${r() > 0.5 ? 255 : 0},${r() > 0.5 ? 255 : 0},${r() > 0.5 ? 255 : 0},0.03)`; g.fillRect(r() * W, r() * H, 2, 2); }
  const draw = (ctx, color, width) => {
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
  };
  draw(g, '#3d4148', groove + 8); draw(g, '#15171a', groove); draw(g, '#1d2024', groove - 10);
  // inlet / outlet
  g.fillStyle = '#0d0e10';
  [[pts[0][0], pts[0][1]], [pts[pts.length - 1][0], pts[pts.length - 1][1]]].forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 22, 0, Math.PI * 2); g.fill(); });
  // bump (bright = high)
  const bmp = canvas(W, H); const b = bmp.getContext('2d');
  b.fillStyle = '#9a9a9a'; b.fillRect(0, 0, W, H);
  draw(b, '#6a6a6a', groove + 8); draw(b, '#202020', groove);
  const map = tex(col, true); map.wrapS = map.wrapT = THREE.ClampToEdgeWrapping;
  const bump = tex(bmp); bump.wrapS = bump.wrapT = THREE.ClampToEdgeWrapping;
  return { map, bump, points: pts };
}

/** Carbon felt: tangled fibres. */
export function feltTexture() {
  const c = canvas(512, 512); const g = c.getContext('2d'); const r = mulberry(11);
  g.fillStyle = '#17191d'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 5200; i++) {
    const x = r() * 512, y = r() * 512, a = r() * Math.PI * 2, l = 10 + r() * 40, k = 70 + r() * 90;
    g.strokeStyle = `rgba(${k},${k + 4},${k + 10},${0.35 + r() * 0.4})`; g.lineWidth = 0.8 + r() * 1.4;
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a + 1) * l * 0.5, y + Math.sin(a + 1) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
  const t = tex(c, true); t.repeat.set(1.5, 1.5); return t;
}

/** Louvered grey cabinet front. */
export function louverTexture() {
  const c = canvas(512, 384); const g = c.getContext('2d');
  g.fillStyle = '#b9bec5'; g.fillRect(0, 0, 512, 384);
  g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = 2;
  for (let x = 0; x < 3; x++) { g.strokeRect(10 + x * 168, 10, 156, 364); }
  g.fillStyle = '#6e737a';
  for (let x = 0; x < 3; x++) for (let band = 0; band < 2; band++) for (let i = 0; i < 9; i++) g.fillRect(34 + x * 168, 30 + band * 230 + i * 10, 108, 4);
  g.fillStyle = '#3a3e45'; for (let x = 0; x < 3; x++) g.fillRect(150 + x * 168, 180, 6, 26);
  return tex(c, true);
}

/** Solar panel cell grid. */
export function panelTexture() {
  const c = canvas(256, 160); const g = c.getContext('2d');
  g.fillStyle = '#0d1d44'; g.fillRect(0, 0, 256, 160);
  g.strokeStyle = 'rgba(180,200,255,0.35)'; g.lineWidth = 1.5;
  for (let x = 0; x <= 256; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 160); g.stroke(); }
  for (let y = 0; y <= 160; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(256, y); g.stroke(); }
  g.strokeStyle = 'rgba(255,255,255,0.6)'; g.lineWidth = 3; g.strokeRect(1, 1, 254, 158);
  return tex(c, true);
}


/** Soft radial glow for additive sprites (halos, light pools). */
export function glowTexture() {
  const c = canvas(128, 128); const g = c.getContext('2d');
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, 'rgba(255,255,255,1)'); grd.addColorStop(0.25, 'rgba(255,255,255,0.55)'); grd.addColorStop(0.6, 'rgba(255,255,255,0.12)'); grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

/** Pressure-gauge face with tick marks and a needle. */
export function dialTexture() {
  const c = canvas(128, 128); const g = c.getContext('2d');
  g.fillStyle = '#f2f4f7'; g.beginPath(); g.arc(64, 64, 62, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#1b2230'; g.lineWidth = 3;
  for (let i = 0; i <= 10; i++) { const a = Math.PI * 0.75 + i * Math.PI * 1.5 / 10; g.beginPath(); g.moveTo(64 + Math.cos(a) * 46, 64 + Math.sin(a) * 46); g.lineTo(64 + Math.cos(a) * 56, 64 + Math.sin(a) * 56); g.stroke(); }
  g.strokeStyle = '#2bb673'; g.lineWidth = 6; g.beginPath(); g.arc(64, 64, 40, Math.PI * 0.75, Math.PI * 1.6); g.stroke();
  g.strokeStyle = '#e5484d'; g.beginPath(); g.arc(64, 64, 40, Math.PI * 1.9, Math.PI * 2.25); g.stroke();
  g.strokeStyle = '#d9361e'; g.lineWidth = 4; g.beginPath(); g.moveTo(64, 64); g.lineTo(64 + Math.cos(Math.PI * 1.35) * 44, 64 + Math.sin(Math.PI * 1.35) * 44); g.stroke();
  g.fillStyle = '#1b2230'; g.beginPath(); g.arc(64, 64, 6, 0, Math.PI * 2); g.fill();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}

/** Poured-concrete pad: mottled grey with expansion joints. */
export function concreteTexture() {
  const c = canvas(512, 512); const g = c.getContext('2d'); const r = mulberry(21);
  g.fillStyle = '#8f96a0'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 14000; i++) { const k = 110 + r() * 80; g.fillStyle = `rgba(${k},${k + 2},${k + 6},${0.05 + r() * 0.1})`; const s = 1 + r() * 5; g.fillRect(r() * 512, r() * 512, s, s); }
  g.strokeStyle = 'rgba(30,34,42,0.55)'; g.lineWidth = 2;
  for (let i = 0; i <= 512; i += 128) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 512); g.moveTo(0, i); g.lineTo(512, i); g.stroke(); }
  const t = tex(c, true); t.repeat.set(4, 4); return t;
}

/** Corrugated battery-container wall with a door outline and vents. */
export function containerTexture() {
  const c = canvas(512, 256); const g = c.getContext('2d');
  g.fillStyle = '#c7ccd3'; g.fillRect(0, 0, 512, 256);
  for (let x = 0; x < 512; x += 16) { g.fillStyle = 'rgba(0,0,0,0.10)'; g.fillRect(x, 0, 6, 256); g.fillStyle = 'rgba(255,255,255,0.10)'; g.fillRect(x + 8, 0, 4, 256); }
  g.strokeStyle = 'rgba(20,24,32,0.45)'; g.lineWidth = 3; g.strokeRect(24, 30, 150, 210); g.strokeRect(190, 30, 150, 210);
  g.fillStyle = '#5d646e'; for (let i = 0; i < 8; i++) g.fillRect(376, 44 + i * 12, 110, 5);
  g.fillStyle = '#26d9e3'; g.fillRect(376, 170, 110, 6);
  return tex(c, true);
}

export function buildTextures() {
  return { brushed: brushedTexture(), serp: serpentineTextures(), felt: feltTexture(), louver: louverTexture(), panel: panelTexture(), glow: glowTexture(), dial: dialTexture(), concrete: concreteTexture(), container: containerTexture() };
}
