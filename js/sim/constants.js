/**
 * Physical constants and reference data shared by every calculator and
 * simulation on the site. Pure data: importable from the browser and from Node
 * (tests). Sources are listed on pillars/references.html.
 */
export const F = 96485.332;          // C/mol, Faraday constant
export const R = 8.314462;           // J/(mol·K), gas constant
export const AH_PER_MOL = F / 3600;  // 26.80 Ah per mole of electrons
export const T_REF = 298.15;         // K

// Standard reduction potentials vs SHE [refs 1, 9]
export const E0_NEG = -0.255;        // V³⁺ + e⁻ ⇌ V²⁺
export const E0_POS = 1.004;         // VO₂⁺ + 2H⁺ + e⁻ ⇌ VO²⁺ + H₂O
export const E0_CELL = E0_POS - E0_NEG; // 1.259 V

// Empirical offset between the simple Nernst form and measured OCV at 50 % SOC
// (proton activity + Donnan potential), Knehr & Kumbur 2011 [ref 15].
export const DONNAN_OFFSET = 0.06;   // V

export const M_V = 50.9415;          // g/mol vanadium
export const M_V2O5 = 181.88;        // g/mol vanadium pentoxide (2 V per formula unit)
export const KG_V2O5_PER_KG_V = M_V2O5 / (2 * M_V); // 1.785

/** Colours of the four vanadium oxidation states (sRGB hex), used by 3D, 2D and charts. */
export const V_HEX = { v2: '#7c3aed', v3: '#1fae45', v4: '#1d63f0', v5: '#f2c21a' };

/** Balanced half-reactions, written in the DISCHARGE direction. Used by the UI and by the consistency tests. */
export const REACTIONS = {
  negative: {
    left: [{ s: 'V', charge: 2, atoms: { V: 1 } }],
    right: [{ s: 'V', charge: 3, atoms: { V: 1 } }, { s: 'e', charge: -1, atoms: {} }],
    e0: E0_NEG,
  },
  positive: {
    left: [{ s: 'VO2', charge: 1, atoms: { V: 1, O: 2 } }, { s: 'H', charge: 1, atoms: { H: 1 }, n: 2 }, { s: 'e', charge: -1, atoms: {} }],
    right: [{ s: 'VO', charge: 2, atoms: { V: 1, O: 1 } }, { s: 'H2O', charge: 0, atoms: { H: 2, O: 1 } }],
    e0: E0_POS,
  },
};
