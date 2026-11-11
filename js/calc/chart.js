/**
 * Minimal canvas line chart: one y-axis, thin 2 px lines, recessive grid,
 * crosshair + tooltip on hover. Series colours are assigned by the caller in
 * fixed order (cyan, orange, violet, green).
 */
export const CHART_COLORS = ['#139fae', '#d9711c', '#9d66f5', '#45a157'];

function niceTicks(min, max, n = 5) {
  const span = max - min || 1; const step0 = span / n; const mag = Math.pow(10, Math.floor(Math.log10(step0)));
  const steps = [1, 2, 2.5, 5, 10]; let step = steps.find(s => s * mag >= step0) * mag;
  const start = Math.ceil(min / step) * step; const out = [];
  for (let v = start; v <= max + 1e-9; v += step) out.push(+v.toFixed(10));
  return out;
}


/** Gives a chart container an accessible name taken from the nearest title, if the page did not set one. */
function nameChart(el) {
  if (el.getAttribute('aria-label')) return;
  const title = el.parentElement?.querySelector('.chart-title span, .chart-title, h3, h2') || el.closest('section')?.querySelector('h2, h3');
  if (title) { el.setAttribute('role', 'img'); el.setAttribute('aria-label', title.textContent.trim()); }
}

export function lineChart(el, cfg) {
  nameChart(el);
  const canvas = document.createElement('canvas'); el.appendChild(canvas);
  const tip = document.createElement('div'); tip.className = 'chart__tip'; el.appendChild(tip);
  const ctx = canvas.getContext('2d');
  let data = cfg, hover = null;
  const pad = { l: 56, r: 18, t: 16, b: 38 };
  const fx = (v) => (data.xFormat || (x => x))(v), fy = (v) => (data.yFormat || (y => y))(v);

  function draw() {
    const dpr = window.devicePixelRatio || 1; const w = el.clientWidth || 600, h = el.clientHeight || 300;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
    const series = (data.series || []).filter(s => s.points && s.points.length);
    if (!series.length) return;
    let xmin = Infinity, xmax = -Infinity, ymin = Infinity, ymax = -Infinity;
    series.forEach(s => s.points.forEach(([x, y]) => { xmin = Math.min(xmin, x); xmax = Math.max(xmax, x); ymin = Math.min(ymin, y); ymax = Math.max(ymax, y); }));
    if (data.yMin != null) ymin = data.yMin; if (data.yMax != null) ymax = data.yMax;
    if (ymax - ymin < 1e-9) { ymax += 1; ymin -= 1; }
    const yt = niceTicks(ymin, ymax, 5); ymin = Math.min(ymin, yt[0]); ymax = Math.max(ymax, yt[yt.length - 1]);
    const X = x => pad.l + (x - xmin) / (xmax - xmin) * (w - pad.l - pad.r);
    const Y = y => h - pad.b - (y - ymin) / (ymax - ymin) * (h - pad.t - pad.b);
    ctx.font = '11px "JetBrains Mono", ui-monospace, monospace'; ctx.fillStyle = '#8291a8'; ctx.strokeStyle = 'rgba(160,180,210,0.12)'; ctx.lineWidth = 1;
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    yt.forEach(t => { const y = Y(t); ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(w - pad.r, y); ctx.stroke(); ctx.fillText(fy(t), pad.l - 8, y); });
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    niceTicks(xmin, xmax, 6).forEach(t => { const x = X(t); ctx.fillText(fx(t), x, h - pad.b + 8); });
    if (data.xLabel) { ctx.fillText(data.xLabel, (pad.l + w - pad.r) / 2, h - 14); }
    if (data.yLabel) { ctx.save(); ctx.translate(12, (pad.t + h - pad.b) / 2); ctx.rotate(-Math.PI / 2); ctx.textBaseline = 'middle'; ctx.fillText(data.yLabel, 0, 0); ctx.restore(); }
    // baseline
    ctx.strokeStyle = 'rgba(160,180,210,0.3)'; ctx.beginPath(); ctx.moveTo(pad.l, Y(Math.max(ymin, Math.min(0, ymax)))); ctx.lineTo(w - pad.r, Y(Math.max(ymin, Math.min(0, ymax)))); ctx.stroke();
    // series
    series.forEach(s => {
      ctx.beginPath(); s.points.forEach(([x, y], i) => i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y)));
      if (s.fill) { ctx.save(); ctx.lineTo(X(s.points[s.points.length - 1][0]), Y(Math.max(ymin, 0))); ctx.lineTo(X(s.points[0][0]), Y(Math.max(ymin, 0))); ctx.closePath(); ctx.fillStyle = s.color; ctx.globalAlpha = 0.12; ctx.fill(); ctx.restore(); ctx.beginPath(); s.points.forEach(([x, y], i) => i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y))); }
      ctx.strokeStyle = s.color; ctx.lineWidth = s.width || 2; ctx.lineJoin = 'round'; ctx.setLineDash(s.dash || []); ctx.stroke(); ctx.setLineDash([]);
    });
    // marker
    if (data.marker != null) { const x = X(data.marker); ctx.strokeStyle = 'rgba(232,237,245,0.35)'; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(x, pad.t); ctx.lineTo(x, h - pad.b); ctx.stroke(); ctx.setLineDash([]); }
    // hover
    if (hover != null) {
      const xv = xmin + (hover - pad.l) / (w - pad.l - pad.r) * (xmax - xmin);
      if (xv >= xmin && xv <= xmax) {
        const x = X(xv); ctx.strokeStyle = 'rgba(232,237,245,0.25)'; ctx.beginPath(); ctx.moveTo(x, pad.t); ctx.lineTo(x, h - pad.b); ctx.stroke();
        const rows = series.map(s => { let best = s.points[0]; for (const p of s.points) if (Math.abs(p[0] - xv) < Math.abs(best[0] - xv)) best = p; ctx.fillStyle = s.color; ctx.beginPath(); ctx.arc(X(best[0]), Y(best[1]), 4, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#0d1320'; ctx.lineWidth = 2; ctx.stroke(); return `<span style="color:${s.color}">●</span> ${s.name}: <b>${fy(best[1])}</b>`; });
        tip.innerHTML = `<div class="muted">${data.xLabel ? data.xLabel + ' ' : ''}${fx(series[0].points.reduce((b, p) => Math.abs(p[0] - xv) < Math.abs(b[0] - xv) ? p : b)[0])}</div>${rows.join('<br>')}`;
        tip.style.left = `${Math.min(Math.max(x, 90), w - 90)}px`; tip.style.top = `${pad.t + 30}px`; tip.classList.add('is-on');
      } else tip.classList.remove('is-on');
    } else tip.classList.remove('is-on');
  }
  el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); hover = e.clientX - r.left; draw(); });
  el.addEventListener('pointerleave', () => { hover = null; draw(); });
  if ('ResizeObserver' in window) new ResizeObserver(() => draw()).observe(el); else window.addEventListener('resize', draw);
  draw();
  return { canvas, update(next) { data = { ...data, ...next }; draw(); } };
}

