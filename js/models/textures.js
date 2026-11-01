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

export function buildTextures() {
  return { brushed: brushedTexture(), serp: serpentineTextures(), felt: feltTexture(), louver: louverTexture(), panel: panelTexture() };
}
