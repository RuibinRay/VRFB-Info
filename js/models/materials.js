import * as THREE from 'three';
import { V_HEX } from '../sim/constants.js';

/**
 * Physically based material factory. Every call returns a fresh material so
 * callers can fade or tint parts independently.
 */
export function makeMaterials(T) {
  const std = (o) => new THREE.MeshStandardMaterial(o);
  const phy = (o) => new THREE.MeshPhysicalMaterial(o);
  return {
    steel: () => std({ color: 0xc9ced4, metalness: 0.9, roughness: 0.85, roughnessMap: T.brushed, envMapIntensity: 1.1 }),
    steelDark: () => std({ color: 0x8e949c, metalness: 0.85, roughness: 0.6, roughnessMap: T.brushed }),
    steelPolished: () => std({ color: 0xe3e8ee, metalness: 1.0, roughness: 0.22, envMapIntensity: 1.3 }),
    copper: () => std({ color: 0xd97b3c, metalness: 0.95, roughness: 0.8, roughnessMap: T.brushed, envMapIntensity: 1.2 }),
    graphite: () => std({ color: 0x2a2d32, metalness: 0.2, roughness: 0.6 }),
    flowField: () => std({ map: T.serp.map, bumpMap: T.serp.bump, bumpScale: 0.01, metalness: 0.15, roughness: 0.7 }),
    felt: () => std({ map: T.felt, bumpMap: T.felt, bumpScale: 0.012, roughness: 1, metalness: 0 }),
    membrane: () => phy({ color: 0xcdeedd, transmission: 0.45, thickness: 0.05, roughness: 0.4, ior: 1.35, transparent: true, opacity: 0.95, emissive: 0x9fd8bf, emissiveIntensity: 0.12, side: THREE.DoubleSide }),
    gasket: () => std({ color: 0xaab0b8, metalness: 0.55, roughness: 0.5 }),
    polymer: (hex) => std({ color: hex, metalness: 0.05, roughness: 0.5 }),
    rubber: () => std({ color: 0x15171a, metalness: 0.0, roughness: 0.85 }),
    oring: (hex) => std({ color: hex, roughness: 0.45, metalness: 0, emissive: hex, emissiveIntensity: 0.35 }),
    glass: () => phy({ color: 0xffffff, transmission: 0.92, roughness: 0.12, thickness: 0.08, ior: 1.4, envMapIntensity: 0.45, transparent: true, opacity: 1, side: THREE.DoubleSide, depthWrite: false }),
    casing: () => std({ color: 0xbfe6ff, metalness: 0.0, roughness: 0.06, envMapIntensity: 1.4, transparent: true, opacity: 0.085, side: THREE.DoubleSide, depthWrite: false }),
    liquid: (hex) => std({ color: hex, roughness: 0.55, metalness: 0.0, envMapIntensity: 0.35, transparent: true, opacity: 0.94, emissive: hex, emissiveIntensity: 0.22 }),
    pipe: (hex) => phy({ color: hex, transmission: 0.1, roughness: 0.4, metalness: 0.05, envMapIntensity: 0.5, emissive: hex, emissiveIntensity: 0.18, transparent: true, opacity: 0.97 }),
    paint: (hex) => std({ color: hex, metalness: 0.25, roughness: 0.45 }),
    cabinet: () => std({ map: T.louver, metalness: 0.35, roughness: 0.55 }),
    panel: () => std({ map: T.panel, metalness: 0.5, roughness: 0.25, envMapIntensity: 1.4 }),
    container: () => std({ map: T.container, metalness: 0.3, roughness: 0.6 }),
    dial: () => std({ map: T.dial, metalness: 0.1, roughness: 0.35, emissive: 0xffffff, emissiveMap: T.dial, emissiveIntensity: 0.25 }),
    ground: () => std({ color: 0x0b0f17, roughness: 0.9, metalness: 0.0 }),
    concrete: () => std({ map: T.concrete, color: 0x9aa3b0, roughness: 0.92, metalness: 0.0 }),
    carbon: () => std({ color: 0x23262b, roughness: 0.45, metalness: 0.35 }),
    glow: (hex, i = 1) => std({ color: hex, emissive: hex, emissiveIntensity: i, roughness: 0.4 }),
    /** Additive light shaft / halo: fakes light scattering without a volumetric pass. */
    beam: (hex, o = 0.05) => new THREE.MeshBasicMaterial({ color: hex, transparent: true, opacity: o, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }),
    halo: (hex, o = 0.5) => new THREE.SpriteMaterial({ map: T.glow, color: hex, transparent: true, opacity: o, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }),
  };
}

/** Vanadium oxidation-state colours, shared with the 2D diagrams and charts (js/sim/constants.js). */
export const V_COLORS = {
  v2: new THREE.Color(V_HEX.v2), // V²⁺  violet (charged negative)
  v3: new THREE.Color(V_HEX.v3), // V³⁺  green  (discharged negative)
  v4: new THREE.Color(V_HEX.v4), // VO²⁺ blue   (discharged positive)
  v5: new THREE.Color(V_HEX.v5), // VO₂⁺ yellow (charged positive)
};
/**
 * Electrolyte colour at a state of charge. Hue is interpolated (not RGB) so a
 * half-charged positive electrolyte passes through green, as a real mixture of
 * blue VO²⁺ and yellow VO₂⁺ does, instead of turning grey.
 */
export function negColor(soc, out = new THREE.Color()) { return out.copy(V_COLORS.v3).lerpHSL(V_COLORS.v2, soc); }
export function posColor(soc, out = new THREE.Color()) { return out.copy(V_COLORS.v4).lerpHSL(V_COLORS.v5, soc); }
