import * as THREE from 'three';
import { state, env } from './core/state.js';
import { createScene } from './core/scene.js';
import { createRig } from './core/rig.js';
import { buildTimeline } from './core/timeline.js';
import { buildTextures } from './models/textures.js';
import { makeMaterials } from './models/materials.js';
import { buildStack } from './models/stack.js';
import { buildSystem } from './models/system.js';
import { buildMicro } from './models/micro.js';
import { buildGrid } from './models/grid.js';
import { createLabels } from './ui/labels.js';
import { createPanel } from './ui/panel.js';
import { setupCaptions } from './ui/captions.js';
import { createPicker } from './ui/picker.js';
import { mountChrome } from './ui/chrome.js';
import { init as initI18n, t, pillarPath } from './i18n/index.js';

// Language first: chrome, captions, labels and the panel all read the dictionary.
await initI18n();
mountChrome({ active: 'home', footer: true });

const canvas = document.getElementById('stage');
const done = () => document.getElementById('loader').classList.add('is-done');

let gl = null;
try { gl = createScene(canvas, env); } catch (err) { console.warn('WebGL unavailable, showing the illustrated journey instead.', err); }

if (!gl) {
  // Fallback for devices without WebGL: a still render behind the same captions.
  document.body.classList.add('no-webgl');
  const { chapters } = buildTimeline(state, { membraneX: 0, bipolarFaceX: 0, feltX: 0 }, env);
  setupCaptions(chapters, document.getElementById('chapters-nav'));
  done();
} else {
  const { renderer, scene, camera, resize } = gl;
  const T = buildTextures();
  const M = makeMaterials(T);

  // --- world ---------------------------------------------------------------
  const macro = new THREE.Group(); scene.add(macro);
  const stack = buildStack(M, T, { shadows: !env.mobile }); macro.add(stack.group);
  const system = buildSystem(M, { shadows: !env.mobile, mobile: env.mobile, glow: T.glow }); macro.add(system.group);
  const grid = buildGrid(M, { mobile: env.mobile, glow: T.glow }); macro.add(grid.group);
  const micro = buildMicro(M, { mobile: env.mobile, halo: M.halo }); scene.add(micro.group);

  // serpentine flow particles live on the centre cell's bipolar plate
  const flowN = env.mobile ? 120 : 260;
  const flowPos = new Float32Array(flowN * 3);
  const flowGeo = new THREE.BufferGeometry(); flowGeo.setAttribute('position', new THREE.BufferAttribute(flowPos, 3));
  const flowMat = new THREE.PointsMaterial({ size: 0.016, map: T.glow, color: 0x8fc0ff, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  const flowPts = new THREE.Points(flowGeo, flowMat); flowPts.frustumCulled = false; macro.add(flowPts);
  const serpLen = stack.serpCurve.getLength();

  // --- UI --------------------------------------------------------------------
  const panel = createPanel(document.getElementById('panel'), { t, pillarPath, components: t('components', null) });
  const labels = createLabels(document.getElementById('labels'), camera, id => panel.open(id));
  const tr = (s) => ({ ...s, text: t(`labels.${s.key}.text`, s.text), sub: t(`labels.${s.key}.sub`, s.sub) });
  stack.labelSpecs.forEach(s => labels.add(tr(s), () => state.labels * (1 - state.iris)));
  system.labelSpecs.forEach(s => labels.add(tr(s), () => state.plantLabels * state.periphery, 'plant'));
  micro.labelSpecs.forEach(s => labels.add(tr(s), () => (state.view ? 1 : 0) * (1 - state.iris), 'micro'));
  const { chapters, tl, at, len } = buildTimeline(state, stack.anchors, env);
  setupCaptions(chapters, document.getElementById('chapters-nav'));

  let hot = null;
  createPicker({
    canvas, camera,
    getList: () => (state.view ? [] : state.periphery > 0.5 ? [...stack.pickables, ...system.pickables] : stack.pickables),
    onPick: (id) => { panel.open(id); labels.highlight(id); },
    onHover: (id, o) => {
      if (hot) hot.traverse(c => { if (c.material?.emissive && c.userData.hot) { c.material.emissive.setHex(0x000000); c.userData.hot = false; } });
      hot = o || null;
      if (hot) hot.traverse(c => { if (c.material?.emissive && !Array.isArray(c.material) && c.material.emissive.getHex() === 0) { c.material.emissive.setHex(0x1b4f58); c.userData.hot = true; } });
      labels.highlight(id);
    },
  });

  // --- loop ------------------------------------------------------------------
  const rig = createRig(camera, env);
  const iris = document.getElementById('iris');
  const clock = new THREE.Clock();
  const v = new THREE.Vector3();
  let flowT = 0, lastIris = -1, lastCanvas = -1;

  window.addEventListener('resize', () => { resize(); window.ScrollTrigger?.refresh(); });

  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), 0.05);
    const microOn = state.view >= 0.5;
    macro.visible = !microOn; micro.group.visible = microOn;

    stack.update(state);
    system.update(state, dt);
    grid.update(state, dt);
    micro.update(state, dt);

    // serpentine particles
    flowMat.opacity = state.flowCell * (1 - state.iris);
    if (flowMat.opacity > 0.01) {
      flowT += dt; flowPts.visible = true;
      const plate = stack.bipolarCenter; const adv = (flowT * 0.22) / serpLen;
      for (let i = 0; i < flowN; i++) { const u = (i / flowN + adv) % 1; stack.serpCurve.getPointAt(u, v); flowPos[i * 3] = plate.position.x + 0.028 + Math.sin(i * 7.1) * 0.004; flowPos[i * 3 + 1] = v.y + Math.sin(i * 3.3) * 0.006; flowPos[i * 3 + 2] = v.z + Math.cos(i * 5.7) * 0.006; }
      flowGeo.attributes.position.needsUpdate = true;
    } else flowPts.visible = false;

    rig.update(state, dt);
    labels.update();
    if (state.iris !== lastIris) { iris.style.opacity = state.iris.toFixed(3); lastIris = state.iris; }
    if (state.canvas !== lastCanvas) { canvas.style.opacity = state.canvas.toFixed(3); lastCanvas = state.canvas; }
    if (state.canvas > 0.01 && state.iris < 0.995) renderer.render(scene, camera);
  });

  requestAnimationFrame(() => requestAnimationFrame(() => { done(); window.ScrollTrigger?.refresh(); }));

  // Debug hook: inspect the scroll-driven state from the console.
  window.__vrfb = { state, env, renderer,
    /** Jump to a point inside a chapter, e.g. __vrfb.seek('plant', 0.5). */
    seek(name, f = 0) { const p = (at[name] + len[name] * f) / tl.duration(); const track = document.getElementById('scroll-track'); window.scrollTo(0, track.offsetTop + p * (track.offsetHeight - innerHeight)); tl.progress(p); return p; } };
}