export function legend(el, series) { el.innerHTML = series.map(s => `<span><i style="background:${s.color}"></i>${s.name}</span>`).join(''); }
export const fmt = {
  n: (d = 0) => v => Number(v).toLocaleString('en-US', { maximumFractionDigits: d, minimumFractionDigits: d }),
  pct: v => `${(v * 100).toFixed(0)} %`,
};
export function readInputs(root) { const o = {}; root.querySelectorAll('[data-k]').forEach(i => { o[i.dataset.k] = parseFloat(i.value); const v = i.closest('.field')?.querySelector('.val'); if (v && i.type === 'range') v.textContent = i.value + (i.dataset.unit || ''); }); return o; }

// ---------------------------------------------------------------------------
// Bar chart (grouped or stacked) and tornado chart. Same visual language as
// lineChart: one axis, recessive grid, labels in text colours, 2 px surface
// gaps between fills, hover tooltip per category.
// ---------------------------------------------------------------------------
function setup(el) {
  const canvas = document.createElement('canvas'); el.appendChild(canvas);
  const tip = document.createElement('div'); tip.className = 'chart__tip'; el.appendChild(tip);
  return { canvas, tip, ctx: canvas.getContext('2d') };
}
function size(el, canvas, ctx) {
  const dpr = window.devicePixelRatio || 1; const w = el.clientWidth || 600, h = el.clientHeight || 300;
  canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
  return { w, h };
}
function roundedBar(ctx, x, y, w, h, r, up = true) {
  r = Math.min(r, Math.abs(w) / 2, Math.abs(h)); ctx.beginPath();
  if (up) { ctx.moveTo(x, y + h); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h); }
  else { ctx.moveTo(x, y); ctx.lineTo(x, y + h - r); ctx.quadraticCurveTo(x, y + h, x + r, y + h); ctx.lineTo(x + w - r, y + h); ctx.quadraticCurveTo(x + w, y + h, x + w, y + h - r); ctx.lineTo(x + w, y); }
  ctx.closePath(); ctx.fill();
}

/**
 * cfg: { categories: [label], series: [{ name, color, values: [number] }], stacked, yLabel, yFormat, yMin }
 */
