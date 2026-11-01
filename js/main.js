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
import { setupNav } from './ui/nav.js';
import { createPicker } from './ui/picker.js';
import { init as initI18n, t, pillarPath } from './i18n/index.js';

// Language first: captions, labels and the panel all read the dictionary.
await initI18n();

const canvas = document.getElementById('stage');
const { renderer, scene, camera, resize } = createScene(canvas, env);
const T = buildTextures();
const M = makeMaterials(T);

// --- world ---------------------------------------------------------------
const macro = new THREE.Group(); scene.add(macro);
const stack = buildStack(M, T, { shadows: !env.mobile }); macro.add(stack.group);
const system = buildSystem(M, { shadows: !env.mobile, mobile: env.mobile }); macro.add(system.group);
const grid = buildGrid(M, { mobile: env.mobile }); macro.add(grid.group);
const micro = buildMicro(M, { mobile: env.mobile }); scene.add(micro.group);

// serpentine flow particles live on the centre cell's bipolar plate
const flowN = env.mobile ? 120 : 260;
const flowPos = new Float32Array(flowN * 3);
const flowGeo = new THREE.BufferGeometry(); flowGeo.setAttribute('position', new THREE.BufferAttribute(flowPos, 3));
const flowMat = new THREE.PointsMaterial({ size: 0.014, color: 0xb08cff, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
const flowPts = new THREE.Points(flowGeo, flowMat); flowPts.frustumCulled = false; macro.add(flowPts);
const serpLen = stack.serpCurve.getLength();

// --- UI --------------------------------------------------------------------
const panel = createPanel(document.getElementById('panel'), { t, pillarPath, components: t('components', null) });
const labels = createLabels(document.getElementById('labels'), camera, id => panel.open(id));
const tr = (s) => ({ ...s, text: t(`labels.${s.key}.text`, s.text), sub: t(`labels.${s.key}.sub`, s.sub) });
stack.labelSpecs.forEach(s => labels.add(tr(s), () => state.labels * (1 - state.iris)));
micro.labelSpecs.forEach(s => labels.add(tr(s), () => (state.view ? 1 : 0) * (1 - state.iris), 'micro'));
const { chapters } = buildTimeline(state, stack.anchors);
setupCaptions(chapters, document.getElementById('chapters-nav'));
setupNav();

let hot = null;
createPicker({
  canvas, camera,
  getList: () => (state.view ? [] : [...stack.pickables, ...system.pickables]),
  onPick: (id) => { panel.open(id); labels.highlight(id); },
  onHover: (id, o) => {
    if (hot) hot.traverse(c => { if (c.material?.emissive && c.userData.hot) { c.material.emissive.setHex(0x000000); c.userData.hot = false; } });
    hot = o || null;
    if (hot) hot.traverse(c => { if (c.material?.emissive && !Array.isArray(c.material)) { c.material.emissive.setHex(0x1b4f58); c.userData.hot = true; } });
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

requestAnimationFrame(() => requestAnimationFrame(() => {
  document.getElementById('loader').classList.add('is-done');
  window.ScrollTrigger?.refresh();
}));

// Debug hook: inspect the scroll-driven state from the console.
window.__vrfb = { state, env };
