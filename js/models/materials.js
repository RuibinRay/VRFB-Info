import * as THREE from 'three';

export function makeMaterials(T) {
  const std = (o) => new THREE.MeshStandardMaterial(o);
  const phy = (o) => new THREE.MeshPhysicalMaterial(o);
  return {
    steel: () => std({ color: 0xc9ced4, metalness: 0.9, roughness: 0.85, roughnessMap: T.brushed, envMapIntensity: 1.1 }),
    steelDark: () => std({ color: 0x8e949c, metalness: 0.85, roughness: 0.6, roughnessMap: T.brushed }),
    copper: () => std({ color: 0xd97b3c, metalness: 0.95, roughness: 0.8, roughnessMap: T.brushed, envMapIntensity: 1.2 }),
    graphite: () => std({ color: 0x2a2d32, metalness: 0.2, roughness: 0.6 }),
    flowField: () => std({ map: T.serp.map, bumpMap: T.serp.bump, bumpScale: 0.01, metalness: 0.15, roughness: 0.7 }),
    felt: () => std({ map: T.felt, bumpMap: T.felt, bumpScale: 0.006, roughness: 1, metalness: 0 }),
    membrane: () => phy({ color: 0xcdeedd, transmission: 0.45, thickness: 0.05, roughness: 0.4, ior: 1.35, transparent: true, opacity: 0.95, emissive: 0x9fd8bf, emissiveIntensity: 0.12, side: THREE.DoubleSide }),
    gasket: () => std({ color: 0xaab0b8, metalness: 0.55, roughness: 0.5 }),
    polymer: (hex) => std({ color: hex, metalness: 0.05, roughness: 0.5 }),
    oring: (hex) => std({ color: hex, roughness: 0.45, metalness: 0, emissive: hex, emissiveIntensity: 0.35 }),
    glass: () => phy({ color: 0xffffff, transmission: 0.92, roughness: 0.12, thickness: 0.08, ior: 1.4, envMapIntensity: 0.45, transparent: true, opacity: 1, side: THREE.DoubleSide, depthWrite: false }),
    liquid: (hex) => std({ color: hex, roughness: 0.55, metalness: 0.0, envMapIntensity: 0.35, transparent: true, opacity: 0.94, emissive: hex, emissiveIntensity: 0.22 }),
    pipe: (hex) => phy({ color: hex, transmission: 0.1, roughness: 0.4, metalness: 0.05, envMapIntensity: 0.5, emissive: hex, emissiveIntensity: 0.18, transparent: true, opacity: 0.97 }),
    paint: (hex) => std({ color: hex, metalness: 0.25, roughness: 0.45 }),
    cabinet: () => std({ map: T.louver, metalness: 0.35, roughness: 0.55 }),
    panel: () => std({ map: T.panel, metalness: 0.5, roughness: 0.25, envMapIntensity: 1.4 }),
    ground: () => std({ color: 0x0b0f17, roughness: 0.9, metalness: 0.0 }),
    carbon: () => std({ color: 0x23262b, roughness: 0.45, metalness: 0.35 }),
    glow: (hex, i = 1) => std({ color: hex, emissive: hex, emissiveIntensity: i, roughness: 0.4 }),
  };
}

/** Vanadium oxidation-state colours (linear-space hex for three.js). */
export const V_COLORS = {
  v2: new THREE.Color(0x7c3aed), // V²⁺  violet (charged negative)
  v3: new THREE.Color(0x1fae45), // V³⁺  green  (discharged negative)
  v4: new THREE.Color(0x1d63f0), // VO²⁺ blue   (discharged positive)
  v5: new THREE.Color(0xf2c21a), // VO₂⁺ yellow (charged positive)
};
export function negColor(soc, out = new THREE.Color()) { return out.lerpColors(V_COLORS.v3, V_COLORS.v2, soc); }
export function posColor(soc, out = new THREE.Color()) { return out.lerpColors(V_COLORS.v4, V_COLORS.v5, soc); }