export function barChart(el, cfg) {
  nameChart(el);
  const { canvas, tip, ctx } = setup(el);
  let data = cfg, hover = -1;
  const pad = { l: 60, r: 14, t: 14, b: 44 };
  const fy = (v) => (data.yFormat || (y => y))(v);
  function draw() {
    const { w, h } = size(el, canvas, ctx);
    const cats = data.categories || [], series = data.series || [];
    if (!cats.length || !series.length) return;
    let ymin = 0, ymax = 0;
    cats.forEach((_, i) => {
      if (data.stacked) { let pos = 0, neg = 0; series.forEach(s => { const v = s.values[i] || 0; if (v >= 0) pos += v; else neg += v; }); ymax = Math.max(ymax, pos); ymin = Math.min(ymin, neg); }
      else series.forEach(s => { ymax = Math.max(ymax, s.values[i] || 0); ymin = Math.min(ymin, s.values[i] || 0); });
    });
    if (data.yMin != null) ymin = Math.min(ymin, data.yMin);
    if (ymax - ymin < 1e-9) ymax = ymin + 1;
    const yt = niceTicks(ymin, ymax, 5); ymin = Math.min(ymin, yt[0]); ymax = Math.max(ymax, yt[yt.length - 1]);
    const Y = y => h - pad.b - (y - ymin) / (ymax - ymin) * (h - pad.t - pad.b);
    const bandW = (w - pad.l - pad.r) / cats.length;
    ctx.font = '11px "JetBrains Mono", ui-monospace, monospace'; ctx.fillStyle = '#8291a8'; ctx.strokeStyle = 'rgba(160,180,210,0.12)'; ctx.lineWidth = 1;
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    yt.forEach(t => { const y = Y(t); ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(w - pad.r, y); ctx.stroke(); ctx.fillText(fy(t), pad.l - 8, y); });
    if (data.yLabel) { ctx.save(); ctx.translate(12, (pad.t + h - pad.b) / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = 'center'; ctx.fillText(data.yLabel, 0, 0); ctx.restore(); }
    ctx.strokeStyle = 'rgba(160,180,210,0.35)'; ctx.beginPath(); ctx.moveTo(pad.l, Y(0)); ctx.lineTo(w - pad.r, Y(0)); ctx.stroke();
    const every = Math.max(1, Math.ceil(cats.length / Math.max(1, Math.floor((w - pad.l - pad.r) / 46))));
    cats.forEach((c, i) => {
      const x0 = pad.l + i * bandW, inner = Math.min(bandW * 0.72, 64), gx = x0 + (bandW - inner) / 2;
      if (i === hover) { ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(x0, pad.t, bandW, h - pad.t - pad.b); }
      if (data.stacked) {
        let pos = 0, neg = 0;
        series.forEach((s, si) => { const v = s.values[i] || 0; if (!v) return; ctx.fillStyle = s.color;
          if (v >= 0) { const y1 = Y(pos + v), y0 = Y(pos); const last = !series.slice(si + 1).some(o => (o.values[i] || 0) > 0); if (last) roundedBar(ctx, gx, y1, inner, y0 - y1 - (pos ? 2 : 0), 4, true); else ctx.fillRect(gx, y1, inner, Math.max(1, y0 - y1 - (pos ? 2 : 0))); pos += v; }
          else { const y0 = Y(neg), y1 = Y(neg + v); ctx.fillRect(gx, y0 + (neg ? 2 : 0), inner, Math.max(1, y1 - y0 - (neg ? 2 : 0))); neg += v; } });
      } else {
        const bw = (inner - 2 * (series.length - 1)) / series.length;
        series.forEach((s, si) => { const v = s.values[i] || 0; ctx.fillStyle = s.color; const x = gx + si * (bw + 2); if (v >= 0) roundedBar(ctx, x, Y(v), bw, Y(0) - Y(v), 4, true); else roundedBar(ctx, x, Y(0), bw, Y(v) - Y(0), 4, false); });
      }
      if (i % every === 0) { ctx.fillStyle = '#8291a8'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillText(String(c), x0 + bandW / 2, h - pad.b + 8); }
    });
    if (data.xLabel) { ctx.fillStyle = '#8291a8'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillText(data.xLabel, (pad.l + w - pad.r) / 2, h - 16); }
    if (hover >= 0 && hover < cats.length) {
      const total = series.reduce((s, x) => s + (x.values[hover] || 0), 0);
      tip.innerHTML = `<div class="muted">${data.xLabel ? data.xLabel + ' ' : ''}${cats[hover]}</div>${series.map(s => `<span style="color:${s.color}">■</span> ${s.name}: <b>${fy(s.values[hover] || 0)}</b>`).join('<br>')}${data.stacked && series.length > 1 ? `<br><span class="muted">Σ</span> <b>${fy(total)}</b>` : ''}`;
      tip.style.left = `${Math.min(Math.max(pad.l + (hover + 0.5) * bandW, 100), w - 100)}px`; tip.style.top = `${pad.t + 34}px`; tip.classList.add('is-on');
    } else tip.classList.remove('is-on');
  }
  el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); const n = (data.categories || []).length; const i = Math.floor((e.clientX - r.left - pad.l) / ((r.width - pad.l - pad.r) / Math.max(1, n))); hover = i >= 0 && i < n ? i : -1; draw(); });
  el.addEventListener('pointerleave', () => { hover = -1; draw(); });
  if ('ResizeObserver' in window) new ResizeObserver(() => draw()).observe(el); else window.addEventListener('resize', draw);
  draw();
  return { canvas, update(next) { data = { ...data, ...next }; draw(); } };
}

