/**
 * Builds a PDF report in the browser without any library: the report is laid
 * out on canvases (so Latin and CJK text and the on-screen charts print
 * exactly), each page is JPEG-encoded and wrapped by pdfFromJpegs().
 *
 *   const bytes = await makeReport({ title, subtitle, blocks, footer })
 *   blocks: { h } | { p } | { kv: [[k, v]] } | { table: { head, rows } } | { img: canvas, caption }
 */
import { pdfFromJpegs } from '../sim/exporters.js';

const W = 1240, H = 1754, M = 96, INK = '#111827', MUTED = '#5b6677', LINE = '#d7dde6', ACCENT = '#0e7f8c';
const SANS = '"Inter", "Helvetica Neue", Arial, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif';
const font = (px, weight = 400) => `${weight} ${px}px ${SANS}`;

function wrap(ctx, text, maxW) {
  const tokens = String(text).split(/(\s+|(?=[　-鿿＀-￯])|(?<=[　-鿿＀-￯]))/).filter(t => t !== undefined && t !== '');
  const lines = []; let cur = '';
  for (const tok of tokens) {
    if (/^\n+$/.test(tok)) { lines.push(cur); cur = ''; continue; }
    if (ctx.measureText(cur + tok).width > maxW && cur.trim()) { lines.push(cur.trimEnd()); cur = tok.trimStart(); } else cur += tok;
  }
  if (cur.trim()) lines.push(cur.trimEnd());
  return lines;
}
const strip = (html) => String(html ?? '').replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

export async function makeReport({ title, subtitle = '', blocks = [], footer = '' }) {
  const pages = []; let cv, ctx, y;
  const newPage = () => {
    cv = document.createElement('canvas'); cv.width = W; cv.height = H; ctx = cv.getContext('2d');
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H); ctx.textBaseline = 'top'; pages.push(cv); y = M;
    if (pages.length > 1) { ctx.fillStyle = MUTED; ctx.font = font(18); ctx.fillText(strip(title), M, 44); y = M; }
  };
  const need = (h) => { if (y + h > H - M - 30) newPage(); };
  newPage();
  ctx.fillStyle = ACCENT; ctx.fillRect(M, y, 64, 8); y += 26;
  ctx.fillStyle = INK; ctx.font = font(44, 700); wrap(ctx, strip(title), W - 2 * M).forEach(l => { ctx.fillText(l, M, y); y += 54; });
  if (subtitle) { ctx.fillStyle = MUTED; ctx.font = font(22); wrap(ctx, strip(subtitle), W - 2 * M).forEach(l => { ctx.fillText(l, M, y); y += 30; }); }
  y += 20;
  for (const b of blocks) {
    if (b.h) { need(70); y += 14; ctx.fillStyle = INK; ctx.font = font(28, 700); ctx.fillText(strip(b.h), M, y); y += 38; ctx.fillStyle = LINE; ctx.fillRect(M, y, W - 2 * M, 2); y += 14; }
    else if (b.p) { ctx.font = font(20); const lines = wrap(ctx, strip(b.p), W - 2 * M); lines.forEach(l => { need(28); ctx.fillStyle = b.muted ? MUTED : INK; ctx.font = font(20); ctx.fillText(l, M, y); y += 28; }); y += 10; }
    else if (b.kv) {
      const colW = (W - 2 * M) / 2;
      for (let i = 0; i < b.kv.length; i += 2) {
        need(34);
        [b.kv[i], b.kv[i + 1]].forEach((pair, c) => { if (!pair) return; const x = M + c * colW; ctx.font = font(18); ctx.fillStyle = MUTED; let k = strip(pair[0]); while (ctx.measureText(k).width > colW * 0.58 && k.length > 4) k = k.slice(0, -2); ctx.fillText(k, x, y); ctx.fillStyle = INK; ctx.font = font(18, 600); ctx.textAlign = 'right'; ctx.fillText(strip(pair[1]), x + colW - 24, y); ctx.textAlign = 'left'; });
        y += 30; ctx.fillStyle = '#eef1f5'; ctx.fillRect(M, y - 4, W - 2 * M, 1);
      }
      y += 12;
    } else if (b.table) {
      const { head, rows } = b.table, n = head.length, cw = (W - 2 * M) / n;
      const drawHead = () => { need(40); ctx.fillStyle = '#eef1f5'; ctx.fillRect(M, y, W - 2 * M, 32); ctx.fillStyle = INK; ctx.font = font(16, 700); head.forEach((hd, i) => { ctx.textAlign = i ? 'right' : 'left'; let s = strip(hd); while (ctx.measureText(s).width > cw - 12 && s.length > 3) s = s.slice(0, -1); ctx.fillText(s, i ? M + (i + 1) * cw - 8 : M + 8, y + 8); }); ctx.textAlign = 'left'; y += 36; };
      drawHead();
      rows.forEach(r => { if (y + 26 > H - M - 30) { newPage(); drawHead(); } ctx.fillStyle = INK; ctx.font = font(16); r.forEach((cell, i) => { ctx.textAlign = i ? 'right' : 'left'; ctx.fillText(strip(cell), i ? M + (i + 1) * cw - 8 : M + 8, y + 4); }); ctx.textAlign = 'left'; y += 26; ctx.fillStyle = '#eef1f5'; ctx.fillRect(M, y - 2, W - 2 * M, 1); });
      y += 14;
    } else if (b.img) {
      const src = b.img; if (!src.width || !src.height) continue;
      const w = W - 2 * M, h = Math.min(520, w * src.height / src.width);
      need(h + (b.caption ? 44 : 16));
      ctx.fillStyle = '#0d1320'; const r = 14; ctx.beginPath(); ctx.moveTo(M + r, y); ctx.arcTo(M + w, y, M + w, y + h, r); ctx.arcTo(M + w, y + h, M, y + h, r); ctx.arcTo(M, y + h, M, y, r); ctx.arcTo(M, y, M + w, y, r); ctx.closePath(); ctx.fill();
      const iw = h * src.width / src.height; ctx.drawImage(src, M + (w - Math.min(w, iw)) / 2 + 10, y + 10, Math.min(w, iw) - 20, h - 20);
      y += h + 8;
      if (b.caption) { ctx.fillStyle = MUTED; ctx.font = font(17); ctx.fillText(strip(b.caption), M, y); y += 28; }
      y += 8;
    }
  }
  pages.forEach((p, i) => { const c = p.getContext('2d'); c.textBaseline = 'top'; c.fillStyle = MUTED; c.font = font(16); c.fillText(strip(footer), M, H - 62); c.textAlign = 'right'; c.fillText(`${i + 1} / ${pages.length}`, W - M, H - 62); c.textAlign = 'left'; });
  const out = [];
  for (const p of pages) { const blob = await new Promise(res => p.toBlob(res, 'image/jpeg', 0.9)); out.push({ jpeg: new Uint8Array(await blob.arrayBuffer()), width: W, height: H }); }
  return pdfFromJpegs(out);
}
