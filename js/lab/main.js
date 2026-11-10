/**
 * Free-exploration 3D laboratory. Reuses the journey's procedural models but
 * hands the camera to the visitor: orbit, zoom, explode, toggle assemblies,
 * click a component to read about it or isolate it, run charge / discharge and
 * follow the electrolyte round its loop.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { env } from '../core/state.js';
import { createScene } from '../core/scene.js';
import { buildTextures } from '../models/textures.js';
import { makeMaterials } from '../models/materials.js';
import { buildStack } from '../models/stack.js';
import { buildSystem } from '../models/system.js';
import { buildGrid } from '../models/grid.js';
import { COMPONENTS, anatomyAnchor } from '../data/components.js';
import { ocv, electrolyteColor } from '../sim/electrochem.js';
import { init as initI18n, t, pillarPath } from '../i18n/index.js';
import { mountChrome } from '../ui/chrome.js';
import { getLevel, onLevel } from '../ui/level.js';
import { initGlossary, autoLink } from '../ui/glossary.js';

await initI18n({ extra: ['labs', 'learn'] });
mountChrome({ active: 'lab', footer: false });
initGlossary(t('learn.glossary', {}));
const L = (k, f = '') => t(`labs.lab.${k}`, f);

const wrap = document.getElementById('stage-wrap'), canvas = document.getElementById('stage');
const info = document.getElementById('info'), hud = document.getElementById('hud'), tip = document.getElementById('tip');
const $ = (id) => document.getElementById(id);

let gl = null;
try { gl = createScene(canvas, env); } catch (err) { console.warn('WebGL unavailable', err); }

// ---------------------------------------------------------------------------------
// Component information panel (works with or without WebGL)
// ---------------------------------------------------------------------------------
const translated = t('components', null);
const partText = (id) => { const p = t(`labs.lab.parts.${id}`, null); return typeof p === 'string' ? t(`labs.lab.parts.${p}`, null) : p; };
let depth = getLevel() === 'beginner' ? 0 : 1;      // 0 = simple, 1 = engineering
let selected = null, isolated = false;
const actions = { isolate: () => {}, focus: () => {}, select: () => {} };

function renderInfo() {
  if (!selected) {
    info.innerHTML = `<div class="eyebrow">${L('title')}</div><h1>${L('emptyTitle')}</h1><div class="lab__empty">${L('empty')}</div>
      <h2>${L('parts_h')}</h2><div style="display:flex;flex-wrap:wrap;gap:6px">${Object.keys(COMPONENTS).map(id => `<button type="button" class="chip" data-pick="${id}" style="cursor:pointer"><i style="color:${COMPONENTS[id].color}"></i>${(translated && translated[id]?.name) || COMPONENTS[id].name}</button>`).join('')}</div>`;
    info.querySelectorAll('[data-pick]').forEach(b => b.addEventListener('click', () => actions.select(b.dataset.pick, true)));
    return;
  }
  const c = { ...COMPONENTS[selected], ...((translated && translated[selected]) || {}) };
  const p = partText(selected) || {};
  const q = (key) => p[key] ? `<div class="q"><h3>${L(key)}</h3><p>${p[key][depth] || p[key][0]}</p></div>` : '';
  info.innerHTML = `<div class="eyebrow">${c.kicker}</div><h1><span class="panel__swatch" style="background:${c.color}"></span>${c.name}</h1>
    <div class="seg" role="group" style="margin:8px 0 14px"><button type="button" data-depth="0" aria-pressed="${depth === 0}">${L('simple')}</button><button type="button" data-depth="1" aria-pressed="${depth === 1}">${L('engineering')}</button></div>
    <div id="info-body">${q('what')}${q('why')}${q('how')}${q('fail')}
    <div class="q"><h3>${L('specs')}</h3><dl>${c.specs.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl></div>
    ${c.facts?.length && depth === 1 ? `<div class="q"><h3>${t('panel.facts', 'Worth knowing')}</h3>${c.facts.map(f => `<p>${f}</p>`).join('')}</div>` : ''}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:14px 0">
      <button type="button" class="btn btn--ghost btn--sm" id="btn-isolate" aria-pressed="${isolated}" ${gl ? '' : 'disabled'}>${isolated ? L('showAll') : L('isolate')}</button>
      <button type="button" class="btn btn--ghost btn--sm" id="btn-focus" ${gl ? '' : 'disabled'}>${L('focus')}</button>
    </div>
    <p class="panel__refs">${L('sources')}: ${c.refs.map(r => `<a href="${pillarPath('references')}#ref-${r}">[${r}]</a>`).join(' ')} · <a href="${pillarPath('anatomy')}#${anatomyAnchor(selected)}">${L('more')}</a></p>
    <button type="button" class="btn btn--ghost btn--sm" id="btn-clear">${L('deselect')}</button>`;
  info.querySelectorAll('[data-depth]').forEach(b => b.addEventListener('click', () => { depth = +b.dataset.depth; renderInfo(); }));
  info.querySelector('#btn-isolate')?.addEventListener('click', () => actions.isolate(!isolated));
  info.querySelector('#btn-focus')?.addEventListener('click', () => actions.focus(selected));
  info.querySelector('#btn-clear').addEventListener('click', () => actions.select(null));
  autoLink(info.querySelector('#info-body'), 6);
}
onLevel(level => { depth = level === 'beginner' ? 0 : 1; renderInfo(); });

// mobile sheets
const dock = $('dock'), openDock = $('open-dock'), openInfo = $('open-info');
function sheet(which) { const d = which === 'dock' && !dock.classList.contains('is-open'), i = which === 'info' && !info.classList.contains('is-open'); dock.classList.toggle('is-open', d); info.classList.toggle('is-open', i); openDock.setAttribute('aria-pressed', String(d)); openInfo.setAttribute('aria-pressed', String(i)); }
openDock.addEventListener('click', () => sheet('dock')); openInfo.addEventListener('click', () => sheet('info'));

if (!gl) {
  // No WebGL: keep the component encyclopedia usable, with a still image instead of the model.
  canvas.remove();
  const fb = document.createElement('div'); fb.className = 'lab__fallback'; fb.innerHTML = `<div><h3>${L('fallbackTitle')}</h3><p>${L('fallback')}</p><a class="btn btn--primary btn--sm" href="${pillarPath('anatomy')}">${L('more')}</a></div>`; wrap.appendChild(fb);
  actions.select = (id) => { selected = id; renderInfo(); if (id) sheet('info'); };
  dock.querySelectorAll('input,button').forEach(el => { el.disabled = true; });
  renderInfo();
} else {
  const { renderer, scene, camera } = gl;
  const T = buildTextures(), M = makeMaterials(T);
  const stack = buildStack(M, T, { shadows: !env.mobile });
  const system = buildSystem(M, { shadows: !env.mobile, mobile: env.mobile, glow: T.glow });
  const site = buildGrid(M, { mobile: env.mobile, glow: T.glow });
  scene.add(stack.group, system.group, site.group);

  const S = { explode: 0, reveal: 0, periphery: 1, casing: 1, casingShow: 1, flowSystem: 0, soc: 0.5, grid: 1, flowSolar: 0, flowGrid: 0 };
  let mode = 0, flowOn = false, siteOn = true;

  // --- camera -------------------------------------------------------------------
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true; controls.dampingFactor = 0.08; controls.minDistance = 0.5; controls.maxDistance = 60; controls.maxPolarAngle = Math.PI / 2 - 0.03; controls.zoomSpeed = 0.9;
  const VIEWS = { system: [[7.6, 4.4, 14.2], [0, 0.1, 0]], stack: [[1.9, 1.0, 3.1], [0, 0.05, 0]], cell: [[stack.anchors.membraneX + 0.9, 0.45, 2.2], [stack.anchors.membraneX, 0, 0]] };
  camera.position.set(...VIEWS.system[0]); controls.target.set(...VIEWS.system[1]);
  let fly = null;
  function flyTo(pos, target, dur = 1.1, then) { fly = { p0: camera.position.clone(), t0: controls.target.clone(), p1: new THREE.Vector3(...pos), t1: new THREE.Vector3(...target), t: 0, dur: env.reducedMotion ? 0.01 : dur, then }; }
  controls.addEventListener('start', () => { fly = null; stopTour(); });
  function fit() { const w = wrap.clientWidth, h = wrap.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.fov = 40; camera.updateProjectionMatrix(); }
  new ResizeObserver(fit).observe(wrap); fit();

  // --- component registry: id → meshes --------------------------------------------
  const byId = new Map(); const pickables = [...stack.pickables, ...system.pickables];
  const idOf = (o) => { while (o && !o.userData.component) o = o.parent; return o ? o.userData.component : null; };
  [stack.group, system.group].forEach(root => root.traverse(o => { if (!o.isMesh) return; const id = idOf(o); if (!id) return; if (!byId.has(id)) byId.set(id, []); byId.get(id).push(o); }));
  // top-level object of every instance, so "zoom to it" frames one pump or one plate rather than all of them
  const roots = new Map();
  pickables.forEach(o => { const id = idOf(o); if (!id) return; if (!roots.has(id)) roots.set(id, []); roots.get(id).push(o); });
  const rootOf = (o) => { while (o && !pickables.includes(o)) o = o.parent; return o; };
  let lastHit = null;
  scene.traverse(o => { if (o.isLight) o.layers.enable(1); });
  system.fixed.children.slice(0, 3).forEach(o => o.layers.enable(1)); // ground, grid and pad stay visible in isolation

  const tint = (meshes, hex, flag) => meshes.forEach(m => (Array.isArray(m.material) ? m.material : [m.material]).forEach(mat => {
    if (!mat?.emissive) return;
    if (hex === null) { if (mat.userData[flag]) { mat.emissive.setHex(0x000000); mat.userData[flag] = false; } }
    else if (mat.emissive.getHex() === 0 || mat.userData.hot || mat.userData.sel) { mat.emissive.setHex(hex); mat.userData[flag] = true; }
  }));

  actions.select = (id, focus = false) => {
    if (selected && byId.has(selected)) tint(byId.get(selected), null, 'sel');
    if (isolated) actions.isolate(false, true);
    selected = id && COMPONENTS[id] ? id : null;
    if (selected && byId.has(selected)) tint(byId.get(selected), 0x12464f, 'sel');
    renderInfo();
    if (selected) { if (matchMedia('(max-width: 860px)').matches) sheet('info'); if (focus) actions.focus(selected); }
  };
  actions.isolate = (on, silent = false) => {
    isolated = on && !!selected;
    byId.forEach((meshes, id) => meshes.forEach(m => { if (isolated && id === selected) m.layers.enable(1); else m.layers.disable(1); }));
    camera.layers.set(isolated ? 1 : 0); ray.layers.set(isolated ? 1 : 0);
    if (isolated) actions.focus(selected);
    if (!silent) renderInfo();
  };
  const box = new THREE.Box3(), tmpBox = new THREE.Box3(), centre = new THREE.Vector3(), sizeV = new THREE.Vector3();
  actions.focus = (id) => {
    const list = roots.get(id); if (!list?.length) return;
    // frame the instance that was clicked, otherwise the one nearest the middle of the model
    const target = lastHit && idOf(lastHit) === id ? lastHit : list.reduce((a, b) => (Math.abs(b.getWorldPosition(centre).x) < Math.abs(a.getWorldPosition(sizeV).x) ? b : a));
    box.setFromObject(target); if (box.isEmpty()) return;
    box.getCenter(centre); box.getSize(sizeV);
    const dir = camera.position.clone().sub(controls.target).normalize(); if (dir.y < 0.15) { dir.y = 0.25; dir.normalize(); }
    const dist = Math.max(0.9, sizeV.length() * 1.05 + 0.5);
    flyTo(centre.clone().add(dir.multiplyScalar(dist)).toArray(), centre.toArray());
  };

  // --- picking ----------------------------------------------------------------------
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(); let hitObj = null;
  const cast = (e) => { const r = canvas.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, camera);
    for (const h of ray.intersectObjects(pickables, true)) { let v = true; for (let o = h.object; o; o = o.parent) if (!o.visible) { v = false; break; } if (!v) continue; const mats = Array.isArray(h.object.material) ? h.object.material : [h.object.material]; if (mats.every(m => m.opacity < 0.2)) continue; const id = idOf(h.object); if (id) { hitObj = rootOf(h.object); return id; } }
    return null; };
  let down = null, hotId = null, lastMove = 0;
  canvas.addEventListener('pointerdown', e => { down = [e.clientX, e.clientY]; });
  canvas.addEventListener('pointerup', e => { if (!down) return; const d = Math.hypot(e.clientX - down[0], e.clientY - down[1]); down = null; if (d > 8) return; const id = cast(e); if (id) { lastHit = hitObj; actions.select(id); } });
  canvas.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse' || e.buttons) return; const now = performance.now(); if (now - lastMove < 60) return; lastMove = now;
    const id = cast(e); if (id === hotId) return;
    if (hotId && hotId !== selected && byId.has(hotId)) tint(byId.get(hotId), null, 'hot');
    hotId = id; canvas.style.cursor = id ? 'pointer' : 'grab';
    if (id && id !== selected && byId.has(id)) tint(byId.get(id), 0x1b4f58, 'hot');
    tip.textContent = id ? ((translated && translated[id]?.name) || COMPONENTS[id]?.name || id) : (tourOn ? tip.textContent : L('tipDefault'));
  }, { passive: true });

  // --- particles: serpentine flow field + electrons on the busbars -------------------
  const N = env.mobile ? 120 : 240;
  const serpPos = new Float32Array(N * 3), serpGeo = new THREE.BufferGeometry(); serpGeo.setAttribute('position', new THREE.BufferAttribute(serpPos, 3));
  const serpMat = new THREE.PointsMaterial({ size: 0.02, map: T.glow, color: 0xb08cff, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  const serpPts = new THREE.Points(serpGeo, serpMat); serpPts.frustumCulled = false; scene.add(serpPts);
  const serpLen = stack.serpCurve.getLength();
  const EN = 28, ePos = new Float32Array(EN * 2 * 3), eGeo = new THREE.BufferGeometry(); eGeo.setAttribute('position', new THREE.BufferAttribute(ePos, 3));
  const eMat = new THREE.PointsMaterial({ size: 0.09, map: T.glow, color: 0x26d9e3, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  const ePts = new THREE.Points(eGeo, eMat); ePts.frustumCulled = false; scene.add(ePts);

  // --- dock controls -------------------------------------------------------------------
  const explode = $('explode'), socIn = $('soc'), flow = $('flow');
  explode.addEventListener('input', () => { S.explode = explode.value / 100; });
  socIn.addEventListener('input', () => { S.soc = socIn.value / 100; });
  flow.addEventListener('change', () => { flowOn = flow.checked; });
  $('modes').querySelectorAll('button').forEach(b => b.addEventListener('click', () => setMode(+b.dataset.mode)));
  function setMode(m) { mode = m; $('modes').querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.mode === m))); if (m) { flowOn = true; flow.checked = true; } }
  $('views').querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
    const v = b.dataset.view; stopTour();
    if (v === 'cell') { S.explode = 1; explode.value = 100; } else if (v === 'system') { S.explode = 0; explode.value = 0; }
    flyTo(...VIEWS[v]);
  }));
  const layerVisible = { membrane: true, felt: true };
  dock.querySelectorAll('[data-part]').forEach(c => c.addEventListener('change', () => {
    const p = c.dataset.part;
    if (p === 'casing') S.casingShow = c.checked ? 1 : 0;
    else if (p === 'site') siteOn = c.checked;
    else if (p === 'pipes') { system.setPart('pipes', c.checked); system.setPart('instruments', c.checked); }
    else system.setPart(p, c.checked);
  }));
  dock.querySelectorAll('[data-layer]').forEach(c => c.addEventListener('change', () => { layerVisible[c.dataset.layer] = c.checked; stack.layers.forEach(Ly => { if (Ly.type.startsWith(c.dataset.layer)) Ly.mesh.visible = c.checked; }); }));
  $('reset').addEventListener('click', () => {
    stopTour(); actions.select(null); setMode(0); flowOn = false; flow.checked = false; S.explode = 0; explode.value = 0; S.soc = 0.5; socIn.value = 50;
    dock.querySelectorAll('[data-part],[data-layer]').forEach(c => { if (!c.checked) { c.checked = true; c.dispatchEvent(new Event('change')); } });
    flyTo(...VIEWS.system);
  });

  // --- guided tour: follow the negative electrolyte round its loop ----------------------
  const TOUR = [
    [[5.6, 1.5, 3.6], [3.4, 0.2, 0]], [[3.5, -0.2, 2.2], [2.3, -0.7, 0]], [[2.2, -0.05, 1.5], [1.6, -0.3, 0]],
    [[1.75, 0.2, 1.5], [0.6, 0, 0]], [[2.4, 1.4, 2.2], [1.7, 1.0, 0]], [[5.0, 2.6, 3.2], [3.2, 1.3, 0]],
  ];
  let tourOn = false, tourStep = 0, tourTimer = 0;
  const tourBtn = $('tour');
  function showStep() { const steps = L('tour', []); tip.textContent = `${tourStep + 1}/${TOUR.length} · ${steps[tourStep] || ''}`; flyTo(TOUR[tourStep][0], TOUR[tourStep][1], 1.6); tourTimer = 0; }
  function stopTour() { if (!tourOn) return; tourOn = false; tourBtn.textContent = L('follow'); tip.textContent = L('tipDefault'); }
  tourBtn.addEventListener('click', () => {
    if (tourOn) return stopTour();
    tourOn = true; tourStep = 0; tourBtn.textContent = L('tourStop'); flowOn = true; flow.checked = true; S.explode = 0; explode.value = 0;
    dock.classList.remove('is-open'); openDock.setAttribute('aria-pressed', 'false'); showStep();
  });

  // --- HUD ----------------------------------------------------------------------------------
  const socVal = $('soc-val'), socPos = $('soc-pos'), socNeg = $('soc-neg');
  let hudKey = '';
  function drawHud() {
    const pct = Math.round(S.soc * 100), key = `${mode}|${pct}|${flowOn}`;
    if (key === hudKey) return; hudKey = key;
    socVal.textContent = `${pct} %`; socIn.value = pct;
    socPos.style.cssText = `width:50%;background:${electrolyteColor('pos', S.soc)}`; socNeg.style.cssText = `width:50%;background:${electrolyteColor('neg', S.soc)}`;
    const chips = [`<span class="chip chip--model"><i></i>${L('ocv')} ${ocv(S.soc).toFixed(2)} V</span>`, `<span class="chip"><i style="color:${mode > 0 ? '#26d9e3' : mode < 0 ? '#ff9b2f' : '#8291a8'}"></i>${L(mode > 0 ? 'hudCharge' : mode < 0 ? 'hudDischarge' : 'hudIdle')}</span>`];
    if (mode) chips.push(`<span class="chip"><i style="color:#26d9e3"></i>${L(mode > 0 ? 'eChg' : 'eDis')}</span>`);
    if (flowOn) chips.push(`<span class="chip"><i style="color:#a36bff"></i>${L('flowNote')}</span>`);
    hud.innerHTML = chips.join('');
  }

  // --- loop -------------------------------------------------------------------------------------
  const clock = new THREE.Clock(), v = new THREE.Vector3(); let time = 0, ePhase = 0;
  const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const approach = (a, b, k) => a + (b - a) * Math.min(1, k);
  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), 0.05); time += dt;
    // operation: SOC ramps between the limits, then the mode drops back to idle
    if (mode) { S.soc = Math.min(0.95, Math.max(0.05, S.soc + mode * dt * 0.035)); if ((mode > 0 && S.soc >= 0.95) || (mode < 0 && S.soc <= 0.05)) setMode(0); }
    const away = 1 - Math.min(1, S.explode / 0.25);            // plant and enclosure step aside while the stack is open
    S.periphery = approach(S.periphery, away, dt * 5); S.casing = approach(S.casing, away, dt * 6);
    S.flowSystem = approach(S.flowSystem, flowOn ? 1 : 0, dt * 3);
    S.grid = approach(S.grid, siteOn ? 1 : 0, dt * 4);
    S.flowSolar = approach(S.flowSolar, mode > 0 ? 1 : 0, dt * 3); S.flowGrid = approach(S.flowGrid, mode < 0 ? 1 : 0, dt * 3);
    stack.update(S); system.update(S, dt); site.update(S, dt);

    // flow-field particles on the centre plate once the stack is open
    serpMat.opacity = S.flowSystem * Math.max(0, (S.explode - 0.55) / 0.45);
    serpPts.visible = serpMat.opacity > 0.01;
    if (serpPts.visible) { const plate = stack.bipolarCenter, adv = (time * 0.22) / serpLen;
      for (let i = 0; i < N; i++) { stack.serpCurve.getPointAt((i / N + adv) % 1, v); serpPos[i * 3] = plate.position.x + 0.028; serpPos[i * 3 + 1] = v.y + Math.sin(i * 3.3) * 0.006; serpPos[i * 3 + 2] = v.z + Math.cos(i * 5.7) * 0.006; }
      serpGeo.attributes.position.needsUpdate = true; }
    // electrons on the busbars: out of the negative terminal (right-hand collector) on discharge, into it on charge
    eMat.opacity = approach(eMat.opacity, mode ? S.periphery : 0, dt * 4); ePts.visible = eMat.opacity > 0.01 && system.parts.cabinet.visible;
    if (ePts.visible) { ePhase += dt * 0.18 * (mode < 0 ? 1 : -1);
      system.busbars.forEach((b, bi) => { for (let i = 0; i < EN; i++) { let u = (i / EN + ePhase * (b.side > 0 ? 1 : -1)) % 1; if (u < 0) u += 1; b.curve.getPointAt(u, v); const o = (bi * EN + i) * 3; ePos[o] = v.x; ePos[o + 1] = v.y; ePos[o + 2] = v.z; } });
      eGeo.attributes.position.needsUpdate = true; }

    if (fly) { fly.t += dt / fly.dur; const k = ease(Math.min(1, fly.t)); camera.position.lerpVectors(fly.p0, fly.p1, k); controls.target.lerpVectors(fly.t0, fly.t1, k); if (fly.t >= 1) { const then = fly.then; fly = null; then && then(); } }
    if (tourOn && !fly) { tourTimer += dt; if (tourTimer > 3.2) { tourStep++; if (tourStep >= TOUR.length) stopTour(); else showStep(); } }
    controls.update(); drawHud();
    renderer.render(scene, camera);
  });

  renderInfo();
  const want = new URLSearchParams(location.search).get('part'); if (want && COMPONENTS[want]) actions.select(want, true);
  window.__lab = { S, actions, camera, controls };
}
