import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export function createScene(canvas, env) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !env.mobile, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, env.mobile ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = !env.mobile;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x070a10, 0.016);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  pmrem.dispose();

  const camera = new THREE.PerspectiveCamera(38, 1, 0.05, 200);

  const key = new THREE.DirectionalLight(0xfff1e0, 2.4); key.position.set(4, 7, 5);
  key.castShadow = !env.mobile; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -7, right: 7, top: 6, bottom: -4, near: 1, far: 30 }); key.shadow.bias = -0.0005; key.shadow.normalBias = 0.02;
  const fill = new THREE.DirectionalLight(0x8fb6ff, 0.7); fill.position.set(-6, 3, -2);
  const rim = new THREE.DirectionalLight(0x26d9e3, 1.0); rim.position.set(-3, 2.5, -7);
  const rim2 = new THREE.DirectionalLight(0xff9b2f, 0.6); rim2.position.set(5, 1.5, -6);
  const amb = new THREE.HemisphereLight(0x3c4a66, 0x05070b, 0.5);
  scene.add(key, fill, rim, rim2, amb);

  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  resize();
  return { renderer, scene, camera, resize };
}
