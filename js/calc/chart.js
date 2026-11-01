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

export function lineChart(el, cfg) {
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
  return { update(next) { data = { ...data, ...next }; draw(); } };
}

export function legend(el, series) { el.innerHTML = series.map(s => `<span><i style="background:${s.color}"></i>${s.name}</span>`).join(''); }
export const fmt = {
  n: (d = 0) => v => Number(v).toLocaleString('en-US', { maximumFractionDigits: d, minimumFractionDigits: d }),
  pct: v => `${(v * 100).toFixed(0)} %`,
};
export function readInputs(root) { const o = {}; root.querySelectorAll('[data-k]').forEach(i => { o[i.dataset.k] = parseFloat(i.value); const v = i.closest('.field')?.querySelector('.val'); if (v && i.type === 'range') v.textContent = i.value + (i.dataset.unit || ''); }); return o; }