/**
 * Tornado chart: one horizontal bar per input, from the result at −x % to the result at +x %.
 * cfg: { rows: [{ label, low, high }], base, format, lowColor, highColor, lowLabel, highLabel }
 */
export function tornadoChart(el, cfg) {
  nameChart(el);
  const { canvas, tip, ctx } = setup(el);
  let data = cfg, hover = -1;
  const pad = { l: 176, r: 20, t: 26, b: 30 };
  const f = (v) => (data.format || (x => x))(v);
  function draw() {
    const { w, h } = size(el, canvas, ctx);
    const rows = data.rows || []; if (!rows.length) return;
    let min = data.base, max = data.base; rows.forEach(r => { min = Math.min(min, r.low, r.high); max = Math.max(max, r.low, r.high); });
    const span = (max - min) || 1; min -= span * 0.08; max += span * 0.08;
    const X = v => pad.l + (v - min) / (max - min) * (w - pad.l - pad.r);
    const rowH = (h - pad.t - pad.b) / rows.length;
    ctx.font = '11px "JetBrains Mono", ui-monospace, monospace';
    ctx.strokeStyle = 'rgba(160,180,210,0.12)'; ctx.fillStyle = '#8291a8'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    niceTicks(min, max, 5).forEach(t => { const x = X(t); ctx.beginPath(); ctx.moveTo(x, pad.t); ctx.lineTo(x, h - pad.b); ctx.stroke(); ctx.fillText(f(t), x, h - pad.b + 8); });
    rows.forEach((r, i) => {
      const y = pad.t + i * rowH + rowH * 0.2, bh = Math.min(26, rowH * 0.6), xb = X(data.base);
      if (i === hover) { ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(0, pad.t + i * rowH, w, rowH); }
      const seg = (v, color) => { const x = X(v); ctx.fillStyle = color; const x0 = Math.min(x, xb), ww = Math.abs(x - xb); if (ww > 0.5) ctx.fillRect(x0 + (x > xb ? 1 : 0), y, Math.max(1, ww - 1), bh); };
      seg(r.low, data.lowColor || CHART_COLORS[0]); seg(r.high, data.highColor || CHART_COLORS[1]);
      ctx.fillStyle = '#b7c2d3'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.font = '12px Inter, system-ui, sans-serif';
      let label = r.label; while (ctx.measureText(label).width > pad.l - 16 && label.length > 4) label = label.slice(0, -2); if (label !== r.label) label += '…';
      ctx.fillText(label, pad.l - 10, y + bh / 2); ctx.font = '11px "JetBrains Mono", ui-monospace, monospace';
    });
    const xb = X(data.base); ctx.strokeStyle = 'rgba(232,237,245,0.6)'; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(xb, pad.t - 6); ctx.lineTo(xb, h - pad.b); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#e8edf5'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'; ctx.fillText(f(data.base), xb, pad.t - 8);
    if (hover >= 0 && rows[hover]) { const r = rows[hover];
      tip.innerHTML = `<div class="muted">${r.label}</div><span style="color:${data.lowColor || CHART_COLORS[0]}">■</span> ${data.lowLabel || '−'}: <b>${f(r.low)}</b><br><span style="color:${data.highColor || CHART_COLORS[1]}">■</span> ${data.highLabel || '+'}: <b>${f(r.high)}</b>`;
      tip.style.left = `${Math.min(Math.max(xb, 110), w - 110)}px`; tip.style.top = `${pad.t + hover * rowH + 30}px`; tip.classList.add('is-on');
    } else tip.classList.remove('is-on');
  }
  el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); const n = (data.rows || []).length; const i = Math.floor((e.clientY - r.top - pad.t) / ((r.height - pad.t - pad.b) / Math.max(1, n))); hover = i >= 0 && i < n ? i : -1; draw(); });
  el.addEventListener('pointerleave', () => { hover = -1; draw(); });
  if ('ResizeObserver' in window) new ResizeObserver(() => draw()).observe(el); else window.addEventListener('resize', draw);
  draw();
  return { canvas, update(next) { data = { ...data, ...next }; draw(); } };
}
